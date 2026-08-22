import { describe, it, expect } from 'vitest';
import { formatCurrency, toCents, fromCents, calculatePercentage } from '../../src/lib/utils/currency';

describe('Financial Safety Utilities', () => {
  it('should format INR currency properly', () => {
    const formatted = formatCurrency(10000);
    expect(formatted).toContain('10,000');
  });

  it('should accurately convert to and from cents without floating point drift', () => {
    expect(toCents(10.55)).toBe(1055);
    expect(fromCents(1055)).toBe(10.55);
  });

  it('should calculate percentage safely with boundary checks', () => {
    expect(calculatePercentage(8500, 10000)).toBe(85);
    expect(calculatePercentage(0, 10000)).toBe(0);
    expect(calculatePercentage(15000, 10000)).toBe(100);
  });
});
