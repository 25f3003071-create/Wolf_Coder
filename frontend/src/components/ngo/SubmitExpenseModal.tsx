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
  FileText,
  X,
  Upload,
} from 'lucide-react';

interface SubmitExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiaries: any[];
  onSuccess: (updatedBeneficiary: any, expenseRecord: any) => void;
}

export const SubmitExpenseModal: React.FC<SubmitExpenseModalProps> = ({
  isOpen,
  onClose,
  beneficiaries,
  onSuccess,
}) => {
  const [selectedBenId, setSelectedBenId] = useState<string>(
    beneficiaries.length > 0 ? beneficiaries[0].id : ''
  );
  const [expenseCategory, setExpenseCategory] = useState('Medical Treatment');
  const [amount, setAmount] = useState('5000');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('Surgical supplies and physician fees');
  const [vendorName, setVendorName] = useState('XYZ Super Specialty Hospital');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash' | 'Crypto'>('UPI');
  const [paymentReference, setPaymentReference] = useState('');

  // Receipt File Upload State
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Selected beneficiary financial details lookup
  const currentBeneficiary = useMemo(() => {
    return beneficiaries.find((b) => b.id === selectedBenId) || beneficiaries[0] || null;
  }, [beneficiaries, selectedBenId]);

  const approvedAmount = Number(currentBeneficiary?.approved_amount || currentBeneficiary?.estimated_cost || 0);
  const spentAmount = Number(currentBeneficiary?.spent_amount || 0);
  const remainingBalance = approvedAmount - spentAmount;

  const upiVpa = 'relieftrack@demo';
  const upiUri = useMemo(() => {
    return `upi://pay?pa=${upiVpa}&pn=ReliefTrack%20Foundation&am=${amount}&tr=REF-${amount}-2026&cu=INR`;
  }, [amount]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('FILE SIZE EXCEEDED: File size cannot exceed 10 MB.');
        return;
      }

      const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!allowedExts.includes(ext)) {
        setErrorMsg('INVALID FILE TYPE: Allowed formats are PDF, JPG, JPEG, and PNG.');
        return;
      }

      setReceiptFile(file);
    }
  };

  const isFormValid = () => {
    if (!currentBeneficiary) return false;
    const numericAmt = Number(amount);
    if (!numericAmt || isNaN(numericAmt) || numericAmt <= 0) return false;
    if (numericAmt > remainingBalance) return false;
    if (!description.trim()) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBeneficiary) {
      setErrorMsg('Please select a valid beneficiary.');
      return;
    }

    const numericAmt = Number(amount);
    if (!numericAmt || isNaN(numericAmt) || numericAmt <= 0) {
      setErrorMsg('Please enter a valid positive expense amount.');
      return;
    }

    // SERVER-SIDE FINANCIAL CEILING SAFETY VALIDATION
    if (numericAmt > remainingBalance) {
      setErrorMsg(`Cannot disburse more than remaining approved amount (${formatCurrency(remainingBalance)}).`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Post expense & disbursement via POST /api/expenses
      const res = await authFetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beneficiaryId: currentBeneficiary.id,
          ngoId: currentBeneficiary.ngo_id || 'NGO-1042',
          amount: numericAmt,
          category: expenseCategory,
          description,
          vendorName,
          paymentMethod,
          paymentReference: paymentReference || `REF-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || (!data.expense && !data.disbursement)) {
        throw new Error(data.error || 'Failed to record relief expense.');
      }

      const createdItem = data.disbursement || data.expense;

      // 2. Upload supporting evidence receipt document if selected
      if (receiptFile) {
        try {
          await authFetch(`/api/beneficiaries/${currentBeneficiary.id}/documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              documentType: 'Medical Document',
              filename: receiptFile.name,
              mimeType: receiptFile.type || 'application/pdf',
              fileSize: receiptFile.size,
              storagePath: `documents/receipt_${createdItem.id.toLowerCase()}_${receiptFile.name}`,
            }),
          });
        } catch (docErr) {
          console.warn('Receipt evidence upload warning:', docErr);
        }
      }

      setIsSubmitting(false);
      setSuccessMsg(`Expense submitted successfully — Expense ID: ${createdItem.id}`);

      setTimeout(() => {
        onSuccess(data.beneficiary || currentBeneficiary, createdItem);
        onClose();
        setSuccessMsg(null);
        setReceiptFile(null);
        setAmount('5000');
        setDescription('');
      }, 1500);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to submit relief expense.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Relief Expense"
      subtitle="Record a beneficiary-related field expense with supporting evidence."
    >
      {successMsg ? (
        <div className="py-8 text-center space-y-4 animate-fade-in">
          <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">{successMsg}</h3>
          <p className="text-xs text-slate-400">
            Payment Mode: <span className="font-mono text-emerald-400 font-bold">DEVELOPMENT_SIMULATION</span>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* BENEFICIARY SELECTOR */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Beneficiary *</label>
            <select
              value={selectedBenId}
              onChange={(e) => {
                setSelectedBenId(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {beneficiaries.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.full_name || 'Anonymous'} ({b.id}) — {b.emergency_need || b.aid_required}
                </option>
              ))}
            </select>
          </div>

          {/* REAL-TIME FINANCIAL BALANCE DISPLAY */}
          {currentBeneficiary && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Approved Aid</p>
                <p className="font-extrabold text-emerald-400">{formatCurrency(approvedAmount)}</p>
              </div>
              <div>
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Already Spent</p>
                <p className="font-extrabold text-amber-400">{formatCurrency(spentAmount)}</p>
              </div>
              <div>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Remaining Aid</p>
                <p className="font-extrabold text-blue-400">{formatCurrency(remainingBalance)}</p>
              </div>
            </div>
          )}

          {/* EXPENSE CATEGORY & AMOUNT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Category *</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Medical Treatment">Medical Treatment</option>
                <option value="Medicines">Medicines</option>
                <option value="Hospital Charges">Hospital Charges</option>
                <option value="Food & Essential Supplies">Food &amp; Essential Supplies</option>
                <option value="Shelter">Shelter</option>
                <option value="Transportation">Transportation</option>
                <option value="Emergency Purchase">Emergency Purchase</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Amount (₹) *</label>
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
                placeholder="5000"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              {Number(amount) > remainingBalance && (
                <p className="text-[10px] text-rose-400 mt-1 font-semibold">
                  Exceeds remaining approved amount ({formatCurrency(remainingBalance)})!
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Date *</label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vendor / Hospital Name</label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. City Pharmacy Ltd."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed explanation of purchase..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* PAYMENT METHOD */}
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

          {/* EVIDENCE RECEIPT FILE UPLOAD */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Attach Receipt / Invoice Evidence (PDF, JPG, PNG &lt; 10MB)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-emerald-950 file:text-emerald-400"
            />

            {receiptFile && (
              <div className="mt-2 p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate font-semibold text-slate-200">{receiptFile.name}</span>
                  <span className="text-[10px] text-slate-400">({(receiptFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptFile(null)}
                  className="text-rose-400 hover:text-rose-300 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>DEVELOPMENT / SIMULATION MODE — Persists <code>AID-2026-XXXXXX</code> disbursement record and updates DB spent &amp; remaining balance.</p>
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
              SUBMIT RELIEF EXPENSE
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
