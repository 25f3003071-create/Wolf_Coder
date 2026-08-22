import { describe, it, expect } from 'vitest';
import { DatabaseRepository } from '../../src/lib/db/repository';
import { evaluateFraudRules } from '../../src/lib/fraud/engine';

describe('End-to-End Relief Delivery Flow', () => {
  it('executes full relief pipeline: Donation -> Beneficiary -> Allocation -> Expense -> Camera Evidence', async () => {
    // 1. Donor Donation
    const donation = await DatabaseRepository.createDonation({
      campaignId: 'CMP-2026-0192',
      amount: 10000,
      donorId: '11111111-1111-1111-1111-111111111111',
    });
    expect(donation.id).toContain('DR-2026-');

    // 2. NGO Beneficiary Registration
    const { beneficiary } = await DatabaseRepository.createBeneficiary({
      category: 'MEDICAL',
      aidRequired: 'Emergency Surgery',
      estimatedCost: 78500,
      ngoId: 'NGO-1042',
      anonymizedSummary: 'Cardiac surgery beneficiary',
    });
    expect(beneficiary.id).toContain('BEN-');

    // 3. Manager Fund Allocation
    const allocation = await DatabaseRepository.createAllocation({
      campaignId: 'CMP-2026-0192',
      ngoId: 'NGO-1042',
      beneficiaryId: beneficiary.id,
      receiptId: donation.id,
      amount: 8500,
    });
    expect(allocation.id).toContain('ALLOC-2026-');

    // 4. NGO Itemized Expense
    const { expense } = await DatabaseRepository.createExpense({
      allocationId: allocation.id,
      ngoId: 'NGO-1042',
      beneficiaryId: beneficiary.id,
      receiptId: donation.id,
      amount: 6500,
      category: 'Medical Treatment',
      description: 'OT Charges & Physician Fees',
      receiptHash: 'a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8',
    });
    expect(expense.id).toContain('EXP-2026-');

    // 5. In-App Camera Evidence SHA-256 Hashing
    const evidence = await DatabaseRepository.createEvidence({
      expenseId: expense.id,
      beneficiaryId: beneficiary.id,
      receiptId: donation.id,
      ngoId: 'NGO-1042',
      fileHash: '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
      capturedViaCamera: true,
      locationMeta: { lat: 19.076, lng: 72.8777, hospital: 'XYZ Hospital' },
    });
    expect(evidence.id).toContain('EVD-2026-');

    // 6. Fraud Rule Validation
    const flags = evaluateFraudRules({
      entityType: 'EXPENSE',
      entityId: expense.id,
      amount: 6500,
      allocationAmount: allocation.amount,
      hasEvidence: true,
    });
    expect(flags).toHaveLength(0); // Clean expense with evidence attached
  });
});
