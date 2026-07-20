import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';

export type WalletState = {
  isConnected: boolean;
  address: string | null;
  coinPublicKey: string | null;
  error: string | null;
  connector: InitialAPI | null;
  walletApi: ConnectedAPI | null;
  /** Which wallet is currently connected: 'lace' | '1am' | null */
  walletType: WalletType | null;
};

export type WalletType = 'lace' | '1am';

// Network ID — Lace officially supports 'preview' (not preprod)
const NETWORK_ID = (import.meta as any).env?.VITE_NETWORK_ID ?? 'preview';

// ── Wallet Detection ────────────────────────────────────────────────────

/**
 * Finds a specific wallet connector by its key in window.midnight.
 * E.g. key='1am' → window.midnight['1am']
 *      key='lace' → window.midnight['lace'] (if named)
 */
const getConnectorByKey = (key: string): InitialAPI | null => {
  if (typeof window === 'undefined') return null;
  const midnight = (window as any).midnight;
  if (!midnight || typeof midnight !== 'object') return null;
  const w = midnight[key];
  return w && typeof w === 'object' && 'apiVersion' in w ? (w as InitialAPI) : null;
};

/**
 * Finds the first compatible Midnight wallet injected into window.midnight.
 * Official detection pattern: check for 'apiVersion' property on the connector.
 * Returns the connector and what key it was found under.
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
 * Detect 1AM wallet specifically (window.midnight['1am']).
 * Returns the InitialAPI connector or null.
 */
export const get1AMConnector = (): InitialAPI | null => {
  return getConnectorByKey('1am');
};

/**
 * Returns true if ANY Midnight-compatible wallet connector is injected.
 */
export const isMidnightWalletAvailable = (): boolean => {
  return getLaceConnector() !== null;
};

/**
 * Returns true if the 1AM wallet is specifically detected.
 */
export const is1AMWalletAvailable = (): boolean => {
  return get1AMConnector() !== null;
};

/**
 * Returns true if Lace (non-1AM) wallet is detected.
 * Checks if there is any injected connector that is NOT under the '1am' key.
 */
export const isLaceWalletAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  const midnight = (window as any).midnight;
  if (!midnight || typeof midnight !== 'object') return false;
  return Object.entries(midnight).some(
    ([key, w]) =>
      key !== '1am' &&
      !!w &&
      typeof w === 'object' &&
      'apiVersion' in (w as object),
  );
};

// ── Connect Helpers ─────────────────────────────────────────────────────

/**
 * Generic connect helper — connects to whichever connector is provided.
 * Used by both connectLace and connect1AM.
 */
const connectConnector = async (
  connector: InitialAPI,
  walletName: string,
): Promise<{ connector: InitialAPI; walletApi: ConnectedAPI }> => {
  console.log(`[MidnightVault] Connecting to ${walletName} via connect("${NETWORK_ID}")...`);
  try {
    const walletApi = await connector.connect(NETWORK_ID);
    console.log(`[MidnightVault] ✓ ${walletName} connected successfully`);
    return { connector, walletApi };
  } catch (err: any) {
    if (err?.message?.includes('User rejected') || err?.message?.includes('rejected')) {
      throw new Error(`Connection rejected. Please approve in ${walletName}.`);
    }
    if (err?.message?.includes('network') || err?.message?.includes('mismatch')) {
      throw new Error(`Network mismatch. Switch ${walletName} to Midnight Preview (testnet).`);
    }
    throw new Error(err?.message || `Failed to connect ${walletName}`);
  }
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

  // Prefer Lace-specific connector (non-1am key), fall back to any available
  let connector: InitialAPI | null = null;
  const midnight = (window as any).midnight;
  if (midnight && typeof midnight === 'object') {
    const laceEntry = Object.entries(midnight).find(
      ([key, w]) =>
        key !== '1am' &&
        !!w &&
        typeof w === 'object' &&
        'apiVersion' in (w as object),
    );
    if (laceEntry) connector = laceEntry[1] as InitialAPI;
  }
  // Final fallback: any connector
  if (!connector) connector = getLaceConnector();

  if (!connector) {
    throw new Error(
      'Lace wallet not found. Please install Lace and enable the Midnight feature in Settings → Experiments.',
    );
  }

  return connectConnector(connector, 'Lace');
};

/**
 * Connects to the 1AM wallet.
 * 1AM injects at window.midnight['1am'] and supports the standard DApp Connector API.
 * Features faster syncing via its WASM-native proving engine.
 *
 * Source: https://1am.xyz · DApp Connector v4
 */
export const connect1AM = async (): Promise<{
  connector: InitialAPI;
  walletApi: ConnectedAPI;
}> => {
  if (typeof window === 'undefined') {
    throw new Error('Must run in browser');
  }

  const connector = get1AMConnector();
  if (!connector) {
    throw new Error(
      '1AM wallet not found. Please install the 1AM extension from chromewebstore.google.com/detail/1am/bphnkdkcnfhompoegfpgnkidcjfbojjp',
    );
  }

  return connectConnector(connector, '1AM');
};

// ── Address Helpers ─────────────────────────────────────────────────────

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
