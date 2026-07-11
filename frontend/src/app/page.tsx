"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoonButton } from '@/components/ui/MoonButton';
import { MoonCard } from '@/components/ui/MoonCard';
import { CrescentDivider } from '@/components/ui/CrescentDivider';
import { useWallet } from '@/context/WalletContext';
import { useContract } from '@/context/ContractContext';
import { Shield, Orbit, Lock, Sparkles } from 'lucide-react';

export default function Home() {
  const { isConnected, address, connectWallet, disconnect, error: walletError } = useWallet();
  const { registeredMembersCount, registerMember, isLoading, privacyProven, error: contractError } = useContract();
  const [secretInput, setSecretInput] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretInput) return;
    
    // Simulate converting input string to bigint/field for Midnight contract
    const numericSecret = BigInt(secretInput.replace(/[^0-9]/g, '') || '0');
    await registerMember(numericSecret);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start py-20 px-4">
      {/* Navbar/Header */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-24 relative z-20">
        <div className="flex items-center gap-3">
          <MoonIcon className="w-8 h-8 text-moon-white" />
          <span className="text-xl font-medium tracking-wide">Midnight Vault</span>
        </div>
        <div>
          {isConnected ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-silver/80 font-mono">
                {address?.slice(0, 8)}...{address?.slice(-4)}
              </span>
              <MoonButton variant="outline" onClick={disconnect} className="px-4 py-2 text-xs">
                Disconnect
              </MoonButton>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {walletError && <span className="text-xs text-red-400 max-w-[200px] truncate">{walletError}</span>}
              <MoonButton onClick={() => connectWallet()}>
                Connect Lace
              </MoonButton>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center max-w-4xl w-full mb-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-48 h-48 mb-12"
        >
          {/* Animated Moon Illustration */}
          <div className="absolute inset-0 rounded-full bg-moon-white shadow-[0_0_80px_rgba(244,246,240,0.4)]">
            <div className="absolute top-[20%] left-[20%] w-8 h-8 rounded-full bg-silver/20" />
            <div className="absolute bottom-[30%] right-[30%] w-12 h-12 rounded-full bg-silver/20" />
            <div className="absolute top-[40%] right-[20%] w-6 h-6 rounded-full bg-silver/20" />
          </div>
          
          {/* Orbiting Stars */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-10 border border-white/10 rounded-full"
          >
            <Sparkles className="absolute -top-3 left-1/2 text-moon-glow w-6 h-6 -translate-x-1/2" />
          </motion.div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-5xl md:text-7xl font-light tracking-tight mb-6 text-moon-white text-balance"
        >
          Privacy Lives Here.
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg md:text-xl text-silver/80 font-light max-w-2xl text-balance mb-12"
        >
          A thin, deliberate crescent of your identity revealed. 
          The rest rests in shadow, protected by zero-knowledge proofs on the Midnight network.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex gap-6"
        >
          {!isConnected && (
            <MoonButton onClick={() => connectWallet()}>
              Enter the Vault
            </MoonButton>
          )}
          <MoonButton variant="secondary" onClick={() => {
            document.getElementById('contract-section')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Discover How
          </MoonButton>
        </motion.div>
      </section>

      <CrescentDivider />

      {/* Contract Interaction Section */}
      <section id="contract-section" className="w-full max-w-5xl my-24 grid md:grid-cols-2 gap-12 relative z-10">
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-light mb-6 flex items-center gap-3">
            <Shield className="w-8 h-8 text-moon-glow" />
            Prove Without Revealing
          </h2>
          <p className="text-silver/80 font-light mb-8 text-lg">
            Using Midnight Compact, you can register as a member by proving knowledge of the membership secret. 
            The secret is validated in a local zero-knowledge circuit. Only a proof is sent to the network.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="border border-white/10 rounded-2xl p-6 bg-midnight-blue/30 backdrop-blur-sm">
              <h3 className="text-silver text-sm mb-2 uppercase tracking-widest">Global Members</h3>
              <div className="text-4xl font-light text-moon-white">{registeredMembersCount}</div>
            </div>
            <div className="border border-white/10 rounded-2xl p-6 bg-midnight-blue/30 backdrop-blur-sm">
              <h3 className="text-silver text-sm mb-2 uppercase tracking-widest">Network</h3>
              <div className="text-lg font-light text-moon-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Preprod
              </div>
            </div>
          </div>
        </div>

        <MoonCard>
          <div className="flex flex-col h-full">
            <h3 className="text-2xl font-light mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Vault Registration
            </h3>
            <p className="text-sm text-silver/60 mb-8">
              Enter your private witness credential. It will never leave your browser.
            </p>

            {contractError && (
              <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/30 text-red-200 text-sm">
                {contractError}
              </div>
            )}

            {privacyProven ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mb-2">
                  <Shield className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-medium text-moon-white">Privacy Protected</h4>
                <p className="text-sm text-silver/80">
                  Your registration is complete. A ZK proof was successfully generated and verified on-chain. Your secret remains safe.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleRegister} className="flex-1 flex flex-col">
                <div className="mb-8 flex-1">
                  <label className="block text-sm text-silver mb-2">Membership Secret (Numeric)</label>
                  <input
                    type="password"
                    value={secretInput}
                    onChange={(e) => setSecretInput(e.target.value)}
                    placeholder="Enter numeric secret..."
                    className="w-full bg-space-black/50 border border-white/10 rounded-xl px-4 py-3 text-moon-white focus:outline-none focus:border-moon-glow/50 transition-colors"
                  />
                </div>
                
                <MoonButton 
                  type="submit" 
                  disabled={isLoading || !secretInput}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Orbit className="w-4 h-4 animate-spin" />
                      Generating Proof...
                    </>
                  ) : (
                    "Execute ZK Circuit"
                  )}
                </MoonButton>
              </form>
            )}
          </div>
        </MoonCard>
      </section>
      
      {/* Footer */}
      <footer className="w-full max-w-6xl mt-32 border-t border-white/10 pt-12 pb-8 flex flex-col md:flex-row justify-between items-center text-sm text-silver/60">
        <p>Built for the Midnight DApp Challenge.</p>
        <p>Deployed on Preprod.</p>
      </footer>
    </main>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.15a1 1 0 00-1.46-.86A10.023 10.023 0 002 12c0 5.523 4.477 10 10 10 5.163 0 9.4-3.924 9.945-8.948a1 1 0 00-1.458-1.02A8.001 8.001 0 0112 4.135V2.15z" />
    </svg>
  );
}
