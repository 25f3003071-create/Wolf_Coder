import { NextRequest, NextResponse } from 'next/server';
import { DatabaseRepository } from '@/lib/db/repository';

export async function GET(req: NextRequest, { params }: { params: { receiptId: string } }) {
  try {
    const receiptId = params.receiptId;
    if (!receiptId || receiptId.trim().length === 0) {
      return NextResponse.json({ error: 'Receipt ID parameter is required' }, { status: 400 });
    }

    const { receipt, timeline, expenses } = await DatabaseRepository.getDonationReceipt(receiptId);

    return NextResponse.json({
      success: true,
      receipt,
      timeline,
      expenses,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch donation tracking journey';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
