import { NextRequest, NextResponse } from 'next/server';
import { DatabaseRepository } from '@/lib/db/repository';
import { authorizeRole } from '@/lib/auth/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const { user, errorResponse } = await authorizeRole(req, ['NGO']);
    if (errorResponse) return errorResponse;

    const { beneficiary } = await DatabaseRepository.getBeneficiaryById(params.id);
    if (user?.role === 'NGO' && beneficiary.ngo_id !== user.ngo_id) {
      return NextResponse.json(
        { error: `UNAUTHORIZED: NGO user is not permitted to delete documents of another organization.` },
        { status: 403 }
      );
    }

    await DatabaseRepository.deleteBeneficiaryDocument(params.documentId);
    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error deleting document';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
