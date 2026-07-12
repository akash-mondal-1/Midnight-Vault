"use client";

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { MoonButton } from './MoonButton';
import { useWallet } from '@/context/WalletContext';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletConnectModal = ({ isOpen, onClose }: WalletConnectModalProps) => {
  const { connectWallet, isConnected, isWalletAvailable, error } = useWallet();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close when connected
  useEffect(() => {
    if (isConnected && isOpen) {
      const timer = setTimeout(onClose, 800);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label="Connect Wallet"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-space-black/80 backdrop-blur-md" />

          {/* Modal Panel */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="relative z-10 w-full max-w-md bg-midnight-blue/90 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Crescent shimmer top */}
            <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* Glow orb */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-soft-indigo/10 blur-[80px] pointer-events-none" />

            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-moon-white/10 flex items-center justify-center">
                    <MoonSvgIcon className="w-5 h-5 text-moon-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-moon-white">Connect Wallet</h2>
                    <p className="text-xs text-silver/60">Midnight Network · Preprod</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  id="modal-close-btn"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-silver/60 hover:text-moon-white transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Wallet Option */}
              {isWalletAvailable ? (
                <div className="space-y-3 mb-6">
                  <p className="text-xs text-silver/50 uppercase tracking-widest mb-4">Available Wallet</p>
                  <button
                    id="lace-connect-btn"
                    onClick={handleConnect}
                    disabled={isConnecting || isConnected}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 group disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-label="Connect Lace Wallet"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-soft-indigo/40 to-midnight-blue flex items-center justify-center flex-shrink-0">
                      <LaceIcon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-moon-white font-medium">Lace Wallet</div>
                      <div className="text-xs text-silver/60">Midnight Network Extension</div>
                    </div>
                    {isConnecting ? (
                      <Loader2 className="w-5 h-5 text-silver/60 animate-spin flex-shrink-0" />
                    ) : isConnected ? (
                      <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-moon-glow/60 animate-pulse flex-shrink-0" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-200 font-medium mb-1">Lace Wallet Not Detected</p>
                      <p className="text-xs text-amber-200/70 mb-3">
                        Install the Lace wallet browser extension and enable the Midnight network feature to connect.
                      </p>
                      <a
                        href="https://www.lace.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                        id="lace-install-link"
                        className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-100 transition-colors"
                      >
                        Download Lace Wallet
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Error display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 rounded-2xl bg-red-900/20 border border-red-500/30"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Connection status */}
              {isConnected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-sm text-green-300 font-medium">Connected successfully!</p>
                </motion.div>
              )}

              {/* Info text */}
              <div className="mt-2 pt-6 border-t border-white/5">
                <p className="text-xs text-silver/40 text-center leading-relaxed">
                  Connecting grants read access to your Midnight address only.
                  Your private keys never leave your wallet.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function MoonSvgIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.15a1 1 0 00-1.46-.86A10.023 10.023 0 002 12c0 5.523 4.477 10 10 10 5.163 0 9.4-3.924 9.945-8.948a1 1 0 00-1.458-1.02A8.001 8.001 0 0112 4.135V2.15z" />
    </svg>
  );
}

function LaceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="24" r="24" fill="url(#lace-gradient)" />
      <path d="M24 8C15.163 8 8 15.163 8 24s7.163 16 16 16 16-7.163 16-16S32.837 8 24 8zm0 4a12 12 0 110 24A12 12 0 0124 12z" fill="white" fillOpacity="0.9"/>
      <path d="M24 16a8 8 0 100 16 8 8 0 000-16zm0 4a4 4 0 110 8 4 4 0 010-8z" fill="white" fillOpacity="0.6"/>
      <defs>
        <linearGradient id="lace-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4B0082"/>
          <stop offset="1" stopColor="#0B1021"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
