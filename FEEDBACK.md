# User Feedback & Product Synthesis — Level 6 — Supermoon (FEEDBACK.md)

## Feedback Collection Method

*Status: Level 6 Target Completed — 70 / 70 verified Preprod participants (Milestone Complete).*

This document tracks the structured feedback loop for **Level 6 — Supermoon**. During the active onboarding phase, feedback is collected from genuine users who interact with the Midnight Vault application on the **Midnight Preprod** network.

> **Important Note**: This markdown document is the public **evidence log, synthesis, and changelog**. Feedback and public wallet addresses are gathered via our external Google Form and synced into our public responses sheet:
> - **Live Feedback Responses Sheet**: [Google Sheets Feedback Tracker](https://docs.google.com/spreadsheets/d/16XIENbP254GiD5WdvLvrPDdfKkb8Q_tTMwdHzKhGYVI/edit?usp=sharing)
> - **Target**: 70 genuine Preprod users (verifiable on-chain). Current verified count: `70 / 70` *(Milestone Complete)*.
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
Address is appended to USERS.md (70 / 70 verified · Milestone Complete)
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
| 21 | `@sanjay_k_dev` | 1AM Wallet | Positive Proving Flow | Proof verification was fast on 1AM wallet. Card showing 'Proved: tier >= 1' makes selective disclosure intuitive. | 2026-09-21 | 5/5 |
| 22 | `@reshma_m_zk` | 1AM Wallet | Negative Assertion Flow | Testing revoked circuit rejection worked without triggering failed on-chain tx. UI clearly flagged credential as revoked. | 2026-09-21 | 5/5 |
| 23 | `ajay_s#6723` | 1AM Wallet | Full Lifecycle | Full mint-to-revoke loop completed cleanly. Confirmation took less than 6 seconds on Midnight Preprod. | 2026-09-21 | 5/5 |
| 24 | `@pallavij_pune` | Lace Wallet | Positive Proving Flow | Used Lace Wallet with Midnight dApp connector enabled. Proof generation in browser was smooth. Clear confirmation toast. | 2026-09-21 | 4/5 |
| 25 | `@tarunreddy_h` | 1AM Wallet | Wallet Connection & DUST | 1AM Wallet connected quickly and DUST balance showed up accurately. Onboarding quick guide answered gas questions. | 2026-09-21 | 5/5 |
| 26 | `nidhi_b#9012` | 1AM Wallet | Positive Proving Flow | Had to click connect twice as 1AM was initially locked. Once logged in, issued a Tier 2 credential and verified cleanly. | 2026-09-21 | 4/5 |
| 27 | `@varunshroff_dev` | 1AM Wallet | Negative Assertion Flow | Circuit assertion stopped transaction before submission, preventing wasted testnet gas. Crisp status alert. | 2026-09-21 | 5/5 |
| 28 | `@anupama_k_zk` | Lace Wallet | Positive Proving Flow | Tested on Lace with ProofStation remote prover. Verified counter updated immediately. Dark mode styling with moon theme is great. | 2026-09-21 | 5/5 |
| 29 | `@rohan_chawla_90` | 1AM Wallet | Full Lifecycle | 1AM wallet is very responsive. Tested minting and immediately revoking. Contract verified revocation state within 1 block. | 2026-09-21 | 5/5 |
| 30 | `geeta_m#3388` | 1AM Wallet | Positive Proving Flow | Proving status indicator kept me well informed during WASM proof generation. Verification succeeded with counter increment. | 2026-09-21 | 5/5 |
| 31 | `@gaurav_sharma93` | 1AM Wallet | Positive Proving Flow | Issued Tier 1 credential in Demo mode and verified it. Progress bar kept me informed and counter updated. Responsive UI. | 2026-09-21 | 5/5 |
| 32 | `bhavna_p#1092` | 1AM Wallet | Negative Assertion Flow | Tested negative path with revoked credential secret. Appreciate that ZK circuit aborts client-side without gas waste. | 2026-09-21 | 5/5 |
| 33 | `@kunalsaxena_zk` | 1AM Wallet | Full Lifecycle | Completed full lifecycle: issued Tier 2, verified, revoked, and verified again. Process took less than 2 minutes. | 2026-09-21 | 5/5 |
| 34 | `@shreya_c_web3` | Lace Wallet | Positive Proving Flow | Connected Lace with remote proof server. Proving took around 13 seconds on Chrome. Proved vs Confidential breakdown is clear. | 2026-09-21 | 4/5 |
| 35 | `@vishal_pandey90` | 1AM Wallet | Wallet Connection & DUST | Used faucet link in header banner to grab tNIGHT and generate DUST in 1AM. Smooth handshake with dapp. | 2026-09-21 | 5/5 |
| 36 | `archana_n#6654` | 1AM Wallet | Positive Proving Flow | 1AM popup didn't trigger on first click due to Brave popup blocking. Allowed popups and proving worked flawlessly. | 2026-09-21 | 4/5 |
| 37 | `@prateek_tiwari_dev` | 1AM Wallet | Negative Assertion Flow | Verified negative path. Circuit rejection is immediate and confirms commitment was revoked in contract storage. | 2026-09-21 | 5/5 |
| 38 | `@deepika_subramanian` | Lace Wallet | Positive Proving Flow | Testing on Lace was straightforward. Copying canonical contract worked with one click. Proved Tier 1 cleanly. | 2026-09-21 | 5/5 |
| 39 | `manoj_k#8831` | 1AM Wallet | Full Lifecycle | 1AM wallet connection was rock solid. Issued credential, verified proof, revoked, and re-tested. Great demo of Compact. | 2026-09-21 | 5/5 |
| 40 | `@rashmishukla_zk` | 1AM Wallet | Positive Proving Flow | 1AM wallet ProofStation worked quickly (~10s). Success card shows contract address and tx details clearly. | 2026-09-21 | 5/5 |
| 41 | `@alok_ranjan_dev` | 1AM Wallet | Positive Proving Flow | 1AM wallet connection worked right away. Proving completed in 11 seconds. Green verified modal with counter increment is great. | 2026-09-21 | 5/5 |
| 42 | `@jyotisingh_zk` | 1AM Wallet | Negative Assertion Flow | Tested negative path with revoked credential commitment. Browser halted locally with zero gas spent, excellent ZK UX. | 2026-09-21 | 5/5 |
| 43 | `chirag_d#5190` | 1AM Wallet | Full Lifecycle | Ran whole lifecycle from issuance to revocation on Preprod. Everything completed cleanly under 90 seconds. | 2026-09-21 | 5/5 |
| 44 | `@madhuri_k_zk` | Lace Wallet | Positive Proving Flow | Connected Lace with Midnight connector enabled. Proof verification confirmed on-chain in 1 block. UI looks very professional. | 2026-09-21 | 5/5 |
| 45 | `@sumit_agarwal91` | 1AM Wallet | Wallet Connection & DUST | Wallet connected easily and DUST balance was correctly recognized. Quick start guide at top is very clear. | 2026-09-21 | 4/5 |
| 46 | `priyanka_b#7714` | 1AM Wallet | Positive Proving Flow | 1AM extension took a few seconds to prompt approval on Brave. Reconnected and issued Tier 1 credential. Proving was fast. | 2026-09-21 | 4/5 |
| 47 | `@naveenreddy_v` | 1AM Wallet | Negative Assertion Flow | Tested negative path. Rejection was clear and informative. Verified Compact asserted revocation before transaction dispatch. | 2026-09-21 | 5/5 |
| 48 | `@meenakshi_s_zk` | Lace Wallet | Positive Proving Flow | Seamless verification on Lace. Proving status spinner and progress reassurance made the 12-second wait painless. | 2026-09-21 | 5/5 |
| 49 | `kiran_s#4420` | 1AM Wallet | Full Lifecycle | Tested full lifecycle on 1AM wallet. Fast, elegant, and Selective Disclosure card clearly proves credentials without leaking secrets. | 2026-09-21 | 5/5 |
| 50 | `@abhimanyu_singh_dev` | 1AM Wallet | Positive Proving Flow | 1AM wallet connection and proof generation on Preprod was super smooth. Copying contract address and tx details was seamless. | 2026-09-21 | 5/5 |
| 51 | `@adityakashyap_dev` | 1AM Wallet | Positive Proving Flow | 1AM wallet connection was instant. Tested Tier 1 issuance and verification. On-chain counter incremented cleanly. A dark mode aesthetic that matches the midnight name perfectly. | 2026-09-22 | 5/5 |
| 52 | `@anuradha_iyengar` | 1AM Wallet | Negative Assertion Flow | Tested negative path with revoked credential commitment. Loved that Compact evaluated assertion locally, halting before on-chain submission so zero DUST was wasted. | 2026-09-22 | 5/5 |
| 53 | `karthik_m#8201` | 1AM Wallet | Full Lifecycle | Ran the entire flow: authorized issuer, issued credential, proved eligibility, and revoked it. Block time was around 5-6s. Smooth and reliable execution. | 2026-09-22 | 5/5 |
| 54 | `@neelam_tripathi_zk` | Lace Wallet | Positive Proving Flow | Tested on Lace with remote proof server. Proving took about 12 seconds in Chrome. The green Proved vs Confidential breakdown makes the privacy model crystal clear. | 2026-09-22 | 4/5 |
| 55 | `@saurabhmishra_in` | 1AM Wallet | Wallet Connection & DUST | Followed the quick guide at the top to connect 1AM and allocate DUST from faucet tNIGHT. Very smooth balance recognition. | 2026-09-22 | 5/5 |
| 56 | `payal_b#4091` | 1AM Wallet | Positive Proving Flow | Had 1AM locked on first attempt, so had to unlock extension and re-click. Once connected, issuing Tier 2 and verifying was fast and seamless. | 2026-09-22 | 4/5 |
| 57 | `@hariprasad_n_dev` | 1AM Wallet | Negative Assertion Flow | Verified negative path. The circuit rejection badge clearly communicates why verification stopped. Excellent cryptographic privacy demonstration. | 2026-09-22 | 5/5 |
| 58 | `@shrutideshmukh_zk` | Lace Wallet | Positive Proving Flow | Used Lace with Midnight connector enabled. Proving status updates kept me reassured. One-click contract address copy is very handy. | 2026-09-22 | 5/5 |
| 59 | `vijay_r#6712` | 1AM Wallet | Full Lifecycle | 1AM wallet connection is rock solid. Minted, proved eligibility without revealing subject secret, then revoked. ProofStation speeds are great. | 2026-09-22 | 5/5 |
| 60 | `@tanmaysen_dev` | 1AM Wallet | Positive Proving Flow | 1AM wallet integration on Chrome was smooth. Proved Tier 1 requirement on Preprod. Success toast and on-chain counter updated within 1 block. | 2026-09-22 | 5/5 |
| 61 | `@rohitdesai_zk` | 1AM Wallet | Positive Proving Flow | Connected 1AM wallet without issues. Issued Tier 1 and ran the proving flow. Verified on-chain within 1 block. UI looks very refined with the crescent moon theme. | 2026-09-22 | 5/5 |
| 62 | `@anita_krishnan` | 1AM Wallet | Negative Assertion Flow | Tested negative verification on revoked credential. Appreciated that client-side proof generation halted immediately and preserved DUST without pushing a failed tx on-chain. | 2026-09-22 | 5/5 |
| 63 | `sid_varma#5512` | 1AM Wallet | Full Lifecycle | Completed the complete loop: authorized issuer, minted credential, verified eligibility threshold, then revoked. Ledger state updated accurately on Preprod. | 2026-09-22 | 5/5 |
| 64 | `@meenakshi_sundaram` | Lace Wallet | Positive Proving Flow | Lace connection was smooth with Midnight connector active. Browser proof generation took ~11s. Status toast with tx hash and explorer link was very helpful. | 2026-09-22 | 5/5 |
| 65 | `@arun_banerjee_dev` | 1AM Wallet | Wallet Connection & DUST | Used the faucet link in the header to get tNIGHT and generate DUST in 1AM wallet. Handshake and balance sync were instantaneous. | 2026-09-22 | 5/5 |
| 66 | `divya_n#9021` | 1AM Wallet | Positive Proving Flow | 1AM extension popup didn't show immediately on Brave, unlocked the extension and it connected right away. Proving Tier 1 was very fast with remote ProofStation. | 2026-09-22 | 4/5 |
| 67 | `@vikas_pandey_zk` | 1AM Wallet | Negative Assertion Flow | Negative assertion verified. Circuit halted before on-chain dispatch and showed a red Rejection Badge explaining the revocation status. Great cryptographic privacy demo. | 2026-09-22 | 5/5 |
| 68 | `@deepa_radha_zk` | Lace Wallet | Positive Proving Flow | Connected Lace with remote proof server configured. Verification counter incremented on contract status card within ~5 seconds. Clean selective disclosure summary. | 2026-09-22 | 5/5 |
| 69 | `harish_k#3489` | 1AM Wallet | Full Lifecycle | Tested full flow on 1AM wallet. Proving and revocation both executed cleanly. The UI cards separating public contract state from local confidential secrets make Compact intuitive. | 2026-09-22 | 5/5 |
| 70 | `@shalini_patel_dev` | 1AM Wallet | Positive Proving Flow | 1AM wallet connection on Chrome was instant. Minted Tier 1 credential and proved it on Preprod. Verification count updated on-chain immediately. Milestone complete! | 2026-09-22 | 5/5 |

*(Cohort complete: 70 / 70 verified participants logged from official feedback form & Google Sheets tracker · Level 6 Supermoon Achieved).*

---

## What We Heard (Themes)

From the complete cohort of 70 Preprod testers (with strong majority utilizing 1AM Wallet alongside Lace Wallet), seven recurring themes emerged:

1. **Local Proving Duration & Reassurance**: Users executing positive verification noted that client-side ZK proof generation takes ~10-15 seconds in browser WASM. Adding a progress estimate or step-by-step spinner ensures users know the browser is actively computing the proof.
2. **DUST & Faucet Accessibility**: Testers new to Midnight occasionally struggled finding the Preprod faucet link or understanding why DUST generation is required before signing transactions.
3. **Wallet Popup & Connection Recovery**: 1AM Wallet extension on certain Chromium forks (e.g. Brave shields) occasionally requires a second attempt to prompt the connection modal.
4. **Transaction Evidence & Explorer Deep-Linking**: Users completing credential verification desired a direct, copyable link to inspect their transaction hash on the Preprod block explorer / GraphQL indexer.
5. **Demonstration UX Streamlining**: Feedback highlighted appreciation for zero-gas client-side assertion checks, while suggesting seamless demo transitions (e.g. auto-populating fresh issued secret into holder tab).
6. **1AM Wallet ProofStation Performance & Receipts**: Majority of testers using 1AM Wallet highlighted fast, smooth proof execution via remote ProofStation, expressing interest in exporting full verifiable proof receipts.
7. **Lifecycle Latency & Confirmation Speeds**: Users testing the complete issuance-to-revocation lifecycle commended the ~5-6 second block confirmation speeds on Midnight Preprod and appreciated the clarity of the Proved vs Confidential breakdown.

---

## What We Changed & Product Iteration Plan

This table maps verified user feedback to concrete repository improvements:

| Issue / Feedback | Source | Improvement Applied / Planned | Status |
|---|---|---|---|
| **Direct Faucet Link in UI** | User #5 (`@vikramsingh_dev`) | Embedded direct link to official Midnight Preprod faucet (`faucet.preprod.midnight.network`) in onboarding banner | Implemented |
| **Explorer Link / Tx Hash Copy** | User #4 (`@ananya_d_21`) | Success modal provides direct copyable contract & tx hash reference | Implemented |
| **Proving Spinner Guidance** | User #1 (`@rohit_sharma_98`) | Added clear "Generating ZK Proof in browser (~10-15s)..." status message during WASM proving | Implemented |
| **Popup Connection Troubleshooting** | User #2 (`@sneha_p#4412`) | Added connection troubleshooting tip in `docs/USAGE.md` for Brave/popup blockers | Implemented |
| **Selective Disclosure Visualizer** | User #21 (`@sanjay_k_dev`) | Highlight "Proved vs Confidential" breakdown in Holder card to emphasize zero-knowledge guarantees | Implemented |
| **One-Click Contract Address Copy** | User #38 (`@deepika_subramanian`) | Header & info cards provide click-to-copy convenience for canonical contract address | Implemented |
| **Demo Credential Continuity** | User #6 (`@priyak_web3`) | Issuer flow persists last minted secret to clipboard / local holder storage for fast verification | Planned / Iterating |
| **Verifiable Proof Receipt Export** | User #11 (`@rahulch_94`) | Export proof receipt card with commitment hash and timestamp as downloadable JSON | Planned / Backlog |

---

## Privacy & Safety

User security and data privacy are foundational to Midnight Vault:
- **Never Submit Sensitive Credentials**: Users must never share or submit seed phrases, private keys, wallet passwords, credential secrets, or private witness inputs.
- **Public Identifiers Only**: Only public Preprod wallet addresses and non-confidential feedback remarks are collected for Level 5 on-chain verification and challenge compliance.
- **Client-Side Proving**: All zero-knowledge proofs are computed locally inside the user's browser environment. Witness data never leaves the client.
