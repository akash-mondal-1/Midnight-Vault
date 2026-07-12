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
 * Prefers mnLace, falls back to any available wallet.
 */
export const detectMidnightWallet = (): DAppConnectorAPI | null => {
  if (typeof window === 'undefined') return null;
  
  // @ts-ignore - window.midnight is injected by Lace wallet extension
  const midnight = window.midnight;
  if (!midnight) return null;

  // Prefer the official Lace connector key
  if (midnight.mnLace) return midnight.mnLace as DAppConnectorAPI;

  // Fallback: enumerate all injected wallets
  const walletKeys = Object.keys(midnight);
  if (walletKeys.length > 0) {
    return midnight[walletKeys[0]] as DAppConnectorAPI;
  }

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
