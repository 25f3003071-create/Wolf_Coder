import { NextRequest, NextResponse } from 'next/server';
import { DatabaseRepository } from '@/lib/db/repository';
import { authorizeRole } from '@/lib/auth/auth';

export async function GET() {
  const sampleAllocations = [
    {
      id: 'ALLOC-2026-91A7',
      campaign_id: 'CMP-2026-0192',
      ngo_id: 'NGO-1042',
      ngo_name: 'Red Cross Relief India',
      beneficiary_id: 'BEN-72A91',
      receipt_id: 'DR-2026-8F72K9',
      amount: 8500,
      status: 'APPROVED',
      approved_at: '2026-08-22T11:18:00Z',
      tx_hash: '0x991823abf772183e910293a8172bc9102931bc77261a90c4217734891a274191',
    },
  ];

  return NextResponse.json({ success: true, allocations: sampleAllocations });
}

export async function POST(req: NextRequest) {
  try {
    // RBAC Security Check: ONLY MANAGER auditor can allocate campaign funds to an NGO
    const { user, errorResponse } = await authorizeRole(req, ['MANAGER']);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { campaignId, ngoId, beneficiaryId, receiptId, amount } = body;

    // Strict Server-Side Validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'INVALID AMOUNT: Allocation amount must be a positive number' }, { status: 400 });
    }
    if (!ngoId) {
      return NextResponse.json({ error: 'NGO ID parameter is required' }, { status: 400 });
    }

    const allocation = await DatabaseRepository.createAllocation({
      campaignId,
      ngoId,
      beneficiaryId,
      receiptId,
      amount: Number(amount),
    });

    return NextResponse.json({ success: true, allocation }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Allocation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
