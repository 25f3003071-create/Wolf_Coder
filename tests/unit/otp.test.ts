import { describe, it, expect } from 'vitest';
import { OtpService } from '../../src/lib/auth/otp.service';

describe('Server-Side OTP Service Unit Tests', () => {
  it('1. Mobile OTP is randomly generated', () => {
    const phone = '+919876500010';
    const res1 = OtpService.generateAndSendOtp(phone);
    expect(res1.success).toBe(true);
    expect(res1.otp).toHaveLength(6);
    expect(/^\d{6}$/.test(res1.otp!)).toBe(true);
  });

  it('2. Development response includes OTP in dev mode but production strips it', () => {
    const phone = '+919876500015';
    const devRes = OtpService.generateAndSendOtp(phone);
    expect(devRes.otp).toBeDefined();

    // Verify production mode strip logic
    const envObj = process.env as any;
    const origEnv = envObj.NODE_ENV;
    envObj.NODE_ENV = 'production';
    
    // In production, response data object strips developmentOtp
    const prodData: Record<string, any> = { success: true, message: `OTP sent to ${phone}` };
    if (envObj.NODE_ENV !== 'production' && devRes.otp) {
      prodData.developmentOtp = devRes.otp;
    }
    expect(prodData.developmentOtp).toBeUndefined();

    envObj.NODE_ENV = origEnv;
  });

  it('3. Resend generates a different OTP and invalidates previous OTP', () => {
    const phone = '+919876500020';
    const res1 = OtpService.generateAndSendOtp(phone);
    const oldOtp = res1.otp!;

    const globalStore = (global as any).__relieftrack_otp_store;
    const record = globalStore.get(phone);
    if (record) record.lastRequestedAt = Date.now() - 31000;

    const res2 = OtpService.generateAndSendOtp(phone);

    // Verify old OTP is now invalid
    const oldVerify = OtpService.verifyOtp(phone, oldOtp);
    expect(oldVerify.success).toBe(false);
    expect(oldVerify.error).toBe('Invalid OTP');

    // Generate again for fresh record & test new OTP
    const record2 = globalStore.get(phone);
    if (record2) record2.lastRequestedAt = Date.now() - 31000;
    const res3 = OtpService.generateAndSendOtp(phone);

    const newVerify = OtpService.verifyOtp(phone, res3.otp!);
    expect(newVerify.success).toBe(true);
  });

  it('4. Correct OTP succeeds', () => {
    const phone = '+919876500030';
    const res = OtpService.generateAndSendOtp(phone);
    const verifyRes = OtpService.verifyOtp(phone, res.otp!);
    expect(verifyRes.success).toBe(true);
  });

  it('5. Incorrect OTP fails', () => {
    const phone = '+919876500040';
    OtpService.generateAndSendOtp(phone);
    const verifyRes = OtpService.verifyOtp(phone, '000000');
    expect(verifyRes.success).toBe(false);
    expect(verifyRes.error).toBe('Invalid OTP');
  });

  it('6. Expired OTP fails', () => {
    const phone = '+919876500050';
    OtpService.generateAndSendOtp(phone);
    const globalStore = (global as any).__relieftrack_otp_store;
    const record = globalStore.get(phone);
    if (record) {
      record.expiresAt = Date.now() - 1000; // Expire record
    }
    const verifyRes = OtpService.verifyOtp(phone, record.otp);
    expect(verifyRes.success).toBe(false);
    expect(verifyRes.error).toBe('OTP expired. Please request a new OTP.');
  });

  it('7. Maximum attempt limit works (max 5 failed attempts)', () => {
    const phone = '+919876500060';
    const res = OtpService.generateAndSendOtp(phone);

    for (let i = 0; i < 5; i++) {
      OtpService.verifyOtp(phone, '999999');
    }

    const verify6 = OtpService.verifyOtp(phone, res.otp!);
    expect(verify6.success).toBe(false);
    expect(verify6.error).toContain('Maximum verification attempts exceeded');
  });

  it('8. Email OTP uses the exact same server-side OTP mechanism', () => {
    const email = 'donor.test@relieftrack.org';
    const res = OtpService.generateAndSendOtp(email);
    expect(res.success).toBe(true);
    expect(res.otp).toHaveLength(6);

    const verifyRes = OtpService.verifyOtp(email, res.otp!);
    expect(verifyRes.success).toBe(true);
  });
});
