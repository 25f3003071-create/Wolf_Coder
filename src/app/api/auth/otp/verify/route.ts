import { NextRequest, NextResponse } from 'next/server';
import { OtpService } from '@/lib/auth/otp.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = body.phone || body.mobileNumber;
    const { otp } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }

    const verifyResult = OtpService.verifyOtp(phone, otp);
    if (!verifyResult.success) {
      return NextResponse.json({ error: verifyResult.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'OTP verification failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
