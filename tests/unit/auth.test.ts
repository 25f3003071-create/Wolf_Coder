import { describe, it, expect, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getAuthenticatedUser, authorizeRole, authorizeNgoOrgAccess } from '../../src/lib/auth/auth';
import { DatabaseRepository } from '../../src/lib/db/repository';
import { POST as createDonationHandler } from '../../src/app/api/donations/route';
import { POST as createAllocationHandler } from '../../src/app/api/allocations/route';
import { POST as vaultHandler } from '../../src/app/api/manager/vault/route';
import { POST as verifyBeneficiaryHandler } from '../../src/app/api/beneficiaries/[id]/verify/route';

describe('Phase 4 Comprehensive Security Hardening Suite', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('1. Unauthenticated request returns 401 Unauthenticated', async () => {
    const unauthReq = new NextRequest('http://localhost:3000/api/donations', {
      method: 'POST',
      body: JSON.stringify({ campaignId: 'CMP-2026-0192', amount: 5000 }),
    });

    const res = await createDonationHandler(unauthReq);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('UNAUTHENTICATED');
  });

  it('2. Wrong role returns 403 Forbidden', async () => {
    const donorReq = new NextRequest('http://localhost:3000/api/beneficiaries/BEN-72A91/verify', {
      method: 'POST',
      headers: { authorization: 'Bearer test-token-donor' },
      body: JSON.stringify({ status: 'VERIFIED', notes: 'Unauthorized attempt' }),
    });

    const res = await verifyBeneficiaryHandler(donorReq, { params: { id: 'BEN-72A91' } });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('UNAUTHORIZED: Role \'DONOR\' is not permitted');
  });

  it('3. Client-provided fake role in request body is ignored by server authorization', async () => {
    const req = new NextRequest('http://localhost:3000/api/manager/vault', {
      method: 'POST',
      headers: { authorization: 'Bearer test-token-donor' }, // Donor token
      body: JSON.stringify({
        role: 'MANAGER', // Forged role in body
        user_id: '44444444-4444-4444-4444-444444444444',
        beneficiaryId: 'BEN-72A91',
      }),
    });

    const res = await vaultHandler(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('UNAUTHORIZED');
  });

  it('4. Test token in production environment is strictly REJECTED with 401', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const req = new NextRequest('http://localhost:3000/api/donations', {
      method: 'POST',
      headers: { authorization: 'Bearer test-token-donor' },
      body: JSON.stringify({ campaignId: 'CMP-2026-0192', amount: 5000 }),
    });

    const { user, error, status } = await getAuthenticatedUser(req);
    expect(user).toBeNull();
    expect(status).toBe(401);
    expect(error).toContain('UNAUTHENTICATED');
  });

  it('5. Donor attempting Manager Verification Vault is blocked with 403', async () => {
    const donorVaultReq = new NextRequest('http://localhost:3000/api/manager/vault', {
      method: 'POST',
      headers: { authorization: 'Bearer test-token-donor' },
      body: JSON.stringify({ beneficiaryId: 'BEN-72A91', documentType: 'Aadhaar' }),
    });

    const res = await vaultHandler(donorVaultReq);
    expect(res.status).toBe(403);
  });

  it('6. Manager role successfully accesses Verification Vault', async () => {
    const managerVaultReq = new NextRequest('http://localhost:3000/api/manager/vault', {
      method: 'POST',
      headers: { authorization: 'Bearer test-token-manager' },
      body: JSON.stringify({ beneficiaryId: 'BEN-72A91', documentType: 'Aadhaar' }),
    });

    const res = await vaultHandler(managerVaultReq);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.vaultAccess.signed_url).toBeDefined();
  });

  it('7. NGO user cannot access data for another NGO organization', () => {
    const ngoUser = {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'ngo@redcross.org',
      role: 'NGO' as const,
      ngo_id: 'NGO-1042',
      full_name: 'Red Cross User',
    };

    const orgError = authorizeNgoOrgAccess(ngoUser, 'NGO-9999');
    expect(orgError).not.toBeNull();
    expect(orgError?.status).toBe(403);
  });

  it('8. NGO user cannot create campaign allocations (Manager Only)', async () => {
    const ngoAllocReq = new NextRequest('http://localhost:3000/api/allocations', {
      method: 'POST',
      headers: { authorization: 'Bearer test-token-ngo' }, // NGO token
      body: JSON.stringify({ campaignId: 'CMP-2026-0192', ngoId: 'NGO-1042', amount: 5000 }),
    });

    const res = await createAllocationHandler(ngoAllocReq);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('UNAUTHORIZED: Role \'NGO\' is not permitted');
  });

  it('9. Production database failure in production mode fails safely without silent in-memory fallback', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    // In production without live Supabase credentials, createDonation must throw an error
    await expect(
      DatabaseRepository.createDonation({
        campaignId: 'CMP-2026-0192',
        amount: 5000,
        donorId: 'donor-id-test',
      })
    ).rejects.toThrow('DATABASE CONFIGURATION ERROR');
  });

  it('10. Financial over-allocation ceiling is enforced server-side', async () => {
    await expect(
      DatabaseRepository.createAllocation({
        campaignId: 'CMP-2026-0192',
        ngoId: 'NGO-1042',
        amount: 99999999,
      })
    ).rejects.toThrow('OVER-ALLOCATION PREVENTED');
  });
});
