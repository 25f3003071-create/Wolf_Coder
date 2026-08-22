'use client';

import React, { useState, useEffect } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';
import { authFetch } from '@/lib/auth/api-client';
import { Building2, UserPlus, Receipt, Camera, DollarSign, Plus, FileText, History, CreditCard, Clock } from 'lucide-react';
import { EvidenceCaptureModal } from '@/components/ngo/EvidenceCaptureModal';
import { RegisterBeneficiaryModal } from '@/components/ngo/RegisterBeneficiaryModal';
import { BeneficiaryDocumentsModal } from '@/components/ngo/BeneficiaryDocumentsModal';
import { RecordAidPaymentModal } from '@/components/ngo/RecordAidPaymentModal';
import { PaymentHistoryModal } from '@/components/ngo/PaymentHistoryModal';
import { SubmitExpenseModal } from '@/components/ngo/SubmitExpenseModal';
import { getSession, createDemoSession, saveSession } from '@/lib/auth/client-session';
import { useRouter } from 'next/navigation';

export default function NgoDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalBeneficiaries: 0, totalApproved: 0, totalDisbursed: 0, totalRemaining: 0 });
  const [isLoadingBeneficiaries, setIsLoadingBeneficiaries] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSubmitExpenseModalOpen, setIsSubmitExpenseModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isDisbursementModalOpen, setIsDisbursementModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any | null>(null);

  const loadBeneficiaries = async () => {
    setIsLoadingBeneficiaries(true);
    try {
      const res = await authFetch('/api/beneficiaries');
      const data = await res.json();
      setIsLoadingBeneficiaries(false);
      if (res.ok && data.success) { setBeneficiaries(data.beneficiaries || []); if (data.summary) setSummary(data.summary); }
    } catch { setIsLoadingBeneficiaries(false); }
  };

  const loadExpenses = async () => {
    setIsLoadingExpenses(true);
    try {
      const res = await authFetch('/api/expenses');
      const data = await res.json();
      setIsLoadingExpenses(false);
      if (res.ok && data.success) setExpenses(data.expenses || []);
    } catch { setIsLoadingExpenses(false); }
  };

  const handleRefreshData = () => { loadBeneficiaries(); loadExpenses(); };

  useEffect(() => {
    setMounted(true);
    let session = getSession();
    if (!session && process.env.NODE_ENV !== 'production') { session = createDemoSession('NGO'); saveSession(session); }
    else if (!session || session.role !== 'NGO') { router.replace('/login?role=NGO'); return; }
    loadBeneficiaries(); loadExpenses();
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2"><Building2 className="w-6 h-6 text-emerald-400" /> Red Cross Relief India <Badge variant="success">NGO-1042 — VERIFIED ✓</Badge></h1>
          <p className="text-slate-400 mt-0.5">Field Operations &amp; Beneficiary Disbursement Hub</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="primary" size="sm" icon={<UserPlus className="w-4 h-4" />} onClick={() => setIsRegisterModalOpen(true)}>Register Beneficiary</Button>
          <Button type="button" variant="outline" size="sm" icon={<Plus className="w-4 h-4 text-emerald-400" />} onClick={() => setIsSubmitExpenseModalOpen(true)}>Submit Expense</Button>
          <Button type="button" variant="outline" size="sm" icon={<Camera className="w-4 h-4 text-emerald-400" />} onClick={() => setIsCameraOpen(true)}>Camera Evidence</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="TOTAL BENEFICIARIES" value={`${summary.totalBeneficiaries || beneficiaries.length} Beneficiaries`} subtitle="Verified cases" icon={<UserPlus className="w-5 h-5" />} color="sky" />
        <StatCard title="TOTAL APPROVED AID" value={formatCurrency(summary.totalApproved || 90000)} subtitle="Assigned budget" icon={<DollarSign className="w-5 h-5" />} color="emerald" />
        <StatCard title="TOTAL AID DISBURSED" value={formatCurrency(summary.totalDisbursed || 55000)} subtitle="Field funds" icon={<Receipt className="w-5 h-5" />} color="purple" />
        <StatCard title="TOTAL REMAINING AID" value={formatCurrency(summary.totalRemaining || 35000)} subtitle="Available" icon={<Clock className="w-5 h-5" />} color="amber" />
      </div>

      <Card title="Beneficiary Aid Management" subtitle="Manage beneficiaries, upload documents, record disbursements, and inspect payment history" action={<Button type="button" variant="outline" size="sm" icon={<UserPlus className="w-3.5 h-3.5" />} onClick={() => setIsRegisterModalOpen(true)}>+ Register Beneficiary</Button>}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr><th className="p-2.5">Beneficiary</th><th className="p-2.5">Need</th><th className="p-2.5">Approved</th><th className="p-2.5">Spent</th><th className="p-2.5">Remaining</th><th className="p-2.5">Status</th><th className="p-2.5 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {isLoadingBeneficiaries ? <tr><td colSpan={7} className="p-6 text-center text-slate-400">Loading...</td></tr> : beneficiaries.map((b) => {
                const approved = Number(b.approved_amount || b.estimated_cost || 0);
                const spent = Number(b.spent_amount || 0);
                const remaining = Number(b.remaining_amount !== undefined ? b.remaining_amount : approved - spent);
                return (
                  <tr key={b.id} className="hover:bg-slate-900/50">
                    <td className="p-2.5"><div className="font-bold text-slate-100">{b.full_name || 'Anonymous'}</div><div className="text-[10px] font-mono text-emerald-400">{b.id}</div></td>
                    <td className="p-2.5 font-semibold text-slate-200">{b.emergency_need || b.aid_category || 'Medical Aid'}</td>
                    <td className="p-2.5 font-semibold text-slate-200">{formatCurrency(approved)}</td>
                    <td className="p-2.5 font-semibold text-sky-400">{formatCurrency(spent)}</td>
                    <td className="p-2.5 font-extrabold text-emerald-400">{formatCurrency(remaining)}</td>
                    <td className="p-2.5"><Badge variant={b.status === 'FULLY_DISBURSED' || b.status === 'VERIFIED' ? 'success' : 'warning'}>{b.status.replace('_', ' ')}</Badge></td>
                    <td className="p-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button type="button" variant="outline" size="sm" icon={<FileText className="w-3 h-3" />} onClick={() => { setSelectedBeneficiary(b); setIsDocumentsModalOpen(true); }}>Docs</Button>
                        <Button type="button" variant="primary" size="sm" icon={<CreditCard className="w-3 h-3" />} onClick={() => { setSelectedBeneficiary(b); setIsDisbursementModalOpen(true); }} disabled={remaining <= 0}>Pay Aid</Button>
                        <Button type="button" variant="ghost" size="sm" icon={<History className="w-3 h-3" />} onClick={() => { setSelectedBeneficiary(b); setIsHistoryModalOpen(true); }}>History</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Itemized Relief Expenses Ledger" subtitle="Track submitted relief bills and payment proof" action={<Button type="button" variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5 text-emerald-400" />} onClick={() => setIsSubmitExpenseModalOpen(true)}>+ Submit Expense</Button>}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr><th className="p-2.5">Expense ID</th><th className="p-2.5">Beneficiary</th><th className="p-2.5">Category</th><th className="p-2.5">Amount</th><th className="p-2.5">Payment Method</th><th className="p-2.5">Verification</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {isLoadingExpenses ? <tr><td colSpan={6} className="p-6 text-center text-slate-400">Loading...</td></tr> : expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-900/50">
                  <td className="p-2.5 font-mono font-bold text-emerald-400">{e.id}</td>
                  <td className="p-2.5 font-mono text-slate-300">{e.beneficiary_id || 'BEN-72A91'}</td>
                  <td className="p-2.5 font-semibold text-slate-200">{e.category || e.purpose || 'Medical Relief'}</td>
                  <td className="p-2.5 font-extrabold text-slate-100">{formatCurrency(e.amount)}</td>
                  <td className="p-2.5"><Badge variant="info">{e.payment_method || 'UPI'}</Badge></td>
                  <td className="p-2.5"><Badge variant={e.status === 'FLAGGED' ? 'danger' : 'success'}>{e.verificationState || e.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <RegisterBeneficiaryModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} onSuccess={handleRefreshData} />
      <SubmitExpenseModal isOpen={isSubmitExpenseModalOpen} onClose={() => setIsSubmitExpenseModalOpen(false)} beneficiaries={beneficiaries} onSuccess={handleRefreshData} />
      {selectedBeneficiary && (
        <>
          <BeneficiaryDocumentsModal isOpen={isDocumentsModalOpen} onClose={() => setIsDocumentsModalOpen(false)} beneficiaryId={selectedBeneficiary.id} beneficiaryName={selectedBeneficiary.full_name || selectedBeneficiary.id} />
          <RecordAidPaymentModal isOpen={isDisbursementModalOpen} onClose={() => setIsDisbursementModalOpen(false)} beneficiary={selectedBeneficiary} onSuccess={handleRefreshData} />
          <PaymentHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} beneficiaryId={selectedBeneficiary.id} beneficiaryName={selectedBeneficiary.full_name || selectedBeneficiary.id} />
        </>
      )}
      <EvidenceCaptureModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} expenseId="EXP-2026-77A2" beneficiaryId="BEN-72A91" onCaptureComplete={handleRefreshData} />
    </div>
  );
}
