"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { WalletState, connectLace, getWalletState } from '@/lib/midnight';
import type { DAppConnectorAPI } from '@midnight-ntwrk/dapp-connector-api';

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    error: null,
    connector: null,
  });

  const connectWallet = async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const connector = await connectLace();
      const walletState = await getWalletState(connector);
      
      setState({
        isConnected: walletState.isConnected || false,
        address: walletState.address || null,
        error: null,
        connector,
      });
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setState(prev => ({ ...prev, error: err.message || 'Failed to connect wallet' }));
    }
  };

  const disconnect = () => {
    setState({
      isConnected: false,
      address: null,
      error: null,
      connector: null,
    });
  };

  return (
    <WalletContext.Provider value={{ ...state, connectWallet, disconnect }}>
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
