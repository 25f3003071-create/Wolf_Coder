import { NextRequest, NextResponse } from 'next/server';
import { OtpService } from '@/lib/auth/otp.service';
import { activeSmsProvider } from '@/lib/auth/providers/twilio-provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const target = body.phone || body.mobileNumber || body.email;

    if (!target || typeof target !== 'string' || target.trim().length < 5) {
      return NextResponse.json(
        { error: 'INVALID TARGET: Valid mobile number or email address is required.' },
        { status: 400 }
      );
    }

    const otpResult = OtpService.generateAndSendOtp(target);
    if (!otpResult.success) {
      return NextResponse.json({ error: otpResult.error }, { status: 400 });
    }

    const isProduction = process.env.NODE_ENV === 'production';

    // In production mode, dispatch via SMS/email provider gateway
    if (isProduction) {
      const smsResult = await activeSmsProvider.sendOtp(target, '******');
      if (!smsResult.success) {
        return NextResponse.json(
          { error: smsResult.message || 'SMS/Email Gateway unconfigured in production environment.' },
          { status: 500 }
        );
      }
    }

    const responseData: Record<string, any> = {
      success: true,
      message: `OTP sent to ${target}`,
    };

    // Attach developmentOtp ONLY when NODE_ENV !== 'production'
    if (!isProduction && otpResult.otp) {
      responseData.developmentOtp = otpResult.otp;
    }

    return NextResponse.json(responseData);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'OTP transmission failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
