import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';

export type WalletState = {
  isConnected: boolean;
  address: string | null;
  coinPublicKey: string | null;
  error: string | null;
  connector: InitialAPI | null;
  walletApi: ConnectedAPI | null;
};

/**
 * Enumerates window.midnight to find a wallet connector with a connect function.
 * The DApp connector API defines: window.midnight = { [key: string]: InitialAPI }
 */
export const getLaceConnector = (): InitialAPI | null => {
  if (typeof window === 'undefined' || !(window as any).midnight) return null;

  try {
    const midnight = (window as any).midnight;
    // DApp Connector API v3: connector must have enable() method
    const connectors = Object.values(midnight).filter(
      (c: any) => c && typeof c === 'object' && (
        typeof c.enable === 'function' || typeof c.connect === 'function'
      )
    ) as InitialAPI[];

    if (connectors.length === 0) return null;

    // Find the Lace connector specifically by rdns or name, prefer enable()
    const laceConnector = connectors.find(
      (c: any) => c.rdns?.includes('lace') || c.name?.toLowerCase().includes('lace')
    );

    return laceConnector || connectors[0];
  } catch {
    return null;
  }
};

/**
 * Returns true if a Midnight wallet connector is available.
 */
export const isMidnightWalletAvailable = (): boolean => {
  return getLaceConnector() !== null;
};

/**
 * Connects to the Lace wallet using the official DApp Connector API v3.
 * Uses enable() which triggers the Lace permission popup.
 * Network ID: 'preprod' for Midnight Preprod testnet.
 */
export const connectLace = async (): Promise<{
  connector: InitialAPI;
  walletApi: ConnectedAPI;
}> => {
  if (typeof window === 'undefined') {
    throw new Error('Must run in browser');
  }

  const connector = getLaceConnector();
  if (!connector) {
    throw new Error(
      'Midnight wallet not found. Please install Lace and enable the Midnight feature in Settings → Experiments.'
    );
  }

  console.log(`[MidnightVault] Connecting via enable() — wallet: ${(connector as any).name || 'unknown'}`);

  try {
    // DApp Connector API v3: enable() opens the Lace permission popup
    const walletApi = await (connector as any).enable();
    console.log('[MidnightVault] ✓ Wallet connected successfully via enable()');
    return { connector, walletApi };
  } catch (err: any) {
    if (err?.code === 'USER_REJECTED' || err?.message?.includes('rejected')) {
      throw new Error('Connection rejected by user. Please approve in Lace.');
    }
    if (err?.code === 'NETWORK_MISMATCH' || err?.message?.includes('network')) {
      throw new Error('Network mismatch. Please switch Lace to Midnight Preprod.');
    }
    throw err;
  }
};

/**
 * Retrieves wallet address info from the connected API.
 * Tries state() first (DApp Connector v3), falls back to getShieldedAddresses().
 */
export const getWalletState = async (
  walletApi: ConnectedAPI
): Promise<{ address: string; coinPublicKey: string }> => {
  try {
    // DApp Connector API v3 method
    const s = await (walletApi as any).state();
    return {
      address: s.address || s.shieldedAddress || '',
      coinPublicKey: s.coinPublicKey || s.shieldedCoinPublicKey || '',
    };
  } catch {
    // Fallback for older API shape
    const s = await (walletApi as any).getShieldedAddresses();
    return {
      address: s.shieldedAddress || '',
      coinPublicKey: s.shieldedCoinPublicKey || '',
    };
  }
};
