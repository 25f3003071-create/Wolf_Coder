'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { QRCodeGenerator } from '@/components/ui/QRCodeGenerator';
import { authFetch } from '@/lib/auth/api-client';
import { formatCurrency } from '@/lib/utils/currency';
import {
  Smartphone,
  Building2,
  Banknote,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react';

interface RecordAidPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiary: any;
  onSuccess: (updatedBeneficiary: any, disbursement: any) => void;
}

export const RecordAidPaymentModal: React.FC<RecordAidPaymentModalProps> = ({
  isOpen,
  onClose,
  beneficiary,
  onSuccess,
}) => {
  const [amount, setAmount] = useState('10000');
  const [aidType, setAidType] = useState('Hospital Surgery Advance');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash' | 'Crypto'>('UPI');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const approvedAmount = Number(beneficiary?.approved_amount || beneficiary?.estimated_cost || 0);
  const spentAmount = Number(beneficiary?.spent_amount || 0);
  const remainingBalance = approvedAmount - spentAmount;

  const upiVpa = 'relieftrack@demo';
  const upiUri = useMemo(() => {
    return `upi://pay?pa=${upiVpa}&pn=ReliefTrack%20Foundation&am=${amount}&tr=REF-${amount}-2026&cu=INR`;
  }, [amount]);

  const handleCopyUpi = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(upiVpa);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const isFormValid = () => {
    const numericAmt = Number(amount);
    if (!numericAmt || numericAmt <= 0) return false;
    if (numericAmt > remainingBalance) return false;
    if (!aidType.trim()) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmt = Number(amount);

    if (!numericAmt || numericAmt <= 0) {
      setErrorMsg('Please enter a valid disbursement amount.');
      return;
    }

    // SERVER-SIDE FINANCIAL VALIDATION REJECTION ON CLIENT BEFORE SUBMIT
    if (numericAmt > remainingBalance) {
      setErrorMsg(`Cannot disburse more than remaining approved amount (${formatCurrency(remainingBalance)}).`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await authFetch(`/api/beneficiaries/${beneficiary.id}/disbursements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmt,
          aidType,
          paymentMethod,
          paymentReference: paymentReference || `REF-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentDate,
          notes,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success || !data.disbursement) {
        throw new Error(data.error || 'Failed to record aid payment.');
      }

      onSuccess(data.beneficiary, data.disbursement);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to record aid payment.');
    }
  };

  if (!beneficiary) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Aid Payment" subtitle={`Disburse approved funds to ${beneficiary.full_name || beneficiary.id}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* FINANCIAL SUMMARY BANNER */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Requested</p>
            <p className="font-extrabold text-slate-200">{formatCurrency(beneficiary.requested_amount || beneficiary.estimated_cost || 0)}</p>
          </div>
          <div>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Approved</p>
            <p className="font-extrabold text-emerald-400">{formatCurrency(approvedAmount)}</p>
          </div>
          <div>
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Spent</p>
            <p className="font-extrabold text-amber-400">{formatCurrency(spentAmount)}</p>
          </div>
          <div>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Available Balance</p>
            <p className="font-extrabold text-blue-400">{formatCurrency(remainingBalance)}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* INPUT FIELDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Amount Given (₹) *</label>
            <input
              type="number"
              required
              min="1"
              max={remainingBalance}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="10000"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            {Number(amount) > remainingBalance && (
              <p className="text-[10px] text-rose-400 mt-1 font-semibold">
                Exceeds remaining approved amount ({formatCurrency(remainingBalance)})!
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Aid Type *</label>
            <input
              type="text"
              required
              value={aidType}
              onChange={(e) => setAidType(e.target.value)}
              placeholder="e.g. Hospital Surgery Advance"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* PAYMENT METHOD SELECTOR */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Payment Method *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('UPI')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                paymentMethod === 'UPI'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-xs font-bold">UPI</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('Bank Transfer')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                paymentMethod === 'Bank Transfer'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span className="text-xs font-bold">Bank Transfer</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('Cash')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                paymentMethod === 'Cash'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span className="text-xs font-bold">Cash</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('Crypto')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                paymentMethod === 'Crypto'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-bold">Crypto</span>
            </button>
          </div>
        </div>

        {/* PAYMENT BEHAVIOR & SIMULATION DETAILS */}
        {paymentMethod === 'UPI' && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-center">
            <Badge variant="success" className="text-[10px]">
              <QrCode className="w-3 h-3 mr-1 inline" /> Dynamic UPI QR Code
            </Badge>
            <div className="flex justify-center">
              <QRCodeGenerator value={upiUri} size={120} />
            </div>
            <p className="text-xs text-slate-300">
              UPI ID: <code className="font-mono text-emerald-400 font-bold px-1 py-0.5 rounded bg-slate-900">{upiVpa}</code>
            </p>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-[11px] font-bold text-slate-300 border border-slate-800"
            >
              {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedUpi ? 'Copied' : 'Copy UPI ID'}
            </button>
          </div>
        )}

        {paymentMethod === 'Bank Transfer' && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Target Bank</span>
              <span className="font-bold text-slate-200">HDFC Bank — Direct Vendor Account</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Account Reference</span>
              <span className="font-mono text-slate-200">XXXX-XXXX-9910</span>
            </div>
          </div>
        )}

        {paymentMethod === 'Cash' && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Disbursement Type</span>
              <span className="font-bold text-emerald-400">Physical Cash Handover</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Requires field officer voucher signature and physical recipient receipt copy upload.
            </p>
          </div>
        )}

        {paymentMethod === 'Crypto' && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Network</span>
              <span className="font-bold text-slate-200">Ethereum Sepolia Testnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Wallet</span>
              <span className="font-mono text-emerald-400">0x71C7...976F</span>
            </div>
          </div>
        )}

        {/* REFERENCE & NOTES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Reference</label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="e.g. UTR-9918230192"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Expense Purpose</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Transfer to hospital pharmacy for ICU medications..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>DEVELOPMENT / SIMULATION MODE — Generates server-side <code>AID-2026-XXXXXX</code> disbursement record and updates DB spent &amp; remaining balance.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
            CANCEL
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={isSubmitting || !isFormValid()}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            RECORD AID PAYMENT
          </Button>
        </div>
      </form>
    </Modal>
  );
};
