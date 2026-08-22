# ReliefTrack Smart Contract & Web3 Architecture

ReliefTrack uses Solidity smart contracts to anchor critical aid delivery milestones on-chain without exposing PII (Personally Identifiable Information) or confidential medical files.

## Smart Contract Specification (`blockchain/contracts/ReliefTracker.sol`)

- **Solidity Version**: `0.8.24`
- **Supported Networks**: Ethereum Sepolia Testnet (Chain ID 11155111) & Polygon Amoy Testnet (Chain ID 80002).

### Functions
- `recordDonation(receiptId, campaignId, amount)` — Anchors donation receipt ID and contributed amount on-chain.
- `allocateFunds(allocationId, campaignId, ngoAddress, beneficiaryId, amount)` — Records manager-approved allocation to an NGO.
- `recordExpense(expenseId, allocationId, amount, category, receiptHash)` — Anchors itemized expenditure and cryptographic receipt checksum.
- `anchorEvidence(evidenceId, expenseId, evidenceHash)` — Anchors camera photo/video SHA-256 hash.
- `markCaseCompleted(receiptId, beneficiaryId, totalSpent)` — Emits case completion event on-chain.
