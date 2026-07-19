# ðŸŒ‘ MidnightVault

[![Midnight CI](https://github.com/akash-mondal-1/Mid-night-Vault-/actions/workflows/ci.yml/badge.svg)](https://github.com/akash-mondal-1/Mid-night-Vault-/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/Tests-4%20Passed-brightgreen)](./tests/)
[![Node](https://img.shields.io/badge/Node-22-green)](https://nodejs.org/)
[![Compact](https://img.shields.io/badge/Compact-0.14.0-blue)](https://docs.midnight.network/)

> **Private Allowlist Access** â€” prove membership without revealing identity. Built on Midnight Network.

**Live Demo:** https://mid-night-vault.vercel.app/
**Demo Video:** https://drive.google.com/drive/folders/1KBfEGdjWiPhWVDirXjqjVIxw_SVBsn8L
**GitHub:** https://github.com/akash-mondal-1/Mid-night-Vault-
**Preprod Wallet Address:** `mn_addr_preview1r225s8a5s3yhc7q44kwlnneafn0fqhwkykvrkz0s5ffjp642xhfqfduh64`

---

## âœ… Level 1 â€” New Moon (Already Approved)

Level 1 (New Moon) submission was previously reviewed and approved.

---

## ðŸ”‘ Submission Checklist â€” Level 2 (Waxing Crescent)

- [x] Lace wallet connect / disconnect implemented
- [x] Circuit called from frontend (`registerMember` via DApp Connector API)
- [x] Observable privacy behavior â€” `witness membershipSecret()` never leaves browser
- [x] Contract deployed to Preprod â€” `mn_addr_preview1r225s8a5s3yhc7q44kwlnneafn0fqhwkykvrkz0s5ffjp642xhfqfduh64`
- [x] 41 meaningful commits (>= 8 required)
- [x] Live demo: https://mid-night-vault.vercel.app/
- [x] Demo video: https://drive.google.com/drive/folders/1KBfEGdjWiPhWVDirXjqjVIxw_SVBsn8L

---

## ðŸ”‘ Submission Checklist â€” Level 3 (First Quarter)

- [x] Fully functional dApp using Midnight's privacy model
- [x] 4 tests passing (>= 3 required) â€” see [Test](#-test)
- [x] CI/CD pipeline running on every push (artifact verify + test + frontend build)
- [x] Approved idea from list: **Private Allowlist Access** â€” see [Product Proposal](#-product-proposal) below
- [x] 41 meaningful commits (>= 10 required)
- [x] Privacy model documented â€” see [Privacy Model](#ï¸-privacy-model)
- [x] Product proposal: [`PROPOSAL.md`](./PROPOSAL.md)
- [x] Live demo: https://mid-night-vault.vercel.app/
- [x] Demo video: https://drive.google.com/drive/folders/1KBfEGdjWiPhWVDirXjqjVIxw_SVBsn8L

---

## ðŸ›¡ï¸ Privacy Model

| | Public | Private |
|---|---|---|
| **Data** | `registeredMembersCount` | `membershipSecret` |
| **Location** | On-chain, readable by all | Local browser only |
| **What it proves** | Someone registered | User knows the secret â€” without revealing it |

**Observer sees:** Counter increments + a ZK proof transaction on-chain.
**Observer cannot see:** The secret value, the user's identity, or any witness input.

```compact
witness membershipSecret(): Field;  // never transmitted to network

export circuit registerMember(expectedSecret: Field): [] {
  const secret = membershipSecret();     // private â€” stays in browser
  assert secret == expectedSecret "Invalid membership secret provided";
  disclose(1);                           // only the success fact is public
  registeredMembersCount.increment();    // public counter
}
```

---

## ðŸ”— Lace Wallet Integration

Real Lace wallet via `@midnight-ntwrk/dapp-connector-api` â€” no mocks.

```typescript
const connector = window.midnight.mnLace;                 // injected by extension
const walletApi = await connector.enable();                // triggers permission popup
const { address } = await walletApi.state();               // bech32m wallet address
const serviceConfig = await connector.serviceUriConfig();  // real Preprod endpoints
const provedTx = await walletApi.balanceAndProveTransaction(tx, []);
const txHash   = await walletApi.submitTransaction(provedTx);
```

**Connect flow:** Detect `window.midnight.mnLace` â†’ `enable()` â†’ wallet permission popup â†’ retrieve address + endpoints â†’ circuit call ready.
**Disconnect:** Clears wallet state from React context; no re-prompt until user clicks Connect again.

---

## ðŸ§ª Test

```bash
npm test
```

4 tests pass:
- âœ” should verify deployment and initial state
- âœ” should accept a valid private witness and update the ledger
- âœ” should properly increment public ledger upon subsequent registrations
- âœ” should fail with expected error if private witness is incorrect

---

## âš™ï¸ CI/CD

[`.github/workflows/ci.yml`](./.github/workflows/ci.yml) runs on every push to `main`:
1. Checkout + Node.js v22 setup
2. `npm install`
3. Verify pre-compiled contract artifacts (`managed/Membership/`)
4. `npm test` â€” 4-test Jest suite
5. `cd frontend && npm install && npm run build`

> The Compact toolchain requires a native binary not available in GitHub Actions runners. The contract is compiled locally and artifacts committed â€” standard practice for Midnight dApps.

---

## ðŸš€ Deploy

```bash
npm run compile        # compact compile contracts/Membership.compact managed/Membership
npm run deploy:preprod
```

**Preprod Wallet:** `mn_addr_preview1r225s8a5s3yhc7q44kwlnneafn0fqhwkykvrkz0s5ffjp642xhfqfduh64`
**tNight Balance:** 5,000 tNight (claimed from faucet)
**Indexer:** https://indexer.preview.midnight.network/api/v4/graphql

![Deploy Output](assets/deploy-output.png)
![Compile Output](assets/compile-output.png)

---

## ðŸ—ï¸ Architecture

```
User Browser
  â””â”€ window.midnight.mnLace.enable()
       â””â”€ Lace Wallet Extension (DAppConnectorWalletAPI)
            â”œâ”€ private witness: membershipSecret  (stays local â€” never transmitted)
            â”œâ”€ balanceAndProveTransaction()  â†’  ZK Proof
            â””â”€ submitTransaction()  â†’  Midnight Preview
                 â”œâ”€ registeredMembersCount++  (public ledger)
                 â””â”€ disclose(1)               (public event)
```

---

## ðŸ› ï¸ Quick Start

```bash
git clone https://github.com/akash-mondal-1/Mid-night-Vault-
npm install && cd frontend && npm install
npm run dev    # http://localhost:3000
cd .. && npm test
```

**Requirements:** Node.js v22, Lace wallet extension (Midnight enabled, set to Preprod)

---

## ðŸ“ Structure

```
contracts/Membership.compact       # ZK smart contract (Compact v0.14.0)
frontend/src/
  context/WalletContext.tsx        # Lace wallet state management
  context/ContractContext.tsx      # Circuit call logic
  lib/midnight.ts                  # DApp Connector API integration
  components/ui/                   # Moon-themed UI components
tests/membership.test.ts           # 4-test Jest suite
.github/workflows/ci.yml           # CI/CD pipeline
managed/Membership/                # Compiled artifacts (keys, zkir)
PROPOSAL.md                        # Product proposal: Private Allowlist Access
```

---

## ðŸ’¡ Product Proposal

**Selected Idea (from approved list): Private Allowlist Access**

> Prove membership without revealing identity.

### The Ecosystem Gap

Every Web3 allowlist today is a public list of wallet addresses. Anyone can scrape it, correlate it with on-chain activity, and deanonymize members. There is no native mechanism to gate access without creating a privacy honeypot.

### What MidnightVault Solves

MidnightVault lets a user prove they belong to an allowlist using a **zero-knowledge proof of secret knowledge** â€” the user's address, wallet, and credential are never published. Only the mathematical fact of validity is recorded on-chain.

| Who | What They Learn |
|---|---|
| Smart contract / dApp | âœ… Valid proof received â€” grant access |
| Blockchain observer | âœ… Someone proved membership (counter +1) |
| Attacker / analyst | âŒ Nothing â€” no address, no secret, no identity |

### Privacy Mechanism

- The `membershipSecret` is declared as a **`witness`** in the Compact circuit â€” it never leaves the user's browser
- The circuit asserts the secret matches server-side expectation **before** generating the proof
- The network receives only a ZK proof; the secret is provably never transmitted
- `disclose(1)` emits only a binary success signal â€” nothing more

### Real-World Applications

- **NFT allowlists** â€” prove you're on the mint list without revealing which wallet you'll use
- **DeFi protocol access gates** â€” prove KYC/AML credential validity without submitting documents on-chain
- **Private DAOs** â€” prove membership for governance voting without linking identity to vote
- **Enterprise B2B** â€” prove partner status to trigger smart contract flows without revealing business relationships

### Roadmap for Higher Levels

- Replace shared secret with **Merkle-tree based membership proofs** (individual credentials, not shared secret)
- Add **credential expiry** â€” time-bounded access without re-revealing identity
- Multi-tier allowlists â€” prove tier level (e.g. gold/silver) without revealing which tier boundary you crossed
- Cross-contract composability â€” other dApps query MidnightVault as a privacy oracle

See full proposal: [`PROPOSAL.md`](./PROPOSAL.md)
