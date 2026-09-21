# User Feedback — Level 5 — Full Moon

## Feedback Collection Method

*Status: Active onboarding phase underway (20 responses verified on Preprod; onboarding remaining participants toward 50 target).*

This document tracks the structured feedback loop for **Level 5 — Full Moon**. During the active onboarding phase, feedback is collected from genuine users who interact with the Midnight Vault application on the **Midnight Preprod** network.

> **Important Note**: This markdown document is the public **evidence log, synthesis, and changelog**. Feedback and public wallet addresses are gathered via our external Google Form and synced into our public responses sheet:
> - **Live Feedback Responses Sheet**: [Google Sheets Feedback Tracker](https://docs.google.com/spreadsheets/d/16XIENbP254GiD5WdvLvrPDdfKkb8Q_tTMwdHzKhGYVI/edit?usp=sharing)
> - **Target**: 50 genuine Preprod users (verifiable on-chain). Current verified count: `20 / 50`.
> - **In-App Touchpoint**: Accessible via the "Feedback" link in the application header and footer.
> - **Data Collected**: Structured feedback, error reports, and the participant's public Preprod wallet address for Indexer verification.
> - **Privacy Notice**: NEVER collect seed phrases, private keys, passwords, or private credential witnesses under any circumstances.

---

## Feedback Collection & Product Iteration Workflow

The project follows a rigorous 8-stage feedback-driven cycle:

```text
Tester opens live MVP (https://midnight-vault-nine.vercel.app/)
  ↓
Performs defined test interaction on Midnight Preprod
  ↓
Submits external feedback form
  ↓
Provides public Preprod wallet address (NO private keys or seed phrases)
  ↓
Core team performs Indexer verification confirming on-chain interaction
  ↓
Address is appended to USERS.md (Currently 20 / 50 verified)
  ↓
Raw feedback logged & recurring themes summarized in docs/FEEDBACK.md
  ↓
Product improvements implemented, verified, & commit hashes recorded below
```

---

## Recommended Feedback Form Fields

> ⚠️ **CRITICAL PRIVACY RULE**: NEVER collect seed phrases, private keys, passwords, or private credential witnesses. The feedback form must strictly collect only public Preprod wallet addresses (`mn_addr_...`) for Indexer verification.

The external submission form is structured with the following 10 fields matching the [live Google Sheet](https://docs.google.com/spreadsheets/d/16XIENbP254GiD5WdvLvrPDdfKkb8Q_tTMwdHzKhGYVI/edit?usp=sharing):

1. **Timestamp**: Submission date and time
2. **Email Address**: Tester contact email
3. **Wallet Used**: 1AM Wallet, Lace Wallet, or Other
4. **What did you test?**: Positive Proving Flow, Negative Assertion Flow, Full Lifecycle, or Wallet Connection & DUST
5. **Was wallet connection successful?**: Yes / No / Required multiple attempts
6. **Were you able to complete your test?**: Yes / No
7. **What would you improve about Midnight Vault?**: Qualitative suggestions / friction points
8. **Your public Midnight Preprod wallet address**: `mn_addr_preprod...` for on-chain audit
9. **Overall Experience**: Rating from 1 to 5
10. **Optional Discord / Telegram / X handle**: Social handle for follow-up

---

## Raw Feedback Log

The log below records raw feedback submitted by verified Preprod users, synced from the [Google Sheet Tracker](https://docs.google.com/spreadsheets/d/16XIENbP254GiD5WdvLvrPDdfKkb8Q_tTMwdHzKhGYVI/edit?usp=sharing). Entries are recorded chronologically:

| # | User / Handle | Wallet Type | Interaction Tested | Feedback Summary | Date | Rating |
|---|---|---|---|---|---|---|
| 1 | `@rohit_sharma_98` | Lace Wallet | Positive Proving Flow | Proving progress indicator could show estimated seconds remaining. Local proof took ~12-14s on Chrome; spinner reassurance helpful. | 2026-09-14 | 4/5 |
| 2 | `sneha_p#4412` | 1AM Wallet | Negative Assertion Flow | Had to refresh once for 1AM wallet popup prompt to trigger on Brave. Once connected, negative circuit rejection worked as expected. | 2026-09-14 | 4/5 |
| 3 | `@arjunnair_k` | Lace Wallet | Full Lifecycle | Clearer tooltip regarding DUST balance and Preprod faucet tokens before issuing credentials. Proving flow is intuitive. | 2026-09-14 | 5/5 |
| 4 | `@ananya_d_21` | Lace Wallet | Positive Proving Flow | Add automatic copy button for transaction hash linking to Preprod explorer on the success modal. UI looks sharp. | 2026-09-15 | 5/5 |
| 5 | `@vikramsingh_dev` | 1AM Wallet | Wallet Connection & DUST | Add a direct link to Midnight Preprod faucet inside the wallet balance widget to avoid looking up faucet separately. | 2026-09-15 | 4/5 |
| 6 | `@priyak_web3` | Lace Wallet | Positive Proving Flow | Dark theme and moon aesthetics look very clean. When switching between Issuer and Holder tabs, auto-populating recently issued demo secret speeds up testing. | 2026-09-15 | 5/5 |
| 7 | `karthik_r#8901` | 1AM Wallet | Full Lifecycle | Revoked credential halted client-side without submitting failed tx on-chain, saving gas/DUST fees. Very clear rejection card. | 2026-09-15 | 5/5 |
| 8 | `@poojamehta_m` | Lace Wallet | Negative Assertion Flow | Everything worked smoothly. Suggest making the 'Revoked' status card in the negative verification display slightly larger with clearer ZK explanation. | 2026-09-15 | 4/5 |
| 9 | `@manishverma_92` | 1AM Wallet | Positive Proving Flow | Wallet connection timed out initially because extension was on background tab. Re-clicked and connected immediately. Tier 1 proved cleanly. | 2026-09-15 | 4/5 |
| 10 | `@divyasengupta` | Lace Wallet | Wallet Connection & DUST | Connecting Lace with Midnight connector active was straightforward. Quick start guide at the top helped guide through steps. | 2026-09-15 | 5/5 |
| 11 | `@rahulch_94` | 1AM Wallet | Positive Proving Flow | 1AM wallet connection was instantaneous. Proving took about 11 seconds. Helpful to have option to export proof receipt as JSON. | 2026-09-17 | 5/5 |
| 12 | `swati_sharma#2109` | 1AM Wallet | Full Lifecycle | Tested full lifecycle from minting to revocation. Loved contract enforcing revocation without exposing secret. Add network block height badge. | 2026-09-17 | 5/5 |
| 13 | `@amitbose_dev` | 1AM Wallet | Negative Assertion Flow | Negative verification rejected immediately client-side before gas was burnt. Explanatory text under error card makes ZK concept clear. | 2026-09-18 | 5/5 |
| 14 | `@deepak_joshi89` | 1AM Wallet | Positive Proving Flow | 1AM extension was locked initially so needed unlock. Once authenticated, issuing and proving Tier 1 on Preprod was seamless. | 2026-09-18 | 4/5 |
| 15 | `neha_g#7821` | Lace Wallet | Wallet Connection & DUST | Lace connected fine after enabling Midnight connector in settings. Quick-start guide at top of page helped avoid DUST confusion. | 2026-09-19 | 4/5 |
| 16 | `@sid_iyer_zk` | 1AM Wallet | Positive Proving Flow | Very smooth experience with 1AM wallet. Proving progress updates kept me informed. Subtle completion cue on mobile would be nice. | 2026-09-19 | 5/5 |
| 17 | `@tanvi_desai_m` | 1AM Wallet | Negative Assertion Flow | Confirmed revoked credential halts proving with zero on-chain leakage. Adding FAQ about Compact circuit revocation handling would be great. | 2026-09-20 | 5/5 |
| 18 | `@harsh_vardhan_dev` | 1AM Wallet | Full Lifecycle | 1AM wallet worked great for proof signing. Revoking credential confirmed within 1 block (~5s). Dark moon style is stunning. | 2026-09-20 | 5/5 |
| 19 | `meera_n#5544` | Lace Wallet | Positive Proving Flow | Testing on Lace with remote proof server was straightforward. Verification count incremented immediately on contract status card. | 2026-09-21 | 4/5 |
| 20 | `@abhishek_rawat_zk` | 1AM Wallet | Positive Proving Flow | 1AM wallet integration on Chrome was instantaneous. Faucet link in header banner made obtaining tNIGHT super simple. Clear success toast. | 2026-09-21 | 5/5 |

*(Ongoing: Updating regularly as participants complete the remaining 30 onboarding slots).*

---

## What We Heard (Themes)

From the first 20 Preprod testers (with majority utilizing 1AM Wallet), six recurring themes emerged:

1. **Local Proving Duration & Reassurance**: Users executing positive verification noted that client-side ZK proof generation takes ~10-15 seconds in browser WASM. Adding a progress estimate or step-by-step spinner ensures users know the browser is actively computing the proof.
2. **DUST & Faucet Accessibility**: Testers new to Midnight occasionally struggled finding the Preprod faucet link or understanding why DUST generation is required before signing transactions.
3. **Wallet Popup & Connection Recovery**: 1AM Wallet extension on certain Chromium forks (e.g. Brave shields) occasionally requires a second attempt to prompt the connection modal.
4. **Transaction Evidence & Explorer Deep-Linking**: Users completing credential verification desired a direct, copyable link to inspect their transaction hash on the Preprod block explorer / GraphQL indexer.
5. **Demonstration UX Streamlining**: Feedback highlighted appreciation for zero-gas client-side assertion checks, while suggesting seamless demo transitions (e.g. auto-populating fresh issued secret into holder tab).
6. **1AM Wallet ProofStation Performance & Receipts**: Majority of testers using 1AM Wallet highlighted fast, smooth proof execution via remote ProofStation, expressing interest in exporting full verifiable proof receipts.

---

## What We Changed & Product Iteration Plan

This table maps verified user feedback to concrete repository improvements:

| Issue / Feedback | Source | Improvement Applied / Planned | Status |
|---|---|---|---|
| **Direct Faucet Link in UI** | User #5 (`@vikramsingh_dev`) | Embedded direct link to official Midnight Preprod faucet (`faucet.preprod.midnight.network`) in onboarding banner | Implemented |
| **Explorer Link / Tx Hash Copy** | User #4 (`@ananya_d_21`) | Success modal provides direct copyable contract & tx hash reference | Implemented |
| **Proving Spinner Guidance** | User #1 (`@rohit_sharma_98`) | Added clear "Generating ZK Proof in browser (~10-15s)..." status message during WASM proving | Implemented |
| **Popup Connection Troubleshooting** | User #2 (`@sneha_p#4412`) | Added connection troubleshooting tip in `docs/USAGE.md` for Brave/popup blockers | Implemented |
| **Demo Credential Continuity** | User #6 (`@priyak_web3`) | Issuer flow persists last minted secret to clipboard / local holder storage for fast verification | Planned / Iterating |
| **Verifiable Proof Receipt Export** | User #11 (`@rahulch_94`) | Export proof receipt card with commitment hash and timestamp as downloadable JSON | Planned / Backlog |

---

## Privacy & Safety

User security and data privacy are foundational to Midnight Vault:
- **Never Submit Sensitive Credentials**: Users must never share or submit seed phrases, private keys, wallet passwords, credential secrets, or private witness inputs.
- **Public Identifiers Only**: Only public Preprod wallet addresses and non-confidential feedback remarks are collected for Level 5 on-chain verification and challenge compliance.
- **Client-Side Proving**: All zero-knowledge proofs are computed locally inside the user's browser environment. Witness data never leaves the client.
