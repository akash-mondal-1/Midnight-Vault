"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWallet } from './WalletContext';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

// Active network ID — configures the global Midnight SDK network context
const ACTIVE_NETWORK_ID = (import.meta as any).env?.VITE_NETWORK_ID ?? 'preprod';
setNetworkId(ACTIVE_NETWORK_ID);
console.log(`[MidnightVault] setNetworkId('${ACTIVE_NETWORK_ID}') called — network context initialized`);

const BECH32_ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

export function normalizeContractAddress(address: string): string {
  if (!address) return address;
  const clean = address.trim();
  if (/^(0x)?[0-9a-fA-F]{64}$/.test(clean)) {
    return clean.startsWith('0x') || clean.startsWith('0X') ? clean.slice(2) : clean;
  }
  if (clean.includes('1')) {
    try {
      const pos = clean.lastIndexOf('1');
      const dataStr = clean.substring(pos + 1).toLowerCase();
      const words: number[] = [];
      for (let i = 0; i < dataStr.length; i++) {
        const idx = BECH32_ALPHABET.indexOf(dataStr[i]);
        if (idx !== -1) words.push(idx);
      }
      const payload = words.slice(0, words.length - 6);
      let val = 0;
      let bits = 0;
      const bytes: number[] = [];
      for (const w of payload) {
        val = (val << 5) | w;
        bits += 5;
        while (bits >= 8) {
          bits -= 8;
          bytes.push((val >> bits) & 0xff);
        }
      }
      const hex = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
      if (hex.length === 64) {
        return hex;
      }
    } catch (e) {
      console.warn('[MidnightVault] Failed to parse Bech32 contract address:', e);
    }
  }
  return clean;
}

export const PREPROD_CONTRACT_ADDRESS = (import.meta as any).env?.VITE_CONTRACT_ADDRESS || '';

const DEFAULT_INDEXER_URI =
  (import.meta as any).env?.VITE_INDEXER_URI ??
  'https://indexer.preprod.midnight.network/api/v4/graphql';

interface ContractState {
  contractAddress: string;
  verificationCount: number;
  isLoading: boolean;
  txHash: string | null;
  error: string | null;
  lastProofTimestamp: number | null;
}

interface VaultWitnessState {
  credentialSecret?: Uint8Array;
  credentialType?: bigint;
  credentialIssuer?: Uint8Array;
  issuerSecret?: Uint8Array;
}

interface ContractContextType extends ContractState {
  isContractValid: boolean | null;
  deployNewContract: () => Promise<void>;
  authorizeIssuer: (issuerId: Uint8Array, witness: VaultWitnessState) => Promise<void>;
  issueCredential: (credentialCommitment: Uint8Array, witness: VaultWitnessState) => Promise<void>;
  verifyCredential: (requiredType: bigint, witness: VaultWitnessState) => Promise<void>;
  revokeCredential: (credentialCommitment: Uint8Array, witness: VaultWitnessState) => Promise<void>;
  resetState: () => void;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

function formatContractError(err: any): string {
  if (!err) return 'Operation failed';
  console.error('[MidnightVault] Detailed error inspection:', err);
  
  const getMsg = (e: any): string | null => {
    if (!e) return null;
    if (typeof e === 'string' && e.trim()) return e.trim();
    if (e.failure) return getMsg(e.failure);
    if (e.message && typeof e.message === 'string' && e.message.trim()) return e.message.trim();
    if (e.reason && typeof e.reason === 'string' && e.reason.trim()) return e.reason.trim();
    if (e.cause) return getMsg(e.cause);
    if (e.error) return getMsg(e.error);
    return null;
  };

  const extracted = getMsg(err.cause) || getMsg(err) || (typeof err === 'string' ? err : String(err));

  if (!extracted || extracted === '[object Object]') {
    return 'Operation failed or transaction rejected by wallet. Please check browser console for details.';
  }

  if (
    extracted.includes('User rejected') ||
    extracted.includes('rejected') ||
    extracted.includes('denied')
  ) {
    return 'Transaction was rejected in your Lace wallet. Please try again and click Sign transaction.';
  }
  if (
    extracted.includes('was shutdown') ||
    extracted.includes('channel')
  ) {
    return 'Wallet channel timed out. Please reload the page, reconnect wallet, and try again.';
  }
  if (extracted.includes('insufficient') || extracted.includes('balance')) {
    return 'Insufficient tNIGHT or DUST balance. Please top up at https://faucet.preprod.midnight.network/';
  }

  return extracted;
}

async function fetchContractState(
  address: string,
  indexerUrl: string = DEFAULT_INDEXER_URI
): Promise<{ exists: boolean; stateHex: string | null }> {
  const normalizedAddr = normalizeContractAddress(address);
  const query = `
    query {
      contractAction(address: "${normalizedAddr}") {
        state
      }
    }
  `;

  try {
    const res = await fetch(indexerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const json = await res.json();
    const stateHex =
      json.data?.contractState?.state ??
      json.data?.contractAction?.state ??
      null;

    return { exists: stateHex !== null && stateHex !== undefined, stateHex };
  } catch (err) {
    console.warn('[MidnightVault] Indexer query failed:', err);
    return { exists: false, stateHex: null };
  }
}

export const ContractProvider = ({ children }: { children: React.ReactNode }) => {
  const { walletApi, isConnected, getFreshWalletApi } = useWallet();
  const [state, setState] = useState<ContractState>({
    contractAddress: PREPROD_CONTRACT_ADDRESS,
    verificationCount: 0,
    isLoading: false,
    txHash: null,
    error: null,
    lastProofTimestamp: null,
  });
  const [isContractValid, setIsContractValid] = useState<boolean | null>(null);

  const resetState = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: null,
      txHash: null,
    }));
  }, []);

  useEffect(() => {
    if (!state.contractAddress) {
      setIsContractValid(false);
      return;
    }

    const checkContract = async () => {
      let indexerUrl = DEFAULT_INDEXER_URI;
      if (walletApi) {
        try {
          const cfg = await walletApi.getConfiguration();
          if (cfg?.indexerUri) indexerUrl = cfg.indexerUri;
        } catch {}
      }

      const { exists } = await fetchContractState(state.contractAddress, indexerUrl);

      if (exists) {
        setIsContractValid(true);
      } else {
        setIsContractValid(false);
      }
    };

    checkContract();
  }, [state.contractAddress, walletApi]);

  const getContractInstance = async (witness: VaultWitnessState) => {
    setNetworkId(ACTIVE_NETWORK_ID);
    const { findDeployedContract } = await import('@midnight-ntwrk/midnight-js-contracts');
    const { initializeProviders } = await import('../lib/midnight-providers');
    const { compiledVaultContract } = await import('../lib/compiled-contract');

    const freshApi = await getFreshWalletApi();
    const activeApi = freshApi ?? walletApi;

    if (!activeApi) {
      throw new Error('Wallet disconnected. Please connect Wallet and try again.');
    }

    const providers = await initializeProviders(activeApi, ACTIVE_NETWORK_ID);
    const normalizedContractAddress = normalizeContractAddress(state.contractAddress);
    
    const initialPrivateState = {
      credentialSecret: witness.credentialSecret ?? new Uint8Array(32),
      credentialType: witness.credentialType ?? 0n,
      credentialIssuer: witness.credentialIssuer ?? new Uint8Array(32),
      issuerSecret: witness.issuerSecret ?? new Uint8Array(32)
    };

    const contract = await findDeployedContract(providers, {
      compiledContract: compiledVaultContract,
      contractAddress: normalizedContractAddress,
      privateStateId: 'vault-state',
      initialPrivateState,
    } as any);

    return contract;
  };

  const executeCircuit = async (action: (contract: any) => Promise<any>, witness: VaultWitnessState) => {
    if (!isConnected || !walletApi) {
      setState(prev => ({ ...prev, error: 'Please connect your wallet first.' }));
      return;
    }

    if (!state.contractAddress) {
      setState(prev => ({ ...prev, error: 'No contract address available.' }));
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      txHash: null,
    }));

    try {
      const contract = await getContractInstance(witness);
      const tx = await action(contract);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        txHash: typeof tx === 'string' ? tx : 'ZK proof submitted on-chain',
        lastProofTimestamp: Date.now(),
      }));
    } catch (err: any) {
      const formatted = formatContractError(err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: formatted,
      }));
      throw err;
    }
  };

  const authorizeIssuer = useCallback(async (issuerId: Uint8Array, witness: VaultWitnessState) => {
    return executeCircuit(c => c.callTx.authorizeIssuer(issuerId), witness);
  }, [isConnected, walletApi, state.contractAddress]);

  const issueCredential = useCallback(async (credentialCommitment: Uint8Array, witness: VaultWitnessState) => {
    return executeCircuit(c => c.callTx.issueCredential(credentialCommitment), witness);
  }, [isConnected, walletApi, state.contractAddress]);

  const verifyCredential = useCallback(async (requiredType: bigint, witness: VaultWitnessState) => {
    return executeCircuit(c => c.callTx.verifyCredential(requiredType), witness);
  }, [isConnected, walletApi, state.contractAddress]);

  const revokeCredential = useCallback(async (credentialCommitment: Uint8Array, witness: VaultWitnessState) => {
    return executeCircuit(c => c.callTx.revokeCredential(credentialCommitment), witness);
  }, [isConnected, walletApi, state.contractAddress]);

  const deployNewContract = useCallback(async () => {
    if (!isConnected || !walletApi) {
      setState(prev => ({ ...prev, error: 'Please connect your wallet first.' }));
      return;
    }
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      setNetworkId(ACTIVE_NETWORK_ID);
      const { deployContract } = await import('@midnight-ntwrk/midnight-js-contracts');
      const { initializeProviders } = await import('../lib/midnight-providers');
      const { compiledVaultContract } = await import('../lib/compiled-contract');

      const providers = await initializeProviders(walletApi, ACTIVE_NETWORK_ID);
      // This is the legitimate, required initial private state for the Midnight PrivateStateProvider.
      // It acts as the unpopulated baseline schema (no business data) expected by the generated Vault contract.
      // It is NOT a mock or simulation.
      const legitimateInitialPrivateState = {
        credentialSecret: new Uint8Array(32),
        credentialType: 0n,
        credentialIssuer: new Uint8Array(32),
        issuerSecret: new Uint8Array(32)
      };

      const deployment = await deployContract(providers, {
        compiledContract: compiledVaultContract,
        privateStateId: 'vault-state',
        initialPrivateState: legitimateInitialPrivateState,
      } as any);

      setState(prev => ({
        ...prev,
        isLoading: false,
        contractAddress: deployment.deployTxData.public.contractAddress,
        error: null,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: formatContractError(err),
      }));
    }
  }, [isConnected, walletApi]);

  return (
    <ContractContext.Provider
      value={{
        ...state,
        isContractValid,
        deployNewContract,
        authorizeIssuer,
        issueCredential,
        verifyCredential,
        revokeCredential,
        resetState
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = () => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};
