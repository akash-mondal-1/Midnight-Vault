import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MoonButton } from '@/components/ui/MoonButton';
import { MoonCard } from '@/components/ui/MoonCard';
import { CrescentDivider } from '@/components/ui/CrescentDivider';
import { WalletConnectModal } from '@/components/ui/WalletConnectModal';
import { useWallet } from '@/context/WalletContext';
import { useContract } from '@/context/ContractContext';
import { getIssuerId, getUserId, getCredentialCommitment } from '@/lib/compiled-contract';
import { toHex, fromHex } from '@/lib/midnight-providers';
import { Shield, Orbit, Lock, Sparkles, ExternalLink, Copy, CheckCircle, RefreshCw, Key, ShieldCheck, XCircle } from 'lucide-react';

const to32Bytes = (text: string): Uint8Array => {
  const arr = new Uint8Array(32);
  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);
  arr.set(encoded.slice(0, 32));
  return arr;
};

export default function Home() {
  const {
    isConnected,
    address,
    disconnect,
    walletType,
    error: walletError,
  } = useWallet();
  const {
    contractAddress,
    isContractValid,
    isLoading,
    txHash,
    error: contractError,
    deployNewContract,
    authorizeIssuer,
    issueCredential,
    verifyCredential,
    revokeCredential,
    resetState,
  } = useContract();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'issuer' | 'holder'>('issuer');

  // Issuer State
  const [issuerSecret, setIssuerSecret] = useState('demo-secret-123');
  const [recipientSecret, setRecipientSecret] = useState('my-cred-secret-abc');
  const [issueTier, setIssueTier] = useState('1');

  // Derived Public Issuer ID
  const derivedIssuerIdBytes = getIssuerId(to32Bytes(issuerSecret));
  const derivedIssuerIdHex = toHex(derivedIssuerIdBytes);

  // Derived Credential Commitment (D1 v6 formula: hash(userId, ctypeBytes, issuerId))
  const derivedUserIdBytes = getUserId(to32Bytes(recipientSecret));
  const derivedCommitmentBytes = getCredentialCommitment(derivedUserIdBytes, BigInt(issueTier), derivedIssuerIdBytes);
  const derivedCommitmentHex = toHex(derivedCommitmentBytes);

  // Holder State
  const [credSecret, setCredSecret] = useState('my-cred-secret-abc');
  const [credIssuer, setCredIssuer] = useState(derivedIssuerIdHex);
  const [credTier, setCredTier] = useState('1');
  
  // Verify State
  const [requiredTier, setRequiredTier] = useState('1');

  // Revoke State
  const [revokeCommitment, setRevokeCommitment] = useState('');

  // Results
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);

  const handleCopyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(contractAddress || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [contractAddress]);

  const truncateAddress = (addr: string, start = 6, end = 4) =>
    `${addr.slice(0, start)}...${addr.slice(-end)}`;

  const handleAuthorize = async () => {
    try {
      await authorizeIssuer(derivedIssuerIdBytes, { issuerSecret: to32Bytes(issuerSecret) });
    } catch {}
  };

  const handleIssue = async () => {
    try {
      await issueCredential(derivedCommitmentBytes, {
        issuerSecret: to32Bytes(issuerSecret),
        credentialType: BigInt(issueTier)
      });
    } catch {}
  };

  const handleRevoke = async () => {
    try {
      const trimmed = revokeCommitment.trim();
      const targetCommitmentBytes = trimmed.length === 64 ? fromHex(trimmed) : trimmed.length > 0 ? to32Bytes(trimmed) : derivedCommitmentBytes;
      await revokeCredential(targetCommitmentBytes, {
        issuerSecret: to32Bytes(issuerSecret)
      });
    } catch {}
  };

  const handleVerify = async () => {
    setVerifyResult(null);
    try {
      const issuerTrimmed = credIssuer.trim();
      const issuerBytes = issuerTrimmed.length === 64 ? fromHex(issuerTrimmed) : to32Bytes(issuerTrimmed);
      await verifyCredential(BigInt(requiredTier), {
        credentialSecret: to32Bytes(credSecret),
        credentialIssuer: issuerBytes,
        credentialType: BigInt(credTier)
      });
      // If we reach here without throwing, proof was generated and tx confirmed (or submitted)
      setVerifyResult(true);
    } catch (e) {
      setVerifyResult(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start py-20 px-4">
      <WalletConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-24 relative z-20">
        <div className="flex items-center gap-3">
          <MoonIcon className="w-8 h-8 text-moon-white" />
          <span className="text-xl font-medium tracking-wide">Midnight Vault</span>
          <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-moon-glow/20 text-moon-glow border border-moon-glow/30">
            PREPROD
          </span>
        </div>

        <nav aria-label="Wallet navigation">
          {isConnected ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-green-300 font-mono">
                  {walletType === 'Lace' ? 'Lace: ' : walletType === 'Nightly' ? 'Nightly: ' : 'Wallet: '}
                  {address ? truncateAddress(address) : 'Connected'}
                </span>
              </div>
              <MoonButton variant="outline" onClick={disconnect} className="px-4 py-2 text-xs">
                Disconnect
              </MoonButton>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {walletError && <span className="text-xs text-red-400 max-w-[200px] truncate">{walletError}</span>}
              <MoonButton onClick={() => setIsModalOpen(true)}>Connect Wallet</MoonButton>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center max-w-4xl w-full mb-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative w-48 h-48 mb-12"
        >
          <div className="absolute inset-0 rounded-full bg-moon-white shadow-[0_0_80px_rgba(244,246,240,0.4)]">
            <div className="absolute top-[20%] left-[20%] w-8 h-8 rounded-full bg-silver/20" />
            <div className="absolute bottom-[30%] right-[30%] w-12 h-12 rounded-full bg-silver/20" />
          </div>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute -inset-10 border border-white/10 rounded-full">
            <Sparkles className="absolute -top-3 left-1/2 text-moon-glow w-6 h-6 -translate-x-1/2" />
          </motion.div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="text-5xl md:text-7xl font-light tracking-tight mb-6 text-moon-white text-balance">
          Private Credentials.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="text-lg md:text-xl text-silver/80 font-light max-w-2xl text-balance mb-12">
          Prove your eligibility without revealing your identity or the credential itself. Powered by zero-knowledge proofs on Midnight Preprod.
        </motion.p>
      </section>

      <CrescentDivider />

      {/* Dashboard Section */}
      <section className="w-full max-w-6xl my-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Column: Network & Contract Status */}
          <div className="w-full md:w-1/3 flex flex-col gap-6">
            <div className="border border-white/10 rounded-2xl p-6 bg-midnight-blue/30 backdrop-blur-sm">
              <h3 className="text-silver text-sm mb-2 uppercase tracking-widest font-light flex items-center gap-2">
                <Shield className="w-4 h-4 text-moon-glow" />
                Vault Contract (Preprod)
              </h3>
              <div className="flex items-center justify-between mb-4">
                <code className="text-sm text-moon-white/90 font-mono">
                  {contractAddress ? truncateAddress(contractAddress, 10, 10) : 'Not Deployed'}
                </code>
                {contractAddress && (
                  <div className="flex gap-2">
                    <button onClick={handleCopyAddress} className="text-silver/60 hover:text-white p-1">
                      {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a href={`https://indexer.preprod.midnight.network/api/v4/graphql`} target="_blank" rel="noreferrer" className="text-silver/60 hover:text-white p-1">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${isContractValid ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={isContractValid ? 'text-green-300' : 'text-red-300'}>
                {isContractValid ? 'Contract verified on Preprod Indexer' : 'Contract not found'}
              </span>
            </div>
            
            {isContractValid === false && (
              <div className="mt-2 text-xs text-amber-300 flex flex-col gap-2">
                {isConnected && (
                  <button onClick={deployNewContract} className="self-start underline text-moon-glow font-medium hover:text-yellow-200 transition-colors">
                    Deploy New Contract Instance
                  </button>
                )}
              </div>
            )}
          </div>

            {/* Error Display */}
            {contractError && (
              <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/30 text-red-200 text-sm">
                ⚠️ {contractError}
              </div>
            )}
            
            {/* Loading Display */}
            {isLoading && (
              <div className="p-4 rounded-xl bg-moon-glow/10 border border-moon-glow/30 text-moon-glow text-sm flex items-center gap-3">
                <Orbit className="w-5 h-5 animate-spin" />
                <div className="flex flex-col">
                  <span className="font-medium">Transaction in progress...</span>
                  <span className="text-xs opacity-70">Check your wallet for approval.</span>
                </div>
              </div>
            )}

            {/* Success Notification */}
            {txHash && !isLoading && (
              <div className="p-4 rounded-xl bg-green-900/20 border border-green-500/30 text-green-200 text-sm flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                <div className="flex flex-col">
                  <span className="font-medium">Transaction Submitted</span>
                  <code className="text-xs opacity-70">TX: {truncateAddress(txHash)}</code>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interaction Panels */}
          <div className="w-full md:w-2/3 flex flex-col gap-6">
            
            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-4">
              <button 
                onClick={() => { setActiveTab('holder'); resetState(); setVerifyResult(null); }}
                className={`text-lg font-light pb-2 border-b-2 transition-colors ${activeTab === 'holder' ? 'border-moon-glow text-moon-white' : 'border-transparent text-silver/50 hover:text-silver'}`}
              >
                Holder / Verifier
              </button>
              <button 
                onClick={() => { setActiveTab('issuer'); resetState(); setVerifyResult(null); }}
                className={`text-lg font-light pb-2 border-b-2 transition-colors ${activeTab === 'issuer' ? 'border-moon-glow text-moon-white' : 'border-transparent text-silver/50 hover:text-silver'}`}
              >
                Issuer (Demo)
              </button>
            </div>

            {!isConnected ? (
              <div className="p-8 text-center border border-white/5 rounded-2xl bg-midnight-blue/20">
                <p className="text-silver/60 mb-4">Please connect your wallet to interact with the Preprod network.</p>
                <MoonButton onClick={() => setIsModalOpen(true)}>Connect Wallet</MoonButton>
              </div>
            ) : (
              <>
                {/* HOLDER TAB */}
                {activeTab === 'holder' && (
                  <div className="flex flex-col gap-6">
                    <div className="p-4 rounded-xl bg-soft-indigo/10 border border-soft-indigo/20 text-xs text-silver/70">
                      <strong>Credential Vault:</strong> Store your private credential details here. These values remain local to your browser and form the Private Witness during ZK proving.
                    </div>
                    
                    <MoonCard>
                      <h4 className="font-medium text-moon-white mb-4 flex items-center gap-2"><Key className="w-4 h-4 text-moon-glow" /> Local Private State</h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs text-silver mb-1">Credential Secret (Private)</label>
                          <input type="text" value={credSecret} onChange={e => setCredSecret(e.target.value)} className="w-full bg-space-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-moon-white" />
                        </div>
                        <div>
                          <label className="block text-xs text-silver mb-1">Credential Issuer ID</label>
                          <input type="text" value={credIssuer} onChange={e => setCredIssuer(e.target.value)} className="w-full bg-space-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-moon-white" />
                        </div>
                        <div>
                          <label className="block text-xs text-silver mb-1">Eligibility Tier (Type)</label>
                          <select value={credTier} onChange={e => setCredTier(e.target.value)} className="w-full bg-space-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-moon-white">
                            <option value="1">Tier 1 (Basic)</option>
                            <option value="2">Tier 2 (Premium)</option>
                            <option value="3">Tier 3 (VIP)</option>
                          </select>
                        </div>
                      </div>
                    </MoonCard>

                    <MoonCard>
                      <h4 className="font-medium text-moon-white mb-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-400" /> Prove Eligibility</h4>
                      <p className="text-xs text-silver/60 mb-4">Prove to the network you hold a valid, unrevoked credential satisfying the required tier. Your identity and exact tier remain hidden.</p>
                      
                      <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <label className="block text-xs text-silver mb-1">Required Tier</label>
                          <select value={requiredTier} onChange={e => setRequiredTier(e.target.value)} className="w-full bg-space-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-moon-white">
                            <option value="1">Tier 1+</option>
                            <option value="2">Tier 2+</option>
                            <option value="3">Tier 3+</option>
                          </select>
                        </div>
                        <MoonButton onClick={handleVerify} disabled={isLoading || !isContractValid} className="px-6 py-2">
                          Verify Credential
                        </MoonButton>
                      </div>

                      {verifyResult === true && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-xl border border-green-500/30 bg-green-900/10">
                          <h5 className="text-green-400 font-medium mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> PROVED</h5>
                          <ul className="text-sm text-silver/80 space-y-1 ml-6 list-disc marker:text-green-400">
                            <li>Credential is valid</li>
                            <li>Issuer is authorized</li>
                            <li>Credential is not revoked</li>
                            <li>Required eligibility satisfied</li>
                          </ul>
                          
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <h5 className="text-amber-200/80 font-medium mb-2 flex items-center gap-2"><Lock className="w-4 h-4" /> NOT REVEALED</h5>
                            <ul className="text-sm text-silver/60 space-y-1 ml-6 list-disc marker:text-amber-200/80">
                              <li>Credential secret</li>
                              <li>Exact credential tier</li>
                              <li>User identity</li>
                            </ul>
                          </div>
                          <p className="text-[10px] text-silver/40 mt-4 italic">Note: Credential commitment is publicly visible; repeated presentations may be linkable in this MVP.</p>
                        </motion.div>
                      )}
                      
                      {verifyResult === false && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-xl border border-red-500/30 bg-red-900/10 flex items-center gap-3 text-red-300">
                          <XCircle className="w-6 h-6" />
                          <div>
                            <p className="font-medium">Verification Failed</p>
                            <p className="text-xs opacity-80">Credential revoked, invalid, or insufficient tier.</p>
                          </div>
                        </motion.div>
                      )}
                    </MoonCard>
                  </div>
                )}

                {/* ISSUER TAB */}
                {activeTab === 'issuer' && (
                  <div className="flex flex-col gap-6">
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/80">
                      <strong>Demo Issuer Registration:</strong> This section is open for the Level 4 MVP to allow testing of the full issuance and revocation lifecycle.
                    </div>
                    
                    <MoonCard>
                      <h4 className="font-medium text-moon-white mb-4">ISSUER SETUP</h4>
                      <p className="text-xs text-silver/60 mb-4">
                        This registers the issuer's public commitment on the Midnight Preprod ledger. The issuer secret never becomes a public circuit argument.
                      </p>
                      
                      <div className="grid grid-cols-1 gap-4 mb-4">
                        <div>
                          <label className="block text-xs text-silver mb-1">Issuer Secret (Private)</label>
                          <input type="text" value={issuerSecret} onChange={e => setIssuerSecret(e.target.value)} className="w-full bg-space-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-moon-white" />
                        </div>
                        <div>
                          <label className="block text-xs text-silver mb-1">Issuer ID (Derived Public Commitment)</label>
                          <input type="text" value={derivedIssuerIdHex} readOnly className="w-full bg-space-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-silver/60 font-mono cursor-not-allowed" />
                        </div>
                      </div>
                      <MoonButton variant="outline" onClick={handleAuthorize} disabled={isLoading || !isContractValid} className="w-full">
                        Authorize Issuer
                      </MoonButton>
                    </MoonCard>

                    <MoonCard>
                      <h4 className="font-medium text-moon-white mb-4">2. Issue Credential</h4>
                      <p className="text-xs text-silver/60 mb-4">
                        Computes the D1 v6 commitment <code className="text-moon-glow font-mono">hash(userId, ctypeBytes, issuerId)</code> and registers it on-chain under the active authorized issuer.
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs text-silver mb-1">Recipient Subject Secret (Private)</label>
                          <input type="text" value={recipientSecret} onChange={e => setRecipientSecret(e.target.value)} className="w-full bg-space-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-moon-white font-mono" />
                        </div>
                        <div>
                          <label className="block text-xs text-silver mb-1">Credential Tier</label>
                          <select value={issueTier} onChange={e => setIssueTier(e.target.value)} className="w-full bg-space-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-moon-white">
                            <option value="1">Tier 1</option>
                            <option value="2">Tier 2</option>
                            <option value="3">Tier 3</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-xs text-silver mb-1">Derived Credential Commitment (Public Circuit Argument)</label>
                        <input type="text" value={derivedCommitmentHex} readOnly className="w-full bg-space-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-silver/60 font-mono cursor-not-allowed" />
                      </div>
                      <MoonButton variant="outline" onClick={handleIssue} disabled={isLoading || !isContractValid} className="w-full">
                        Issue Credential
                      </MoonButton>
                    </MoonCard>
                    
                    <MoonCard>
                      <h4 className="font-medium text-moon-white mb-4">3. Revoke Credential</h4>
                      <div className="mb-4">
                        <label className="block text-xs text-silver mb-1">Credential Commitment to Revoke (Leave blank for derived)</label>
                        <input type="text" placeholder={derivedCommitmentHex} value={revokeCommitment} onChange={e => setRevokeCommitment(e.target.value)} className="w-full bg-space-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-moon-white font-mono" />
                      </div>
                      <MoonButton variant="outline" onClick={handleRevoke} disabled={isLoading || !isContractValid} className="w-full border-red-500/50 text-red-300 hover:bg-red-500/10 hover:text-red-200">
                        Revoke Credential
                      </MoonButton>
                    </MoonCard>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-6xl mt-32 border-t border-white/10 pt-12 pb-8 flex flex-col md:flex-row justify-between items-center text-sm text-silver/60 gap-4" role="contentinfo">
        <p>Built for the Midnight DApp Challenge — New Moon to Full.</p>
        <div className="flex items-center gap-6">
          <a href="https://faucet.preprod.midnight.network/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-moon-glow/70 hover:text-moon-glow transition-colors">
            Preprod Faucet
          </a>
          <a href="https://github.com/akash-mondal-1/Midnight-Vault" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-moon-white transition-colors">
            <ExternalLink className="w-4 h-4" /> GitHub
          </a>
          <span>MIDNIGHT PREPROD</span>
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
