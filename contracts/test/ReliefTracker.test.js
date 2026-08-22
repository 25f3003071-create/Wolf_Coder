const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReliefTracker Smart Contract", function () {
  let ReliefTracker;
  let reliefTracker;
  let owner;
  let donor;
  let ngo;

  beforeEach(async function () {
    [owner, donor, ngo] = await ethers.getSigners();
    ReliefTracker = await ethers.getContractFactory("ReliefTracker");
    reliefTracker = await ReliefTracker.deploy();
    await reliefTracker.waitForDeployment();
  });

  it("Should record a donation and emit DonationCreated event", async function () {
    const receiptId = "DR-2026-TEST01";
    const campaignId = "CMP-2026-0192";
    const amount = ethers.parseEther("0.1");

    const tx = await reliefTracker.connect(donor).recordDonation(receiptId, campaignId, amount);
    await expect(tx).to.emit(reliefTracker, "DonationCreated");

    const rec = await reliefTracker.donations(receiptId);
    expect(rec.exists).to.be.true;
    expect(rec.donor).to.equal(donor.address);
    expect(rec.amount).to.equal(amount);
  });

  it("Should record an allocation and emit FundsAllocated event", async function () {
    const allocId = "ALLOC-2026-TEST01";
    const campaignId = "CMP-2026-0192";
    const beneficiaryId = "BEN-72A91";
    const amount = ethers.parseEther("0.085");

    const tx = await reliefTracker.connect(owner).allocateFunds(allocId, campaignId, ngo.address, beneficiaryId, amount);
    await expect(tx).to.emit(reliefTracker, "FundsAllocated");

    const rec = await reliefTracker.allocations(allocId);
    expect(rec.exists).to.be.true;
    expect(rec.beneficiaryId).to.equal(beneficiaryId);
  });

  it("Should record an expense and evidence anchor", async function () {
    const expenseId = "EXP-2026-TEST01";
    const allocId = "ALLOC-2026-TEST01";
    const amount = ethers.parseEther("0.065");
    const category = "Medical Treatment";
    const receiptHash = ethers.keccak256(ethers.toUtf8Bytes("surgery_receipt_hash_01"));

    await reliefTracker.connect(ngo).recordExpense(expenseId, allocId, amount, category, receiptHash);

    const evidenceId = "EVD-2026-TEST01";
    const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("camera_photo_hash_01"));

    const tx = await reliefTracker.connect(ngo).anchorEvidence(evidenceId, expenseId, evidenceHash);
    await expect(tx).to.emit(reliefTracker, "EvidenceAnchored");
  });
});
