// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ReliefTracker
 * @notice Smart contract for immutable, transparent audit trail of emergency relief donations, fund allocations, expense recordings, and evidence hashes.
 * @dev Does NOT store PII or sensitive documents on-chain. Anchors only cryptographic hashes and receipt IDs.
 */
contract ReliefTracker {
    address public owner;

    struct DonationRecord {
        string receiptId;
        address donor;
        string campaignId;
        uint256 amount;
        uint256 timestamp;
        bool exists;
    }

    struct AllocationRecord {
        string allocationId;
        string campaignId;
        address ngoAddress;
        string beneficiaryId;
        uint256 amount;
        uint256 timestamp;
        bool exists;
    }

    struct ExpenseRecord {
        string expenseId;
        string allocationId;
        address ngoAddress;
        uint256 amount;
        string category;
        bytes32 receiptHash;
        uint256 timestamp;
        bool exists;
    }

    struct EvidenceRecord {
        string evidenceId;
        string expenseId;
        bytes32 evidenceHash;
        uint256 timestamp;
        bool exists;
    }

    // Mappings
    mapping(string => DonationRecord) public donations;
    mapping(string => AllocationRecord) public allocations;
    mapping(string => ExpenseRecord) public expenses;
    mapping(string => EvidenceRecord) public evidenceRecords;

    // Events for transparency
    event DonationCreated(
        string indexed receiptId,
        address indexed donor,
        string campaignId,
        uint256 amount,
        uint256 timestamp
    );

    event FundsAllocated(
        string indexed allocationId,
        string campaignId,
        address indexed ngoAddress,
        string beneficiaryId,
        uint256 amount,
        uint256 timestamp
    );

    event ExpenseRecorded(
        string indexed expenseId,
        string indexed allocationId,
        address indexed ngoAddress,
        uint256 amount,
        string category,
        bytes32 receiptHash,
        uint256 timestamp
    );

    event EvidenceAnchored(
        string indexed evidenceId,
        string indexed expenseId,
        bytes32 evidenceHash,
        uint256 timestamp
    );

    event CaseCompleted(
        string indexed receiptId,
        string indexed beneficiaryId,
        uint256 totalSpent,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "ReliefTracker: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Register a new donation on-chain
     */
    function recordDonation(
        string calldata receiptId,
        string calldata campaignId,
        uint256 amount
    ) external payable {
        require(bytes(receiptId).length > 0, "ReliefTracker: receiptId required");
        require(!donations[receiptId].exists, "ReliefTracker: donation receipt already exists");

        donations[receiptId] = DonationRecord({
            receiptId: receiptId,
            donor: msg.sender,
            campaignId: campaignId,
            amount: amount,
            timestamp: block.timestamp,
            exists: true
        });

        emit DonationCreated(receiptId, msg.sender, campaignId, amount, block.timestamp);
    }

    /**
     * @notice Anchor fund allocation to an NGO and beneficiary
     */
    function allocateFunds(
        string calldata allocationId,
        string calldata campaignId,
        address ngoAddress,
        string calldata beneficiaryId,
        uint256 amount
    ) external {
        require(bytes(allocationId).length > 0, "ReliefTracker: allocationId required");
        require(!allocations[allocationId].exists, "ReliefTracker: allocation already exists");

        allocations[allocationId] = AllocationRecord({
            allocationId: allocationId,
            campaignId: campaignId,
            ngoAddress: ngoAddress,
            beneficiaryId: beneficiaryId,
            amount: amount,
            timestamp: block.timestamp,
            exists: true
        });

        emit FundsAllocated(allocationId, campaignId, ngoAddress, beneficiaryId, amount, block.timestamp);
    }

    /**
     * @notice Record an expense incurred by an NGO along with receipt hash
     */
    function recordExpense(
        string calldata expenseId,
        string calldata allocationId,
        uint256 amount,
        string calldata category,
        bytes32 receiptHash
    ) external {
        require(bytes(expenseId).length > 0, "ReliefTracker: expenseId required");
        require(!expenses[expenseId].exists, "ReliefTracker: expense already exists");

        expenses[expenseId] = ExpenseRecord({
            expenseId: expenseId,
            allocationId: allocationId,
            ngoAddress: msg.sender,
            amount: amount,
            category: category,
            receiptHash: receiptHash,
            timestamp: block.timestamp,
            exists: true
        });

        emit ExpenseRecorded(expenseId, allocationId, msg.sender, amount, category, receiptHash, block.timestamp);
    }

    /**
     * @notice Anchor evidence hash (photo/video checksum) on-chain
     */
    function anchorEvidence(
        string calldata evidenceId,
        string calldata expenseId,
        bytes32 evidenceHash
    ) external {
        require(bytes(evidenceId).length > 0, "ReliefTracker: evidenceId required");
        require(!evidenceRecords[evidenceId].exists, "ReliefTracker: evidence already exists");

        evidenceRecords[evidenceId] = EvidenceRecord({
            evidenceId: evidenceId,
            expenseId: expenseId,
            evidenceHash: evidenceHash,
            timestamp: block.timestamp,
            exists: true
        });

        emit EvidenceAnchored(evidenceId, expenseId, evidenceHash, block.timestamp);
    }

    /**
     * @notice Mark a donation journey as completed
     */
    function markCaseCompleted(
        string calldata receiptId,
        string calldata beneficiaryId,
        uint256 totalSpent
    ) external {
        emit CaseCompleted(receiptId, beneficiaryId, totalSpent, block.timestamp);
    }
}
