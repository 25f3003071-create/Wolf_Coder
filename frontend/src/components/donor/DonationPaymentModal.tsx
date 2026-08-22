'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { QRCodeGenerator } from '@/components/ui/QRCodeGenerator';
import { authFetch } from '@/lib/auth/api-client';
import { formatCurrency } from '@/lib/utils/currency';
import {
  CreditCard,
  Building2,
  Wallet,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Receipt,
  Globe,
  ArrowLeft,
  Copy,
  Check,
  QrCode,
  Lock,
} from 'lucide-react';

interface DonationPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  onSuccess?: (receipt: any) => void;
}

export const DonationPaymentModal: React.FC<DonationPaymentModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
  amount,
  onSuccess,
}) => {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'crypto'>('upi');

  // 1. UPI State & Copy
  const [copiedUpi, setCopiedUpi] = useState(false);
  const upiVpa = 'relieftrack@demo';

  // Dynamic simulated UPI URI encoding donation amount and reference
  const upiUri = useMemo(() => {
    return `upi://pay?pa=${upiVpa}&pn=ReliefTrack%20Foundation&am=${amount}&tr=REF-${amount}-2026&cu=INR`;
  }, [amount]);

  // 2. Card State
  const [cardHolder, setCardHolder] = useState('Rahul Sharma');
  const [cardNumber, setCardNumber] = useState('4532 8891 2049 8891');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('891'); // CVV is local component state ONLY, never sent to server

  // 3. Netbanking State
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // 4. Crypto State
  const [connectedWallet, setConnectedWallet] = useState('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  const [selectedChain, setSelectedChain] = useState<'sepolia' | 'amoy'>('sepolia');

  // Processing & Result State
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);

  const handleCopyUpiId = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(upiVpa);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  // Method-Specific Form Validation Check
  const isFormValid = () => {
    if (amount <= 0) return false;
    if (paymentMethod === 'upi') {
      return true; // Dynamic QR generated for valid amount
    }
    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      return (
        cardHolder.trim().length >= 2 &&
        cleanCard.length >= 12 &&
        cardExpiry.trim().length >= 4 &&
        cardCvv.trim().length >= 3
      );
    }
    if (paymentMethod === 'netbanking') {
      return selectedBank.trim().length > 0;
    }
    if (paymentMethod === 'crypto') {
      return connectedWallet.trim().length >= 10;
    }
    return false;
  };

  const handleProcessPayment = async () => {
    if (!isFormValid()) {
      setErrorMsg('Please complete all required payment inputs correctly.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // SECURITY: CVV is NEVER included in API payload
      const res = await authFetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaignId || 'CMP-2026-0192',
          amount: Number(amount),
          paymentMethod,
          paymentDetails: {
            upiVpa: paymentMethod === 'upi' ? upiVpa : undefined,
            upiUri: paymentMethod === 'upi' ? upiUri : undefined,
            cardHolder: paymentMethod === 'card' ? cardHolder : undefined,
            cardNumberMasked: paymentMethod === 'card' ? `•••• ${cardNumber.slice(-4)}` : undefined,
            bank: paymentMethod === 'netbanking' ? selectedBank : undefined,
            chain: paymentMethod === 'crypto' ? selectedChain : undefined,
            walletAddress: paymentMethod === 'crypto' ? connectedWallet : undefined,
          },
          walletAddress: paymentMethod === 'crypto' ? connectedWallet : undefined,
          chain: selectedChain,
        }),
      });

      const data = await res.json();
      setIsProcessing(false);

      if (!res.ok || !data.success || !data.receipt) {
        throw new Error(data.error || 'Payment processing failed. Please try again.');
      }

      setSuccessReceipt(data.receipt);
      if (onSuccess) {
        onSuccess(data.receipt);
      }
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Payment failed. Please check inputs and retry.');
    }
  };

  const handleTrackNavigation = () => {
    if (successReceipt?.id) {
      onClose();
      router.push(`/track/${successReceipt.id}`);
    }
  };

  const handleCloseModal = () => {
    setSuccessReceipt(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="Complete Donation" subtitle="Select your preferred payment method">
      <div className="space-y-6">
        {/* SUCCESS VIEW */}
        {successReceipt ? (
          <div className="space-y-6 text-center py-2 animate-fade-in">
            <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <Badge variant="success" className="mb-2">Payment Confirmed (Simulation) ✓</Badge>
              <h3 className="text-2xl font-black text-slate-100">Donation Successful</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your contribution has been recorded and anchored with tracking receipt generation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-left text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Receipt ID</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{successReceipt.id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Amount Paid</span>
                <span className="font-extrabold text-slate-100">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Target Campaign</span>
                <span className="font-semibold text-slate-200 truncate max-w-[200px]">{campaignTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Blockchain Hash</span>
                <span className="font-mono text-[10px] text-slate-300 truncate max-w-[180px]">
                  {successReceipt.blockchain_tx_hash || 'SIMULATED-0x8a7291bc...'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                icon={<Receipt className="w-4 h-4" />}
                onClick={handleTrackNavigation}
              >
                Track Donation
              </Button>
              <Button variant="outline" size="md" className="w-full" onClick={handleCloseModal}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          /* PAYMENT METHOD SELECTION & DYNAMIC CONTENT FORM */
          <>
            {/* CAMPAIGN & AMOUNT SUMMARY */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Target Campaign</p>
                <p className="text-xs font-bold text-slate-100 truncate max-w-[220px] sm:max-w-[280px]">{campaignTitle}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Amount</p>
                <p className="text-lg font-black text-emerald-400">{formatCurrency(amount)}</p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <p>{errorMsg}</p>
              </div>
            )}

            {/* PAYMENT METHOD SELECTOR TABS */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Choose Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('upi'); setErrorMsg(null); }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs font-bold">UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentMethod('card'); setErrorMsg(null); }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-bold">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentMethod('netbanking'); setErrorMsg(null); }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="text-xs font-bold">Net Banking</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentMethod('crypto'); setErrorMsg(null); }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'crypto'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                  <span className="text-xs font-bold">Crypto</span>
                </button>
              </div>
            </div>

            {/* DYNAMIC CONTENT: 1. UPI QR FLOW */}
            {paymentMethod === 'upi' && (
              <div className="space-y-4 animate-fade-in text-center">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-3">
                  <Badge variant="success" className="mb-1">
                    <QrCode className="w-3 h-3 mr-1 inline" /> Scan with any UPI app
                  </Badge>
                  
                  {/* Dynamic Scalable QR Code Generator */}
                  <QRCodeGenerator value={upiUri} size={150} />

                  <div className="text-center space-y-1.5 pt-1">
                    <p className="text-xs font-semibold text-slate-300">
                      UPI ID: <code className="font-mono text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">{upiVpa}</code>
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyUpiId}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 transition-colors"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      {copiedUpi ? 'Copied UPI ID' : 'Copy UPI ID'}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2 text-left">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>DEVELOPMENT / SIMULATION MODE — No real payment will be charged.</p>
                </div>
              </div>
            )}

            {/* DYNAMIC CONTENT: 2. CARD FLOW */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Rahul Sharma"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4532 8891 2049 8891"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">CVV Security Code</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>DEVELOPMENT / SIMULATION MODE: CVV remains local and is NEVER sent to backend or stored.</p>
                </div>
              </div>
            )}

            {/* DYNAMIC CONTENT: 3. NET BANKING FLOW */}
            {paymentMethod === 'netbanking' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Search & Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Bank Portal</span>
                    <span className="font-bold text-slate-200">{selectedBank}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Simulation Status</span>
                    <Badge variant="info" className="text-[10px]">Secure Net Banking Simulation</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    No actual bank passwords, PINs, or credentials required for evaluation.
                  </p>
                </div>
              </div>
            )}

            {/* DYNAMIC CONTENT: 4. CRYPTO / WEB3 FLOW */}
            {paymentMethod === 'crypto' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Connected Wallet</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {connectedWallet ? `${connectedWallet.substring(0, 8)}...${connectedWallet.substring(connectedWallet.length - 4)}` : 'Not Connected'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Target Network</span>
                    <span className="flex items-center gap-1 font-bold text-slate-200">
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      {selectedChain === 'sepolia' ? 'Ethereum Sepolia' : 'Polygon Amoy'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedChain('sepolia')}
                    className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${
                      selectedChain === 'sepolia'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Ethereum Sepolia
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChain('amoy')}
                    className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${
                      selectedChain === 'amoy'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Polygon Amoy
                  </button>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS: BACK & CONFIRM PAYMENT */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleCloseModal}
                disabled={isProcessing}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                BACK
              </Button>

              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isProcessing}
                disabled={isProcessing || !isFormValid()}
                onClick={handleProcessPayment}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {paymentMethod === 'crypto' ? 'CONFIRM TRANSACTION' : 'CONFIRM PAYMENT'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
