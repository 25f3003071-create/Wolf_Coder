'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils/currency';
import { authFetch } from '@/lib/auth/api-client';
import { ShieldCheck, Lock, AlertTriangle, Eye, CheckCircle2, XCircle, Activity, Globe, DollarSign } from 'lucide-react';
import { VerificationVaultModal } from '@/components/manager/VerificationVaultModal';

import { getSession } from '@/lib/auth/client-session';
import { useRouter } from 'next/navigation';

export default function ManagerDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const session = getSession();
    if (!session || session.role !== 'MANAGER') {
      router.replace('/login?role=MANAGER');
    }
  }, [router]);

  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [selectedBen, setSelectedBen] = useState('BEN-72A91');
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isSubmittingAllocation, setIsSubmittingAllocation] = useState(false);

  // Allocation form state
  const [allocateAmount, setAllocateAmount] = useState('8500');
  const [targetNgo, setTargetNgo] = useState('NGO-1042');
  const [targetBen, setTargetBen] = useState('BEN-72A91');

  const [queue, setQueue] = useState([
    {
      id: 'BEN-72A91',
      ngo: 'Red Cross India',
      hospital: 'XYZ Super Specialty Hospital',
      estimated_cost: 78500,
      status: 'VERIFIED',
    },
    {
      id: 'BEN-99C03',
      ngo: 'Care Foundation',
      hospital: 'District Care Unit',
      estimated_cost: 25000,
      status: 'UNDER_REVIEW',
    },
  ]);

  const handleVerifyBeneficiary = async (benId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await authFetch(`/api/beneficiaries/${benId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ status, notes: `Manager approved via verification hub`, hospitalVerified: true }),
      });
      const data = await res.json();
      if (data.success) {
        setQueue((prev) => prev.map((item) => (item.id === benId ? { ...item, status } : item)));
      }
    } catch {
      // fallback
    }
  };

  const handleAllocateFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAllocation(true);
    try {
      const res = await authFetch('/api/allocations', {
        method: 'POST',
        body: JSON.stringify({
          campaignId: 'CMP-2026-0192',
          ngoId: targetNgo,
          beneficiaryId: targetBen,
          receiptId: 'DR-2026-8F72K9',
          amount: Number(allocateAmount),
        }),
      });
      const data = await res.json();
      setIsSubmittingAllocation(false);
      if (data.success) {
        alert(`Funds ₹${allocateAmount} allocated successfully to ${targetNgo} for ${targetBen}`);
        setIsAllocateModalOpen(false);
      }
    } catch {
      setIsSubmittingAllocation(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-purple-400" />
            Manager & Verification Auditor Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Platform Governance, Fraud Detection & Verification Vault</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            icon={<DollarSign className="w-4 h-4" />}
            onClick={() => setIsAllocateModalOpen(true)}
          >
            Allocate Campaign Funds
          </Button>
          <Link href="/manager/verification-vault">
            <Button variant="outline" size="sm" icon={<Lock className="w-4 h-4 text-purple-400" />}>
              Open Vault
            </Button>
          </Link>
          <Link href="/manager/fraud">
            <Button variant="danger" size="sm" icon={<AlertTriangle className="w-4 h-4" />}>
              Fraud Center (2 Flags)
            </Button>
          </Link>
        </div>
      </div>

      {/* ADMIN METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Platform Volume" value="₹23.5 Lakh" subtitle="Across 148 donations" icon={<Activity className="w-5 h-5" />} color="emerald" />
        <StatCard title="Verified Beneficiaries" value="198 Verified" subtitle="17 Pending review" icon={<CheckCircle2 className="w-5 h-5" />} color="sky" />
        <StatCard title="Fraud Flags" value="2 Open Flags" subtitle="1 High severity" icon={<AlertTriangle className="w-5 h-5" />} color="rose" />
        <StatCard title="Cross-Chain Tx" value="2 Chains" subtitle="Sepolia & Polygon Amoy" icon={<Globe className="w-5 h-5" />} color="purple" />
      </div>

      {/* TWO COLUMN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PENDING BENEFICIARY VERIFICATIONS (2 COLS) */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Beneficiary Verification Queue" subtitle="Review hospital credentials, verify cases, or inspect Vault documents">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase tracking-wider bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Beneficiary ID</th>
                    <th className="p-3">NGO</th>
                    <th className="p-3">Hospital</th>
                    <th className="p-3">Est. Cost</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-medium">
                  {queue.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/50">
                      <td className="p-3 font-mono font-bold text-emerald-400">{item.id}</td>
                      <td className="p-3">{item.ngo}</td>
                      <td className="p-3">{item.hospital}</td>
                      <td className="p-3 font-extrabold text-slate-100">{formatCurrency(item.estimated_cost)}</td>
                      <td className="p-3">
                        <Badge variant={item.status === 'VERIFIED' ? 'success' : 'warning'}>{item.status}</Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Eye className="w-3.5 h-3.5 text-purple-400" />}
                            onClick={() => {
                              setSelectedBen(item.id);
                              setIsVaultOpen(true);
                            }}
                          >
                            Vault
                          </Button>
                          {item.status !== 'VERIFIED' && (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                              onClick={() => handleVerifyBeneficiary(item.id, 'VERIFIED')}
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* VAULT & GOVERNANCE SIDEBAR */}
        <div className="space-y-6">
          <Card title="Verification Vault Status" subtitle="Restricted manager access to raw identity & hospital documents">
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Lock className="w-4 h-4 text-purple-400" /> Vault Security Active
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Raw Aadhaar images and medical certificates stay in encrypted storage. Only authorized Managers can view them with step-up audit logging. Donors see only anonymized badges.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full"
                icon={<Lock className="w-4 h-4" />}
                onClick={() => setIsVaultOpen(true)}
              >
                OPEN VERIFICATION VAULT
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL: ALLOCATE FUNDS */}
      <Modal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        title="Allocate Campaign Funds"
        subtitle="Assign treasury relief funds to verified NGO and beneficiary cases"
      >
        <form onSubmit={handleAllocateFunds} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Target NGO Partner</label>
            <select
              value={targetNgo}
              onChange={(e) => setTargetNgo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="NGO-1042">Red Cross Relief India (NGO-1042)</option>
              <option value="NGO-2018">Care Foundation (NGO-2018)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Target Beneficiary ID</label>
            <select
              value={targetBen}
              onChange={(e) => setTargetBen(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="BEN-72A91">BEN-72A91 (XYZ Super Specialty Hospital — ₹78,500)</option>
              <option value="BEN-99C03">BEN-99C03 (District Care Unit — ₹25,000)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Allocation Amount (₹)</label>
            <input
              type="number"
              value={allocateAmount}
              onChange={(e) => setAllocateAmount(e.target.value)}
              required
              min="100"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isSubmittingAllocation}>
            CONFIRM ALLOCATION
          </Button>
        </form>
      </Modal>

      <VerificationVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        beneficiaryId={selectedBen}
      />
    </div>
  );
}
