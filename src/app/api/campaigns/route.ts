import { NextRequest, NextResponse } from 'next/server';
import { generateCampaignId } from '@/lib/utils/identifiers';

const sampleCampaigns = [
  {
    id: 'CMP-2026-0192',
    title: 'Emergency Medical Relief Campaign 2026',
    description: 'Immediate surgical assistance and critical medication for acute emergency victims in underserved regions.',
    category: 'Medical Emergency',
    target_amount: 500000,
    raised_amount: 285000,
    status: 'ACTIVE',
    start_date: '2026-08-01T00:00:00Z',
  },
  {
    id: 'CMP-2026-0411',
    title: 'Flood Disaster Reconstruction & Aid',
    description: 'Providing urgent shelter kits, clean water, and food rations for flood-affected families.',
    category: 'Disaster Relief',
    target_amount: 1000000,
    raised_amount: 620000,
    status: 'ACTIVE',
    start_date: '2026-08-10T00:00:00Z',
  },
];

export async function GET() {
  return NextResponse.json({ success: true, campaigns: sampleCampaigns });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, targetAmount } = body;

    const newCampaign = {
      id: generateCampaignId(),
      title,
      description,
      category: category || 'Emergency Relief',
      target_amount: Number(targetAmount),
      raised_amount: 0,
      status: 'ACTIVE',
      start_date: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, campaign: newCampaign });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error creating campaign';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
