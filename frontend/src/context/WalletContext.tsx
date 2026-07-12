"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  WalletState,
  connectLace,
  getWalletState,
  isMidnightWalletAvailable,
} from '@/lib/midnight';
import type { DAppConnectorWalletAPI } from '@midnight-ntwrk/dapp-connector-api';

interface WalletContextType extends WalletState {
  isWalletAvailable: boolean;
  connectWallet: () => Promise<void>;
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
  });
  const [isWalletAvailable, setIsWalletAvailable] = useState(false);

  // Check wallet availability after mount (extension injects after DOM ready)
  // Try multiple times to handle slow extension injection
  useEffect(() => {
    const check = () => setIsWalletAvailable(isMidnightWalletAvailable());
    check();
    const t1 = setTimeout(check, 500);
    const t2 = setTimeout(check, 1500);
    const t3 = setTimeout(check, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const connectWallet = useCallback(async () => {
    setState(prev => ({ ...prev, error: null }));

    try {
      const { connector, walletApi } = await connectLace();
      const { address, coinPublicKey } = await getWalletState(walletApi);

      setState({
        isConnected: true,
        address,
        coinPublicKey,
        error: null,
        connector,
        walletApi,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      console.error('Wallet connection error:', err);
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: message,
        connector: null,
        walletApi: null,
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      address: null,
      coinPublicKey: null,
      error: null,
      connector: null,
      walletApi: null,
    });
  }, []);

  return (
    <WalletContext.Provider value={{ ...state, isWalletAvailable, connectWallet, disconnect }}>
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
