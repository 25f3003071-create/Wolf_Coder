'use client';

import React, { useState, useEffect } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';
import { authFetch } from '@/lib/auth/api-client';
import {
  Building2,
  UserPlus,
  Receipt,
  Camera,
  DollarSign,
  CheckCircle2,
  Clock,
  Plus,
  FileText,
  History,
  CreditCard,
} from 'lucide-react';
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

  // Beneficiaries & Summary State
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalBeneficiaries: 0,
    totalApproved: 0,
    totalDisbursed: 0,
    totalRemaining: 0,
  });
  const [isLoadingBeneficiaries, setIsLoadingBeneficiaries] = useState(true);

  // Expenses State
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);

  // Action Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSubmitExpenseModalOpen, setIsSubmitExpenseModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isDisbursementModalOpen, setIsDisbursementModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Active target beneficiary for sub-modals
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any | null>(null);

  const loadBeneficiaries = async () => {
    setIsLoadingBeneficiaries(true);
    try {
      const res = await authFetch('/api/beneficiaries');
      const data = await res.json();
      setIsLoadingBeneficiaries(false);
      if (res.ok && data.success) {
        setBeneficiaries(data.beneficiaries || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      setIsLoadingBeneficiaries(false);
    }
  };

  const loadExpenses = async () => {
    setIsLoadingExpenses(true);
    try {
      const res = await authFetch('/api/expenses');
      const data = await res.json();
      setIsLoadingExpenses(false);
      if (res.ok && data.success) {
        setExpenses(data.expenses || []);
      }
    } catch (err) {
      setIsLoadingExpenses(false);
    }
  };

  const handleRefreshData = () => {
    loadBeneficiaries();
    loadExpenses();
  };

  useEffect(() => {
    setMounted(true);
    let session = getSession();
    if (!session && process.env.NODE_ENV !== 'production') {
      session = createDemoSession('NGO');
      saveSession(session);
    } else if (!session || session.role !== 'NGO') {
      router.replace('/login?role=NGO');
      return;
    }
    loadBeneficiaries();
    loadExpenses();
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-emerald-400" />
            Red Cross Relief India <Badge variant="success">NGO-1042 — VERIFIED ✓</Badge>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Field Operations &amp; Beneficiary Disbursement Hub</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsRegisterModalOpen(true);
            }}
            aria-label="Register Beneficiary"
          >
            Register Beneficiary
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
            icon={<Plus className="w-4 h-4 text-emerald-400" />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsSubmitExpenseModalOpen(true);
            }}
            aria-label="Submit Expense"
          >
            Submit Expense
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
            icon={<Camera className="w-4 h-4 text-emerald-400" />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsCameraOpen(true);
            }}
            aria-label="Camera Evidence"
          >
            Camera Evidence
          </Button>
        </div>
      </div>

      {/* FINANCIAL DASHBOARD SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL BENEFICIARIES"
          value={`${summary.totalBeneficiaries || beneficiaries.length} Beneficiaries`}
          subtitle="Verified registered cases"
          icon={<UserPlus className="w-5 h-5" />}
          color="sky"
        />
        <StatCard
          title="TOTAL APPROVED AID"
          value={formatCurrency(summary.totalApproved || 90000)}
          subtitle="Total assigned aid budget"
          icon={<DollarSign className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="TOTAL AID DISBURSED"
          value={formatCurrency(summary.totalDisbursed || 55000)}
          subtitle="Disbursed field funds"
          icon={<Receipt className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="TOTAL REMAINING AID"
          value={formatCurrency(summary.totalRemaining || 35000)}
          subtitle="Available for disbursement"
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* BENEFICIARY MANAGEMENT TABLE SECTION */}
      <Card
        title="Beneficiary Aid Management"
        subtitle="Manage beneficiaries, upload supporting verification documents, record aid disbursements, and inspect payment history"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
            icon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsRegisterModalOpen(true);
            }}
            aria-label="Register New Beneficiary Button"
          >
            + Register New Beneficiary
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Beneficiary</th>
                <th className="p-3">Emergency Need</th>
                <th className="p-3">Approved</th>
                <th className="p-3">Spent</th>
                <th className="p-3">Remaining</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {isLoadingBeneficiaries ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading beneficiary records...
                  </td>
                </tr>
              ) : beneficiaries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No beneficiaries registered yet. Click &quot;Register New Beneficiary&quot; to add one.
                  </td>
                </tr>
              ) : (
                beneficiaries.map((ben) => {
                  const approved = Number(ben.approved_amount || ben.estimated_cost || 0);
                  const spent = Number(ben.spent_amount || 0);
                  const remaining = Number(ben.remaining_amount ?? approved - spent);

                  let statusVariant: 'success' | 'warning' | 'info' | 'neutral' = 'info';
                  if (ben.status === 'FULLY_DISBURSED') statusVariant = 'success';
                  else if (ben.status === 'PARTIALLY_DISBURSED') statusVariant = 'warning';
                  else if (ben.status === 'APPROVED') statusVariant = 'info';

                  return (
                    <tr key={ben.id} className="hover:bg-slate-900/50">
                      <td className="p-3">
                        <div className="font-bold text-slate-100">
                          {ben.full_name || 'Anonymous Beneficiary'}
                        </div>
                        <div className="font-mono text-[11px] text-emerald-400">{ben.id}</div>
                      </td>
                      <td className="p-3 max-w-[200px] truncate text-slate-300">
                        {ben.emergency_need || ben.aid_required || ben.anonymized_summary}
                      </td>
                      <td className="p-3 font-extrabold text-emerald-400">
                        {formatCurrency(approved)}
                      </td>
                      <td className="p-3 font-extrabold text-amber-400">
                        {formatCurrency(spent)}
                      </td>
                      <td className="p-3 font-extrabold text-blue-400">
                        {formatCurrency(remaining)}
                      </td>
                      <td className="p-3">
                        <Badge variant={statusVariant}>{ben.status || 'REGISTERED'}</Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBeneficiary(ben);
                              setIsDocumentsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 cursor-pointer transition-colors"
                            title="Manage Documents"
                          >
                            <FileText className="w-3 h-3 text-emerald-400" />
                            Docs
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBeneficiary(ben);
                              setIsDisbursementModalOpen(true);
                            }}
                            disabled={remaining <= 0}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                              remaining <= 0
                                ? 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
                                : 'bg-emerald-950/60 hover:bg-emerald-900/80 border-emerald-500/40 text-emerald-300'
                            }`}
                            title="Record Aid Payment"
                          >
                            <CreditCard className="w-3 h-3" />
                            + Record Aid
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBeneficiary(ben);
                              setIsHistoryModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 cursor-pointer transition-colors"
                            title="Payment History"
                          >
                            <History className="w-3 h-3 text-blue-400" />
                            History
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ITEMIZED RELIEF EXPENSES TABLE */}
      <Card
        title="Itemized Relief Expenses"
        subtitle="Recorded field purchases anchored with receipt hashes and payment references"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
            icon={<Plus className="w-3.5 h-3.5 text-emerald-400" />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsSubmitExpenseModalOpen(true);
            }}
            aria-label="Submit Expense Card Button"
          >
            + Submit Expense
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Expense ID</th>
                <th className="p-3">Beneficiary</th>
                <th className="p-3">Category</th>
                <th className="p-3">Description</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment Method</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {isLoadingExpenses ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading relief expense records...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No relief expenses recorded yet. Click &quot;Submit Expense&quot; to log a field expense.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-mono font-bold text-emerald-400">{exp.id}</td>
                    <td className="p-3 font-mono text-slate-300">{exp.beneficiary_id}</td>
                    <td className="p-3">{exp.category}</td>
                    <td className="p-3 text-slate-300 max-w-[220px] truncate">{exp.description || exp.purpose}</td>
                    <td className="p-3 font-extrabold text-slate-100">{formatCurrency(exp.amount)}</td>
                    <td className="p-3 text-slate-400">{exp.payment_method || 'UPI'}</td>
                    <td className="p-3">
                      <Badge variant="success">{exp.status || 'APPROVED'} ✓</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL 1: REGISTER BENEFICIARY */}
      <RegisterBeneficiaryModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={() => handleRefreshData()}
      />

      {/* MODAL 2: SUBMIT RELIEF EXPENSE */}
      <SubmitExpenseModal
        isOpen={isSubmitExpenseModalOpen}
        onClose={() => setIsSubmitExpenseModalOpen(false)}
        beneficiaries={beneficiaries}
        onSuccess={() => handleRefreshData()}
      />

      {/* MODAL 3: BENEFICIARY DOCUMENTS */}
      {selectedBeneficiary && (
        <BeneficiaryDocumentsModal
          isOpen={isDocumentsModalOpen}
          onClose={() => {
            setIsDocumentsModalOpen(false);
            setSelectedBeneficiary(null);
          }}
          beneficiaryId={selectedBeneficiary.id}
          beneficiaryName={selectedBeneficiary.full_name || selectedBeneficiary.id}
        />
      )}

      {/* MODAL 4: RECORD AID PAYMENT */}
      {selectedBeneficiary && (
        <RecordAidPaymentModal
          isOpen={isDisbursementModalOpen}
          onClose={() => {
            setIsDisbursementModalOpen(false);
            setSelectedBeneficiary(null);
          }}
          beneficiary={selectedBeneficiary}
          onSuccess={() => handleRefreshData()}
        />
      )}

      {/* MODAL 5: PAYMENT HISTORY */}
      {selectedBeneficiary && (
        <PaymentHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setSelectedBeneficiary(null);
          }}
          beneficiaryId={selectedBeneficiary.id}
          beneficiaryName={selectedBeneficiary.full_name || selectedBeneficiary.id}
        />
      )}

      <EvidenceCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCaptureComplete={(ev: any) => {
          alert(`Evidence ${ev.id} captured and anchored successfully with SHA-256: ${ev.fileHash.substring(0, 16)}...`);
        }}
      />
    </div>
  );
}
