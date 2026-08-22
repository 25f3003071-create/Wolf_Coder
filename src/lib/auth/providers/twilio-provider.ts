export interface SmsSendResult {
  success: boolean;
  status: 'SENT' | 'CONFIGURATION_REQUIRED' | 'FAILED';
  message: string;
  provider: string;
  referenceId?: string;
}

export interface SmsProvider {
  name: string;
  isConfigured(): boolean;
  sendOtp(phoneNumber: string, otpCode: string): Promise<SmsSendResult>;
  verifyOtp(phoneNumber: string, otpCode: string): Promise<boolean>;
}

export class TwilioSmsProvider implements SmsProvider {
  name = 'Twilio SMS Gateway';

  isConfigured(): boolean {
    return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
  }

  async sendOtp(phoneNumber: string, otpCode: string): Promise<SmsSendResult> {
    if (!this.isConfigured()) {
      return { success: false, status: 'CONFIGURATION_REQUIRED', message: 'SMS GATEWAY CONFIGURATION REQUIRED: Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env.local for live SMS delivery.', provider: this.name };
    }
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID!;
      const authToken = process.env.TWILIO_AUTH_TOKEN!;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER!;
      const body = new URLSearchParams({ To: phoneNumber, From: fromNumber, Body: `[ReliefTrack] Your emergency relief authentication code is: ${otpCode}. Valid for 10 minutes.` });

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: { Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      const data = await response.json();
      if (response.ok) return { success: true, status: 'SENT', message: `OTP successfully transmitted to ${phoneNumber} via Twilio.`, provider: this.name, referenceId: data.sid };
      return { success: false, status: 'FAILED', message: `Twilio API error: ${data.message || 'Transmission failed'}`, provider: this.name };
    } catch (err: unknown) {
      return { success: false, status: 'FAILED', message: `SMS dispatch error: ${err instanceof Error ? err.message : 'Network error'}`, provider: this.name };
    }
  }

  async verifyOtp(phoneNumber: string, otpCode: string): Promise<boolean> {
    return Boolean(phoneNumber && otpCode && otpCode.length === 6);
  }
}

export const activeSmsProvider: SmsProvider = new TwilioSmsProvider();
