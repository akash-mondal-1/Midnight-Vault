"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  WalletState,
  WalletType,
  connectLace,
  connect1AM,
  getWalletState,
  isMidnightWalletAvailable,
  is1AMWalletAvailable,
  isLaceWalletAvailable,
} from '@/lib/midnight';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';

interface WalletContextType extends WalletState {
  isWalletAvailable: boolean;
  is1AMAvailable: boolean;
  isLaceAvailable: boolean;
  connectWallet: () => Promise<void>;
  connect1AMWallet: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    coinPublicKey: null,
    error: null,
    connector: null,
    walletApi: null,
    walletType: null,
  });
  const [isWalletAvailable, setIsWalletAvailable] = useState(false);
  const [is1AMAvailable, setIs1AMAvailable] = useState(false);
  const [isLaceAvailable, setIsLaceAvailable] = useState(false);

  // Check wallet availability after mount (extension injects after DOM ready)
  // Try multiple times to handle slow extension injection
  useEffect(() => {
    const check = () => {
      setIsWalletAvailable(isMidnightWalletAvailable());
      setIs1AMAvailable(is1AMWalletAvailable());
      setIsLaceAvailable(isLaceWalletAvailable());
    };
    check();
    const t1 = setTimeout(check, 500);
    const t2 = setTimeout(check, 1500);
    const t3 = setTimeout(check, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  /**
   * Internal helper to perform connection + state update.
   */
  const performConnect = useCallback(async (
    connectFn: () => Promise<{ connector: any; walletApi: ConnectedAPI }>,
    type: WalletType,
  ) => {
    setState(prev => ({ ...prev, error: null }));

    try {
      const { connector, walletApi } = await connectFn();
      const { address, coinPublicKey } = await getWalletState(walletApi);

      setState({
        isConnected: true,
        address,
        coinPublicKey,
        error: null,
        connector,
        walletApi,
        walletType: type,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      console.error(`[MidnightVault] ${type} connection error:`, err);
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: message,
        connector: null,
        walletApi: null,
        walletType: null,
      }));
    }
  }, []);

  /** Connect via Lace wallet */
  const connectWallet = useCallback(async () => {
    await performConnect(connectLace, 'lace');
  }, [performConnect]);

  /** Connect via 1AM wallet */
  const connect1AMWallet = useCallback(async () => {
    await performConnect(connect1AM, '1am');
  }, [performConnect]);

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      address: null,
      coinPublicKey: null,
      error: null,
      connector: null,
      walletApi: null,
      walletType: null,
    });
  }, []);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        isWalletAvailable,
        is1AMAvailable,
        isLaceAvailable,
        connectWallet,
        connect1AMWallet,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
