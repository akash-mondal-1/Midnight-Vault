import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import type { MidnightProviders, UnboundTransaction, MidnightProvider, WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import { Transaction } from '@midnight-ntwrk/ledger-v7';

// Utility for hex conversion
export const toHex = (arr: Uint8Array): string => Buffer.from(arr).toString('hex');
export const fromHex = (hex: string): Uint8Array => new Uint8Array(Buffer.from(hex, 'hex'));

// In-memory private state provider implementation matching PrivateStateProvider interface
const createInMemoryPrivateStateProvider = () => {
  const states = new Map<string, any>();
  const signingKeys = new Map<string, any>();
  let currentContractAddress: string | null = null;

  return {
    setContractAddress: (address: string) => {
      currentContractAddress = address;
    },
    getContractAddress: () => currentContractAddress,
    get: async (key: string) => states.get(key) ?? null,
    set: async (key: string, state: any) => {
      states.set(key, state);
    },
    remove: async (key: string) => {
      states.delete(key);
    },
    getSigningKey: async (address?: string) => {
      const addr = address ?? currentContractAddress;
      return addr ? (signingKeys.get(addr) ?? null) : null;
    },
    setSigningKey: async (address: string, signingKey: any) => {
      signingKeys.set(address, signingKey);
    },
    clear: async () => {
      states.clear();
      signingKeys.clear();
    },
  };
};

const privateStateProviderInstance = createInMemoryPrivateStateProvider();

export const initializeProviders = async (
  connectedAPI: ConnectedAPI,
  networkId: string = 'preview'
): Promise<MidnightProviders> => {
  // Set the global network ID
  setNetworkId(networkId);

  // Get Lace configuration and shielded addresses
  const config = await connectedAPI.getConfiguration();
  
  // Try to use proverServerUri from wallet config, then env var, then fallback to preview default
  const envProofServer = (import.meta as any).env?.VITE_PROOF_SERVER_URI;
  const proofServerUri =
    config.proverServerUri ||
    envProofServer ||
    'https://proof-server.preview.midnight.network';
  const shieldedAddresses = await connectedAPI.getShieldedAddresses();

  // Create ZK Config Provider that fetches from the DApp's public directory
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const zkConfigProvider = new FetchZkConfigProvider(origin, fetch.bind(window));

  return {
    privateStateProvider: privateStateProviderInstance as any,
    zkConfigProvider,
    proofProvider: httpClientProofProvider(proofServerUri, zkConfigProvider),
    publicDataProvider: indexerPublicDataProvider(config.indexerUri, config.indexerWsUri),
    walletProvider: {
      getCoinPublicKey: () => shieldedAddresses.shieldedCoinPublicKey,
      getEncryptionPublicKey: () => shieldedAddresses.shieldedEncryptionPublicKey,
      balanceTx: async (tx: UnboundTransaction) => {
        // Balance the transaction using Lace Wallet
        const txHex = toHex(tx.serialize());
        const received = await connectedAPI.balanceUnsealedTransaction(txHex);
        
        // Deserialize the balanced transaction returned by Lace
        return Transaction.deserialize('signature', 'proof', 'binding', fromHex(received.tx));
      },
    },
    midnightProvider: {
      submitTx: async (tx: any) => {
        // Submit the finalized transaction through Lace
        const txHex = toHex(tx.serialize());
        await connectedAPI.submitTransaction(txHex);
        return tx.identifiers()[0];
      },
    },
  };
};
