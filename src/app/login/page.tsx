'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Mail, Lock, Phone, KeyRound, ArrowRight, AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';
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
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  useEffect(() => {
    const existingSession = getSession();
    if (existingSession?.role) {
      if (existingSession.role === 'DONOR') router.replace('/donor');
      else if (existingSession.role === 'NGO') router.replace('/ngo');
      else if (existingSession.role === 'MANAGER') router.replace('/manager');
      return;
    }
    const roleParam = searchParams.get('role') as UserRole | null;
    const storedRole = typeof window !== 'undefined' ? (sessionStorage.getItem('relieftrack_target_role') as UserRole | null) : null;
    const resolvedRole = roleParam || storedRole || 'DONOR';
    setTargetRole(resolvedRole);
    if (resolvedRole === 'DONOR') setEmail('donor@relieftrack.org');
    else if (resolvedRole === 'NGO') setEmail('ngo@redcrossrelief.org');
    else if (resolvedRole === 'MANAGER') setEmail('admin@relieftrack.org');
  }, [searchParams, router]);

  const handleSendOtp = async (targetOverride?: string) => {
    const target = targetOverride || (authMethod === 'phone' ? phone : email);
    setOtpError(null); setOtpMessage(null); setDevOtp(null); setIsSendingOtp(true);
    try {
      const res = await fetch('/api/auth/otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: target, email: target }) });
      const data = await res.json();
      setIsSendingOtp(false);
      if (!res.ok || !data.success) { setOtpError(data.error || 'Failed to send OTP'); return; }
      setOtpSent(true); setOtp(''); setOtpMessage(data.message || `OTP sent to ${target}`);
      if (data.developmentOtp) setDevOtp(data.developmentOtp);
    } catch {
      setIsSendingOtp(false); setOtpError('Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = authMethod === 'phone' ? phone : email;
    if (!otp || otp.length !== 6) { setOtpError('Please enter valid 6-digit OTP code'); return; }
    setIsVerifyingOtp(true); setOtpError(null);
    try {
      const res = await fetch('/api/auth/otp/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: target, email: target, code: otp, otpCode: otp }) });
      const data = await res.json();
      setIsVerifyingOtp(false);
      if (!res.ok || !data.success) { setOtpError(data.error || 'Invalid or expired OTP'); return; }
      saveSession(createDemoSession(targetRole, { email, full_name: `${targetRole} User` }));
      router.push(targetRole === 'DONOR' ? '/donor' : targetRole === 'NGO' ? '/ngo' : '/manager');
    } catch {
      setIsVerifyingOtp(false); setOtpError('OTP verification failed');
    }
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    saveSession(createDemoSession(targetRole, { email, full_name: `${targetRole} User` }));
    router.push(targetRole === 'DONOR' ? '/donor' : targetRole === 'NGO' ? '/ngo' : '/manager');
  };

  const inputClass = "w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono";

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 text-xs">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center space-y-1.5">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block"><ShieldCheck className="w-8 h-8" /></div>
          <h1 className="text-2xl font-black text-slate-100">{targetRole} Authentication</h1>
          <Badge variant={targetRole === 'DONOR' ? 'info' : targetRole === 'NGO' ? 'warning' : 'danger'}>Role: {targetRole} Access</Badge>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button type="button" onClick={() => { setAuthMethod('email'); setOtpSent(false); setOtpError(null); }} className={`py-1.5 rounded-lg font-bold ${authMethod === 'email' ? 'bg-emerald-950/50 border border-emerald-500/50 text-emerald-400' : 'text-slate-400'}`}>Password Auth</button>
              <button type="button" onClick={() => { setAuthMethod('phone'); setOtpSent(false); setOtpError(null); }} className={`py-1.5 rounded-lg font-bold ${authMethod === 'phone' ? 'bg-emerald-950/50 border border-emerald-500/50 text-emerald-400' : 'text-slate-400'}`}>Mobile / Email OTP</button>
            </div>

            {otpError && <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" /><p>{otpError}</p></div>}

            {authMethod === 'email' ? (
              <form onSubmit={handlePasswordLogin} className="space-y-3">
                <div><label className="block font-semibold text-slate-300 mb-1">Email</label><div className="relative"><Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} /></div></div>
                <div><label className="block font-semibold text-slate-300 mb-1">Password</label><div className="relative"><Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} /></div></div>
                <Button type="submit" variant="primary" size="md" className="w-full" icon={<ArrowRight className="w-4 h-4" />}>Authenticate &amp; Launch Dashboard</Button>
              </form>
            ) : (
              <div>
                {!otpSent ? (
                  <div className="space-y-3">
                    <div><label className="block font-semibold text-slate-300 mb-1">Mobile or Email</label><div className="relative"><Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" /><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputClass} /></div></div>
                    <Button type="button" variant="primary" size="md" className="w-full" disabled={isSendingOtp} onClick={() => handleSendOtp()}>{isSendingOtp ? 'Transmitting OTP...' : 'Send Verification OTP'}</Button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    {otpMessage && <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">{otpMessage}</div>}
                    {devOtp && <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 font-mono"><p className="font-bold">Development Mode Code: {devOtp}</p></div>}
                    <div><label className="block font-semibold text-slate-300 mb-1">Enter 6-Digit OTP</label><div className="relative"><KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" /><input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="123456" className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono font-bold tracking-widest" /></div></div>
                    <Button type="submit" variant="primary" size="md" className="w-full" disabled={isVerifyingOtp}>{isVerifyingOtp ? 'Verifying...' : 'Verify OTP &amp; Continue'}</Button>
                    <button type="button" onClick={() => handleSendOtp(phone)} className="w-full text-center text-slate-400 hover:text-emerald-400 flex items-center justify-center gap-1"><RotateCcw className="w-3 h-3" /> Resend OTP</button>
                  </form>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-between text-slate-400">
              <Link href="/" className="hover:text-slate-200 underline flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Change Role</Link>
              <div>Don&apos;t have an account? <Link href="/register" className="text-emerald-400 font-bold hover:underline">Register</Link></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-xs font-mono">Loading Login...</div>}><LoginContent /></Suspense>;
}
