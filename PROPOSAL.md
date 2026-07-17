# Product Proposal: Private Allowlist Access

## The Problem
Many Web3 platforms, such as exclusive NFT mints, DeFi protocols, or private DAOs, require users to prove they are part of an allowlist to participate. However, traditional allowlists require exposing the user's wallet address publicly on-chain. This means anyone analyzing the blockchain can map identities to specific exclusive groups, compromising the user's privacy and exposing their on-chain behavior.

## The Solution
**Midnight Vault** implements a *Private Allowlist Access* model using the Midnight network's zero-knowledge capabilities. Instead of storing a public list of addresses, the dApp uses a shared or verifiable secret credential. Users generate a zero-knowledge proof locally on their device proving they know the credential. The network validates the proof and updates a public counter, granting them access or registering their participation, all without ever revealing the user's identity or the credential itself.

## Privacy Model
- **What is Private (The Shadow):** The user's membership secret, their wallet address, and the specific inputs used in the local circuit.
- **What is Public (The Light):** The total count of registered members and the fact that *someone* successfully proved their membership at a specific time. An observer can see the aggregate participation but cannot single out individual members.

## Contract Overview
The smart contract is written in Midnight's Compact language.
1. **State:** A public ledger tracking the `registeredMembersCount`.
2. **Circuit Logic:** The `registerMember` circuit takes a `membershipSecret` as a private witness. It asserts the secret is valid (e.g., matching a predefined hash or value).
3. **Disclosure:** Upon successful verification, the circuit discloses a state transition to increment the public `registeredMembersCount` by 1. The secret itself is never disclosed to the network.
