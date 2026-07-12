import type { DAppConnectorAPI, DAppConnectorWalletAPI } from '@midnight-ntwrk/dapp-connector-api';

export type WalletState = {
  isConnected: boolean;
  address: string | null;
  coinPublicKey: string | null;
  error: string | null;
  connector: DAppConnectorAPI | null;
  walletApi: DAppConnectorWalletAPI | null;
};

/**
 * Detects available Midnight wallets injected into window.midnight.
 * Checks that the connector actually has an enable() function.
 * Handles UUID-based key injection used by newer Lace versions.
 */
export const detectMidnightWallet = (): DAppConnectorAPI | null => {
  if (typeof window === 'undefined') return null;

  // @ts-ignore - window.midnight is injected by Lace wallet extension
  const midnight = window.midnight;
  if (!midnight || typeof midnight !== 'object') return null;

  // Check mnLace first — but verify it actually has enable()
  if (midnight.mnLace && typeof midnight.mnLace.enable === 'function') {
    return midnight.mnLace as DAppConnectorAPI;
  }

  // Enumerate ALL keys — Lace may inject under a UUID-based key in newer versions
  for (const key of Object.keys(midnight)) {
    const wallet = midnight[key];
    if (wallet && typeof wallet === 'object' && typeof wallet.enable === 'function') {
      return wallet as DAppConnectorAPI;
    }
  }

  // Last resort: if something is injected but enable isn't a function yet
  // (extension still loading), return null so user retries
  return null;
};

/**
 * Returns true if a Midnight-compatible wallet is available in the browser.
 */
export const isMidnightWalletAvailable = (): boolean => {
  return detectMidnightWallet() !== null;
};

/**
 * Connects to the Lace wallet via the DApp Connector API.
 * This will trigger the wallet's permission dialog in the browser.
 * Returns the enabled wallet API upon user approval.
 */
export const connectLace = async (): Promise<{
  connector: DAppConnectorAPI;
  walletApi: DAppConnectorWalletAPI;
}> => {
  if (typeof window === 'undefined') {
    throw new Error('Window is not defined. This must run in a browser.');
  }

  const connector = detectMidnightWallet();
  
  if (!connector) {
    throw new Error(
      'Midnight Lace Wallet not found. Please install the Lace wallet extension and enable the Midnight network in its settings.'
    );
  }

  // Request wallet access — this triggers the Lace permission popup
  const walletApi = await connector.enable();
  return { connector, walletApi };
};

/**
 * Fetches the wallet state (address, coinPublicKey) from the enabled wallet API.
 */
export const getWalletState = async (
  walletApi: DAppConnectorWalletAPI
): Promise<{ address: string; coinPublicKey: string }> => {
  const state = await walletApi.state();
  return {
    address: state.address,
    coinPublicKey: state.coinPublicKey,
  };
};
