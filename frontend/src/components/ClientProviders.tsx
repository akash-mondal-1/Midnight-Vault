"use client";

import React from 'react';
import { WalletProvider } from '@/context/WalletContext';
import { ContractProvider } from '@/context/ContractContext';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { ExtensionErrorSuppressor } from '@/components/ui/ExtensionErrorSuppressor';

/**
 * Client-side providers wrapper.
 * Separating this into its own "use client" component ensures that:
 * 1. The providers are only initialized on the client side
 * 2. No SSR hydration mismatches from wallet detection
 * 3. The animated background renders only in the browser
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ExtensionErrorSuppressor />
      <AnimatedBackground />
      <WalletProvider>
        <ContractProvider>
          {children}
        </ContractProvider>
      </WalletProvider>
    </>
  );
}
