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
    const connectors = Object.values(midnight).filter(
      (c: any) => c && typeof c === 'object' && typeof c.connect === 'function'
    ) as InitialAPI[];

    if (connectors.length === 0) return null;

    // Find the Lace connector specifically by rdns or name
    const laceConnector = connectors.find(
      (c) => c.rdns?.includes('lace') || c.name?.toLowerCase().includes('lace')
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
 * Connects to the Lace wallet.
 * Network ID should match what Lace is configured to:
 *   - 'testnet' for Midnight Preview/Preprod
 *   - 'mainnet' for production
 */
export const connectLace = async (
  networkId: string = 'preview'
): Promise<{
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

  console.log(`[MidnightVault] Connecting to wallet ${connector.name} (${connector.rdns}) on network: ${networkId}`);
  
  try {
    const walletApi = await connector.connect(networkId);
    console.log('[MidnightVault] ✓ Wallet connected successfully');
    return { connector, walletApi };
  } catch (err: any) {
    // Handle specific error codes from the DApp connector
    if (err?.code === 'USER_REJECTED' || err?.message?.includes('rejected')) {
      throw new Error('Connection rejected by user. Please approve in Lace.');
    }
    if (err?.code === 'NETWORK_MISMATCH' || err?.message?.includes('network')) {
      throw new Error('Network mismatch. Please switch Lace to the Midnight testnet.');
    }
    throw err;
  }
};

/**
 * Retrieves the shielded address information from the wallet API.
 * Uses the official ConnectedAPI.getShieldedAddresses() method.
 */
export const getWalletState = async (
  walletApi: ConnectedAPI
): Promise<{ address: string; coinPublicKey: string }> => {
  const state = await walletApi.getShieldedAddresses();
  return {
    address: state.shieldedAddress,
    coinPublicKey: state.shieldedCoinPublicKey,
  };
};
