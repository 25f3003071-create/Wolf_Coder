import { NextRequest, NextResponse } from 'next/server';
import { DatabaseRepository } from '@/lib/db/repository';
import { authorizeRole } from '@/lib/auth/auth';

export async function GET() {
  const sampleEvidence = [
    {
      id: 'EVD-2026-72K9',
      expense_id: 'EXP-2026-77A2',
      beneficiary_id: 'BEN-72A91',
      receipt_id: 'DR-2026-8F72K9',
      ngo_id: 'NGO-1042',
      storage_path: 'evidence/ben-72a91_surgery_evidence.jpg',
      file_hash: '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
      captured_via_camera: true,
      location_meta: {
        lat: 19.076,
        lng: 72.8777,
        hospital: 'XYZ Super Specialty Hospital',
        timestamp: '2026-08-22T11:42:00Z',
      },
      created_at: '2026-08-22T11:42:00Z',
    },
  ];

  return NextResponse.json({ success: true, evidence: sampleEvidence });
}

export async function POST(req: NextRequest) {
  try {
    // RBAC Security Check: Only NGO or MANAGER can anchor evidence
    const { user, errorResponse } = await authorizeRole(req, ['NGO', 'MANAGER']);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { expenseId, beneficiaryId, receiptId, ngoId, storagePath, fileHash, capturedViaCamera, locationMeta } = body;

    // Strict Server-Side Validation
    if (!fileHash || typeof fileHash !== 'string' || fileHash.trim().length === 0) {
      return NextResponse.json({ error: 'INVALID HASH: SHA-256 evidence hash is mandatory' }, { status: 400 });
    }

    const evidence = await DatabaseRepository.createEvidence({
      expenseId,
      beneficiaryId,
      receiptId,
      ngoId: user?.role === 'NGO' ? user.ngo_id || 'NGO-1042' : ngoId || 'NGO-1042',
      storagePath,
      fileHash,
      capturedViaCamera,
      locationMeta,
    });

    return NextResponse.json({ success: true, evidence }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Evidence submission failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
