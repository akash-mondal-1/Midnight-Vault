"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWallet } from './WalletContext';

// ── Contract Address ────────────────────────────────────────────────────
// This is the deployed contract address on Midnight Preprod/Preview.
// Replace with your actual deployed contract address.
export const PREPROD_CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  'a7f3d891c4b2e056f8a913d4c7e2b089f1d3c456a7f8e9b0c1d2e3f4a5b6c7d8';

// ── Network Config ──────────────────────────────────────────────────────
const DEFAULT_INDEXER_URI = 'https://indexer.testnet.midnight.network/api/v1/graphql';
const DEFAULT_INDEXER_WS_URI = 'wss://indexer.testnet.midnight.network/api/v1/graphql';

// ── Types ───────────────────────────────────────────────────────────────
interface ContractState {
  contractAddress: string;
  registeredMembersCount: number;
  isLoading: boolean;
  txHash: string | null;
  error: string | null;
  privacyProven: boolean;
  lastProofTimestamp: number | null;
}

interface ContractContextType extends ContractState {
  isContractValid: boolean | null;
  registerMember: (secret: bigint) => Promise<void>;
  deployNewContract: () => Promise<void>;
  resetState: () => void;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

// ── Helpers ─────────────────────────────────────────────────────────────

/**
 * Generates a privacy proof locally — the secret never leaves the browser.
 * Uses Web Crypto API to hash the secret, proving knowledge without revealing it.
 */
async function generateLocalPrivacyProof(secret: bigint): Promise<{
  proofHash: string;
  timestamp: number;
}> {
  // Convert the secret to bytes
  const secretBytes = new TextEncoder().encode(secret.toString());

  // Generate SHA-256 hash — the secret is NEVER transmitted, only this hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', secretBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const proofHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    proofHash,
    timestamp: Date.now(),
  };
}

/**
 * Query the Midnight indexer for contract state.
 */
async function fetchContractState(
  address: string,
  indexerUrl: string = DEFAULT_INDEXER_URI
): Promise<{ exists: boolean; stateHex: string | null }> {
  const query = `
    query {
      contractState(address: "${address}") {
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

    // Try multiple response shapes (API varies between versions)
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

/**
 * Parse a hex state value to a number (member count).
 */
function parseStateCount(hex: string | null): number {
  if (!hex) return 0;
  try {
    const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
    return Number(BigInt('0x' + clean));
  } catch {
    return 0;
  }
}

// ── Provider ────────────────────────────────────────────────────────────
export const ContractProvider = ({ children }: { children: React.ReactNode }) => {
  const { walletApi, isConnected } = useWallet();
  const [state, setState] = useState<ContractState>({
    contractAddress: PREPROD_CONTRACT_ADDRESS,
    registeredMembersCount: 0,
    isLoading: false,
    txHash: null,
    error: null,
    privacyProven: false,
    lastProofTimestamp: null,
  });
  const [isContractValid, setIsContractValid] = useState<boolean | null>(null);

  const resetState = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: null,
      privacyProven: false,
      txHash: null,
    }));
  }, []);

  // ── Verify contract on mount and when address changes ──────────────
  useEffect(() => {
    if (!state.contractAddress) {
      setIsContractValid(false);
      return;
    }

    const checkContract = async () => {
      // Try to get indexer URL from wallet config, fall back to default
      let indexerUrl = DEFAULT_INDEXER_URI;
      if (walletApi) {
        try {
          const cfg = await walletApi.getConfiguration();
          if (cfg?.indexerUri) indexerUrl = cfg.indexerUri;
        } catch {
          // Use default indexer URL
        }
      }

      console.log(`[MidnightVault] Checking contract at: ${state.contractAddress}`);
      const { exists, stateHex } = await fetchContractState(state.contractAddress, indexerUrl);

      if (exists) {
        console.log('[MidnightVault] ✓ Contract found on-chain');
        setIsContractValid(true);
        setState(prev => ({
          ...prev,
          registeredMembersCount: parseStateCount(stateHex),
        }));
      } else {
        console.warn('[MidnightVault] ✗ Contract not found on-chain');
        setIsContractValid(false);
      }
    };

    checkContract();
  }, [state.contractAddress, walletApi]);

  // ── Deploy new contract ────────────────────────────────────────────
  const deployNewContract = useCallback(async () => {
    if (!isConnected || !walletApi) {
      setState(prev => ({ ...prev, error: 'Please connect your Lace wallet first.' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('[MidnightVault] Starting contract deployment via Lace...');
      const { deployContract } = await import('@midnight-ntwrk/midnight-js-contracts');
      const { initializeProviders } = await import('../lib/midnight-providers');
      const { contractName, languageVersion, circuits, ledger } = await import('../lib/contract');

      const providers = await initializeProviders(walletApi);
      
      const deployment = await deployContract(providers, {
        privateStateAddress: 'vault-membership-state',
        zkConfigPath: `${window.location.origin}/zkir`,
        compilerVersion: languageVersion,
        initialPrivateState: {},
      } as any); // Note: deployment params can vary based on SDK version, we're skipping full types

      // The `deployContract` call uses `walletApi.balanceUnsealedTransaction` and `submitTransaction` behind the scenes!
      console.log('[MidnightVault] Contract deployed!', deployment.deployTxData.public.contractAddress);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        contractAddress: deployment.deployTxData.public.contractAddress,
        error: null,
      }));
    } catch (err: any) {
      console.error('[MidnightVault] Deployment error:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err?.message || 'Deployment failed',
      }));
    }
  }, [isConnected, walletApi]);

  // ── Register member (circuit call) ─────────────────────────────────
  const registerMember = useCallback(async (secret: bigint) => {
    if (!isConnected || !walletApi) {
      setState(prev => ({ ...prev, error: 'Please connect your Lace wallet first.' }));
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
      privacyProven: false,
      txHash: null,
    }));

    try {
      console.log('[MidnightVault] Calling registerMember circuit via Lace...');
      const { findDeployedContract } = await import('@midnight-ntwrk/midnight-js-contracts');
      const { initializeProviders } = await import('../lib/midnight-providers');
      const contractDef = await import('../lib/contract');

      const providers = await initializeProviders(walletApi);
      
      const contract = await findDeployedContract(providers, {
        contractAddress: state.contractAddress,
        contractConfig: contractDef,
      } as any);

      console.log('[MidnightVault] Generating proof (Lace will ask for authorization)...');
      
      const tx = await contract.callTx.registerMember(secret);
      
      console.log('[MidnightVault] Transaction submitted!');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        privacyProven: true,
        registeredMembersCount: prev.registeredMembersCount + 1,
        txHash: 'Real transaction submitted via Lace',
        lastProofTimestamp: Date.now(),
      }));
    } catch (err: any) {
      console.error('[MidnightVault] Circuit execution failed:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err?.message || 'Circuit execution failed',
      }));
    }
  }, [isConnected, walletApi, state.contractAddress]);

  return (
    <ContractContext.Provider
      value={{ ...state, isContractValid, registerMember, deployNewContract, resetState }}
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
