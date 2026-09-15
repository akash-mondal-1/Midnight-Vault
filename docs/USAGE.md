# User Guide & Testing Instructions — Midnight Vault (Level 5)

Welcome to **Midnight Vault**. This guide walks you through testing our privacy-preserving zero-knowledge credential application on the **Midnight Preprod Testnet**.

---

## 1. What Midnight Vault Does

Midnight Vault enables decentralized, selective-disclosure credential verification:
- **Zero-Knowledge Proofs**: Prove that you meet an eligibility requirement (e.g. `tier >= 1`, active membership) without disclosing your identity, your secret keys, or your exact credential tier.
- **Client-Side Privacy**: Private witnesses (secrets, raw attributes) are held strictly in your browser and used to compute zero-knowledge proofs locally via WebAssembly.
- **On-Chain Enforcement**: The Midnight Preprod smart contract cryptographically validates that credentials were issued by an authorized issuer and have not been revoked.

---

## 2. Prerequisites & What You Need

To test the application, you will need:
1. A desktop browser: Google Chrome, Brave, or Microsoft Edge.
2. A supported Midnight browser wallet extension:
   - **1AM Wallet** (Recommended: includes native proof generation support) — available on the [Chrome Web Store](https://chromewebstore.google.com/detail/1am/bphnkdkcnfhompoegfpgnkidcjfbojjp).
   - **Lace Wallet** (Beta with Midnight connector enabled).
3. Testnet **$tNIGHT** and **DUST** tokens to pay for zero-knowledge transaction fees.

---

## 3. Accessing the Live Demo & Contract Details

- **Live Application URL**: [https://midnight-vault-nine.vercel.app/](https://midnight-vault-nine.vercel.app/)
- **Canonical Smart Contract Address**:
  ```text
  dcef898920d314ca3ad8c512ec356befac3407c730700b0323cd9577faadd18f
  ```
- **Network**: Midnight Preprod
- **Indexer Endpoint**: `https://indexer.preprod.midnight.network/api/v4/graphql`

---

## 4. Wallet Setup & Gas (DUST) Configuration

Midnight requires **DUST** tokens to execute transactions and verify zero-knowledge proofs.

### Step A: Install and Configure Your Wallet
- **1AM Wallet**:
  1. Open 1AM Wallet and verify the network selector is set to **Preprod**.
- **Lace Wallet**:
  1. Open Lace → Click **⚙️ Settings** → **Experiments**.
  2. Toggle on **Midnight dApp connector**.
  3. Under Midnight settings, select **Remote proof server** (ProofStation: `https://api-preprod.1am.xyz`).
  4. Ensure network is set to **Preprod**.

### Step B: Obtain Testnet $tNIGHT
1. Copy your unshielded Midnight address from your wallet.
2. Visit the official [Midnight Preprod Faucet](https://faucet.preprod.midnight.network/).
3. Paste your address and request testnet `$tNIGHT`.

### Step C: Generate DUST
1. In 1AM or Lace, navigate to **DUST Management** or **Generate DUST**.
2. Allocate a portion of your unshielded `$tNIGHT` to generate DUST.
3. Allow a short window for the DUST balance to mature and become available for transaction fees.

---

## 5. How a Level 5 Tester Qualifies

To ensure authenticity and fulfill challenge requirements, a participant qualifies as a **Verified Level 5 Preprod User** by completing actual on-chain interaction:

1. **Connect a Genuine Wallet**: Connect 1AM or Lace wallet configured for **Midnight Preprod**.
2. **Execute an Interaction**: Successfully execute at least one transaction on the canonical smart contract on Midnight Preprod:
   - **Positive Proving Flow**: Issue a fresh credential in the *Issuer* tab and verify it in the *Holder* tab (producing on-chain verification counter increment).
   - **Negative Assertion Flow**: Verify the revoked baseline credential and observe client-side circuit rejection.
   - **Issuance Flow**: Authorize an issuer or issue a credential commitment.
3. **Submit Verification Details**: Provide your public Preprod wallet address and qualitative feedback through the official Level 5 feedback form.
4. **On-Chain Audit**: The project team cross-verifies the wallet's interaction on the Midnight Preprod indexer before appending the address to [USERS.md](../USERS.md).

> **Important**: Merely submitting a wallet address through a form without interacting on-chain does **not** qualify. Only genuine, verified participants are admitted to `USERS.md`.

---

## 6. Testing the MVP Flow

### Step 1: Connect Your Wallet
1. Navigate to [https://midnight-vault-nine.vercel.app/](https://midnight-vault-nine.vercel.app/).
2. Review the **Quick Start · Tester Walkthrough** banner at the top of the dashboard.
3. Click **Connect Wallet** in the top right.
4. Select your installed wallet (**1AM Wallet** or **Lace Wallet**) and approve the connection request.
5. Verify that the network status indicator displays **Vault Contract (Preprod)**.
6. Notice the **Feedback** links in the header and footer to share feedback or report issues.

### Demonstration Issuer Architecture Disclosure
In this live Preprod MVP, the "Issuer (Demo)" interface is provided strictly as a demonstration and testing harness to allow hackathon evaluators and community testers to experience the complete zero-knowledge credential issuance and revocation lifecycle. It does **not** represent production issuer key management infrastructure. In production deployments, issuing authorities manage private keys within secure hardware security modules (HSMs) or enterprise key vaults and publish commitments via administrative endpoints. The underlying Midnight smart contract (`Vault.compact`) strictly cryptographically enforces that only authorized issuer commitments registered in the `issuers` ledger map can mint or revoke credentials.

### Step 2: Positive Verification Flow (Issue & Prove Fresh Credential)
1. Navigate to the **Issuer (Demo)** tab.
2. Notice that the issuer secret `demo-secret-123` derives the canonical issuer commitment (`99967b55...`) which was permanently authorized during Level 4.
3. In **Recipient Subject Secret**, enter a unique secret (e.g. `tester-secret-01` or your handle).
4. Select a tier (e.g. `Tier 1`).
5. Click **Issue Credential** and approve the transaction in your wallet.
6. Once submitted, switch to the **Holder / Verifier** tab:
   - Enter that exact secret in **Credential Secret**.
   - Keep the Issuer ID as `99967b5594ee4cc8ec0c31f8cbc02be10089e16eb269ba92f4b66d6b11431953`.
   - Set Required Tier to `Tier 1+`.
   - Click **Verify Credential** and approve the transaction.
7. Observe the verified green **PROVED ON-CHAIN** state detailing what was proved and what remained confidential.

### Step 3: Negative Verification Flow (Testing Circuit Rejection)
> **Note on Level 4 Baseline Credential**: The pre-filled default secret (`my-cred-secret-abc`) represents the Level 4 benchmark credential which was intentionally revoked on-chain to prove negative assertions.
1. On the **Holder / Verifier** tab with default values:
2. Click **Verify Credential**.
3. The local zero-knowledge circuit evaluates the assertion `revoked.member(publicCommitment) == false`.
4. Because the credential is revoked on-chain, the transaction safely aborts before submission and displays the red **Verification Rejected** card. This demonstrates cryptographic enforcement.

### Step 4: Revocation Flow (Optional)
1. Switch to the **Issuer (Demo)** tab.
2. In the **Revoke Credential** card, enter any active credential commitment.
3. Click **Revoke Credential** and sign the transaction.
4. Return to the Holder tab and verify that the credential can no longer be proved.

---

## 7. Submitting Your Preprod Wallet for Level 5 Verification

To be credited as one of our 50 verified Preprod users:
1. Open your 1AM or Lace wallet.
2. Copy your public unshielded address (starts with `mn_addr_...`).
3. Submit your address via the designated Level 5 feedback form / [Responses Tracker](https://docs.google.com/spreadsheets/d/16XIENbP254GiD5WdvLvrPDdfKkb8Q_tTMwdHzKhGYVI/edit?usp=sharing).
4. Your interaction will be audited against the Preprod GraphQL indexer and added to [USERS.md](../USERS.md).

> **Troubleshooting Note (Brave & Popup Blockers)**: If your wallet connection popup does not appear immediately when clicking "Connect Wallet", ensure popup blockers or Brave Shields allow wallet prompts, or reload the page once.

---

## 8. Providing Feedback

We value your feedback to guide our product iterations:
- **Usability**: Was the wallet connection and interface intuitive?
- **Clarity**: Did you clearly understand what information was proved versus what was kept private?
- **Performance**: How smooth was the local proof generation and transaction submission?
- **Encountered Issues**: Did you experience any wallet timeouts or confusing error messages?

All entries will be logged in [docs/FEEDBACK.md](FEEDBACK.md) to drive subsequent improvements.

---

## 9. Privacy & Safety Warnings

- **Never Share Private Keys**: Never share your wallet seed phrase, recovery phrase, or private keys with anyone or paste them into any website or form.
- **Never Share Real Secrets**: Use arbitrary demonstration strings for testing. Never enter personal passwords or confidential data.
- **Client-Side Proof Security**: Zero-knowledge proving takes place locally in your browser. Only public cryptographic commitments and zero-knowledge proofs are broadcast to the Midnight Preprod ledger.
