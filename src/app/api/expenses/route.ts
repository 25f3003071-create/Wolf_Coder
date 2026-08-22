import { NextRequest, NextResponse } from 'next/server';
import { DatabaseRepository } from '@/lib/db/repository';
import { authorizeRole, authorizeNgoOrgAccess } from '@/lib/auth/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await authorizeRole(req, ['NGO', 'MANAGER']);
    if (errorResponse) return errorResponse;

    const targetNgoId = user?.role === 'NGO' ? user.ngo_id : undefined;
    const { expenses } = await DatabaseRepository.getExpenses(targetNgoId);

    return NextResponse.json({ success: true, expenses });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching itemized expenses';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // RBAC Security Check: Only NGO or MANAGER can submit expenses
    const { user, errorResponse } = await authorizeRole(req, ['NGO', 'MANAGER']);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { allocationId, ngoId, beneficiaryId, receiptId, amount, category, description, receiptHash, paymentMethod, paymentReference } = body;

    const targetNgoId = user?.role === 'NGO' ? user.ngo_id || 'NGO-1042' : ngoId || 'NGO-1042';

    // Organization Isolation check: NGO user cannot submit expense for another NGO
    if (user) {
      const orgAccessErr = authorizeNgoOrgAccess(user, targetNgoId);
      if (orgAccessErr) return orgAccessErr;
    }

    // Strict Server-Side Validation
    if (amount === undefined || amount === null || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'INVALID AMOUNT: Expense amount must be a positive number' }, { status: 400 });
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json({ error: 'INVALID DESCRIPTION: Expense description is mandatory' }, { status: 400 });
    }
    if (!beneficiaryId || typeof beneficiaryId !== 'string') {
      return NextResponse.json({ error: 'INVALID BENEFICIARY: Target beneficiary is mandatory' }, { status: 400 });
    }

    // If beneficiaryId is provided, record aid disbursement to trigger server-side financial ceiling checks & beneficiary state update
    const { disbursement, beneficiary, expense } = await DatabaseRepository.createAidDisbursement({
      beneficiaryId,
      ngoId: targetNgoId,
      amount: Number(amount),
      aidType: category || 'Medical Treatment',
      paymentMethod: paymentMethod || 'UPI',
      paymentReference: paymentReference || `REF-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: description,
    });

    return NextResponse.json({ success: true, expense, disbursement, beneficiary }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Expense submission failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
