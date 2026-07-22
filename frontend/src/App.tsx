
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MoonButton } from '@/components/ui/MoonButton';
import { MoonCard } from '@/components/ui/MoonCard';
import { CrescentDivider } from '@/components/ui/CrescentDivider';
import { WalletConnectModal } from '@/components/ui/WalletConnectModal';
import { useWallet } from '@/context/WalletContext';
import { useContract } from '@/context/ContractContext';
import { PREPROD_CONTRACT_ADDRESS } from '@/context/ContractContext';
import { Shield, Orbit, Lock, Sparkles, ExternalLink, Copy, CheckCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';

export default function Home() {
  const {
    isConnected,
    address,
    connectWallet,
    disconnect,
    isWalletAvailable,
    walletType,
    error: walletError,
  } = useWallet();
  const {
    contractAddress,
    registeredMembersCount,
    registerMember,
    deployNewContract,
    isContractValid,
    isLoading,
    privacyProven,
    txHash,
    error: contractError,
    resetState,
  } = useContract();

  const [secretInput, setSecretInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [secretSaved, setSecretSaved] = useState(false);

  // Generate a random 6-digit numeric secret for the ZK witness
  const generateSecret = useCallback(() => {
    const random = Math.floor(100000 + Math.random() * 900000).toString();
    setSecretInput(random);
    setShowSecret(true);  // show it so user can copy/save it
    setSecretSaved(false);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretInput.trim()) return;

    // Validate: only numeric input accepted for the Compact Field type
    const numericOnly = secretInput.replace(/[^0-9]/g, '');
    if (!numericOnly || numericOnly === '0') {
      return;
    }

    const numericSecret = BigInt(numericOnly);
    await registerMember(numericSecret);
  };

  const handleCopyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(contractAddress || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }, [contractAddress]);

  const truncateAddress = (addr: string, start = 6, end = 4) =>
    `${addr.slice(0, start)}...${addr.slice(-end)}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-start py-20 px-4">
      {/* Wallet Connect Modal */}
      <WalletConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Navbar/Header */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-24 relative z-20">
        <div className="flex items-center gap-3">
          <MoonIcon className="w-8 h-8 text-moon-white" />
          <span className="text-xl font-medium tracking-wide">Midnight Vault</span>
        </div>

        <nav aria-label="Wallet navigation">
          {isConnected ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true" />
                <span className="text-sm text-green-300 font-mono" aria-label="Connected wallet address">
                  {address ? truncateAddress(address) : 'Connected'}
                </span>
              </div>
              <MoonButton
                variant="outline"
                onClick={disconnect}
                id="disconnect-btn"
                className="px-4 py-2 text-xs"
                aria-label="Disconnect wallet"
              >
                Disconnect
              </MoonButton>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {walletError && (
                <span className="text-xs text-red-400 max-w-[200px] truncate" role="alert">
                  {walletError}
                </span>
              )}
              <MoonButton
                onClick={() => setIsModalOpen(true)}
                id="header-connect-btn"
                aria-label="Connect Wallet"
              >
                Connect Wallet
              </MoonButton>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section
        className="flex flex-col items-center justify-center text-center max-w-4xl w-full mb-32 relative z-10"
        aria-labelledby="hero-heading"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative w-48 h-48 mb-12"
          aria-hidden="true"
        >
          {/* Animated Moon */}
          <div className="absolute inset-0 rounded-full bg-moon-white shadow-[0_0_80px_rgba(244,246,240,0.4)]">
            <div className="absolute top-[20%] left-[20%] w-8 h-8 rounded-full bg-silver/20" />
            <div className="absolute bottom-[30%] right-[30%] w-12 h-12 rounded-full bg-silver/20" />
            <div className="absolute top-[40%] right-[20%] w-6 h-6 rounded-full bg-silver/20" />
          </div>

          {/* Orbiting Stars */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-10 border border-white/10 rounded-full"
          >
            <Sparkles className="absolute -top-3 left-1/2 text-moon-glow w-6 h-6 -translate-x-1/2" />
          </motion.div>
        </motion.div>

        <motion.h1
          id="hero-heading"
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
          A thin, deliberate crescent of your identity revealed. The rest rests in shadow,
          protected by zero-knowledge proofs on the Midnight network.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          {!isConnected && (
            <MoonButton
              onClick={() => setIsModalOpen(true)}
              id="hero-connect-btn"
              aria-label="Enter the Vault by connecting wallet"
            >
              Enter the Vault
            </MoonButton>
          )}
          <MoonButton
            variant="secondary"
            id="discover-btn"
            onClick={() => {
              document.getElementById('contract-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label="Scroll to learn how privacy works"
          >
            Discover How
          </MoonButton>
        </motion.div>
      </section>

      <CrescentDivider />

      {/* Privacy Architecture Section */}
      <section
        id="privacy-section"
        className="w-full max-w-5xl my-16 relative z-10"
        aria-labelledby="privacy-heading"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 id="privacy-heading" className="text-3xl md:text-4xl font-light mb-4 text-moon-white">
            Observable Privacy
          </h2>
          <p className="text-silver/70 max-w-2xl mx-auto">
            The public chain sees a counter increment and a disclosure event. It never sees your secret.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🔒',
              title: 'Private Witness',
              desc: 'Your membershipSecret is computed locally in the ZK circuit. It never leaves your device or browser.',
            },
            {
              icon: '⚡',
              title: 'ZK Proof',
              desc: 'Midnight generates a mathematical proof that you know the secret — without revealing the secret itself.',
            },
            {
              icon: '📡',
              title: 'Public Disclosure',
              desc: 'Only disclose(1) and the counter increment appear on-chain. Your secret stays hidden forever.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 rounded-[24px] bg-midnight-blue/30 border border-white/5 backdrop-blur-sm"
            >
              <div className="text-3xl mb-4" aria-hidden="true">{item.icon}</div>
              <h3 className="text-moon-white font-medium mb-2">{item.title}</h3>
              <p className="text-sm text-silver/60 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <CrescentDivider />

      {/* Contract Interaction Section */}
      <section
        id="contract-section"
        className="w-full max-w-5xl my-24 grid md:grid-cols-2 gap-12 relative z-10"
        aria-labelledby="contract-heading"
      >
        <div className="flex flex-col justify-center">
          <h2
            id="contract-heading"
            className="text-3xl md:text-4xl font-light mb-6 flex items-center gap-3"
          >
            <Shield className="w-8 h-8 text-moon-glow" aria-hidden="true" />
            Prove Without Revealing
          </h2>
          <p className="text-silver/80 font-light mb-8 text-lg">
            Using Midnight Compact, you can register as a member by proving knowledge of the
            membership secret. The secret is validated in a local zero-knowledge circuit.
            Only a cryptographic proof is sent to the network.
          </p>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div
              className="border border-white/10 rounded-2xl p-6 bg-midnight-blue/30 backdrop-blur-sm"
              aria-label="Global members count"
            >
              <h3 className="text-silver text-sm mb-2 uppercase tracking-widest">Global Members</h3>
              <div className="text-4xl font-light text-moon-white" aria-live="polite">
                {registeredMembersCount}
              </div>
            </div>
            <div className="border border-white/10 rounded-2xl p-6 bg-midnight-blue/30 backdrop-blur-sm">
              <h3 className="text-silver text-sm mb-2 uppercase tracking-widest">Network</h3>
              <div className="text-lg font-light text-moon-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
                Preview
              </div>
            </div>
          </div>

          {/* Contract Address */}
          <div className="border border-white/10 rounded-2xl p-4 bg-midnight-blue/20 backdrop-blur-sm">
            <h3 className="text-silver text-sm mb-2 uppercase tracking-widest font-light">Contract Address</h3>
            <div className="flex items-center gap-2">
              <code className="text-xs text-moon-white/80 font-mono flex-1 truncate">
                {contractAddress ? truncateAddress(contractAddress, 16, 8) : 'Not Deployed'}
              </code>
              {contractAddress && (
                <button
                  onClick={handleCopyAddress}
                  id="copy-address-btn"
                  className="text-silver/40 hover:text-moon-white transition-colors p-1"
                  aria-label="Copy contract address"
                  title="Copy contract address"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
              {contractAddress && (
                <a
                  href={`https://indexer.preview.midnight.network/api/v4/graphql`}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="indexer-link"
                  className="text-silver/40 hover:text-moon-white transition-colors p-1"
                  aria-label="View on Midnight Preview Indexer"
                  title="View on Indexer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            {isContractValid === false && (
              <div className="mt-3 text-xs text-amber-300 flex flex-col gap-2">
                <span>⚠️ Contract not active on Preview (Testnet).</span>
                {isConnected ? (
                  <button
                    onClick={deployNewContract}
                    id="deploy-contract-btn"
                    className="self-start underline text-moon-glow font-medium hover:text-yellow-200 transition-colors"
                  >
                    Deploy New Contract Instance
                  </button>
                ) : (
                  <span className="text-silver/40">Connect your wallet to deploy a fresh instance.</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Registration Card */}
        <MoonCard aria-label="Vault registration form">
          <div className="flex flex-col h-full">
            <h3 className="text-2xl font-light mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5" aria-hidden="true" />
              Vault Registration
            </h3>
            <p className="text-sm text-silver/60 mb-8">
              Enter your private witness credential. It will never leave your browser.
            </p>

            {/* Error Display */}
            {contractError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/30 text-red-200 text-sm"
                role="alert"
              >
                {contractError}
              </motion.div>
            )}

            {/* Not connected warning */}
            {!isConnected && !privacyProven && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-4 rounded-xl bg-amber-900/10 border border-amber-500/20 text-amber-200/80 text-sm flex items-center gap-2"
              >
                <span>Connect a Midnight wallet to register.</span>
                <button
                  onClick={() => setIsModalOpen(true)}
                  id="inline-connect-btn"
                  className="text-moon-glow hover:text-yellow-200 transition-colors underline underline-offset-2 whitespace-nowrap"
                  aria-label="Open wallet connect modal"
                >
                  Connect now
                </button>
              </motion.div>
            )}

            {/* Success State */}
            {privacyProven ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mb-2">
                  <Shield className="w-8 h-8" aria-hidden="true" />
                </div>
                <h4 className="text-xl font-medium text-moon-white">Privacy Protected</h4>
                <p className="text-sm text-silver/80 max-w-xs">
                  Your registration circuit was successfully called. A ZK proof was generated
                  locally. Your secret was never transmitted.
                </p>
                {txHash && (
                  <code className="text-xs text-silver/50 font-mono">TX: {truncateAddress(txHash, 8, 6)}</code>
                )}
                <MoonButton
                  variant="outline"
                  onClick={() => {
                    resetState();
                    setSecretInput('');
                  }}
                  id="register-again-btn"
                  className="mt-4 text-xs px-6 py-2"
                >
                  Register Again
                </MoonButton>
              </motion.div>
            ) : (
              <form onSubmit={handleRegister} className="flex-1 flex flex-col" noValidate>
                <div className="mb-6 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="secret-input" className="block text-sm text-silver">
                      Membership Secret
                    </label>
                    <button
                      type="button"
                      onClick={generateSecret}
                      id="generate-secret-btn"
                      className="inline-flex items-center gap-1 text-xs text-moon-glow/70 hover:text-moon-glow transition-colors"
                      title="Generate a random 6-digit secret"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Generate
                    </button>
                  </div>

                  {/* What is this? callout */}
                  <div className="mb-3 p-3 rounded-lg bg-soft-indigo/10 border border-soft-indigo/20 text-xs text-silver/70 leading-relaxed">
                    <strong className="text-moon-white/80">What is this?</strong>&nbsp;
                    This is your private ZK membership PIN — any number you choose (e.g. <code className="text-moon-glow">42</code> or <code className="text-moon-glow">123456</code>).
                    It acts as your proof credential. The number itself <strong className="text-moon-white/80">never leaves your browser</strong> — only a ZK proof is sent on-chain.
                    Use the same number to prove membership again later.
                  </div>

                  {/* Input + eye toggle */}
                  <div className="relative">
                    <input
                      id="secret-input"
                      type={showSecret ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={secretInput}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setSecretInput(val);
                        setSecretSaved(false);
                      }}
                      placeholder="e.g. 42 or 123456"
                      autoComplete="off"
                      className="w-full bg-space-black/50 border border-white/10 rounded-xl px-4 py-3 pr-10 text-moon-white focus:outline-none focus:border-moon-glow/50 focus:ring-1 focus:ring-moon-glow/20 transition-colors placeholder:text-silver/30 font-mono tracking-widest"
                      aria-describedby="secret-hint"
                      required
                      minLength={1}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(v => !v)}
                      id="toggle-secret-visibility"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-silver/40 hover:text-silver/80 transition-colors"
                      aria-label={showSecret ? 'Hide secret' : 'Show secret'}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Save reminder — shown when secret is visible and non-empty */}
                  {showSecret && secretInput && !secretSaved && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
                    >
                      <span className="text-xs text-amber-200/80">
                        ⚠️ Save this number! You’ll need it to prove membership again.
                      </span>
                      <button
                        type="button"
                        onClick={() => setSecretSaved(true)}
                        id="confirm-saved-btn"
                        className="ml-2 text-xs text-amber-300 hover:text-amber-100 whitespace-nowrap transition-colors"
                      >
                        Got it ✓
                      </button>
                    </motion.div>
                  )}

                  <p id="secret-hint" className="text-xs text-silver/40 mt-2">
                    Processed as a private Compact <code>Field</code> witness — stays local, proven via ZK.
                  </p>
                </div>

                <MoonButton
                  type="submit"
                  id="execute-circuit-btn"
                  disabled={isLoading || !secretInput || !isConnected}
                  className="w-full"
                  aria-label={isLoading ? 'Generating ZK proof...' : 'Execute ZK circuit'}
                >
                  {isLoading ? (
                    <>
                      <Orbit className="w-4 h-4 animate-spin" aria-hidden="true" />
                      Generating Proof...
                    </>
                  ) : (
                    'Execute ZK Circuit'
                  )}
                </MoonButton>

                {isLoading && (
                  <div className="mt-3 p-3 rounded-xl bg-moon-glow/5 border border-moon-glow/20 text-center space-y-1">
                    <p className="text-xs text-moon-glow font-medium flex items-center justify-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-moon-glow animate-ping" />
                      Generating ZK proof via Midnight proof server...
                    </p>
                    <p className="text-[11px] text-silver/60">
                      Proof creation takes 30–90 seconds. Your wallet popup will open to approve the transaction once proof is ready.
                    </p>
                  </div>
                )}

                {!isConnected && (
                  <p className="text-xs text-silver/40 text-center mt-3">
                    Wallet connection required to submit
                  </p>
                )}
              </form>
            )}
          </div>
        </MoonCard>
      </section>

      {/* Footer */}
      <footer
        className="w-full max-w-6xl mt-32 border-t border-white/10 pt-12 pb-8 flex flex-col md:flex-row justify-between items-center text-sm text-silver/60 gap-4"
        role="contentinfo"
      >
        <p>Built for the Midnight DApp Challenge — New Moon to Full.</p>
        <div className="flex items-center gap-6">
          <a
            href="https://faucet.preview.midnight.network/"
            target="_blank"
            rel="noopener noreferrer"
            id="faucet-link"
            className="flex items-center gap-1.5 text-moon-glow/70 hover:text-moon-glow transition-colors"
            aria-label="Get testnet tNIGHT & DUST tokens from the Preview Faucet"
            title="Top up tNIGHT & DUST from the Midnight Preview Faucet"
          >
            <FaucetIcon className="w-4 h-4" />
            Preview Faucet
          </a>
          <a
            href="https://github.com/akash-mondal-1/Mid-night-Vault-"
            target="_blank"
            rel="noopener noreferrer"
            id="github-link"
            className="flex items-center gap-1.5 hover:text-moon-white transition-colors"
            aria-label="View source code on GitHub"
          >
            <GitHubIcon className="w-4 h-4" />
            GitHub
          </a>
          <span>Preview (Testnet)</span>
        </div>
      </footer>
    </main>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.15a1 1 0 00-1.46-.86A10.023 10.023 0 002 12c0 5.523 4.477 10 10 10 5.163 0 9.4-3.924 9.945-8.948a1 1 0 00-1.458-1.02A8.001 8.001 0 0112 4.135V2.15z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function FaucetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M9 3h6l-1 5H10L9 3z" />
      <path d="M12 8v4" />
      <path d="M8 12h8" />
      <path d="M10 12c0 2.5-2 4-2 6a4 4 0 008 0c0-2-2-3.5-2-6" />
      <path d="M19 8h-2a2 2 0 00-2 2v1" />
    </svg>
  );
}
