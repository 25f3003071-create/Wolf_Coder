import { NextRequest, NextResponse } from 'next/server';
import { authorizeRole } from '@/lib/auth/auth';
import { createAuditEntry } from '@/lib/audit/logger';

const sampleFlags = [
  {
    id: 'FRD-101',
    entity_type: 'EXPENSE',
    entity_id: 'EXP-2026-77A2',
    severity: 'MEDIUM',
    reason: 'Expense amount ₹65,000 triggered mandatory high-trust manager review threshold.',
    status: 'RESOLVED',
    resolution_notes: 'Verified against XYZ Hospital OT surgical invoice.',
    created_at: '2026-08-22T11:41:00Z',
  },
  {
    id: 'FRD-102',
    entity_type: 'BENEFICIARY',
    entity_id: 'BEN-99C03',
    severity: 'HIGH',
    reason: 'Duplicate phone number check flagged across 2 distinct registration applications.',
    status: 'OPEN',
    created_at: '2026-08-21T09:15:00Z',
  },
];

export async function GET() {
  return NextResponse.json({ success: true, flags: sampleFlags });
}

export async function POST(req: NextRequest) {
  try {
    // RBAC Security Check: Only MANAGER can resolve fraud flags
    const { user, errorResponse } = await authorizeRole(req, ['MANAGER']);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { flagId, status, resolutionNotes } = body;

    await createAuditEntry({
      userId: user?.id,
      action: 'FRAUD_FLAG_CREATED',
      entityType: 'FRAUD_FLAG',
      entityId: flagId || 'FRD-101',
      newState: { status, resolutionNotes, reviewerRole: user?.role },
      reasoning: `Manager ${user?.email} resolved fraud flag ${flagId} with status '${status}'.`,
    });

    return NextResponse.json({
      success: true,
      flagId,
      status: status || 'RESOLVED',
      resolutionNotes,
      reviewed_by: user?.id,
      updated_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Fraud flag update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
