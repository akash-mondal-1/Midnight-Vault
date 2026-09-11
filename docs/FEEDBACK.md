# User Feedback — Level 5 — Full Moon

## Feedback Collection Method

*Status: External form link to be published before user onboarding.*

This document tracks the structured feedback loop for **Level 5 — Full Moon**. During the active onboarding phase, feedback is collected from genuine users who interact with the Midnight Vault application on the **Midnight Preprod** network.

> **Important Note**: This markdown document is the public **evidence log and changelog**. It is **not** the submission interface. Feedback and public wallet addresses will be gathered via the external form linked below.

- **External Submission Form**: `[Feedback Form URL — To be published before user onboarding]`
- **In-App Touchpoint**: Accessible via the "Feedback" link in the application header and footer.
- **Target**: 50 genuine Preprod users (verifiable on-chain). Current verified count: `0 / 50`.
- **Data Collected**: Structured feedback, error reports, and the participant's public Preprod wallet address for Indexer verification.
- **Privacy Notice**: NEVER collect seed phrases, private keys, passwords, or private credential witnesses under any circumstances.

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
Address is appended to USERS.md
  ↓
Raw feedback logged & recurring themes summarized in docs/FEEDBACK.md
  ↓
Product improvements implemented, verified, & commit hashes recorded below
```

---

## Recommended Feedback Form Fields

> ⚠️ **CRITICAL PRIVACY RULE**: NEVER collect seed phrases, private keys, passwords, or private credential witnesses. The feedback form must strictly collect only public Preprod wallet addresses (`mn_addr_...`) for Indexer verification.

The external submission form is structured with the following 11 fields to facilitate actionable analysis:

1. **Wallet Used**:
   - 1AM Wallet
   - Lace Wallet
   - Other
2. **What was tested?**:
   - Positive Proving Flow (Issued a fresh credential and verified it on-chain)
   - Negative Assertion Flow (Tested the revoked credential circuit rejection)
   - Full Lifecycle (Authorize Issuer, Issue Credential, Verify, Revoke)
   - Wallet Connection & DUST generation only
3. **Was wallet connection successful?**:
   - Yes / No / Required multiple attempts
4. **Was the test completed?**:
   - Yes, completed full transaction flow / No, encountered an issue
5. **Expected vs observed result**:
   - What did you expect to happen, and what actually occurred on-screen and in your wallet?
6. **Points of confusion**:
   - Was any terminology (witness, commitment, tier threshold, DUST maturity) unclear?
7. **Errors encountered**:
   - Did you encounter any wallet rejection, timeout, or circuit error messages? (Include exact error text if available)
8. **Suggested improvement**:
   - What single improvement would make Midnight Vault easier to use?
9. **Overall experience rating**:
   - Rating from 1 to 5 (1 = Frustrating, 5 = Seamless)
10. **Public Midnight Preprod wallet address**:
    - Your public unshielded address (`mn_addr_...`) to qualify for [USERS.md](../USERS.md).
    - *Security Disclaimer: Public blockchain identifier only. NEVER collect seed phrases, private keys, passwords, or private credential witnesses.*
11. **Optional social/contact handle**:
    - Discord, Telegram, or X handle for verification or follow-up.

---

## Raw Feedback Log

The log below records raw feedback submitted by verified Preprod users. Entries will be recorded chronologically as real feedback is received during Phase 4 and Phase 5.

| # | User / Handle | Wallet Type | Interaction Tested | Feedback Summary | Date |
|---|---------------|-------------|-------------------|------------------|------|

*(Awaiting real user onboarding and feedback submissions. No synthetic entries allowed.)*

---

## What We Heard (Themes)

*This section will be synthesized from actual user feedback once collected.*

No themes have been synthesized yet. Following onboarding, raw user feedback will be clustered into recurring themes (e.g., wallet connection experience, Preprod faucet/DUST clarity, transaction feedback, circuit proving latency, UI guidance) to inform prioritization.

---

## What We Changed

This table maps verified user feedback to concrete repository improvements, documenting the problem, the applied change, and the associated Git commit.

| Change | Reason | Commit |
|--------|--------|--------|

*(No feedback-driven changes have been applied yet. Product iterations will be documented here in Phase 6.)*

---

## Privacy & Safety

User security and data privacy are foundational to Midnight Vault:
- **Never Submit Sensitive Credentials**: Users must never share or submit seed phrases, private keys, wallet passwords, credential secrets, or private witness inputs.
- **Public Identifiers Only**: Only public Preprod wallet addresses and non-confidential feedback remarks are collected for Level 5 on-chain verification and challenge compliance.
- **Client-Side Proving**: All zero-knowledge proofs are computed locally inside the user's browser environment. Witness data never leaves the client.
