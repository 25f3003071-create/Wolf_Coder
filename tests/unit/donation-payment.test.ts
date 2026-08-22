import { describe, it, expect } from 'vitest';
import { DatabaseRepository } from '../../src/lib/db/repository';

describe('Donation Payment Flow & Receipt Creation Unit Tests', () => {
  it('1. Rejects donation if amount is zero or negative', async () => {
    await expect(
      DatabaseRepository.createDonation({
        campaignId: 'CMP-2026-0192',
        amount: 0,
        donorId: 'test-donor-1',
      })
    ).rejects.toThrow('Valid positive donation amount is required');
  });

  it('2. Generates unique DR-2026-XXXXXX receipt for valid donation', async () => {
    const receipt = await DatabaseRepository.createDonation({
      campaignId: 'CMP-2026-0192',
      amount: 10000,
      donorId: 'test-donor-1',
      chain: 'sepolia',
    });

    expect(receipt).toBeDefined();
    expect(receipt.id).toMatch(/^DR-2026-[2-9A-Z]{6}$/);
    expect(receipt.amount).toBe(10000);
    expect(receipt.blockchain_tx_hash).toMatch(/^(SIMULATED-)?0x[0-9a-f]+/i);
    expect(receipt.blockchain_tx_status).toBe('SIMULATED_TRANSACTION');
    expect(receipt.payment_mode).toBe('DEVELOPMENT_SIMULATION');
  });

  it('3. Can retrieve generated receipt by DR-2026-XXXXXX receipt ID', async () => {
    const created = await DatabaseRepository.createDonation({
      campaignId: 'CMP-2026-0411',
      amount: 25000,
      donorId: 'test-donor-2',
    });

    const fetched = await DatabaseRepository.getDonationReceipt(created.id);
    expect(fetched).toBeDefined();
    expect(fetched.receipt.id).toBe(created.id);
    expect(fetched.receipt.amount).toBe(25000);
  });

  it('4. Payment simulation metadata is persisted on receipt creation', async () => {
    const receipt = await DatabaseRepository.createDonation({
      campaignId: 'CMP-2026-0192',
      amount: 15000,
      donorId: 'test-donor-3',
    });

    expect(receipt.payment_mode).toBe('DEVELOPMENT_SIMULATION');
    expect(receipt.blockchain_tx_status).toBe('SIMULATED_TRANSACTION');
  });
});
