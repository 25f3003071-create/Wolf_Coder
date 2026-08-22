import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseRepository } from '../../src/lib/db/repository';
import { dbMemory } from '../../src/backend/services/memory-store';

describe('NGO Beneficiary Management & Financial Disbursement Unit Tests', () => {
  beforeEach(() => {
    // Reset seed beneficiary for testing
    dbMemory.beneficiaries.set('BEN-TEST-01', {
      id: 'BEN-TEST-01',
      ngo_id: 'NGO-1042',
      full_name: 'Test Beneficiary 1',
      requested_amount: 40000,
      approved_amount: 40000,
      spent_amount: 15000,
      remaining_amount: 25000,
      emergency_need: 'Emergency Medical Treatment',
      status: 'PARTIALLY_DISBURSED',
      created_at: new Date().toISOString(),
    });

    dbMemory.beneficiaries.set('BEN-TEST-02', {
      id: 'BEN-TEST-02',
      ngo_id: 'NGO-9999', // Different NGO
      full_name: 'Foreign NGO Beneficiary',
      requested_amount: 50000,
      approved_amount: 50000,
      spent_amount: 0,
      remaining_amount: 50000,
      emergency_need: 'Shelter Relief',
      status: 'APPROVED',
      created_at: new Date().toISOString(),
    });
  });

  it('1. Generates BEN-2026-XXXXXX receipt and initializes financial fields on creation', async () => {
    const { beneficiary } = await DatabaseRepository.createBeneficiary({
      fullName: 'Ramesh Patel',
      emergencyNeed: 'Cardiac Emergency Treatment',
      requestedAmount: 50000,
      approvedAmount: 40000,
      ngoId: 'NGO-1042',
    });

    expect(beneficiary).toBeDefined();
    expect(beneficiary.id).toMatch(/^BEN-(2026-)?[2-9A-Z]{5,6}$/);
    expect(beneficiary.full_name).toBe('Ramesh Patel');
    expect(beneficiary.requested_amount).toBe(50000);
    expect(beneficiary.approved_amount).toBe(40000);
    expect(beneficiary.spent_amount).toBe(0);
    expect(beneficiary.remaining_amount).toBe(40000);
    expect(beneficiary.status).toBe('APPROVED');
  });

  it('2. Rejects beneficiary creation when required emergency need description is missing', async () => {
    await expect(
      DatabaseRepository.createBeneficiary({
        fullName: 'Missing Need User',
        emergencyNeed: '',
        requestedAmount: 25000,
      })
    ).rejects.toThrow('Required aid description is mandatory');
  });

  it('3. Rejects beneficiary creation when requested aid amount is zero or negative', async () => {
    await expect(
      DatabaseRepository.createBeneficiary({
        fullName: 'Invalid Amount User',
        emergencyNeed: 'Surgical Assistance',
        requestedAmount: 0,
      })
    ).rejects.toThrow('Valid positive estimated cost is required');
  });

  it('4. Document upload succeeds for valid PDF / image under 10 MB', async () => {
    const doc = await DatabaseRepository.uploadBeneficiaryDocument({
      beneficiaryId: 'BEN-TEST-01',
      ngoId: 'NGO-1042',
      documentType: 'Hospital Estimate',
      filename: 'hospital_invoice.pdf',
      mimeType: 'application/pdf',
      fileSize: 2 * 1024 * 1024, // 2 MB
    });

    expect(doc).toBeDefined();
    expect(doc.id).toMatch(/^DOC-2026-[2-9A-Z]{6}$/);
    expect(doc.filename).toBe('hospital_invoice.pdf');
  });

  it('5. Document upload rejects invalid file extensions (e.g. .exe)', async () => {
    await expect(
      DatabaseRepository.uploadBeneficiaryDocument({
        beneficiaryId: 'BEN-TEST-01',
        ngoId: 'NGO-1042',
        documentType: 'ID Proof',
        filename: 'malicious_script.exe',
        mimeType: 'application/x-msdownload',
        fileSize: 1024,
      })
    ).rejects.toThrow('INVALID FILE TYPE');
  });

  it('6. Document upload rejects files exceeding 10 MB ceiling', async () => {
    await expect(
      DatabaseRepository.uploadBeneficiaryDocument({
        beneficiaryId: 'BEN-TEST-01',
        ngoId: 'NGO-1042',
        documentType: 'Medical Record',
        filename: 'large_scan.pdf',
        mimeType: 'application/pdf',
        fileSize: 15 * 1024 * 1024, // 15 MB
      })
    ).rejects.toThrow('FILE SIZE EXCEEDED: File size cannot exceed 10 MB.');
  });

  it('7. Aid payment updates spent, remaining, and PARTIALLY_DISBURSED status', async () => {
    // Initial: Approved = 40,000, Spent = 15,000, Remaining = 25,000
    // Record Payment = 10,000
    const { disbursement, beneficiary } = await DatabaseRepository.createAidDisbursement({
      beneficiaryId: 'BEN-TEST-01',
      ngoId: 'NGO-1042',
      amount: 10000,
      aidType: 'Medicines',
      paymentMethod: 'UPI',
    });

    expect(disbursement).toBeDefined();
    expect(disbursement.id).toMatch(/^AID-2026-\d{6}$/);
    expect(beneficiary.spent_amount).toBe(25000);
    expect(beneficiary.remaining_amount).toBe(15000);
    expect(beneficiary.status).toBe('PARTIALLY_DISBURSED');
  });

  it('8. Server-side financial validation REJECTS over-spending when payment > remaining balance', async () => {
    // Initial: Approved = 40,000, Spent = 15,000, Remaining = 25,000
    // Attempt Payment = 30,000 (Exceeds 25,000 remaining)
    await expect(
      DatabaseRepository.createAidDisbursement({
        beneficiaryId: 'BEN-TEST-01',
        ngoId: 'NGO-1042',
        amount: 30000,
        aidType: 'Hospital Surgery Advance',
        paymentMethod: 'Bank Transfer',
      })
    ).rejects.toThrow('Cannot disburse more than remaining approved amount.');
  });

  it('9. Exact final payment updates spent to approved, remaining to 0, and status to FULLY_DISBURSED', async () => {
    // Reset test beneficiary: Approved = 40,000, Spent = 30,000, Remaining = 10,000
    dbMemory.beneficiaries.set('BEN-TEST-FINAL', {
      id: 'BEN-TEST-FINAL',
      ngo_id: 'NGO-1042',
      approved_amount: 40000,
      spent_amount: 30000,
      remaining_amount: 10000,
      emergency_need: 'Final Aid Package',
      status: 'PARTIALLY_DISBURSED',
      created_at: new Date().toISOString(),
    });

    const { beneficiary } = await DatabaseRepository.createAidDisbursement({
      beneficiaryId: 'BEN-TEST-FINAL',
      ngoId: 'NGO-1042',
      amount: 10000,
      aidType: 'Final Medical Bill Settlement',
      paymentMethod: 'Bank Transfer',
    });

    expect(beneficiary.spent_amount).toBe(40000);
    expect(beneficiary.remaining_amount).toBe(0);
    expect(beneficiary.status).toBe('FULLY_DISBURSED');
  });

  it('10. Prevents unauthorized NGO from disbursing funds for another organization beneficiary', async () => {
    await expect(
      DatabaseRepository.createAidDisbursement({
        beneficiaryId: 'BEN-TEST-02', // Belongs to NGO-9999
        ngoId: 'NGO-1042', // Attempting access with NGO-1042
        amount: 5000,
        aidType: 'Unapproved Relief',
        paymentMethod: 'Cash',
      })
    ).rejects.toThrow('UNAUTHORIZED');
  });

  it('11. Filters beneficiary listings by authenticated NGO ID for multi-tenant data isolation', async () => {
    const { beneficiaries } = await DatabaseRepository.getBeneficiaries('NGO-1042');
    const foreign = beneficiaries.find((b) => b.ngo_id === 'NGO-9999');
    expect(foreign).toBeUndefined();
  });

  it('12. Prevents non-numeric or negative disbursement amounts', async () => {
    await expect(
      DatabaseRepository.createAidDisbursement({
        beneficiaryId: 'BEN-TEST-01',
        ngoId: 'NGO-1042',
        amount: -5000,
        aidType: 'Invalid Disbursement',
        paymentMethod: 'UPI',
      })
    ).rejects.toThrow('Valid positive disbursement amount is required');
  });

  it('13. Fetches real itemized expenses filtered by NGO ID for itemized relief expense table', async () => {
    const { expenses } = await DatabaseRepository.getExpenses('NGO-1042');
    expect(expenses).toBeDefined();
    expect(Array.isArray(expenses)).toBe(true);
    const foreignExpense = expenses.find((e) => e.ngo_id === 'NGO-9999');
    expect(foreignExpense).toBeUndefined();
  });
});
