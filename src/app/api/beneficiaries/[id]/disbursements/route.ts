import { NextRequest, NextResponse } from 'next/server';
import { DatabaseRepository } from '@/lib/db/repository';
import { authorizeRole } from '@/lib/auth/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, errorResponse } = await authorizeRole(req, ['NGO', 'MANAGER']);
    if (errorResponse) return errorResponse;

    const { beneficiary } = await DatabaseRepository.getBeneficiaryById(params.id);
    if (user?.role === 'NGO' && beneficiary.ngo_id !== user.ngo_id) {
      return NextResponse.json(
        { error: `UNAUTHORIZED: NGO user is not permitted to access disbursements of another organization.` },
        { status: 403 }
      );
    }

    const disbursements = await DatabaseRepository.getBeneficiaryDisbursements(params.id);
    return NextResponse.json({ success: true, disbursements });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching beneficiary disbursements';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // RBAC Security Check: Strictly restricted to NGO role
    const { user, errorResponse } = await authorizeRole(req, ['NGO']);
    if (errorResponse) return errorResponse;

    const { beneficiary } = await DatabaseRepository.getBeneficiaryById(params.id);
    if (user?.role === 'NGO' && beneficiary.ngo_id !== user.ngo_id) {
      return NextResponse.json(
        { error: `UNAUTHORIZED: NGO user is not permitted to record disbursements for another organization.` },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { amount, aidType, paymentMethod, paymentReference, notes, receiptDocumentUrl, campaignId } = body;

    // Server-Side Input Validation
    if (amount === undefined || amount === null || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'INVALID AMOUNT: Disbursement amount must be a positive number' },
        { status: 400 }
      );
    }

    if (!aidType || typeof aidType !== 'string' || aidType.trim().length === 0) {
      return NextResponse.json(
        { error: 'INVALID INPUT: Aid type description is mandatory' },
        { status: 400 }
      );
    }

    // Call DatabaseRepository.createAidDisbursement (performs server-side financial ceiling check)
    const { disbursement, beneficiary: updatedBeneficiary } = await DatabaseRepository.createAidDisbursement({
      beneficiaryId: params.id,
      ngoId: user?.ngo_id || 'NGO-1042',
      amount: Number(amount),
      aidType,
      paymentMethod: paymentMethod || 'UPI',
      paymentReference,
      notes,
      receiptDocumentUrl,
      campaignId,
    });

    return NextResponse.json({ success: true, disbursement, beneficiary: updatedBeneficiary }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error recording aid disbursement';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
