import { FraudFlag, FraudSeverity } from '@/types';

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
  const makeFlag = (severity: FraudSeverity, reason: string): FraudFlag => ({
    id: `FRD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    entity_type: input.entityType,
    entity_id: input.entityId,
    severity,
    reason,
    status: 'OPEN',
    created_at: now,
    updated_at: now,
  });

  if (input.documentHash && input.existingHashes?.includes(input.documentHash)) {
    flags.push(makeFlag('CRITICAL', 'DUPLICATE DOCUMENT HASH DETECTED: The submitted document SHA-256 hash matches an existing beneficiary file.'));
  }
  if (input.amount && input.allocationAmount && input.amount > input.allocationAmount) {
    flags.push(makeFlag('HIGH', `EXPENSE OVER-ALLOCATION: Claimed amount (₹${input.amount}) exceeds approved allocation ceiling (₹${input.allocationAmount}).`));
  }
  if (input.entityType === 'EXPENSE' && input.hasEvidence === false) {
    flags.push(makeFlag('MEDIUM', 'MISSING EVIDENCE: Expense recorded without accompanying in-app camera evidence.'));
  }
  if (input.amount && input.amount >= 50000) {
    flags.push(makeFlag('LOW', `LARGE SINGLE EXPENSE: Transaction of ₹${input.amount} triggered standard manager review threshold.`));
  }
  if (input.ngoStatus && input.ngoStatus !== 'VERIFIED') {
    flags.push(makeFlag('CRITICAL', `UNVERIFIED NGO ACTIVITY: Attempted financial transaction by NGO in '${input.ngoStatus}' state.`));
  }

  return flags;
}
