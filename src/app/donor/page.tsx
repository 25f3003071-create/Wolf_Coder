'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';
import { DonationPaymentModal } from '@/components/donor/DonationPaymentModal';
import { HeartHandshake, Activity, CheckCircle2, Clock, Search, ShieldCheck, ArrowRight } from 'lucide-react';

import { getSession } from '@/lib/auth/client-session';
import { useRouter } from 'next/navigation';

export default function DonorDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const session = getSession();
    if (!session || session.role !== 'DONOR') {
      router.replace('/login?role=DONOR');
    }
  }, [router]);

  const [selectedCampaignId, setSelectedCampaignId] = useState('CMP-2026-0192');
  const [selectedCampaignTitle, setSelectedCampaignTitle] = useState('Emergency Medical Relief Campaign 2026');
  const [donateAmount, setDonateAmount] = useState('10000');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [receiptsList, setReceiptsList] = useState<any[]>([
    {
      id: 'DR-2026-8F72K9',
      campaign: 'Emergency Medical Relief 2026',
      amount: 10000,
      status: 'Aid Delivery ◉',
      badgeVariant: 'warning',
    },
    {
      id: 'DR-2026-99A12B',
      campaign: 'Flood Reconstruction Aid',
      amount: 25000,
      status: 'Completed ✓',
      badgeVariant: 'success',
    },
  ]);

  const handleCampaignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCampaignId(val);
    if (val === 'CMP-2026-0192') {
      setSelectedCampaignTitle('Emergency Medical Relief Campaign 2026');
    } else {
      setSelectedCampaignTitle('Flood Disaster Reconstruction & Aid');
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(donateAmount);

    if (!selectedCampaignId) {
      setValidationError('Please select a target campaign.');
      return;
    }

    if (!numAmount || numAmount <= 0) {
      setValidationError('Please enter a valid donation amount greater than zero.');
      return;
    }

    setValidationError(null);
    // STAGE 1 COMPLETE: Open Stage 2 Payment Modal
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (newReceipt: any) => {
    if (newReceipt) {
      setReceiptsList((prev) => [
        {
          id: newReceipt.id,
          campaign: selectedCampaignTitle,
          amount: newReceipt.amount || Number(donateAmount),
          status: 'Donation Created ◉',
          badgeVariant: 'warning',
        },
        ...prev,
      ]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">Donor Impact Hub</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Welcome back, Rahul Sharma • Connected Wallet: 0x71C7...976F</p>
        </div>
        <Link href="/track/DR-2026-8F72K9">
          <Button variant="outline" size="sm" icon={<Search className="w-4 h-4" />}>
            Track Sample Receipt (DR-2026-8F72K9)
          </Button>
        </Link>
      </div>

      {/* FINTECH STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Donated" value="₹85,000" trend="₹10k this month" trendDirection="up" icon={<HeartHandshake className="w-5 h-5" />} color="emerald" />
        <StatCard title="Active Journeys" value="3 Active" subtitle="In-progress aid delivery" icon={<Clock className="w-5 h-5" />} color="amber" />
        <StatCard title="Completed Cases" value="7 Completed" subtitle="Final impact verified" icon={<CheckCircle2 className="w-5 h-5" />} color="sky" />
        <StatCard title="Impact Generated" value="42 Beneficiaries" subtitle="Verified medical & disaster aid" icon={<Activity className="w-5 h-5" />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT DONATIONS TABLE (2 COLS WIDE) */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Recent Donation Receipts" subtitle="Click any receipt to open its delivery tracking timeline">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase tracking-wider bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Receipt ID</th>
                    <th className="p-3">Campaign</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-medium">
                  {receiptsList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-emerald-400">{item.id}</td>
                      <td className="p-3">{item.campaign}</td>
                      <td className="p-3 font-extrabold text-slate-100">{formatCurrency(item.amount)}</td>
                      <td className="p-3">
                        <Badge variant={item.badgeVariant}>{item.status}</Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/track/${item.id}`}>
                          <Button variant="outline" size="sm">Track</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* STAGE 1 — DONATION DETAILS CARD */}
        <div>
          <Card title="Contribute Relief Funds" subtitle="Specify details and proceed to payment selection">
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {validationError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                  {validationError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Campaign</label>
                <select
                  value={selectedCampaignId}
                  onChange={handleCampaignChange}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="CMP-2026-0192">Emergency Medical Relief Campaign 2026</option>
                  <option value="CMP-2026-0411">Flood Disaster Reconstruction & Aid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Donation Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                    required
                    min="1"
                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>Generates a unique <code>DR-2026-XXXXXX</code> receipt ID anchored on public smart contract.</p>
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full" icon={<ArrowRight className="w-4 h-4" />}>
                PROCEED TO PAYMENT
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* STAGE 2 — PAYMENT METHOD MODAL */}
      <DonationPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        campaignId={selectedCampaignId}
        campaignTitle={selectedCampaignTitle}
        amount={Number(donateAmount) || 0}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
