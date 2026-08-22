import { describe, it, expect } from 'vitest';
import {
  generateDonationReceiptId,
  generateBeneficiaryId,
  generateNgoId,
  generateAllocationId,
  generateExpenseId,
  generateEvidenceId,
  generateVerificationId,
} from '../../src/lib/utils/identifiers';

describe('Identifier System Utilities', () => {
  it('should generate valid Donation Receipt ID format DR-2026-XXXXXX', () => {
    const id = generateDonationReceiptId(2026);
    expect(id).toMatch(/^DR-2026-[2-9A-HJ-NP-Z]{6}$/);
  });

  it('should generate valid Beneficiary ID format BEN-XXXXX', () => {
    const id = generateBeneficiaryId();
    expect(id).toMatch(/^BEN-[2-9A-HJ-NP-Z]{5}$/);
  });

  it('should generate valid NGO ID format NGO-XXXX', () => {
    const id = generateNgoId();
    expect(id).toMatch(/^NGO-\d{4}$/);
  });

  it('should generate unique IDs across multiple invocations', () => {
    const set = new Set();
    for (let i = 0; i < 50; i++) {
      set.add(generateDonationReceiptId(2026));
    }
    expect(set.size).toBe(50);
  });
});
