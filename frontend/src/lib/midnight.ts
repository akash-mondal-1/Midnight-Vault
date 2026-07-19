import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';

export type WalletState = {
  isConnected: boolean;
  address: string | null;
  coinPublicKey: string | null;
  error: string | null;
  connector: InitialAPI | null;
  walletApi: ConnectedAPI | null;
};

// Network ID for Midnight Preprod
const NETWORK_ID = (import.meta as any).env?.VITE_NETWORK_ID ?? 'preprod';

/**
 * Finds the first compatible Midnight wallet injected into window.midnight.
 * Official detection pattern: check for 'apiVersion' property on the connector.
 * Source: leaderboard-ref/leaderboard-ui/src/App.tsx
 */
export const getLaceConnector = (): InitialAPI | null => {
  if (typeof window === 'undefined') return null;
  const midnight = (window as any).midnight;
  if (!midnight || typeof midnight !== 'object') return null;

  // Official pattern from Midnight reference: find by apiVersion presence
  const found = Object.values(midnight).find(
    (w): w is InitialAPI =>
      !!w && typeof w === 'object' && 'apiVersion' in (w as object),
  );

  return found ?? null;
};

/**
 * Returns true if a Midnight wallet connector is available in window.midnight.
 */
export const isMidnightWalletAvailable = (): boolean => {
  return getLaceConnector() !== null;
};

/**
 * Connects to the Midnight Lace wallet.
 * Uses the official DApp Connector API: initialAPI.connect(networkId)
 * This triggers the Lace permission popup.
 *
 * Source: leaderboard-ref — `const c = await walletAPI.connect(NETWORK_ID)`
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
      'Midnight wallet not found. Please install Lace and enable the Midnight feature in Settings → Experiments.',
    );
  }

  console.log(`[MidnightVault] Connecting via connect("${NETWORK_ID}")...`);

  try {
    // This is the official call — triggers the Lace popup
    const walletApi = await connector.connect(NETWORK_ID);
    console.log('[MidnightVault] ✓ Wallet connected successfully');
    return { connector, walletApi };
  } catch (err: any) {
    if (err?.message?.includes('User rejected') || err?.message?.includes('rejected')) {
      throw new Error('Connection rejected. Please approve in Lace.');
    }
    if (err?.message?.includes('network') || err?.message?.includes('mismatch')) {
      throw new Error('Network mismatch. Switch Lace to Midnight Preprod.');
    }
    throw new Error(err?.message || 'Failed to connect wallet');
  }
};

/**
 * Retrieves the wallet address after connection.
 * Official method: getUnshieldedAddress() → { unshieldedAddress }
 * Falls back to getShieldedAddresses() for older API versions.
 *
 * Source: leaderboard-ref — `const { unshieldedAddress } = await c.getUnshieldedAddress()`
 */
export const getWalletState = async (
  walletApi: ConnectedAPI,
): Promise<{ address: string; coinPublicKey: string }> => {
  // Try official v3 method first
  try {
    const res = await (walletApi as any).getUnshieldedAddress();
    return {
      address: res.unshieldedAddress ?? '',
      coinPublicKey: res.coinPublicKey ?? '',
    };
  } catch {
    // Fallback: try state()
    try {
      const s = await (walletApi as any).state();
      return {
        address: s.address ?? s.shieldedAddress ?? '',
        coinPublicKey: s.coinPublicKey ?? s.shieldedCoinPublicKey ?? '',
      };
    } catch {
      // Final fallback: getShieldedAddresses()
      const s = await (walletApi as any).getShieldedAddresses();
      return {
        address: s.shieldedAddress ?? '',
        coinPublicKey: s.shieldedCoinPublicKey ?? '',
      };
    }
  }
};
