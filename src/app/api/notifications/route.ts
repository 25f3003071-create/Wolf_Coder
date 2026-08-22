import { NextResponse } from 'next/server';

export async function GET() {
  const notifications = [
    {
      id: 'n1',
      title: 'Aid Delivery In Progress',
      message: 'NGO Red Cross India has disbursed ₹8,500 for Emergency Surgery for BEN-72A91.',
      type: 'SUCCESS',
      is_read: false,
      target_url: '/track/DR-2026-8F72K9',
      created_at: '2026-08-22T11:42:00Z',
    },
    {
      id: 'n2',
      title: 'Beneficiary Verified',
      message: 'Beneficiary BEN-72A91 passed hospital medical audit.',
      type: 'INFO',
      is_read: true,
      target_url: '/track/DR-2026-8F72K9',
      created_at: '2026-08-22T11:02:00Z',
    },
  ];

  return NextResponse.json({ success: true, notifications });
}
