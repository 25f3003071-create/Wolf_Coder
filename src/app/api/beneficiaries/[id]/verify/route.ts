import { NextRequest, NextResponse } from 'next/server';
import { createAuditEntry } from '@/lib/audit/logger';
import { generateVerificationId } from '@/lib/utils/identifiers';
import { authorizeRole } from '@/lib/auth/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // RBAC Security Check: Only MANAGER can verify beneficiaries
    const { user, errorResponse } = await authorizeRole(req, ['MANAGER']);
    if (errorResponse) return errorResponse;

    const benId = params.id;
    const body = await req.json();
    const { status, notes, hospitalVerified } = body;

    const verificationId = generateVerificationId();

    await createAuditEntry({
      userId: user?.id,
      action: status === 'REJECTED' ? 'BENEFICIARY_REJECTED' : 'BENEFICIARY_VERIFIED',
      entityType: 'BENEFICIARY',
      entityId: benId,
      newState: { status, notes, hospitalVerified, verificationId, reviewerRole: user?.role },
      reasoning: `Manager ${user?.email} updated beneficiary ${benId} verification status to ${status}.`,
    });

    return NextResponse.json({
      success: true,
      verificationId,
      beneficiaryId: benId,
      status: status || 'VERIFIED',
      notes,
      updated_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
