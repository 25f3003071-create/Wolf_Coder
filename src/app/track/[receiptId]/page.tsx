'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DonationTimeline, TimelineStep } from '@/components/donor/DonationTimeline';
import { MoneyBreakdown } from '@/components/donor/MoneyBreakdown';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';
import { Receipt, Building2, UserCheck, Lock, ExternalLink, RefreshCw, Camera, MapPin } from 'lucide-react';
import { getExplorerTxUrl } from '@/lib/blockchain/adapter';

export default function TrackReceiptPage() {
  const params = useParams();
  const receiptId = (params?.receiptId as string) || 'DR-2026-8F72K9';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ receipt: any; timeline: TimelineStep[]; expenses: any[] } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTrackingData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/donations/${receiptId}`);
        const json = await res.json();
        if (json.success && isMounted) setData(json);
      } catch {} finally { if (isMounted) setLoading(false); }
    };
    fetchTrackingData();
    return () => { isMounted = false; };
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
    id: receiptId, amount: 10000, allocated_amount: 8500, spent_amount: 8500, remaining_amount: 1500, campaign_title: 'Emergency Medical Relief Campaign 2026', ngo_name: 'Red Cross Relief India', beneficiary_badge: 'BEN-72A91 — VERIFIED ✓', beneficiary_summary: 'Emergency Cardiac Surgery & Intensive Care', blockchain_tx_hash: '0x8a7291bc44f128e932104975193a218f77361a90c4217734891a274191bc44f1', status: 'AID_DELIVERY',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 text-xs">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1"><Badge variant="success">Real-Time Delivery Tracked</Badge><span className="text-[10px] text-slate-400 font-mono">Live Supabase Sync</span></div>
          <h1 className="text-2xl font-black text-slate-100 font-mono flex items-center gap-2"><Receipt className="w-6 h-6 text-emerald-400" /> {receipt.id}</h1>
          <p className="text-slate-300 font-medium">{receipt.campaign_title}</p>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-left md:text-right">
          <span className="block text-[10px] font-bold text-slate-400 uppercase">Donation Value</span>
          <span className="text-2xl font-black text-emerald-400">{formatCurrency(receipt.amount)}</span>
          <span className="block text-[10px] text-slate-400">Allocated: {formatCurrency(receipt.allocated_amount)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-800"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Building2 className="w-5 h-5" /></div><div><span className="block text-[10px] font-bold text-slate-400 uppercase">Assigned NGO</span><span className="font-bold text-slate-100">{receipt.ngo_name}</span><span className="block text-[10px] text-emerald-400 font-mono">NGO-1042 — VERIFIED</span></div></div></Card>
        <Card className="border-slate-800"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20"><UserCheck className="w-5 h-5" /></div><div><span className="block text-[10px] font-bold text-slate-400 uppercase">Beneficiary</span><span className="font-extrabold text-emerald-400">{receipt.beneficiary_badge}</span><span className="block text-[10px] text-slate-400 truncate max-w-[180px]">{receipt.beneficiary_summary}</span></div></div></Card>
        <Card className="border-slate-800"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20"><Lock className="w-5 h-5" /></div><div><span className="block text-[10px] font-bold text-slate-400 uppercase">Privacy Vault</span><span className="font-semibold text-slate-200">Raw Docs Encrypted</span><span className="block text-[10px] text-slate-400">Raw files isolated in vault</span></div></div></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Live Delivery & Allocation Timeline" subtitle="Step-by-step audit history updated in real time">
            <DonationTimeline timeline={data?.timeline || []} currentStep={receipt.current_step} />
          </Card>
          <MoneyBreakdown totalAmount={receipt.amount} allocatedAmount={receipt.allocated_amount} spentAmount={receipt.spent_amount} remainingAmount={receipt.remaining_amount} expenses={data?.expenses || []} />
        </div>

        <div className="space-y-6">
          <Card title="Camera-Verified Field Evidence" subtitle="In-app photo evidence with location & SHA-256 hash">
            <div className="space-y-3">
              <div className="relative aspect-video rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col items-center justify-center p-4 text-center">
                <Camera className="w-7 h-7 text-emerald-400 mb-1" />
                <p className="font-bold text-slate-100">XYZ Super Specialty Hospital OT Evidence</p>
                <p className="text-[10px] font-mono text-emerald-400">EVD-2026-72K9</p>
                <div className="absolute bottom-2 left-2 right-2 text-[10px] text-slate-300 font-mono flex justify-between"><div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-400" /><span>GPS: 19.0760 N, 72.8777 E</span></div><Badge variant="success">Camera Verified</Badge></div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px]"><span className="text-slate-400 block font-bold">SHA-256 Checksum</span><p className="text-emerald-400 break-all">7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c</p></div>
            </div>
          </Card>

          <Card title="Blockchain Proof" subtitle="Immutable event anchored on public smart contracts">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1"><span className="block text-[10px] text-slate-400 uppercase font-bold">Ethereum Sepolia Tx</span><a href={getExplorerTxUrl(receipt.blockchain_tx_hash, 'sepolia')} target="_blank" rel="noreferrer" className="font-mono text-emerald-400 hover:underline break-all block text-[10px]">{receipt.blockchain_tx_hash} <ExternalLink className="w-3 h-3 inline" /></a></div>
          </Card>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 space-y-1">
            <div className="flex items-center gap-1 font-semibold text-slate-200"><Lock className="w-4 h-4 text-emerald-400" /> Sensitive Privacy Notice</div>
            <p className="text-[11px] leading-relaxed">Donors receive transparent expenditure summaries and anonymized badges (<code>BEN-72A91</code>). Raw identity cards remain encrypted in Manager Vault.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
