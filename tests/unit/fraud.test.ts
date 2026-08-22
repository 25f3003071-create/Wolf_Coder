import { describe, it, expect } from 'vitest';
import { evaluateFraudRules } from '../../src/lib/fraud/engine';

describe('Fraud & Anomaly Detection Engine', () => {
  it('should flag duplicate document hashes as CRITICAL severity', () => {
    const hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const flags = evaluateFraudRules({
      entityType: 'BENEFICIARY',
      entityId: 'BEN-72A91',
      documentHash: hash,
      existingHashes: [hash],
    });

    expect(flags.length).toBeGreaterThan(0);
    expect(flags[0].severity).toBe('CRITICAL');
    expect(flags[0].reason).toContain('DUPLICATE DOCUMENT HASH');
  });

  it('should flag expense over-allocation as HIGH severity', () => {
    const flags = evaluateFraudRules({
      entityType: 'EXPENSE',
      entityId: 'EXP-2026-TEST',
      amount: 15000,
      allocationAmount: 10000,
    });

    expect(flags.length).toBeGreaterThan(0);
    expect(flags[0].severity).toBe('HIGH');
    expect(flags[0].reason).toContain('OVER-ALLOCATION');
  });

  it('should flag unverified NGO financial transactions as CRITICAL', () => {
    const flags = evaluateFraudRules({
      entityType: 'EXPENSE',
      entityId: 'EXP-2026-TEST2',
      ngoStatus: 'SUSPENDED',
    });

    expect(flags.some((f) => f.severity === 'CRITICAL')).toBe(true);
  });
});
