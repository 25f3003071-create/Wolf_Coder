import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { entityId: string } }) {
  const entityId = params.entityId;

  const logs = [
    {
      id: 'a1-1001',
      action: 'DONATION_CREATED',
      entity_type: 'DONATION_RECEIPT',
      entity_id: entityId,
      reasoning: 'Donor created donation receipt DR-2026-8F72K9 of ₹10,000.',
      blockchain_ref: '0x8a7291bc44f128e932104975193a218f77361a90c4217734891a274191bc44f1',
      created_at: '2026-08-22T10:21:00Z',
    },
    {
      id: 'a1-1002',
      action: 'BENEFICIARY_VERIFIED',
      entity_type: 'BENEFICIARY',
      entity_id: 'BEN-72A91',
      reasoning: 'Manager verified beneficiary BEN-72A91 hospital surgery estimates.',
      blockchain_ref: 'VER-2026-9281',
      created_at: '2026-08-22T11:02:00Z',
    },
    {
      id: 'a1-1003',
      action: 'FUNDS_ALLOCATED',
      entity_type: 'ALLOCATION',
      entity_id: 'ALLOC-2026-91A7',
      reasoning: 'Approved ₹8,500 fund allocation to Red Cross Relief India.',
      blockchain_ref: '0x991823abf772183e910293a8172bc9102931bc77261a90c4217734891a274191',
      created_at: '2026-08-22T11:18:00Z',
    },
  ];

  return NextResponse.json({ success: true, entityId, auditLogs: logs });
}
