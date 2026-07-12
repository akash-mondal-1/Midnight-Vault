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
 * Returns true if window.midnight has ANY entries.
 */
export const isMidnightWalletAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    // @ts-ignore
    const midnight = window.midnight;
    if (!midnight || typeof midnight !== 'object') return false;

    // Has direct enable → available
    if (typeof midnight.enable === 'function') return true;

    // Has any non-null key → likely available (UUID injection)
    const keys = Object.keys(midnight);
    if (keys.length > 0) {
      const firstVal = midnight[keys[0]];
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
 * For SDK v3, the flow is:
 * window.midnight -> UUID -> enable() -> walletApi -> state()
 */
export const connectLace = async (): Promise<{
  connector: DAppConnectorAPI;
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

  for (const { val } of candidates) {
    if (!val || typeof val !== 'object') continue;

    // Only one supported flow: DAppConnectorAPI exposes enable()
    if (typeof val.enable === 'function') {
      const walletApi = await val.enable();
      return { connector: val as DAppConnectorAPI, walletApi };
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
  
  return {
    // The official interface returns these directly in state()
    address: (state as any).address ?? 'unknown',
    coinPublicKey: (state as any).coinPublicKey ?? 'unknown',
  };
};
