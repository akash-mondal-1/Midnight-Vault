# Product Proposal: Privacy-Preserving Zero-Knowledge Credential Infrastructure

## 1. The Problem: Over-Disclosure in Web3 Credentials

Modern credential and access verification systems (e.g. KYC compliance, accredited investor status, DAO governance tiers, membership badges) suffer from a fundamental privacy flaw: **over-disclosure**.

- **Exposing Sensitive Data**: To prove eligibility, users traditionally present full credential documents or certificates, exposing raw personal identifiers, exact tier rankings, and issuance metadata.
- **On-Chain Linkability**: In conventional blockchain identity systems, presenting an address or static badge creates an indelible on-chain footprint. Third-party observers can track user activity across dApps and correlate private wallet behavior with real-world identities.

---

## 2. The Solution: Midnight Vault

**Midnight Vault** implements decentralized, privacy-preserving credential infrastructure utilizing Midnight's Compact smart contract language and zero-knowledge ledger capabilities.

Instead of storing raw user identities or public allowlists on-chain:
1. **Private Witnesses**: Holder secrets and raw credential attributes remain strictly local to the user's browser or wallet environment.
2. **Zero-Knowledge Proofs**: Users generate ZK proofs locally via WebAssembly, proving that they possess a valid credential satisfying a required threshold (e.g. `tier >= requiredTier`) without disclosing the credential secret, their identity, or their exact tier.
3. **Cryptographic Integrity**: The smart contract verifies that the credential was issued by an authorized issuer and has not been revoked, without learning who the holder is.

---

## 3. Core Architecture & Protocol Lifecycle

The canonical smart contract (`contracts/Vault.compact`) provides a complete 4-stage credential lifecycle deployed on **Midnight Preprod**:

### A. Issuer Authorization (`authorizeIssuer`)
An entity registers as an authorized issuer by committing their public identifier on-chain:
$$\text{issuerId} = \text{persistentHash}([\text{secret}, \text{pad}(32, \text{"vault:issuer"})])$$
The issuer's secret remains private and is never disclosed as a public argument.

### B. Credential Issuance (`issueCredential`)
An authorized issuer commits a newly minted credential to the public ledger:
$$\text{userId} = \text{persistentHash}([\text{userSecret}, \text{pad}(32, \text{"vault:user"})])$$
$$\text{commitment} = \text{persistentHash}([\text{userId}, \text{ctypeBytes}, \text{issuerId}])$$
The credential commitment is recorded in the `issued` ledger map under the active issuer.

### C. Zero-Knowledge Verification (`verifyCredential`)
A credential holder proves their eligibility to the network:
- Proves knowledge of the private witness (`credentialSecret`, `credentialType`, `credentialIssuer`).
- Asserts that the derived commitment exists in the `issued` map.
- Asserts that the issuer is authorized and active.
- Asserts that the credential is not in the `revoked` map.
- Asserts that `credentialType >= requiredType` (threshold verification).
- Discloses the successful state transition to increment the public `verificationCount` counter.

### D. Credential Revocation (`revokeCredential`)
If an authorized issuer needs to invalidate a credential, they call `revokeCredential` with the credential commitment. The circuit enforces that only the original issuer can revoke it, inserting the commitment into the `revoked` ledger map. Subsequent verification attempts fail circuit validation.

---

## 4. Privacy Model

| Aspect | What Remains Private (Local Browser Witness) | What is Publicly Disclosed (On-Chain Ledger) |
| :--- | :--- | :--- |
| **Holder Identity** | User secret, derived `userId` | None (proof verifies knowledge without disclosure) |
| **Credential Value** | Exact tier/qualification value | Only that `tier >= requiredTier` condition is satisfied |
| **Issuer Secrets** | Issuer private seed | Derived `issuerId` commitment in `issuers` map |
| **Contract State** | Local witness parameters | Total `verificationCount`, commitment maps (`issued`, `revoked`) |

---

## 5. Canonical Deployment (Midnight Preprod)

- **Network**: Midnight Preprod Testnet
- **Contract Address**: `dcef898920d314ca3ad8c512ec356befac3407c730700b0323cd9577faadd18f`
- **Deployment Block**: `2,088,740`
- **Compiler**: Compact `0.31.1` (`pragma language_version >= 0.23.0`)
- **Live MVP Demo**: [https://midnight-vault-nine.vercel.app/](https://midnight-vault-nine.vercel.app/)
