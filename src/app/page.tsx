'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, HeartHandshake, Building2, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getSession, clearSession } from '@/lib/auth/client-session';
import { UserRole } from '@/types';

const ROLES: { id: UserRole; title: string; badge: 'success' | 'info' | 'warning'; desc: string; color: string; icon: React.ReactNode }[] = [
  { id: 'DONOR', title: 'Donor Portal', badge: 'success', desc: 'Track your contributions, receipts, and real-time aid delivery step-by-step.', color: 'emerald', icon: <HeartHandshake className="w-8 h-8" /> },
  { id: 'NGO', title: 'NGO Workspace', badge: 'info', desc: 'Register emergency beneficiaries, submit itemized expenses, and capture camera evidence.', color: 'sky', icon: <Building2 className="w-8 h-8" /> },
  { id: 'MANAGER', title: 'Manager Hub', badge: 'warning', desc: 'Approve allocations, verify hospital estimates, resolve fraud flags & inspect vault.', color: 'purple', icon: <ShieldCheck className="w-8 h-8" /> },
];

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const session = getSession();
      if (session?.role === 'DONOR') router.replace('/donor');
      else if (session?.role === 'NGO') router.replace('/ngo');
      else if (session?.role === 'MANAGER') router.replace('/manager');
      else if (session && !['DONOR', 'NGO', 'MANAGER'].includes(session.role)) clearSession();
    } catch { clearSession(); }
  }, [router]);

  const handleSelectRole = (selectedRole: UserRole) => {
    try { if (typeof window !== 'undefined') sessionStorage.setItem('relieftrack_target_role', selectedRole); } catch {}
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-slate-950 text-xs">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl"><ShieldCheck className="w-9 h-9" /></div>
          <div>
            <h1 className="text-3xl font-black text-slate-100">Relief<span className="text-emerald-400">Track</span></h1>
            <p className="text-slate-400 mt-1">Blockchain Emergency Relief &amp; Donation Tracking Protocol</p>
          </div>
          <Badge variant="success" className="mt-1">STEP 1: SELECT PLATFORM ROLE</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROLES.map((r) => (
            <Link key={r.id} href={`/login?role=${r.id}`} onClick={() => handleSelectRole(r.id)} className="block group">
              <Card className="p-5 cursor-pointer border-slate-800 hover:border-emerald-500/80 hover:bg-slate-900 transition-all flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="p-2.5 rounded-2xl bg-slate-900 text-emerald-400 border border-slate-800 inline-block group-hover:scale-105 transition-transform">{r.icon}</div>
                  <div>
                    <Badge variant={r.badge} className="mb-1">{r.id}</Badge>
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400">{r.title}</h3>
                    <p className="text-slate-400 mt-1 leading-relaxed">{r.desc}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-800 mt-3 flex items-center justify-between font-bold text-emerald-400">
                  <span>Select &amp; Continue</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
