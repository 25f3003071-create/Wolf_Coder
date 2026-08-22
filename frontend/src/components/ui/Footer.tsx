import React from 'react';
import Link from 'next/link';
import { ShieldCheck, HeartHandshake } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 py-10 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-slate-200">ReliefTrack Protocol © 2026</span>
          <span>— Web3 & Fintech Transparent Aid Delivery</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 font-medium">
          <Link href="/track/DR-2026-8F72K9" className="hover:text-emerald-400 transition-colors">
            Track Receipt
          </Link>
          <Link href="/donor" className="hover:text-emerald-400 transition-colors">
            Donor Portal
          </Link>
          <Link href="/ngo" className="hover:text-emerald-400 transition-colors">
            NGO Workspace
          </Link>
          <Link href="/manager" className="hover:text-emerald-400 transition-colors">
            Manager Hub
          </Link>
        </div>
      </div>
    </footer>
  );
};
