/**
 * SMS Provider Abstraction Interface for Mobile OTP Authentication.
 * Prevents pretending SMS is live when gateway credentials are unconfigured.
 */

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
