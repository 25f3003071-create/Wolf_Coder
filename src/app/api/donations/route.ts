import { NextRequest, NextResponse } from 'next/server';
import { DatabaseRepository } from '@/lib/db/repository';
import { authorizeRole } from '@/lib/auth/auth';

export async function POST(req: NextRequest) {
  try {
    // RBAC Security Check: Authenticated User required (DONOR, NGO, or MANAGER)
    const { user, errorResponse } = await authorizeRole(req, ['DONOR', 'NGO', 'MANAGER']);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { campaignId, amount, walletAddress, chain } = body;

    // Strict Server-Side Financial Validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'INVALID AMOUNT: Donation amount must be a positive number' },
        { status: 400 }
      );
    }

    const receipt = await DatabaseRepository.createDonation({
      campaignId,
      amount: Number(amount),
      donorId: user?.id,
      walletAddress,
      chain,
    });

    return NextResponse.json({ success: true, receipt }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error creating donation';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const sampleDonations = [
    {
      id: 'DR-2026-8F72K9',
      campaign_title: 'Emergency Medical Relief Campaign 2026',
      amount: 10000,
      status: 'AID_DELIVERY',
      ngo_name: 'Red Cross Relief India',
      created_at: '2026-08-22T10:21:00Z',
    },
    {
      id: 'DR-2026-99A12B',
      campaign_title: 'Flood Disaster Reconstruction & Aid',
      amount: 25000,
      status: 'COMPLETED',
      ngo_name: 'Care Foundation',
      created_at: '2026-08-20T14:15:00Z',
    },
  ];

  return NextResponse.json({ success: true, donations: sampleDonations });
}
