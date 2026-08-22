import { useState, useMemo } from 'react';
import { authFetch } from '@/lib/auth/api-client';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'crypto';

interface UseDonationPaymentOptions {
  campaignId: string;
  amount: number;
  onSuccess?: (receipt: any) => void;
  onClose: () => void;
}

export function useDonationPayment({ campaignId, amount, onSuccess, onClose }: UseDonationPaymentOptions) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const upiVpa = 'relieftrack@demo';
  const upiUri = useMemo(() => `upi://pay?pa=${upiVpa}&pn=ReliefTrack%20Foundation&am=${amount}&tr=REF-${amount}-2026&cu=INR`, [amount]);

  const [cardHolder, setCardHolder] = useState('Rahul Sharma');
  const [cardNumber, setCardNumber] = useState('4532 8891 2049 8891');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('891');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [connectedWallet, setConnectedWallet] = useState('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  const [selectedChain, setSelectedChain] = useState<'sepolia' | 'amoy'>('sepolia');
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

  const isFormValid = () => {
    if (amount <= 0) return false;
    if (paymentMethod === 'upi') return true;
    if (paymentMethod === 'card') return cardHolder.trim().length >= 2 && cardNumber.replace(/\s/g, '').length >= 12 && cardExpiry.trim().length >= 4 && cardCvv.trim().length >= 3;
    if (paymentMethod === 'netbanking') return selectedBank.trim().length > 0;
    if (paymentMethod === 'crypto') return connectedWallet.trim().length >= 10;
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
      if (!res.ok || !data.success || !data.receipt) throw new Error(data.error || 'Payment processing failed.');
      setSuccessReceipt(data.receipt);
      if (onSuccess) onSuccess(data.receipt);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Payment failed. Please retry.');
    }
  };

  const handleCloseModal = () => {
    setSuccessReceipt(null);
    setErrorMsg(null);
    onClose();
  };

  return {
    paymentMethod, setPaymentMethod,
    copiedUpi, upiVpa, upiUri, handleCopyUpiId,
    cardHolder, setCardHolder, cardNumber, setCardNumber, cardExpiry, setCardExpiry, cardCvv, setCardCvv,
    selectedBank, setSelectedBank, connectedWallet, setConnectedWallet, selectedChain, setSelectedChain,
    isProcessing, errorMsg, setErrorMsg, successReceipt,
    handleProcessPayment, handleCloseModal,
  };
}
