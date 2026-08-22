'use client';

import React, { useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils/currency';
import { authFetch } from '@/lib/auth/api-client';
import { ShieldCheck, AlertTriangle, Eye, CheckCircle2, XCircle, Activity, Globe, DollarSign } from 'lucide-react';
import { VerificationVaultModal } from '@/components/manager/VerificationVaultModal';
import { getSession } from '@/lib/auth/client-session';
import { useRouter } from 'next/navigation';

export default function ManagerDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const session = getSession();
    if (!session || session.role !== 'MANAGER') router.replace('/login?role=MANAGER');
  }, [router]);

  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [selectedBen, setSelectedBen] = useState('BEN-72A91');
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isSubmittingAllocation, setIsSubmittingAllocation] = useState(false);
  const [allocateAmount, setAllocateAmount] = useState('8500');
  const [targetNgo, setTargetNgo] = useState('NGO-1042');
  const [targetBen, setTargetBen] = useState('BEN-72A91');

  const [queue, setQueue] = useState([
    { id: 'BEN-72A91', ngo: 'Red Cross India', hospital: 'XYZ Super Specialty Hospital', estimated_cost: 78500, status: 'VERIFIED' },
    { id: 'BEN-99C03', ngo: 'Care Foundation', hospital: 'District Care Unit', estimated_cost: 25000, status: 'UNDER_REVIEW' },
  ]);

  const handleVerifyBeneficiary = async (benId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await authFetch(`/api/beneficiaries/${benId}/verify`, { method: 'POST', body: JSON.stringify({ status, notes: `Manager approved`, hospitalVerified: true }) });
      const data = await res.json();
      if (data.success) setQueue((prev) => prev.map((item) => (item.id === benId ? { ...item, status } : item)));
    } catch {}
  };

  const handleAllocateFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAllocation(true);
    try {
      const res = await authFetch('/api/allocations', { method: 'POST', body: JSON.stringify({ campaignId: 'CMP-2026-0192', ngoId: targetNgo, beneficiaryId: targetBen, receiptId: 'DR-2026-8F72K9', amount: Number(allocateAmount) }) });
      const data = await res.json();
      setIsSubmittingAllocation(false);
      if (data.success) { alert(`Funds ₹${allocateAmount} allocated successfully.`); setIsAllocateModalOpen(false); }
    } catch { setIsSubmittingAllocation(false); }
  };

  if (!mounted) return null;
  const inputClass = "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-emerald-400" /> Verification Vault &amp; Manager Operations</h1>
          <p className="text-slate-400 mt-0.5">Platform Verification Auditor &amp; Fraud Surveillance Portal</p>
        </div>
        <Button variant="primary" size="sm" icon={<DollarSign className="w-4 h-4" />} onClick={() => setIsAllocateModalOpen(true)}>Allocate Campaign Funds</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="PENDING VERIFICATIONS" value="3 Cases" subtitle="Awaiting audit" icon={<ShieldCheck className="w-5 h-5" />} color="sky" />
        <StatCard title="ACTIVE FRAUD FLAGS" value="0 Critical" subtitle="Real-time surveillance active" icon={<AlertTriangle className="w-5 h-5" />} color="emerald" />
        <StatCard title="CAMPAIGN ALLOCATIONS" value={formatCurrency(285000)} subtitle="Approved NGO pool" icon={<Activity className="w-5 h-5" />} color="purple" />
        <StatCard title="AUDIT LOGS ANCHORED" value="1,248 Entries" subtitle="Immutable proofs" icon={<Globe className="w-5 h-5" />} color="amber" />
      </div>

      <Card title="Beneficiary Verification Queue" subtitle="Verify registered beneficiary eligibility and inspect uploaded documents">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr><th className="p-2.5">Beneficiary ID</th><th className="p-2.5">NGO</th><th className="p-2.5">Hospital</th><th className="p-2.5">Est. Cost</th><th className="p-2.5">Status</th><th className="p-2.5 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {queue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/50">
                  <td className="p-2.5 font-mono font-bold text-emerald-400">{item.id}</td>
                  <td className="p-2.5 font-semibold text-slate-200">{item.ngo}</td>
                  <td className="p-2.5 text-slate-300">{item.hospital}</td>
                  <td className="p-2.5 font-extrabold text-slate-100">{formatCurrency(item.estimated_cost)}</td>
                  <td className="p-2.5"><Badge variant={item.status === 'VERIFIED' ? 'success' : 'warning'}>{item.status}</Badge></td>
                  <td className="p-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="outline" size="sm" icon={<Eye className="w-3 h-3 text-emerald-400" />} onClick={() => { setSelectedBen(item.id); setIsVaultOpen(true); }}>Vault Evidence</Button>
                      {item.status !== 'VERIFIED' && (
                        <>
                          <Button variant="primary" size="sm" icon={<CheckCircle2 className="w-3 h-3" />} onClick={() => handleVerifyBeneficiary(item.id, 'VERIFIED')}>Approve</Button>
                          <Button variant="danger" size="sm" icon={<XCircle className="w-3 h-3" />} onClick={() => handleVerifyBeneficiary(item.id, 'REJECTED')}>Reject</Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <VerificationVaultModal isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} beneficiaryId={selectedBen} />

      <Modal isOpen={isAllocateModalOpen} onClose={() => setIsAllocateModalOpen(false)} title="Allocate Campaign Funds" subtitle="Allocate approved campaign pool funds to an NGO for a verified beneficiary.">
        <form onSubmit={handleAllocateFunds} className="space-y-3">
          <div><label className="block font-semibold text-slate-300 mb-1">Target NGO *</label><select value={targetNgo} onChange={(e) => setTargetNgo(e.target.value)} className={inputClass}><option value="NGO-1042">NGO-1042 — Red Cross Relief India</option><option value="NGO-2089">NGO-2089 — Care Foundation India</option></select></div>
          <div><label className="block font-semibold text-slate-300 mb-1">Target Beneficiary ID *</label><input type="text" required value={targetBen} onChange={(e) => setTargetBen(e.target.value)} className={inputClass} /></div>
          <div><label className="block font-semibold text-slate-300 mb-1">Allocation Amount (₹) *</label><input type="number" required min="1" max="285000" value={allocateAmount} onChange={(e) => setAllocateAmount(e.target.value)} className={inputClass} /></div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
            <Button type="button" variant="outline" size="md" onClick={() => setIsAllocateModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmittingAllocation}>{isSubmittingAllocation ? 'Allocating...' : 'Approve & Allocate Funds'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
