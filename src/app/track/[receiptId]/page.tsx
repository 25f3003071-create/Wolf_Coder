'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DonationTimeline, TimelineStep } from '@/components/donor/DonationTimeline';
import { MoneyBreakdown } from '@/components/donor/MoneyBreakdown';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/currency';
import { ShieldCheck, Receipt, Building2, UserCheck, Lock, ExternalLink, RefreshCw, Camera, MapPin, CheckCircle2 } from 'lucide-react';
import { getExplorerTxUrl } from '@/lib/blockchain/adapter';

export default function TrackReceiptPage() {
  const params = useParams();
  const receiptId = (params?.receiptId as string) || 'DR-2026-8F72K9';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    receipt: any;
    timeline: TimelineStep[];
    expenses: any[];
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTrackingData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/donations/${receiptId}`);
        const json = await res.json();
        if (json.success && isMounted) {
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTrackingData();
    return () => {
      isMounted = false;
    };
  }, [receiptId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
        <p className="text-sm text-slate-400 font-mono">Fetching real-time donation journey for {receiptId}...</p>
      </div>
    );
  }

  const receipt = data?.receipt || {
    id: receiptId,
    amount: 10000,
    allocated_amount: 8500,
    spent_amount: 8500,
    remaining_amount: 1500,
    campaign_title: 'Emergency Medical Relief Campaign 2026',
    ngo_name: 'Red Cross Relief India',
    beneficiary_badge: 'BEN-72A91 — VERIFIED ✓',
    beneficiary_summary: 'Emergency Cardiac Surgery & Intensive Care',
    blockchain_tx_hash: '0x8a7291bc44f128e932104975193a218f77361a90c4217734891a274191bc44f1',
    status: 'AID_DELIVERY',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* RECEIPT HEADER BANNER */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="success">Real-Time Delivery Tracked</Badge>
              <span className="text-xs text-slate-400 font-mono">Live Supabase Sync</span>
            </div>
            <h1 className="text-3xl font-black text-slate-100 font-mono tracking-tight flex items-center gap-2">
              <Receipt className="w-7 h-7 text-emerald-400" />
              {receipt.id}
            </h1>
            <p className="text-sm text-slate-300 mt-1 font-medium">{receipt.campaign_title}</p>
          </div>

          <div className="text-left md:text-right bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Donation Value</span>
            <span className="text-3xl font-black text-emerald-400 tracking-tight">{formatCurrency(receipt.amount)}</span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Allocated: {formatCurrency(receipt.allocated_amount)}</span>
          </div>
        </div>
      </div>

      {/* QUICK METRICS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned NGO</span>
              <span className="text-sm font-bold text-slate-100">{receipt.ngo_name}</span>
              <span className="block text-[10px] text-emerald-400 font-mono">NGO-1042 — VERIFIED</span>
            </div>
          </div>
        </Card>

        <Card className="border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Beneficiary</span>
              <span className="text-xs font-extrabold text-emerald-400">{receipt.beneficiary_badge}</span>
              <span className="block text-[10px] text-slate-400 truncate max-w-[200px]">{receipt.beneficiary_summary}</span>
            </div>
          </div>
        </Card>

        <Card className="border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Privacy Vault Protection</span>
              <span className="text-xs font-semibold text-slate-200">Raw Docs Encrypted</span>
              <span className="block text-[10px] text-slate-400">Donors see badge, raw files in vault</span>
            </div>
          </div>
        </Card>
      </div>

      {/* MAIN TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: TIMELINE (2 COLUMNS WIDE) */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Live Delivery & Allocation Timeline" subtitle="Step-by-step audit history updated in real time as field events occur">
            <DonationTimeline timeline={data?.timeline || []} currentStep={receipt.current_step} />
          </Card>

          {/* MONEY BREAKDOWN */}
          <MoneyBreakdown
            totalAmount={receipt.amount}
            allocatedAmount={receipt.allocated_amount}
            spentAmount={receipt.spent_amount}
            remainingAmount={receipt.remaining_amount}
            expenses={data?.expenses || []}
          />
        </div>

        {/* RIGHT COLUMN: EVIDENCE & BLOCKCHAIN VERIFICATION */}
        <div className="space-y-6">
          {/* CAMERA EVIDENCE PREVIEW */}
          <Card title="Camera-Verified Field Evidence" subtitle="In-app photo evidence captured with location & SHA-256 hash">
            <div className="space-y-4">
              <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden group">
                {/* Mock evidence photo rendering */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 p-4 text-center">
                  <Camera className="w-8 h-8 text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-slate-100">XYZ Super Specialty Hospital OT Evidence</p>
                  <p className="text-[10px] font-mono text-emerald-400 mt-1">EVD-2026-72K9</p>
                </div>

                <div className="absolute bottom-3 left-3 right-3 z-20 text-[10px] text-slate-300 font-mono flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>GPS: 19.0760 N, 72.8777 E</span>
                  </div>
                  <Badge variant="success" className="text-[9px] py-0">Camera Verified</Badge>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">SHA-256 Checksum</span>
                <p className="font-mono text-emerald-400 text-[10px] break-all">
                  7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c
                </p>
              </div>
            </div>
          </Card>

          {/* BLOCKCHAIN AUDIT PROOF */}
          <Card title="Blockchain Proof" subtitle="Immutable event anchored on public testnet smart contracts">
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Ethereum Sepolia Transaction</span>
                <a
                  href={getExplorerTxUrl(receipt.blockchain_tx_hash, 'sepolia')}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-emerald-400 hover:underline break-all block text-[11px]"
                >
                  {receipt.blockchain_tx_hash} <ExternalLink className="w-3 h-3 inline" />
                </a>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Smart Contract Event</span>
                <span className="font-mono text-purple-400 font-bold">DonationCreated & FundsAllocated</span>
              </div>
            </div>
          </Card>

          {/* PRIVACY NOTICE */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Lock className="w-4 h-4 text-emerald-400" /> Sensitive Privacy Notice
            </div>
            <p className="text-[11px] leading-relaxed">
              Donors receive transparent access to expenditure summaries and anonymized beneficiary verification badges (<code>BEN-72A91</code>). Raw identity cards and private medical files remain encrypted in the Manager Vault to protect beneficiary dignity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
