'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, HeartHandshake, Building2, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getSession, clearSession } from '@/lib/auth/client-session';
import { UserRole } from '@/types';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const session = getSession();
      if (session?.role === 'DONOR') {
        router.replace('/donor');
      } else if (session?.role === 'NGO') {
        router.replace('/ngo');
      } else if (session?.role === 'MANAGER') {
        router.replace('/manager');
      } else if (session && !['DONOR', 'NGO', 'MANAGER'].includes(session.role)) {
        clearSession();
      }
    } catch {
      clearSession();
    }
  }, [router]);

  const handleSelectRole = (selectedRole: UserRole) => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('relieftrack_target_role', selectedRole);
      }
    } catch {
      // Ignore storage exceptions
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-950">
      <div className="w-full max-w-3xl space-y-8 animate-fade-in">
        {/* BRAND HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-950/50">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              Relief<span className="text-emerald-400">Track</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-md mx-auto">
              Blockchain Emergency Relief & Donation Tracking Protocol
            </p>
          </div>
          <Badge variant="success" className="mt-2">STEP 1: SELECT PLATFORM ROLE</Badge>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-100">Select Your Workspace Role</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Choose the platform role you want to enter before proceeding to authentication.
          </p>
        </div>

        {/* 3 ROLE CARDS WRAPPED IN SEMANTIC LINK COMPONENTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* OPTION 1: DONOR */}
          <Link
            href="/login?role=DONOR"
            onClick={() => handleSelectRole('DONOR')}
            className="block text-left group focus:outline-none"
          >
            <Card className="p-6 cursor-pointer border-slate-800 hover:border-emerald-500/80 hover:bg-slate-900 transition-all flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-8 h-8" />
                </div>
                <div>
                  <Badge variant="success" className="mb-2">DONOR</Badge>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                    Donor Portal
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Track your contributions, receipts, and real-time aid delivery step-by-step.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/60 mt-4 flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>Select & Continue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* OPTION 2: NGO */}
          <Link
            href="/login?role=NGO"
            onClick={() => handleSelectRole('NGO')}
            className="block text-left group focus:outline-none"
          >
            <Card className="p-6 cursor-pointer border-slate-800 hover:border-sky-500/80 hover:bg-slate-900 transition-all flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 inline-block group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <Badge variant="info" className="mb-2">NGO</Badge>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-sky-400 transition-colors">
                    NGO Workspace
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Register emergency beneficiaries, submit itemized expenses, and capture camera evidence.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/60 mt-4 flex items-center justify-between text-xs font-bold text-sky-400">
                <span>Select & Continue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* OPTION 3: MANAGER */}
          <Link
            href="/login?role=MANAGER"
            onClick={() => handleSelectRole('MANAGER')}
            className="block text-left group focus:outline-none"
          >
            <Card className="p-6 cursor-pointer border-slate-800 hover:border-purple-500/80 hover:bg-slate-900 transition-all flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 inline-block group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <Badge variant="warning" className="mb-2">MANAGER</Badge>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-purple-400 transition-colors">
                    Manager Hub
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Approve allocations, verify hospital estimates, resolve fraud flags & inspect the vault.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/60 mt-4 flex items-center justify-between text-xs font-bold text-purple-400">
                <span>Select & Continue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
