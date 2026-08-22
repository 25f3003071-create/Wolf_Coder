'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { QRCodeGenerator } from '@/components/ui/QRCodeGenerator';
import { authFetch } from '@/lib/auth/api-client';
import { formatCurrency } from '@/lib/utils/currency';
import { Smartphone, Building2, Banknote, Wallet, AlertTriangle, Copy, Check } from 'lucide-react';

interface RecordAidPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiary: any;
  onSuccess: (updatedBeneficiary: any, disbursement: any) => void;
}

const PAYMENT_METHODS: { id: 'UPI' | 'Bank Transfer' | 'Cash' | 'Crypto'; label: string; icon: React.ReactNode }[] = [
  { id: 'UPI', label: 'UPI QR', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'Bank Transfer', label: 'Bank Transfer', icon: <Building2 className="w-4 h-4" /> },
  { id: 'Cash', label: 'Cash / Voucher', icon: <Banknote className="w-4 h-4" /> },
  { id: 'Crypto', label: 'Crypto', icon: <Wallet className="w-4 h-4" /> },
];

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
  const upiUri = useMemo(() => `upi://pay?pa=${upiVpa}&pn=ReliefTrack%20Foundation&am=${amount}&tr=REF-${amount}-2026&cu=INR`, [amount]);

  const handleCopyUpi = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(upiVpa);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 1500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmt = Number(amount);
    if (!numericAmt || numericAmt <= 0) { setErrorMsg('Please enter a valid disbursement amount.'); return; }
    if (numericAmt > remainingBalance) { setErrorMsg(`Cannot disburse more than remaining approved amount (${formatCurrency(remainingBalance)}).`); return; }

    setIsSubmitting(true); setErrorMsg(null);
    try {
      const res = await authFetch(`/api/beneficiaries/${beneficiary.id}/disbursements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numericAmt, aidType, paymentMethod, paymentReference: paymentReference || `REF-2026-${Math.floor(100000 + Math.random() * 900000)}`, notes: notes || `Direct aid disbursement via ${paymentMethod}` }),
      });
      const data = await res.json();
      setIsSubmitting(false);
      if (!res.ok || !data.success || !data.beneficiary) throw new Error(data.error || 'Disbursement recording failed.');

      onSuccess(data.beneficiary, data.disbursement);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false); setErrorMsg(err.message || 'Failed to record disbursement.');
    }
  };

  const inputClass = "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Aid Disbursement" subtitle={`Disburse aid funds for ${beneficiary?.full_name || 'Beneficiary'} (${beneficiary?.id})`}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-semibold">
          <div className="p-1.5 rounded bg-slate-900"><p className="text-[10px] text-slate-400">Approved</p><p className="text-slate-200">{formatCurrency(approvedAmount)}</p></div>
          <div className="p-1.5 rounded bg-slate-900"><p className="text-[10px] text-slate-400">Disbursed</p><p className="text-sky-400">{formatCurrency(spentAmount)}</p></div>
          <div className="p-1.5 rounded bg-slate-900"><p className="text-[10px] text-slate-400">Remaining</p><p className="text-emerald-400">{formatCurrency(remainingBalance)}</p></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="block font-semibold text-slate-300 mb-1">Disbursement Amount (₹) *</label><input type="number" required min="1" max={remainingBalance} value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} /></div>
          <div><label className="block font-semibold text-slate-300 mb-1">Aid Category *</label><input type="text" required value={aidType} onChange={(e) => setAidType(e.target.value)} placeholder="Hospital Surgery Advance" className={inputClass} /></div>
          <div><label className="block font-semibold text-slate-300 mb-1">Payment Reference / UTR</label><input type="text" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="UTR-991208129" className={inputClass} /></div>
          <div><label className="block font-semibold text-slate-300 mb-1">Date *</label><input type="date" required value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className={inputClass} /></div>
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">Payment Method *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)} className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 font-bold ${paymentMethod === m.id ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                {m.icon}<span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === 'UPI' && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="p-1 rounded bg-slate-900 border border-slate-800">
              <QRCodeGenerator value={upiUri} size={90} />
            </div>
            <div className="text-right font-mono">
              <Badge variant="success">UPI Active</Badge>
              <div className="flex items-center gap-1 font-bold text-emerald-400 mt-1">
                <span>{upiVpa}</span>
                <button type="button" onClick={handleCopyUpi}>
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>
        )}

        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Audit Notes / Directives..." className={inputClass} />

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>{isSubmitting ? 'Recording...' : 'Confirm Aid Disbursement'}</Button>
        </div>
      </form>
    </Modal>
  );
};
