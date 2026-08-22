'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';
import { CreditCard, Building2, Wallet, Smartphone, CheckCircle2, AlertTriangle, Receipt, ArrowRight } from 'lucide-react';
import { useDonationPayment, PaymentMethod } from './hooks/useDonationPayment';
import { UpiPaymentTab, CardPaymentTab, NetbankingPaymentTab, CryptoPaymentTab } from './subcomponents/PaymentTabViews';

interface DonationPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  onSuccess?: (receipt: any) => void;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'upi', label: 'UPI', icon: <Smartphone className="w-5 h-5" /> },
  { id: 'card', label: 'Card', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'netbanking', label: 'Net Banking', icon: <Building2 className="w-5 h-5" /> },
  { id: 'crypto', label: 'Crypto', icon: <Wallet className="w-5 h-5" /> },
];

export const DonationPaymentModal: React.FC<DonationPaymentModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
  amount,
  onSuccess,
}) => {
  const router = useRouter();
  const payment = useDonationPayment({ campaignId, amount, onSuccess, onClose });

  return (
    <Modal isOpen={isOpen} onClose={payment.handleCloseModal} title="Complete Donation" subtitle="Select your preferred payment method">
      <div className="space-y-5">
        {payment.successReceipt ? (
          <div className="space-y-5 text-center py-2">
            <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block"><CheckCircle2 className="w-10 h-10" /></div>
            <div>
              <Badge variant="success" className="mb-1">Payment Confirmed (Simulation) ✓</Badge>
              <h3 className="text-xl font-black text-slate-100">Donation Successful</h3>
              <p className="text-xs text-slate-400 mt-0.5">Your contribution has been recorded with tracking receipt generation.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-left text-xs">
              <div className="flex justify-between pb-1.5 border-b border-slate-800"><span className="text-slate-400">Receipt ID</span><span className="font-mono font-bold text-emerald-400">{payment.successReceipt.id}</span></div>
              <div className="flex justify-between pb-1.5 border-b border-slate-800"><span className="text-slate-400">Amount Paid</span><span className="font-extrabold text-slate-100">{formatCurrency(amount)}</span></div>
              <div className="flex justify-between pb-1.5 border-b border-slate-800"><span className="text-slate-400">Campaign</span><span className="font-semibold text-slate-200 truncate max-w-[200px]">{campaignTitle}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Blockchain Hash</span><span className="font-mono text-[10px] text-slate-300 truncate max-w-[180px]">{payment.successReceipt.blockchain_tx_hash || 'SIMULATED-0x8a729...'}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button variant="primary" size="md" className="w-full" icon={<Receipt className="w-4 h-4" />} onClick={() => { onClose(); router.push(`/track/${payment.successReceipt.id}`); }}>Track Donation</Button>
              <Button variant="outline" size="md" className="w-full" onClick={payment.handleCloseModal}>Close</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div><p className="text-[10px] text-emerald-400 uppercase font-bold">Campaign</p><p className="text-xs font-bold text-slate-100 truncate max-w-[220px]">{campaignTitle}</p></div>
              <div className="text-right"><p className="text-[10px] text-slate-400 uppercase font-bold">Total</p><p className="text-base font-black text-emerald-400">{formatCurrency(amount)}</p></div>
            </div>

            {payment.errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <p>{payment.errorMsg}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">Choose Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button key={method.id} type="button" onClick={() => { payment.setPaymentMethod(method.id); payment.setErrorMsg(null); }} className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${payment.paymentMethod === method.id ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/50' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                    {method.icon}<span className="text-xs font-bold">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {payment.paymentMethod === 'upi' && <UpiPaymentTab upiUri={payment.upiUri} upiVpa={payment.upiVpa} copiedUpi={payment.copiedUpi} onCopy={payment.handleCopyUpiId} />}
            {payment.paymentMethod === 'card' && <CardPaymentTab cardHolder={payment.cardHolder} setCardHolder={payment.setCardHolder} cardNumber={payment.cardNumber} setCardNumber={payment.setCardNumber} cardExpiry={payment.cardExpiry} setCardExpiry={payment.setCardExpiry} cardCvv={payment.cardCvv} setCardCvv={payment.setCardCvv} />}
            {payment.paymentMethod === 'netbanking' && <NetbankingPaymentTab selectedBank={payment.selectedBank} setSelectedBank={payment.setSelectedBank} />}
            {payment.paymentMethod === 'crypto' && <CryptoPaymentTab connectedWallet={payment.connectedWallet} setConnectedWallet={payment.setConnectedWallet} selectedChain={payment.selectedChain} setSelectedChain={payment.setSelectedChain} />}

            <div className="flex items-center gap-3 pt-1">
              <Button type="button" variant="outline" size="md" className="w-1/3" onClick={payment.handleCloseModal} disabled={payment.isProcessing}>Cancel</Button>
              <Button type="button" variant="primary" size="md" className="w-2/3" icon={payment.isProcessing ? undefined : <ArrowRight className="w-4 h-4" />} onClick={payment.handleProcessPayment} disabled={payment.isProcessing}>
                {payment.isProcessing ? 'Processing...' : `Donate ${formatCurrency(amount)}`}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
