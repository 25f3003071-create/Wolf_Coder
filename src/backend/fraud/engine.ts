import { FraudFlag, FraudSeverity } from '../../types';

export interface FraudRuleInput {
  entityType: 'BENEFICIARY' | 'NGO' | 'EXPENSE' | 'EVIDENCE';
  entityId: string;
  amount?: number;
  allocationAmount?: number;
  documentHash?: string;
  existingHashes?: string[];
  hasEvidence?: boolean;
  ngoStatus?: string;
}

export function evaluateFraudRules(input: FraudRuleInput): FraudFlag[] {
  const flags: FraudFlag[] = [];
  const now = new Date().toISOString();

  // Rule 1: Duplicate document hash check
  if (input.documentHash && input.existingHashes && input.existingHashes.includes(input.documentHash)) {
    flags.push({
      id: `FRD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      entity_type: input.entityType,
      entity_id: input.entityId,
      severity: 'CRITICAL' as FraudSeverity,
      reason: 'DUPLICATE DOCUMENT HASH DETECTED: The submitted document SHA-256 hash matches an existing beneficiary file in the system.',
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
      severity: 'HIGH' as FraudSeverity,
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
      severity: 'MEDIUM' as FraudSeverity,
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
      severity: 'LOW' as FraudSeverity,
      reason: `LARGE SINGLE EXPENSE: Transaction of ₹${input.amount} triggered standard manager review threshold (₹50,000).`,
      status: 'OPEN',
      created_at: now,
      updated_at: now,
    });
  }

  // Rule 5: Inactive NGO activity
  if (input.ngoStatus && input.ngoStatus !== 'VERIFIED') {
    flags.push({
      id: `FRD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      entity_type: input.entityType,
      entity_id: input.entityId,
      severity: 'CRITICAL' as FraudSeverity,
      reason: `UNVERIFIED NGO ACTIVITY: Attempted financial transaction by NGO in '${input.ngoStatus}' state.`,
      status: 'OPEN',
      created_at: now,
      updated_at: now,
    });
  }

  return flags;
}
