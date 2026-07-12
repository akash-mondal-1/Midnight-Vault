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
 * Finds any valid Midnight wallet object from window.midnight.
 * Handles two injection patterns from Lace:
 *   - Pattern A: connector with enable() → call enable() to get walletApi
 *   - Pattern B: walletApi injected directly (has state(), no enable())
 */
const findMidnightObject = (): { hasEnable: boolean; obj: any } | null => {
  if (typeof window === 'undefined') return null;

  // @ts-ignore
  const midnight = window.midnight;
  if (!midnight || typeof midnight !== 'object') return null;

  console.debug('[MidnightVault] window.midnight keys:', Object.keys(midnight));

  // Check direct properties first (window.midnight.enable or window.midnight.state)
  if (typeof midnight.enable === 'function') return { hasEnable: true, obj: midnight };
  if (typeof midnight.state === 'function') return { hasEnable: false, obj: midnight };

  // Enumerate all keys (handles UUID-based injection like abbefa01-8675-...)
  for (const key of Object.keys(midnight)) {
    const obj = midnight[key];
    if (!obj || typeof obj !== 'object') continue;

    console.debug(`[MidnightVault] Checking key "${key}":`, {
      hasEnable: typeof obj.enable === 'function',
      hasState: typeof obj.state === 'function',
    });

    if (typeof obj.enable === 'function') return { hasEnable: true, obj };
    if (typeof obj.state === 'function') return { hasEnable: false, obj };
  }

  console.debug('[MidnightVault] No valid connector found in window.midnight');
  return null;
};

/**
 * Returns true if a Midnight wallet is available and usable in the browser.
 */
export const isMidnightWalletAvailable = (): boolean => {
  return findMidnightObject() !== null;
};

/**
 * Connects to the Midnight Lace wallet.
 *
 * Lace can inject in two ways:
 *   1. DAppConnectorAPI (has enable()) → call enable() to get walletApi
 *   2. DAppConnectorWalletAPI directly (has state()) → use as-is
 *
 * Returns both connector (may be null) and walletApi.
 */
export const connectLace = async (): Promise<{
  connector: DAppConnectorAPI | null;
  walletApi: DAppConnectorWalletAPI;
}> => {
  if (typeof window === 'undefined') {
    throw new Error('Window is not defined. This must run in a browser.');
  }

  const found = findMidnightObject();

  if (!found) {
    throw new Error(
      'Midnight wallet not found. Please install the Lace wallet extension and enable the Midnight feature in Settings → Experiments.'
    );
  }

  if (found.hasEnable) {
    // Standard DApp Connector API — call enable() to trigger permission popup
    console.debug('[MidnightVault] Calling connector.enable()...');
    const walletApi: DAppConnectorWalletAPI = await found.obj.enable();
    return { connector: found.obj as DAppConnectorAPI, walletApi };
  } else {
    // Wallet API already injected directly — no enable() needed
    console.debug('[MidnightVault] Using directly-injected wallet API (no enable() needed)');
    return { connector: null, walletApi: found.obj as DAppConnectorWalletAPI };
  }
};

/**
 * Gets address and coinPublicKey from the wallet API.
 */
export const getWalletState = async (
  walletApi: DAppConnectorWalletAPI
): Promise<{ address: string; coinPublicKey: string }> => {
  const state = await walletApi.state();
  console.debug('[MidnightVault] Wallet state:', state);
  return {
    address: state.address,
    coinPublicKey: state.coinPublicKey,
  };
};
