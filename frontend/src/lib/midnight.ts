import type { DAppConnectorAPI } from '@midnight-ntwrk/dapp-connector-api';

export type WalletState = {
  isConnected: boolean;
  address: string | null;
  error: string | null;
  connector: DAppConnectorAPI | null;
};

export const connectLace = async (): Promise<DAppConnectorAPI> => {
  if (typeof window === 'undefined') {
    throw new Error('Window is not defined');
  }

  // @ts-ignore - midnight is injected by Lace
  const midnight = window.midnight;
  
  if (!midnight || !midnight.mnLace) {
    throw new Error('Lace wallet not found. Please install the Lace extension.');
  }

  const isEnabled = await midnight.mnLace.isEnabled();
  
  const connector = await midnight.mnLace.enable();
  return connector as unknown as DAppConnectorAPI;
};

export const getWalletState = async (connector: DAppConnectorAPI): Promise<Partial<WalletState>> => {
  try {
    const api = connector as any;
    const addresses = await api.state().addresses();
    if (addresses && addresses.length > 0) {
      return {
        isConnected: true,
        address: addresses[0],
      };
    }
  } catch (error) {
    console.error("Failed to get wallet state", error);
  }
  
  return {
    isConnected: false,
    address: null,
  };
};
