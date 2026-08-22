import { NextRequest, NextResponse } from 'next/server';
import { DatabaseRepository } from '@/lib/db/repository';
import { authorizeRole } from '@/lib/auth/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, errorResponse } = await authorizeRole(req, ['NGO', 'MANAGER']);
    if (errorResponse) return errorResponse;

    const { beneficiary, documents, disbursements } = await DatabaseRepository.getBeneficiaryById(params.id);

    if (user?.role === 'NGO' && beneficiary.ngo_id !== user.ngo_id) {
      return NextResponse.json(
        { error: `UNAUTHORIZED: NGO user is not permitted to access records of another organization.` },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, beneficiary, documents, disbursements });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching beneficiary details';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, errorResponse } = await authorizeRole(req, ['NGO', 'MANAGER']);
    if (errorResponse) return errorResponse;

    const { beneficiary } = await DatabaseRepository.getBeneficiaryById(params.id);
    if (user?.role === 'NGO' && beneficiary.ngo_id !== user.ngo_id) {
      return NextResponse.json(
        { error: `UNAUTHORIZED: NGO user is not permitted to modify records of another organization.` },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await DatabaseRepository.updateBeneficiary(params.id, body);

    return NextResponse.json({ success: true, beneficiary: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating beneficiary';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
