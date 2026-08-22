import { describe, it, expect } from 'vitest';
import { DatabaseRepository } from '../../src/lib/db/repository';

describe('DatabaseRepository & Transactional Financial Safety (Phase 3)', () => {
  it('should persist new donation and generate a unique DR-2026-XXXXXX receipt ID', async () => {
    const donation = await DatabaseRepository.createDonation({
      campaignId: 'CMP-2026-0192',
      amount: 15000,
      donorId: 'donor-uuid-test',
    });

    expect(donation.id).toMatch(/^DR-2026-[2-9A-HJ-NP-Z]{6}$/);
    expect(donation.amount).toBe(15000);
    expect(donation.status).toBe('DONATION_CREATED');

    // Retrieve receipt and confirm dynamic timeline generation
    const tracking = await DatabaseRepository.getDonationReceipt(donation.id);
    expect(tracking.receipt.id).toBe(donation.id);
    expect(tracking.timeline.length).toBe(10);
    expect(tracking.timeline[0].title).toBe('DONATION CREATED');
  });

  it('should reject invalid or negative donation amounts', async () => {
    await expect(
      DatabaseRepository.createDonation({
        campaignId: 'CMP-2026-0192',
        amount: -500,
      })
    ).rejects.toThrow('Valid positive donation amount is required');
  });

  it('should register a beneficiary with anonymized summary', async () => {
    const { beneficiary, fraudFlags } = await DatabaseRepository.createBeneficiary({
      category: 'MEDICAL',
      aidRequired: 'Pediatric Cardiac Surgery',
      estimatedCost: 65000,
      hospitalName: 'Children Medical Center',
      anonymizedSummary: 'Emergency pediatric surgery for 5yo child.',
    });

    expect(beneficiary.id).toMatch(/^BEN-[2-9A-HJ-NP-Z]{5}$/);
    expect(beneficiary.estimated_cost).toBe(65000);
    expect(beneficiary.status).toBe('PENDING');
  });

  it('should prevent over-allocation exceeding campaign raised funds', async () => {
    await expect(
      DatabaseRepository.createAllocation({
        campaignId: 'CMP-2026-0192',
        ngoId: 'NGO-1042',
        amount: 9999999, // Exceeds raised amount
      })
    ).rejects.toThrow('OVER-ALLOCATION PREVENTED');
  });

  it('should prevent expense recording exceeding allocation ceiling', async () => {
    await expect(
      DatabaseRepository.createExpense({
        allocationId: 'ALLOC-2026-91A7',
        ngoId: 'NGO-1042',
        amount: 500000, // Exceeds allocation of 8500
        category: 'Medical',
        description: 'Surgical OT charges',
      })
    ).rejects.toThrow('EXPENSE CEILING EXCEEDED');
  });

  it('should require SHA-256 file hash for evidence recording', async () => {
    await expect(
      DatabaseRepository.createEvidence({
        expenseId: 'EXP-2026-77A2',
        storagePath: 'evidence/test.jpg',
        fileHash: '',
      })
    ).rejects.toThrow('Cryptographic SHA-256 file hash is required');
  });
});
