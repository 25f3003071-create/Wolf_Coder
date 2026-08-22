function evaluateFraudRules(input) {
  const flags = [];
  const now = new Date().toISOString();

  // Rule 1: Duplicate document hash check
  if (input.documentHash && input.existingHashes && input.existingHashes.includes(input.documentHash)) {
    flags.push({
      id: `FRD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      entity_type: input.entityType,
      entity_id: input.entityId,
      severity: 'CRITICAL',
      reason: 'DUPLICATE DOCUMENT HASH DETECTED: The submitted document SHA-256 hash matches an existing beneficiary file.',
      status: 'OPEN',
      created_at: now,
      updated_at: now,
    });
  }

  // Rule 2: Expense exceeds allocation
  if (input.amount && input.allocationAmount && input.amount > input.allocationAmount) {
    flags.push({
      id: `FRD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      entity_type: input.entityType,
      entity_id: input.entityId,
      severity: 'HIGH',
      reason: `EXPENSE OVER-ALLOCATION: Claimed amount (₹${input.amount}) exceeds approved allocation ceiling (₹${input.allocationAmount}).`,
      status: 'OPEN',
      created_at: now,
      updated_at: now,
    });
  }

  // Rule 3: Missing evidence check
  if (input.entityType === 'EXPENSE' && input.hasEvidence === false) {
    flags.push({
      id: `FRD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      entity_type: input.entityType,
      entity_id: input.entityId,
      severity: 'MEDIUM',
      reason: 'MISSING EVIDENCE: Expense recorded without accompanying in-app camera evidence.',
      status: 'OPEN',
      created_at: now,
      updated_at: now,
    });
  }

  // Rule 4: Suspicious large single expense
  if (input.amount && input.amount >= 50000) {
    flags.push({
      id: `FRD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      entity_type: input.entityType,
      entity_id: input.entityId,
      severity: 'LOW',
      reason: `LARGE SINGLE EXPENSE: Transaction of ₹${input.amount} triggered standard manager review threshold (₹50,000).`,
      status: 'OPEN',
      created_at: now,
      updated_at: now,
    });
  }

  return flags;
}

class FraudService {
  static evaluate(input) {
    return evaluateFraudRules(input);
  }
}

module.exports = FraudService;
