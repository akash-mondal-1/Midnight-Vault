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

  console.log('[MidnightVault] Is window.midnight.mnLace defined?', !!midnight.mnLace);
  console.dir(midnight.mnLace);

  // Find the first UUID key injected by Lace (or use midnight directly)
  const keys = Object.keys(midnight);
  let connectorKey = keys.length > 0 ? keys[0] : '__self__';
  let connector = keys.length > 0 ? midnight[keys[0]] : midnight;

  // Prefer mnLace if it exists, as it is the official DAppConnectorAPI object
  if (midnight.mnLace) {
    connectorKey = 'mnLace';
    connector = midnight.mnLace;
  }

  if (!connector) {
    throw new Error('Lace is installed but no valid connector was found at window.midnight.');
  }

  let walletApi: any = null;

  if (typeof connector.enable === 'function') {
    console.log(`[MidnightVault] Calling enable()...`);
    walletApi = await connector.enable();
  } else if (typeof connector.connect === 'function') {
    console.log(`[MidnightVault] Connector missing enable(). Trying connect() fallback...`);
    try {
      // Try passing network options to satisfy Lace's internal API
      walletApi = await connector.connect('preprod');
    } catch (e1: any) {
      if (e1?.message?.includes('Invalid network ID')) {
         try {
           walletApi = await connector.connect({ networkId: 'preprod' });
         } catch (e2) {
           try {
             walletApi = await connector.connect(); // Last resort
           } catch (e3) {
             throw e1;
           }
         }
      } else {
         throw e1;
      }
    }
  } else {
    throw new Error(`The Midnight wallet connector does not support enable() or connect(). Please check for Lace extension updates.`);
  }

  return { connector: connector as DAppConnectorAPI, walletApi };
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
