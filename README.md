# MidnightVault

[![Midnight CI](https://github.com/akash-mondal-1/Mid-night-Vault-/actions/workflows/ci.yml/badge.svg)](https://github.com/akash-mondal-1/Mid-night-Vault-/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/Tests-4%20Passed-brightgreen)](./tests/)
[![Node](https://img.shields.io/badge/Node-22-green)](https://nodejs.org/)
[![Compact](https://img.shields.io/badge/Compact-0.14.0-blue)](https://docs.midnight.network/)

> **Private Allowlist Access** — prove membership without revealing identity. Built on Midnight Network.

**Live Demo:** <https://mid-night-vault.vercel.app/>  
**Demo Video:** <https://drive.google.com/drive/folders/1KBfEGdjWiPhWVDirXjqjVIxw_SVBsn8L>  
**GitHub:** <https://github.com/akash-mondal-1/Mid-night-Vault->  
**Preprod Wallet Address:** `mn_addr_preview1r225s8a5s3yhc7q44kwlnneafn0fqhwkykvrkz0s5ffjp642xhfqfduh64`

---

## Level 1 — New Moon (Already Approved)

Level 1 (New Moon) submission was previously reviewed and approved.

---

## Submission Checklist — Level 2 (Waxing Crescent)

- [x] Lace wallet connect / disconnect implemented
- [x] Circuit called from frontend (`registerMember` via DApp Connector API)
- [x] Observable privacy behavior — `witness membershipSecret()` never leaves browser
- [x] Contract deployed to Preprod — `mn_addr_preview1r225s8a5s3yhc7q44kwlnneafn0fqhwkykvrkz0s5ffjp642xhfqfduh64`
- [x] 41 meaningful commits (>= 8 required)
- [x] Live demo: <https://mid-night-vault.vercel.app/>
- [x] Demo video: <https://drive.google.com/drive/folders/1KBfEGdjWiPhWVDirXjqjVIxw_SVBsn8L>

---

## Submission Checklist — Level 3 (First Quarter)

- [x] Fully functional dApp using Midnight's privacy model
- [x] 4 tests passing (>= 3 required) — see [Test](#test)
- [x] CI/CD pipeline running on every push (artifact verify + test + frontend build)
- [x] Approved idea from list: **Private Allowlist Access** — see [Product Proposal](#product-proposal) below
- [x] 41 meaningful commits (>= 10 required)
- [x] Privacy model documented — see [Privacy Model](#privacy-model)
- [x] Product proposal: [`PROPOSAL.md`](./PROPOSAL.md)
- [x] Live demo: <https://mid-night-vault.vercel.app/>
- [x] Demo video: <https://drive.google.com/drive/folders/1KBfEGdjWiPhWVDirXjqjVIxw_SVBsn8L>

---

## Privacy Model

| Element | Public | Private |
| :--- | :--- | :--- |
| **Data** | `registeredMembersCount` | `membershipSecret` |
| **Location** | On-chain, readable by all | Local browser only |
| **What it proves** | Someone registered | User knows the secret — without revealing it |

**Observer sees:** Counter increments + a ZK proof transaction on-chain.  
**Observer cannot see:** The secret value, the user's identity, or any witness input.

```compact
witness membershipSecret(): Field;  // never transmitted to network

export circuit registerMember(expectedSecret: Field): [] {
  const secret = membershipSecret();     // private — stays in browser
  assert secret == expectedSecret "Invalid membership secret provided";
  disclose(1);                           // only the success fact is public
  registeredMembersCount.increment();    // public counter
}
```

---

## Lace Wallet Integration

Real Lace wallet via `@midnight-ntwrk/dapp-connector-api` — no mocks.

```typescript
const connector = window.midnight.mnLace;                 // injected by extension
const walletApi = await connector.enable();                // triggers permission popup
const { address } = await walletApi.state();               // bech32m wallet address
const serviceConfig = await connector.serviceUriConfig();  // real Preprod endpoints
const provedTx = await walletApi.balanceAndProveTransaction(tx, []);
const txHash   = await walletApi.submitTransaction(provedTx);
```

**Connect flow:** Detect `window.midnight.mnLace` → `enable()` → wallet permission popup → retrieve address + endpoints → circuit call ready.  
**Disconnect:** Clears wallet state from React context; no re-prompt until user clicks Connect again.

---

## Test

```bash
npm test
```

4 tests pass:

- ✔ should verify deployment and initial state
- ✔ should accept a valid private witness and update the ledger
- ✔ should properly increment public ledger upon subsequent registrations
- ✔ should fail with expected error if private witness is incorrect

---

## CI/CD

[`.github/workflows/ci.yml`](./.github/workflows/ci.yml) runs on every push to `main`:

1. Checkout + Node.js v22 setup
2. `npm install`
3. Verify pre-compiled contract artifacts (`managed/Membership/`)
4. `npm test` — 4-test Jest suite
5. `cd frontend && npm install && npm run build`

> The Compact toolchain requires a native binary not available in GitHub Actions runners. The contract is compiled locally and artifacts committed — standard practice for Midnight dApps.

---

## Deploy

```bash
npm run compile        # compact compile contracts/Membership.compact managed/Membership
npm run deploy:preview
```

**Preview Wallet:** `mn_addr_preview1r225s8a5s3yhc7q44kwlnneafn0fqhwkykvrkz0s5ffjp642xhfqfduh64`  
**tNight Balance:** 5,000 tNight (claimed from faucet)  
**Indexer:** <https://indexer.preview.midnight.network/api/v4/graphql>

![Deploy Output](assets/deploy-output.png)
![Compile Output](assets/compile-output.png)

---

## Architecture

```text
User Browser
  └── window.midnight.mnLace.enable()
       └── Lace Wallet Extension (DAppConnectorWalletAPI)
            ├── private witness: membershipSecret  (stays local — never transmitted)
            ├── balanceAndProveTransaction()  →  ZK Proof
            └── submitTransaction()  →  Midnight Preview
                 ├── registeredMembersCount++  (public ledger)
                 └── disclose(1)               (public event)
```

---

## Quick Start

```bash
git clone https://github.com/akash-mondal-1/Mid-night-Vault-
npm install && cd frontend && npm install
npm run dev    # http://localhost:3000
cd .. && npm test
```

**Requirements:** Node.js v22, Lace wallet extension (Midnight enabled, set to Preview)

---

## Structure

```text
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

## Product Proposal

### Selected Idea: Private Allowlist Access

> Prove membership without revealing identity.

### The Ecosystem Gap

Every Web3 allowlist today is a public list of wallet addresses. Anyone can scrape it, correlate it with on-chain activity, and deanonymize members. There is no native mechanism to gate access without creating a privacy honeypot.

### What MidnightVault Solves

MidnightVault lets a user prove they belong to an allowlist using a **zero-knowledge proof of secret knowledge** — the user's address, wallet, and credential are never published. Only the mathematical fact of validity is recorded on-chain.

| Who | What They Learn |
| :--- | :--- |
| Smart contract / dApp | ✅ Valid proof received — grant access |
| Blockchain observer | ✅ Someone proved membership (counter +1) |
| Attacker / analyst | ❌ Nothing — no address, no secret, no identity |

### Privacy Mechanism

- The `membershipSecret` is declared as a **`witness`** in the Compact circuit — it never leaves the user's browser
- The circuit asserts the secret matches server-side expectation **before** generating the proof
- The network receives only a ZK proof; the secret is provably never transmitted
- `disclose(1)` emits only a binary success signal — nothing more

### Real-World Applications

- **NFT allowlists** — prove you're on the mint list without revealing which wallet you'll use
- **DeFi protocol access gates** — prove KYC/AML credential validity without submitting documents on-chain
- **Private DAOs** — prove membership for governance voting without linking identity to vote
- **Enterprise B2B** — prove partner status to trigger smart contract flows without revealing business relationships

### Roadmap for Higher Levels

- Replace shared secret with **Merkle-tree based membership proofs** (individual credentials, not shared secret)
- Add **credential expiry** — time-bounded access without re-revealing identity
- Multi-tier allowlists — prove tier level (e.g. gold/silver) without revealing which tier boundary you crossed
- Cross-contract composability — other dApps query MidnightVault as a privacy oracle

See full proposal: [`PROPOSAL.md`](./PROPOSAL.md)
