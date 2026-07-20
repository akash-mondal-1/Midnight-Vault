"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, AlertCircle, Loader2, RefreshCw, Zap } from 'lucide-react';
import { MoonButton } from './MoonButton';
import { useWallet } from '@/context/WalletContext';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletConnectModal = ({ isOpen, onClose }: WalletConnectModalProps) => {
  const {
    connectWallet,
    connect1AMWallet,
    isConnected,
    isWalletAvailable,
    is1AMAvailable,
    isLaceAvailable,
    walletType,
    error,
  } = useWallet();

  const [connectingWallet, setConnectingWallet] = React.useState<'lace' | '1am' | null>(null);
  const [hasMidnightInjection, setHasMidnightInjection] = React.useState(false);
  const [has1AMInjection, setHas1AMInjection] = React.useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Direct client-side check for window.midnight injection (bypasses React state timing)
  React.useEffect(() => {
    const checkInjection = () => {
      // @ts-ignore
      const midnight = window?.midnight;
      const has = !!(midnight && typeof midnight === 'object' && Object.keys(midnight).length > 0);
      // @ts-ignore
      const has1am = !!(midnight && midnight['1am'] && typeof midnight['1am'] === 'object');
      setHasMidnightInjection(has);
      setHas1AMInjection(has1am);
    };
    checkInjection();
    const t = setInterval(checkInjection, 1000);
    return () => clearInterval(t);
  }, []);

  // Force re-check wallet availability
  const retryDetection = useCallback(() => {
    // @ts-ignore
    const midnight = window?.midnight;
    console.log('[MidnightVault] Manual debug — window.midnight:', midnight);
    if (midnight) {
      console.log('[MidnightVault] Keys:', Object.keys(midnight));
    }
    window.location.reload();
  }, []);

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

  const handleConnectLace = async () => {
    setConnectingWallet('lace');
    try {
      await connectWallet();
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleConnect1AM = async () => {
    setConnectingWallet('1am');
    try {
      await connect1AMWallet();
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Determine if we have any wallet at all
  const anyWalletDetected = isWalletAvailable || hasMidnightInjection;
  const laceDetected = isLaceAvailable || (hasMidnightInjection && !has1AMInjection);
  const oneAmDetected = is1AMAvailable || has1AMInjection;

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
                    <p className="text-xs text-silver/60">Midnight Network · Preview (Testnet)</p>
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

              {/* Wallet Options */}
              {anyWalletDetected ? (
                <div className="space-y-3 mb-6">
                  <p className="text-xs text-silver/50 uppercase tracking-widest mb-4">
                    Choose Your Wallet
                  </p>

                  {/* 1AM Wallet — shown first as it's faster/more stable */}
                  <div className="relative">
                    <button
                      id="oneam-connect-btn"
                      onClick={handleConnect1AM}
                      disabled={!!connectingWallet || isConnected}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#a78bfa]/40 transition-all duration-200 group disabled:opacity-60 disabled:cursor-not-allowed"
                      aria-label="Connect 1AM Wallet"
                    >
                      {/* 1AM gradient icon */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7c3aed]/50 to-[#0f172a] flex items-center justify-center flex-shrink-0 border border-[#7c3aed]/20">
                        <OneAMIcon className="w-7 h-7" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-moon-white font-medium">1AM Wallet</span>
                          {/* Speed badge */}
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 text-[#a78bfa]">
                            <Zap className="w-2.5 h-2.5" />
                            Faster Sync
                          </span>
                        </div>
                        <div className="text-xs text-silver/60">
                          {oneAmDetected ? 'Detected · DApp Connector v4' : 'Not installed · Install from Chrome Web Store'}
                        </div>
                      </div>
                      {connectingWallet === '1am' ? (
                        <Loader2 className="w-5 h-5 text-silver/60 animate-spin flex-shrink-0" />
                      ) : isConnected && walletType === '1am' ? (
                        <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#a78bfa]/60 animate-pulse flex-shrink-0" />
                      )}
                    </button>
                    {/* 1AM install link if not detected */}
                    {!oneAmDetected && (
                      <a
                        href="https://chromewebstore.google.com/detail/1am/bphnkdkcnfhompoegfpgnkidcjfbojjp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-4 bottom-[-18px] text-[10px] text-[#a78bfa]/60 hover:text-[#a78bfa] transition-colors flex items-center gap-1"
                      >
                        Install 1AM <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  {/* Lace Wallet */}
                  <div className="mt-6">
                    <button
                      id="lace-connect-btn"
                      onClick={handleConnectLace}
                      disabled={!!connectingWallet || isConnected}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 group disabled:opacity-60 disabled:cursor-not-allowed"
                      aria-label="Connect Lace Wallet"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-soft-indigo/40 to-midnight-blue flex items-center justify-center flex-shrink-0">
                        <LaceIcon className="w-7 h-7" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-moon-white font-medium">Lace Wallet</div>
                        <div className="text-xs text-silver/60">
                          {laceDetected ? 'Detected · Midnight Extension' : 'Not detected · Enable Midnight in Settings → Experiments'}
                        </div>
                      </div>
                      {connectingWallet === 'lace' ? (
                        <Loader2 className="w-5 h-5 text-silver/60 animate-spin flex-shrink-0" />
                      ) : isConnected && walletType === 'lace' ? (
                        <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-moon-glow/60 animate-pulse flex-shrink-0" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* No wallet detected — show setup guide */
                <div className="mb-6">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 mb-4">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-200 font-medium mb-1">No Midnight Wallet Detected</p>
                      <p className="text-xs text-amber-200/70">
                        Install one of the supported wallets below to get started.
                      </p>
                    </div>
                  </div>

                  {/* Two wallet options as install cards */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* 1AM Install Card */}
                    <a
                      href="https://chromewebstore.google.com/detail/1am/bphnkdkcnfhompoegfpgnkidcjfbojjp"
                      target="_blank"
                      rel="noopener noreferrer"
                      id="install-1am-link"
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 hover:border-[#7c3aed]/40 hover:bg-[#7c3aed]/20 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed]/50 to-[#0f172a] flex items-center justify-center border border-[#7c3aed]/20">
                        <OneAMIcon className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-moon-white font-medium">1AM</div>
                        <div className="text-[10px] text-[#a78bfa] flex items-center gap-0.5 justify-center mt-0.5">
                          <Zap className="w-2.5 h-2.5" /> Faster Sync
                        </div>
                      </div>
                      <span className="text-[10px] text-silver/50 group-hover:text-silver/80 flex items-center gap-1 transition-colors">
                        Install <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </a>

                    {/* Lace Install Card */}
                    <a
                      href="https://docs.midnight.network/develop/tutorial/using/prereqs"
                      target="_blank"
                      rel="noopener noreferrer"
                      id="install-lace-link"
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-soft-indigo/10 border border-soft-indigo/20 hover:border-soft-indigo/40 hover:bg-soft-indigo/20 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-soft-indigo/40 to-midnight-blue flex items-center justify-center">
                        <LaceIcon className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-moon-white font-medium">Lace</div>
                        <div className="text-[10px] text-silver/50 mt-0.5">Midnight Extension</div>
                      </div>
                      <span className="text-[10px] text-silver/50 group-hover:text-silver/80 flex items-center gap-1 transition-colors">
                        Setup Guide <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </a>
                  </div>

                  {/* Lace setup guide (collapsed hint) */}
                  <div className="p-4 rounded-2xl bg-white/3 border border-white/10 space-y-3">
                    <p className="text-xs text-silver/60 uppercase tracking-widest mb-2">To enable Lace for Midnight:</p>
                    {[
                      "Open Lace extension → click ⚙️ Settings",
                      "Settings → Experiments → Enable Midnight dApp connector",
                      "In Midnight Settings: select Remote proof server",
                      "Set network to Preview (Testnet) in Lace",
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-soft-indigo/30 border border-soft-indigo/50 flex items-center justify-center flex-shrink-0 text-[10px] text-moon-white font-medium">
                          {i + 1}
                        </div>
                        <p className="text-xs text-silver/70 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={retryDetection}
                      id="retry-detect-btn"
                      className="inline-flex items-center gap-1.5 text-xs bg-soft-indigo/20 hover:bg-soft-indigo/40 border border-soft-indigo/40 text-moon-white px-3 py-1.5 rounded-full transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reload &amp; Retry
                    </button>
                    <a
                      href="https://docs.midnight.network/develop/tutorial/using/prereqs"
                      target="_blank"
                      rel="noopener noreferrer"
                      id="midnight-docs-link"
                      className="inline-flex items-center gap-1.5 text-xs text-silver/50 hover:text-silver/80 transition-colors"
                    >
                      Midnight Docs
                      <ExternalLink className="w-3 h-3" />
                    </a>
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

              {/* Connection success */}
              {isConnected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-sm text-green-300 font-medium">
                    Connected via {walletType === '1am' ? '1AM' : 'Lace'} successfully!
                  </p>
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

/** 1AM wallet SVG icon — the "1AM" lettermark / circular ring logo */
function OneAMIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="oneam-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="24" cy="24" r="22" stroke="url(#oneam-gradient)" strokeWidth="2" fill="none" />
      {/* Inner glow ring */}
      <circle cx="24" cy="24" r="16" stroke="#a78bfa" strokeWidth="1" strokeOpacity="0.4" fill="none" strokeDasharray="4 3" />
      {/* "1" letterform */}
      <path d="M20 16 L20 32 M17 19 L20 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* "AM" condensed arc mark */}
      <path d="M24 24 C24 20 28 18 30 21 C32 18 36 20 36 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.85" />
      <path d="M30 21 L30 30" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.85" />
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
