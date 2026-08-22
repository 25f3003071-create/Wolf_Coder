import crypto from 'crypto';

interface OtpRecord {
  otp: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  lastRequestedAt: number;
}

// Global server-side temporary in-memory store for OTP records
const globalStore = global as unknown as { __relieftrack_otp_store?: Map<string, OtpRecord> };
if (!globalStore.__relieftrack_otp_store) {
  globalStore.__relieftrack_otp_store = new Map<string, OtpRecord>();
}
const otpStore = globalStore.__relieftrack_otp_store;

function sanitizeTarget(target: string): string {
  if (!target) return '';
  return target.trim().toLowerCase();
}

function generateRandomOtp(): string {
  const buffer = crypto.randomBytes(4);
  const num = (buffer.readUInt32BE(0) % 900000) + 100000;
  return num.toString();
}

export class OtpService {
  static generateAndSendOtp(rawTarget: string): { success: boolean; message?: string; error?: string; otp?: string } {
    const target = sanitizeTarget(rawTarget);
    if (!target || target.length < 5) {
      return { success: false, error: 'Valid mobile number or email address is required' };
    }

    const now = Date.now();
    const existing = otpStore.get(target);

    // Rate limiting: 30 seconds
    if (existing && existing.lastRequestedAt && now - existing.lastRequestedAt < 30000) {
      const waitSec = Math.ceil((30000 - (now - existing.lastRequestedAt)) / 1000);
      return {
        success: false,
        error: `Please wait ${waitSec} seconds before requesting a new OTP.`,
      };
    }

    const otp = generateRandomOtp();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity

    otpStore.set(target, {
      otp,
      createdAt: now,
      expiresAt,
      attempts: 0,
      lastRequestedAt: now,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('\n====================================');
      console.log('[RELIEFTRACK OTP]');
      console.log(`Target: ${target}`);
      console.log(`OTP: ${otp}`);
      console.log('Expires: 5 minutes');
      console.log('------------------------------------\n');
    }

    return {
      success: true,
      message: `OTP sent to ${target}`,
      otp,
    };
  }

  static verifyOtp(rawTarget: string, inputOtp: string): { success: boolean; error?: string } {
    const target = sanitizeTarget(rawTarget);
    if (!target) {
      return { success: false, error: 'Target destination is required' };
    }

    if (!inputOtp || typeof inputOtp !== 'string' || inputOtp.trim().length !== 6) {
      return { success: false, error: 'Invalid OTP' };
    }

    const record = otpStore.get(target);

    if (!record) {
      return { success: false, error: 'OTP expired. Please request a new OTP.' };
    }

    const now = Date.now();

    if (now > record.expiresAt) {
      otpStore.delete(target);
      return { success: false, error: 'OTP expired. Please request a new OTP.' };
    }

    record.attempts += 1;

    if (record.attempts > 5) {
      otpStore.delete(target);
      return {
        success: false,
        error: 'Maximum verification attempts exceeded. Please request a new OTP.',
      };
    }

    if (inputOtp.trim() !== record.otp) {
      return { success: false, error: 'Invalid OTP' };
    }

    otpStore.delete(target);

    return { success: true };
  }
}
