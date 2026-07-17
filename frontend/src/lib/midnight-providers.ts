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

// We don't have a full private state for this simple contract, so we use a dummy one
const dummyPrivateStateProvider = {
  get: async () => ({}),
  set: async () => {},
  remove: async () => {},
};

export const initializeProviders = async (
  connectedAPI: ConnectedAPI,
  networkId: string = 'preview'
): Promise<MidnightProviders> => {
  // Set the global network ID
  setNetworkId(networkId);

  // Get Lace configuration and shielded addresses
  const config = await connectedAPI.getConfiguration();
  
  // Try to use proverServerUri if provided, otherwise fallback to the public preview proof server
  const proofServerUri = config.proverServerUri || 'https://proof-server.preview.midnight.network';
  const shieldedAddresses = await connectedAPI.getShieldedAddresses();

  // Create ZK Config Provider that fetches from the DApp's public directory
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const zkConfigProvider = new FetchZkConfigProvider(origin, fetch.bind(window));

  return {
    privateStateProvider: dummyPrivateStateProvider as any,
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
