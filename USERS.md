# Preprod Users — Level 5 — Full Moon

Target: 50 genuine Preprod users  
Current count: 10 / 50 (In Progress)

---

## Verified User Registry

The following table records verified participants who have connected to Midnight Vault and executed zero-knowledge credential transactions on the **Midnight Preprod** network. Live responses and feedback are tracked in the [Official Feedback Responses Sheet](https://docs.google.com/spreadsheets/d/16XIENbP254GiD5WdvLvrPDdfKkb8Q_tTMwdHzKhGYVI/edit?usp=sharing).

> **Authenticity Rule**: A wallet address alone does **NOT** qualify as a Level 5 user. Only genuine testers who have actually interacted with the live Midnight Preprod MVP (`https://midnight-vault-nine.vercel.app/`) on the canonical contract (`dcef8989...`) and submitted feedback may be added to this registry.

| # | Public Preprod Wallet Address | Interaction Completed | Indexer Verification | Date Added | Notes / Evidence |
|---|---|---|---|---|---|
| 1 | `mn_addr_preprod1p0dw747p4ds05me6mjk8es3esrf0e38760nlx00raag7djuzyl6svwky8d` | Positive Proving Flow (Issued & verified credential) | Verified (Indexer / Contract state) | 2026-09-14 | Lace Wallet; verified on-chain counter increment |
| 2 | `mn_addr_preprod123zd2vg0mssz3k830l5wm2d4932nuq7sfy6eapdmaazjpng8f2tq9uhlhp` | Negative Assertion Flow (Revoked credential rejection) | Verified (Indexer / Assertion check) | 2026-09-14 | 1AM Wallet; negative assertion circuit rejection |
| 3 | `mn_addr_preprod1lra65vdu6e33as06trls8s3f9rlagv6rtqp286k7ckqh26smmwusg4sm8q` | Full Lifecycle (Authorize, Issue, Verify, Revoke) | Verified (Indexer / Contract state) | 2026-09-14 | Lace Wallet; completed full transaction lifecycle |
| 4 | `mn_addr_preprod1y0005v64n2ppn4whrcsm4ejualmx0hd80tn2hlhx4h2qfpspd68s608y47` | Positive Proving Flow (Tier 1 verification) | Verified (Indexer / Contract state) | 2026-09-15 | Lace Wallet; successfully proved eligibility |
| 5 | `mn_addr_preprod1fcs95y0mnzq3sjuyzqmw79nr625x6eeffvkppr4hqnhjsx2hx2gsnr4xh2` | Wallet Connection & DUST Balance Allocation | Verified (Indexer / Preprod balance) | 2026-09-15 | 1AM Wallet; DUST generation & connection verified |
| 6 | `mn_addr_preprod15qupu9fu6df0sv8kwhege70npg48zc9y7p8g6en72cdnek3vemxs8p425q` | Positive Proving Flow (Fresh credential verification) | Verified (Indexer / Contract state) | 2026-09-15 | Lace Wallet; positive ZK proof verified on-chain |
| 7 | `mn_addr_preprod14mkwgjjcwcspeh96kydg9yep9c6rn5rfu8tv6d5aq49kdtjk55zqn6ewex` | Full Lifecycle (Revocation & circuit rejection) | Verified (Indexer / Contract state) | 2026-09-15 | 1AM Wallet; client-side assertion halted tx |
| 8 | `mn_addr_preprod1dgwrpckvhkf58j09uejrmkmcjad4w0duv3234tw9a4s22l0lyawseq5h3z` | Negative Assertion Flow (Revoked credential check) | Verified (Indexer / Assertion check) | 2026-09-15 | Lace Wallet; negative path verified |
| 9 | `mn_addr_preprod14mdfw8xh8p0afs59j6lahzp9jzvlhdv7df2lrauw4x7rq7c20kvss2tqrw` | Positive Proving Flow (Tier 1 verification) | Verified (Indexer / Contract state) | 2026-09-15 | 1AM Wallet; proved threshold without identity reveal |
| 10 | `mn_addr_preprod17d3nrqyyzz4eycuw7pvk7swkr4mvg7eyz02yjczmrmzztcs9v38s86hqxm` | Wallet Connection & DUST Generation | Verified (Indexer / Preprod balance) | 2026-09-15 | Lace Wallet; successful dApp connector handshake |

*(Remaining 40 slots actively onboarding via community outreach and Google Form/Sheet feedback)*

---

## What Qualifies a Verified Level 5 User

A wallet address alone does **NOT** qualify as a Level 5 user. A verified Level 5 user requires:

1. **Genuine interaction with the live MVP**: The tester must execute an actual transaction flow with the live MVP (`https://midnight-vault-nine.vercel.app/`) on Midnight Preprod (e.g., positive credential verification, negative assertion circuit rejection, or credential issuance).
2. **A public Preprod wallet address**: The tester must provide their public unshielded Preprod wallet address (`mn_addr_...`).
3. **Successful verification of relevant interaction using available Preprod/indexer evidence**: The project team must successfully verify the relevant transaction activity on the official Midnight Preprod Indexer (`https://indexer.preprod.midnight.network/api/v4/graphql`).
4. **A genuine feedback submission**: The tester must submit genuine qualitative feedback through the official Level 5 external feedback form.

---

## Privacy & Security Disclaimers

- **Public Blockchain Identifiers Only**: This table records only public Midnight Preprod wallet addresses necessary for Level 5 on-chain auditability.
- **Strictly Prohibited**: Seed phrases, recovery phrases, private keys, wallet passwords, holder secret witnesses, and issuer secrets must **NEVER** be collected, stored, or published under any circumstances.
- **Confidential Witness Storage**: All secret witnesses used during testing remain strictly local to the tester's browser memory.
