import { NextRequest, NextResponse } from 'next/server';
import { DatabaseRepository } from '@/lib/db/repository';
import { authorizeRole } from '@/lib/auth/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await authorizeRole(req, ['NGO', 'MANAGER']);
    if (errorResponse) return errorResponse;

    const targetNgoId = user?.role === 'NGO' ? user.ngo_id : undefined;
    const { beneficiaries, summary } = await DatabaseRepository.getBeneficiaries(targetNgoId);

    return NextResponse.json({ success: true, beneficiaries, summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching beneficiaries';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await authorizeRole(req, ['NGO', 'MANAGER']);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const {
      fullName,
      mobile,
      email,
      age,
      gender,
      address,
      cityDistrict,
      emergencyNeed,
      familyMembers,
      priority,
      requestedAmount,
      approvedAmount,
      aidCategory,
      description,
      category,
      aidRequired,
      hospitalName,
      treatmentType,
      estimatedCost,
      anonymizedSummary,
      documentHash,
    } = body;

    const aidReq = emergencyNeed || aidRequired;
    if (!aidReq || typeof aidReq !== 'string' || aidReq.trim().length === 0) {
      return NextResponse.json(
        { error: 'INVALID INPUT: Emergency or relief need description is mandatory' },
        { status: 400 }
      );
    }

    const cost = Number(requestedAmount || estimatedCost || 0);
    if (!cost || typeof cost !== 'number' || cost <= 0) {
      return NextResponse.json(
        { error: 'INVALID COST: Requested aid amount must be a positive number' },
        { status: 400 }
      );
    }

    const { beneficiary, fraudFlags } = await DatabaseRepository.createBeneficiary({
      fullName,
      mobile,
      email,
      age,
      gender,
      address,
      cityDistrict,
      emergencyNeed: aidReq,
      familyMembers,
      priority,
      requestedAmount: cost,
      approvedAmount: approvedAmount ? Number(approvedAmount) : cost,
      aidCategory,
      description,
      category,
      aidRequired: aidReq,
      hospitalName,
      treatmentType,
      estimatedCost: cost,
      anonymizedSummary,
      documentHash,
      ngoId: user?.role === 'NGO' ? user.ngo_id || 'NGO-1042' : 'NGO-1042',
    });

    return NextResponse.json({ success: true, beneficiary, fraudFlags }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error registering beneficiary';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
