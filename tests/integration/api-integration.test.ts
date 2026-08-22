import { describe, it, expect } from 'vitest';
import { DatabaseRepository } from '../../src/lib/db/repository';

describe('API & Integration Flow Suite', () => {
  it('should process donation creation and query tracking details end-to-end', async () => {
    const donation = await DatabaseRepository.createDonation({
      campaignId: 'CMP-2026-0192',
      amount: 15000,
      donorId: '11111111-1111-1111-1111-111111111111',
      chain: 'sepolia',
    });

    expect(donation.id).toMatch(/^DR-2026-[A-Z0-9]{6}$/);
    expect(donation.amount).toBe(15000);
    expect(donation.allocated_amount).toBe(12750);

    const tracking = await DatabaseRepository.getDonationReceipt(donation.id);
    expect(tracking.receipt.id).toBe(donation.id);
    expect(tracking.timeline).toHaveLength(10);
    expect(tracking.timeline[0].title).toBe('DONATION CREATED');
  });

  it('should enforce allocation ceiling on expense recording', async () => {
    const alloc = await DatabaseRepository.createAllocation({
      campaignId: 'CMP-2026-0192',
      ngoId: 'NGO-1042',
      beneficiaryId: 'BEN-72A91',
      receiptId: 'DR-2026-8F72K9',
      amount: 5000,
    });

    expect(alloc.id).toMatch(/^ALLOC-2026-[A-Z0-9]{4}$/);

    await expect(
      DatabaseRepository.createExpense({
        allocationId: alloc.id,
        ngoId: 'NGO-1042',
        beneficiaryId: 'BEN-72A91',
        amount: 100000, // Exceeds allocation ceiling
        category: 'Equipment',
        description: 'Over-ceiling equipment claimed',
      })
    ).rejects.toThrow(/EXPENSE CEILING EXCEEDED/);
  });
});
