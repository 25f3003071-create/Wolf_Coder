'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { QRCodeGenerator } from '@/components/ui/QRCodeGenerator';
import { authFetch } from '@/lib/auth/api-client';
import { formatCurrency } from '@/lib/utils/currency';
import { Smartphone, Building2, Banknote, Wallet, AlertTriangle, CheckCircle2, FileText, X, Upload } from 'lucide-react';

interface SubmitExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiaries: any[];
  onSuccess: (updatedBeneficiary: any, expenseRecord: any) => void;
}

const PAYMENT_METHODS: { id: 'UPI' | 'Bank Transfer' | 'Cash' | 'Crypto'; label: string; icon: React.ReactNode }[] = [
  { id: 'UPI', label: 'UPI QR', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'Bank Transfer', label: 'Bank Transfer', icon: <Building2 className="w-4 h-4" /> },
  { id: 'Cash', label: 'Cash / Voucher', icon: <Banknote className="w-4 h-4" /> },
  { id: 'Crypto', label: 'Crypto', icon: <Wallet className="w-4 h-4" /> },
];

export const SubmitExpenseModal: React.FC<SubmitExpenseModalProps> = ({
  isOpen,
  onClose,
  beneficiaries,
  onSuccess,
}) => {
  const [selectedBenId, setSelectedBenId] = useState<string>(beneficiaries.length > 0 ? beneficiaries[0].id : '');
  const [expenseCategory, setExpenseCategory] = useState('Medical Treatment');
  const [amount, setAmount] = useState('5000');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('Surgical supplies and physician fees');
  const [vendorName, setVendorName] = useState('XYZ Super Specialty Hospital');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash' | 'Crypto'>('UPI');
  const [paymentReference, setPaymentReference] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentBeneficiary = useMemo(() => beneficiaries.find((b) => b.id === selectedBenId) || beneficiaries[0] || null, [beneficiaries, selectedBenId]);
  const approvedAmount = Number(currentBeneficiary?.approved_amount || currentBeneficiary?.estimated_cost || 0);
  const spentAmount = Number(currentBeneficiary?.spent_amount || 0);
  const remainingBalance = approvedAmount - spentAmount;

  const upiVpa = 'relieftrack@demo';
  const upiUri = useMemo(() => `upi://pay?pa=${upiVpa}&pn=ReliefTrack%20Foundation&am=${amount}&tr=REF-${amount}-2026&cu=INR`, [amount]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { setErrorMsg('FILE SIZE EXCEEDED: File size cannot exceed 10 MB.'); return; }
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) { setErrorMsg('INVALID FILE TYPE: Allowed formats are PDF, JPG, JPEG, and PNG.'); return; }
      setReceiptFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmt = Number(amount);
    if (!currentBeneficiary || !numericAmt || numericAmt <= 0 || numericAmt > remainingBalance || !description.trim()) {
      setErrorMsg('Please complete all required fields correctly and verify aid budget ceiling.');
      return;
    }

    setIsSubmitting(true); setErrorMsg(null); setSuccessMsg(null);
    try {
      const res = await authFetch(`/api/beneficiaries/${currentBeneficiary.id}/disbursements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numericAmt, aidType: expenseCategory, paymentMethod, paymentReference: paymentReference || `REF-EXP-${Math.floor(100000 + Math.random() * 900000)}`, notes: `${description}${vendorName ? ` (Vendor: ${vendorName})` : ''}`, receiptDocumentUrl: receiptFile ? `documents/${receiptFile.name}` : undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.beneficiary) throw new Error(data.error || 'Failed to submit expense record.');

      setIsSubmitting(false); setSuccessMsg(`Itemized expense recorded successfully — ₹${amount}`);
      setTimeout(() => { onSuccess(data.beneficiary, data.expense || data.disbursement); onClose(); setSuccessMsg(null); setReceiptFile(null); }, 1200);
    } catch (err: any) {
      setIsSubmitting(false); setErrorMsg(err.message || 'Failed to submit expense record.');
    }
  };

  const inputClass = "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Itemized Relief Expense" subtitle="Record itemized relief expense, attach receipt evidence, and update remaining balance.">
      {successMsg ? (
        <div className="py-6 text-center space-y-3"><div className="p-3.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block"><CheckCircle2 className="w-10 h-10" /></div><h3 className="text-xl font-bold text-slate-100">{successMsg}</h3></div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" /><p>{errorMsg}</p></div>}

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="block font-bold text-slate-300 uppercase">Target Beneficiary Case *</label>
            <select value={selectedBenId} onChange={(e) => setSelectedBenId(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg font-bold text-emerald-400">
              {beneficiaries.map((b) => <option key={b.id} value={b.id}>{b.id} — {b.full_name || 'Anonymous'} ({b.emergency_need || b.aid_category || 'Medical Aid'})</option>)}
            </select>
            {currentBeneficiary && (
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center font-semibold">
                <div className="p-1.5 rounded bg-slate-900"><p className="text-[10px] text-slate-400">Approved</p><p className="text-slate-200">{formatCurrency(approvedAmount)}</p></div>
                <div className="p-1.5 rounded bg-slate-900"><p className="text-[10px] text-slate-400">Spent</p><p className="text-sky-400">{formatCurrency(spentAmount)}</p></div>
                <div className="p-1.5 rounded bg-slate-900"><p className="text-[10px] text-slate-400">Remaining</p><p className="text-emerald-400">{formatCurrency(remainingBalance)}</p></div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block font-semibold text-slate-300 mb-1">Expense Category *</label><select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} className={inputClass}><option value="Medical Treatment">Medical Treatment</option><option value="Medicines & ICU Diagnostics">Medicines & ICU Diagnostics</option><option value="Emergency Food Relief Supply">Emergency Food Relief</option></select></div>
            <div><label className="block font-semibold text-slate-300 mb-1">Amount (₹) *</label><input type="number" required min="1" max={remainingBalance} value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} /></div>
            <div><label className="block font-semibold text-slate-300 mb-1">Date *</label><input type="date" required value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className={inputClass} /></div>
            <div><label className="block font-semibold text-slate-300 mb-1">Vendor / Hospital</label><input type="text" value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="XYZ Super Specialty Hospital" className={inputClass} /></div>
          </div>

          <textarea rows={2} required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Expense Purpose / Item Description *" className={inputClass} />

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
              <div className="p-1 rounded bg-slate-900 border border-slate-800"><QRCodeGenerator value={upiUri} size={90} /></div>
              <div className="text-right font-mono"><Badge variant="success">UPI Active</Badge><p className="text-emerald-400 font-bold mt-1">{upiVpa}</p></div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            {receiptFile ? (
              <div className="flex items-center gap-2 truncate"><FileText className="w-4 h-4 text-emerald-400 shrink-0" /><span className="font-semibold text-slate-200 truncate">{receiptFile.name}</span><button type="button" onClick={() => setReceiptFile(null)}><X className="w-4 h-4 text-rose-400" /></button></div>
            ) : (
              <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-emerald-400 font-bold"><Upload className="w-4 h-4" /> Select Invoice / Bill<input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" /></label>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
            <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Expense'}</Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
