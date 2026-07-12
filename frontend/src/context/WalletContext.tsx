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
  useEffect(() => {
    const check = () => setIsWalletAvailable(isMidnightWalletAvailable());
    // Check immediately and after a short delay to allow the extension to inject
    check();
    const timer = setTimeout(check, 800);
    return () => clearTimeout(timer);
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
