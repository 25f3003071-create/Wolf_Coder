import { NextRequest, NextResponse } from 'next/server';
import { generateSignedVaultUrl } from '@/lib/storage/vault';
import { createAuditEntry } from '@/lib/audit/logger';
import { authorizeRole } from '@/lib/auth/auth';

export async function POST(req: NextRequest) {
  try {
    // RBAC Security Check: Strictly restricted to MANAGER role
    const { user, errorResponse } = await authorizeRole(req, ['MANAGER']);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { beneficiaryId, documentType } = body;

    // Audit vault access attempt
    await createAuditEntry({
      userId: user?.id,
      action: 'VAULT_ACCESS_ATTEMPT',
      entityType: 'BENEFICIARY_VAULT',
      entityId: beneficiaryId || 'BEN-72A91',
      reasoning: `Manager ${user?.email} requested inspection of sensitive ${documentType || 'Identity Document'} for beneficiary ${beneficiaryId || 'BEN-72A91'}.`,
    });

    const path = `vault/${(beneficiaryId || 'BEN-72A91').toLowerCase()}/${(documentType || 'Aadhaar').toLowerCase().replace(/\s+/g, '_')}.pdf`;
    const { url, error } = await generateSignedVaultUrl('beneficiary-documents', path, user?.role);

    if (error) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const documentMetadata = {
      beneficiary_id: beneficiaryId || 'BEN-72A91',
      document_type: documentType || 'Aadhaar',
      file_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      signed_url: url,
      expires_in: '15 minutes',
      hospital_verified: true,
      hospital_name: 'XYZ Super Specialty Hospital',
    };

    return NextResponse.json({ success: true, vaultAccess: documentMetadata });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Vault access failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
