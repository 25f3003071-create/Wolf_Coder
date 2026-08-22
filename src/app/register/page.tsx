'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, User, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createDemoSession, saveSession } from '@/lib/auth/client-session';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'DONOR' | 'NGO'>('DONOR');
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    saveSession(createDemoSession(role, { email, full_name: fullName || email.split('@')[0] }));
    if (role === 'DONOR') router.push('/donor');
    else router.push('/ngo');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block">
          <UserCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-100">Create ReliefTrack Account</h1>
        <p className="text-xs text-slate-400">Join the transparent Web3 emergency relief network</p>
      </div>

      <Card>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">Account Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('DONOR')}
                className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all ${
                  role === 'DONOR' ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Donor
              </button>
              <button
                type="button"
                onClick={() => setRole('NGO')}
                className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all ${
                  role === 'NGO' ? 'bg-sky-950/50 border-sky-500 text-sky-400' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                NGO Partner
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name / Org Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Rahul Sharma or Red Cross Relief"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@domain.org"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full">
            Create Account & Continue
          </Button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link href="/login" className="text-emerald-400 font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
