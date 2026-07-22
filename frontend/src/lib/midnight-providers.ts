import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { createProverKey, createVerifierKey, createZKIR } from '@midnight-ntwrk/midnight-js-types';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import type { MidnightProviders, UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';
import { Transaction } from '@midnight-ntwrk/ledger-v7';

// Utility for hex conversion
export const toHex = (arr: Uint8Array): string => Buffer.from(arr).toString('hex');
export const fromHex = (hex: string): Uint8Array => new Uint8Array(Buffer.from(hex, 'hex'));

// Custom ZK Config Provider that supports multiple file extension conventions (.pk / .prover, .vk / .verifier, .zkir / .bzkir)
// This prevents 404 retries and 2-3 minute timeouts when fetching circuit artifacts.
class CustomZkConfigProvider extends FetchZkConfigProvider {
  private async fetchWithFallback(
    path: string,
    circuitId: string,
    exts: string[],
    responseType: 'text' | 'arraybuffer'
  ): Promise<any> {
    for (const ext of exts) {
      try {
        const url = `${this.baseURL}/${path}/${circuitId}${ext}`;
        console.log(`[MidnightVault] Fetching ZK artifact from: ${url}`);
        const response = await (this as any).fetchFunc(url, { method: 'GET' });
        if (response.ok) {
          console.log(`[MidnightVault] ✓ Found ZK artifact at: ${url}`);
          return responseType === 'text'
            ? await response.text()
            : new Uint8Array(await response.arrayBuffer());
        }
      } catch (err: any) {
        console.warn(`[MidnightVault] Retry fallback for ${circuitId}${ext}:`, err?.message);
      }
    }
    throw new Error(`Failed to fetch ZK artifact for ${circuitId} under path ${path}`);
  }

  override async getProverKey(circuitId: string) {
    return this.fetchWithFallback('keys', circuitId, ['.pk', '.prover'], 'arraybuffer').then(createProverKey);
  }

  override async getVerifierKey(circuitId: string) {
    return this.fetchWithFallback('keys', circuitId, ['.vk', '.verifier'], 'arraybuffer').then(createVerifierKey);
  }

  override async getZKIR(circuitId: string) {
    return this.fetchWithFallback('zkir', circuitId, ['.zkir', '.bzkir'], 'arraybuffer').then(createZKIR);
  }
}

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

  // Create ZK Config Provider with fast fallback logic
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const zkConfigProvider = new CustomZkConfigProvider(origin, fetch.bind(window));

  return {
    privateStateProvider: privateStateProviderInstance as any,
    zkConfigProvider,
    proofProvider: httpClientProofProvider(proofServerUri, zkConfigProvider),
    publicDataProvider: indexerPublicDataProvider(config.indexerUri, config.indexerWsUri),
    walletProvider: {
      getCoinPublicKey: () => shieldedAddresses.shieldedCoinPublicKey,
      getEncryptionPublicKey: () => shieldedAddresses.shieldedEncryptionPublicKey,
      balanceTx: async (tx: UnboundTransaction) => {
        // Balance the transaction using Lace / 1AM Wallet
        const txHex = toHex(tx.serialize());
        const received = await connectedAPI.balanceUnsealedTransaction(txHex);
        
        // Deserialize the balanced transaction returned by wallet
        return Transaction.deserialize('signature', 'proof', 'binding', fromHex(received.tx));
      },
    },
    midnightProvider: {
      submitTx: async (tx: any) => {
        // Submit the finalized transaction through wallet
        const txHex = toHex(tx.serialize());
        await connectedAPI.submitTransaction(txHex);
        return tx.identifiers()[0];
      },
    },
  };
};
