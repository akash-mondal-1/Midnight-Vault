/**
 * Midnight DApp Connector Providers
 *
 * Simplified browser-compatible providers that work with the Lace wallet
 * DApp connector API. No Node.js-only dependencies.
 */

import type { ConnectedAPI, Configuration } from '@midnight-ntwrk/dapp-connector-api';

// ── Types ───────────────────────────────────────────────────────────────
export interface MidnightWalletState {
  address: string;
  coinPublicKey: string;
  encryptionPublicKey?: string;
}

export interface NetworkConfig {
  indexerUri: string;
  indexerWsUri: string;
  proverUri: string;
  nodeUri: string;
}

// ── Default Network Config ──────────────────────────────────────────────
export const PREVIEW_NETWORK_CONFIG: NetworkConfig = {
  indexerUri: 'https://indexer.testnet.midnight.network/api/v1/graphql',
  indexerWsUri: 'wss://indexer.testnet.midnight.network/api/v1/graphql',
  proverUri: 'https://prover.testnet.midnight.network',
  nodeUri: 'https://rpc.testnet.midnight.network',
};

/**
 * Fetch the wallet's service configuration.
 * Falls back to defaults if the wallet doesn't provide config.
 */
export async function getNetworkConfig(walletApi: ConnectedAPI): Promise<NetworkConfig> {
  try {
    const cfg = await walletApi.getConfiguration();
    return {
      indexerUri: cfg?.indexerUri || PREVIEW_NETWORK_CONFIG.indexerUri,
      indexerWsUri: cfg?.indexerWsUri || PREVIEW_NETWORK_CONFIG.indexerWsUri,
      proverUri: cfg?.proverServerUri || PREVIEW_NETWORK_CONFIG.proverUri,
      nodeUri: cfg?.substrateNodeUri || PREVIEW_NETWORK_CONFIG.nodeUri,
    };
  } catch {
    return PREVIEW_NETWORK_CONFIG;
  }
}

/**
 * Query the Midnight indexer GraphQL endpoint.
 */
export async function queryIndexer<T = any>(
  indexerUri: string,
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const response = await fetch(indexerUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Indexer query failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors?.length) {
    console.warn('[MidnightVault] Indexer query had errors:', json.errors);
  }

  return json.data as T;
}
