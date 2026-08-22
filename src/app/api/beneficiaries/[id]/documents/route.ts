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
        { error: `UNAUTHORIZED: NGO user is not permitted to access documents of another organization.` },
        { status: 403 }
      );
    }

    const documents = await DatabaseRepository.getBeneficiaryDocuments(params.id);
    return NextResponse.json({ success: true, documents });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching beneficiary documents';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, errorResponse } = await authorizeRole(req, ['NGO']);
    if (errorResponse) return errorResponse;

    const { beneficiary } = await DatabaseRepository.getBeneficiaryById(params.id);
    if (user?.role === 'NGO' && beneficiary.ngo_id !== user.ngo_id) {
      return NextResponse.json(
        { error: `UNAUTHORIZED: NGO user is not permitted to upload documents for another organization.` },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { documentType, filename, mimeType, fileSize, storagePath } = body;

    if (!filename || typeof filename !== 'string' || filename.trim().length === 0) {
      return NextResponse.json({ error: 'INVALID INPUT: Filename parameter is mandatory.' }, { status: 400 });
    }

    if (!fileSize || typeof fileSize !== 'number' || fileSize <= 0) {
      return NextResponse.json({ error: 'INVALID INPUT: Valid file size is required.' }, { status: 400 });
    }

    // Maximum file size check: 10 MB limit
    if (fileSize > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'FILE SIZE EXCEEDED: File size cannot exceed 10 MB.' }, { status: 400 });
    }

    // File type validation check: PDF, JPG, JPEG, PNG
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();

    if (!allowedMimeTypes.includes((mimeType || '').toLowerCase()) && !allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: 'INVALID FILE TYPE: Allowed file types are PDF, JPG, JPEG, and PNG.' },
        { status: 400 }
      );
    }

    const document = await DatabaseRepository.uploadBeneficiaryDocument({
      beneficiaryId: params.id,
      ngoId: user?.ngo_id || 'NGO-1042',
      documentType: documentType || 'Eligibility Document',
      filename,
      mimeType: mimeType || 'application/pdf',
      fileSize,
      storagePath,
      uploadedBy: user?.full_name || 'NGO Representative',
    });

    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error uploading document';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
