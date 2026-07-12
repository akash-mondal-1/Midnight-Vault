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
 * Returns true if window.midnight has ANY entries — even if we can't yet
 * determine the exact API shape. Err on the side of availability.
 */
export const isMidnightWalletAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    // @ts-ignore
    const midnight = window.midnight;
    if (!midnight || typeof midnight !== 'object') return false;

    // Has direct enable or state → definitely available
    if (typeof midnight.enable === 'function' || typeof midnight.state === 'function') return true;

    // Has any non-null key → likely available (UUID injection)
    const keys = Object.keys(midnight);
    if (keys.length > 0) {
      const firstVal = midnight[keys[0]];
      // Return true as long as something is injected
      return firstVal !== null && firstVal !== undefined;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Connects to the Midnight wallet.
 *
 * Lace injects window.midnight["UUID"] = MidnightWalletApi directly.
 * That object has state() but NOT enable(). We detect both cases.
 */
export const connectLace = async (): Promise<{
  connector: DAppConnectorAPI | null;
  walletApi: DAppConnectorWalletAPI;
}> => {
  if (typeof window === 'undefined') {
    throw new Error('Must run in browser');
  }

  // @ts-ignore
  const midnight = window.midnight;

  if (!midnight || typeof midnight !== 'object') {
    throw new Error(
      'Midnight wallet not found. Please install Lace and enable the Midnight feature in Settings → Experiments.'
    );
  }

  // Collect all candidates: midnight itself + all its values
  const candidates: Array<{ key: string; val: any }> = [
    { key: '__self__', val: midnight },
    ...Object.keys(midnight).map(k => ({ key: k, val: midnight[k] })),
  ];

  console.log('[MidnightVault] connectLace: candidates', candidates.map(c => ({
    key: c.key,
    hasEnable: typeof c.val?.enable === 'function',
    hasState: typeof c.val?.state === 'function',
    protoState: typeof Object.getPrototypeOf(c.val ?? {})?.state,
    type: typeof c.val,
  })));

  for (const { key, val } of candidates) {
    if (!val || typeof val !== 'object') continue;

    // Pattern A: has enable() → DAppConnectorAPI — call enable() to get walletApi
    if (typeof val.enable === 'function') {
      console.log(`[MidnightVault] Pattern A: enable() found at "${key}"`);
      const walletApi: DAppConnectorWalletAPI = await val.enable();
      return { connector: val as DAppConnectorAPI, walletApi };
    }

    // Pattern B: has state() directly — already the walletApi
    if (typeof val.state === 'function') {
      console.log(`[MidnightVault] Pattern B: state() found at "${key}" — using directly`);
      return { connector: null, walletApi: val as DAppConnectorWalletAPI };
    }

    // Pattern C: check prototype chain for state (class instance)
    const proto = Object.getPrototypeOf(val);
    if (proto && typeof proto.state === 'function') {
      console.log(`[MidnightVault] Pattern C: state() on prototype at "${key}"`);
      return { connector: null, walletApi: val as DAppConnectorWalletAPI };
    }

    // Pattern D: try calling state() blindly — Proxy objects may hide methods
    try {
      const stateResult = await val.state?.();
      if (stateResult && (stateResult.address || stateResult.coinPublicKey)) {
        console.log(`[MidnightVault] Pattern D: val.state() worked blindly at "${key}"`);
        return { connector: null, walletApi: val as DAppConnectorWalletAPI };
      }
    } catch {
      // not this one
    }
  }

  throw new Error(
    'Lace is installed but the Midnight connector API could not be accessed. ' +
    'Please ensure the Midnight feature is enabled in Lace Settings → Experiments, then reload.'
  );
};

/**
 * Gets address and coinPublicKey from the wallet API.
 */
export const getWalletState = async (
  walletApi: DAppConnectorWalletAPI
): Promise<{ address: string; coinPublicKey: string }> => {
  const state = await walletApi.state();
  console.log('[MidnightVault] Wallet state received:', state);
  return {
    address: (state as any).address ?? (state as any).midnight?.address ?? 'unknown',
    coinPublicKey: (state as any).coinPublicKey ?? (state as any).midnight?.coinPublicKey ?? 'unknown',
  };
};
