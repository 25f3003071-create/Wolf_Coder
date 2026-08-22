'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  KeyRound,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createDemoSession, saveSession, getSession } from '@/lib/auth/client-session';
import { UserRole } from '@/types';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [targetRole, setTargetRole] = useState<UserRole>('DONOR');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('donor@relieftrack.org');
  const [password, setPassword] = useState('password123');

  // Phone / Email OTP States
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  useEffect(() => {
    // If user is ALREADY authenticated, redirect immediately to their authenticated dashboard
    const existingSession = getSession();
    if (existingSession?.role) {
      if (existingSession.role === 'DONOR') router.replace('/donor');
      else if (existingSession.role === 'NGO') router.replace('/ngo');
      else if (existingSession.role === 'MANAGER') router.replace('/manager');
      return;
    }

    // Determine target role from URL query param or sessionStorage
    const roleParam = searchParams.get('role') as UserRole | null;
    let storedRole: UserRole | null = null;
    if (typeof window !== 'undefined') {
      storedRole = sessionStorage.getItem('relieftrack_target_role') as UserRole | null;
    }

    const resolvedRole = roleParam || storedRole || 'DONOR';
    setTargetRole(resolvedRole);

    // Default email matching selected role
    if (resolvedRole === 'DONOR') setEmail('donor@relieftrack.org');
    else if (resolvedRole === 'NGO') setEmail('ngo@redcrossrelief.org');
    else if (resolvedRole === 'MANAGER') setEmail('admin@relieftrack.org');
  }, [searchParams, router]);

  const handleSendOtp = async (targetOverride?: string) => {
    const target = targetOverride || (authMethod === 'phone' ? phone : email);
    setOtpError(null);
    setOtpMessage(null);
    setDevOtp(null);
    setIsSendingOtp(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: target, email: target }),
      });
      const data = await res.json();
      setIsSendingOtp(false);

      if (!res.ok || !data.success) {
        setOtpError(data.error || 'Failed to send OTP');
        return;
      }

      setOtpSent(true);
      setOtp('');
      setOtpMessage(data.message || `OTP sent to ${target}`);

      if (data.developmentOtp) {
        setDevOtp(data.developmentOtp);
      }
    } catch {
      setIsSendingOtp(false);
      setOtpError('Failed to send OTP. Please check your connection.');
    }
  };

  const completeAuthenticationAndRedirect = () => {
    const sessionEmail = authMethod === 'email' ? email : `${phone.replace(/[^0-9]/g, '')}@relieftrack.org`;
    saveSession(createDemoSession(targetRole, { email: sessionEmail, full_name: sessionEmail.split('@')[0] }));

    if (targetRole === 'DONOR') router.push('/donor');
    else if (targetRole === 'NGO') router.push('/ngo');
    else if (targetRole === 'MANAGER') router.push('/manager');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setIsVerifyingOtp(true);

    const target = authMethod === 'phone' ? phone : email;

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: target, email: target, otp }),
      });
      const data = await res.json();
      setIsVerifyingOtp(false);

      if (!res.ok || !data.success) {
        setOtpError(data.error || 'Invalid OTP');
        return;
      }

      completeAuthenticationAndRedirect();
    } catch {
      setIsVerifyingOtp(false);
      setOtpError('Invalid OTP');
    }
  };

  const handleEmailPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeAuthenticationAndRedirect();
  };

  const getRoleBadgeVariant = () => {
    if (targetRole === 'DONOR') return 'success';
    if (targetRole === 'NGO') return 'info';
    return 'warning';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* BRAND & STEP HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-950/50">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Relief<span className="text-emerald-400">Track</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">STEP 2: AUTHENTICATE FOR YOUR WORKSPACE</p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Badge variant={getRoleBadgeVariant()}>TARGET WORKSPACE: {targetRole}</Badge>
          </div>
        </div>

        <Card className="p-6 sm:p-8 bg-slate-900/90 border-slate-800 shadow-2xl">
          <div className="space-y-6">
            {/* AUTH METHOD TAB SWITCHER */}
            <div className="flex border-b border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setOtpError(null);
                  setOtpSent(false);
                  setDevOtp(null);
                }}
                className={`flex-1 py-2.5 font-bold border-b-2 transition-all ${
                  authMethod === 'email' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Email & Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('phone');
                  setOtpError(null);
                  setOtpSent(false);
                  setDevOtp(null);
                }}
                className={`flex-1 py-2.5 font-bold border-b-2 transition-all ${
                  authMethod === 'phone' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Mobile Number OTP
              </button>
            </div>

            {authMethod === 'email' ? (
              /* EMAIL LOGIN FORM */
              <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="user@relieftrack.org"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full" icon={<ArrowRight className="w-4 h-4" />}>
                  Authenticate & Enter {targetRole} Workspace
                </Button>
              </form>
            ) : (
              /* MOBILE NUMBER OTP FORM */
              <div className="space-y-4">
                {otpError && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <p>{otpError}</p>
                  </div>
                )}

                {!otpSent ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Phone Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={isSendingOtp}
                      disabled={isSendingOtp}
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      Send OTP
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    {otpMessage && (
                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                        {otpMessage}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enter 6-Digit OTP Code</label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          required
                          maxLength={6}
                          placeholder="------"
                          data-development-otp={process.env.NODE_ENV !== 'production' && devOtp ? devOtp : undefined}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-emerald-400 tracking-widest focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={isVerifyingOtp}
                      disabled={isVerifyingOtp || otp.length !== 6}
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      Verify OTP & Enter Workspace
                    </Button>

                    <div className="flex items-center justify-between text-xs pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp('');
                          setDevOtp(null);
                          setOtpError(null);
                        }}
                        className="text-slate-400 hover:text-slate-200 underline"
                      >
                        Change Number
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={isSendingOtp}
                        className="text-emerald-400 hover:underline font-bold inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Resend OTP
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <Link href="/" className="text-slate-400 hover:text-slate-200 underline inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Change Role
              </Link>
              <div>
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-emerald-400 font-bold hover:underline">
                  Register here
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <p className="text-xs font-mono">Loading Login Workspace...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
