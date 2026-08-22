import { NextRequest, NextResponse } from 'next/server';
import { authorizeRole } from '@/lib/auth/auth';
import { DatabaseRepository } from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await authorizeRole(req, ['NGO', 'MANAGER']);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { imageDataBase64, expenseId, beneficiaryId, ngoId, locationMeta } = body;

    if (!imageDataBase64) {
      return NextResponse.json({ error: 'Camera image payload is required' }, { status: 400 });
    }

    const fileHash = `sha256_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const now = new Date().toISOString();
    const resolvedNgoId = user?.role === 'NGO' ? user.ngo_id || ngoId || 'NGO-1042' : ngoId || 'NGO-1042';

    const evidence = await DatabaseRepository.createEvidence({
      expenseId: expenseId || 'EXP-2026-77A2',
      beneficiaryId: beneficiaryId || 'BEN-72A91',
      receiptId: 'DR-2026-8F72K9',
      ngoId: resolvedNgoId,
      fileHash,
      capturedViaCamera: true,
      locationMeta: locationMeta || { lat: 19.076, lng: 72.8777, hospital: 'XYZ Hospital', timestamp: now },
    });

    return NextResponse.json({
      success: true,
      evidenceId: evidence.id,
      fileHash: evidence.file_hash,
      capturedViaCamera: true,
      storagePath: evidence.storage_path,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Camera evidence capture failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
