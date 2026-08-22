import React from 'react';
import { Smartphone, CreditCard, Building2, Wallet, Check, Copy, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { QRCodeGenerator } from '@/components/ui/QRCodeGenerator';

const inputClass = "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono";

export const UpiPaymentTab: React.FC<{ upiUri: string; upiVpa: string; copiedUpi: boolean; onCopy: () => void }> = ({ upiUri, upiVpa, copiedUpi, onCopy }) => (
  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
    <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-xs font-bold text-emerald-400">
      <div className="flex items-center gap-2"><Smartphone className="w-4 h-4" /> Instant UPI Payment</div>
      <Badge variant="success">Simulated Live Gateway</Badge>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
      <div className="flex flex-col items-center p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
        <QRCodeGenerator value={upiUri} size={140} />
        <p className="text-[10px] text-slate-400 mt-1 font-mono">Scan using any UPI App</p>
      </div>
      <div className="space-y-2 text-xs">
        <label className="block font-semibold text-slate-400">VPA / UPI ID</label>
        <div className="flex items-center gap-2">
          <input type="text" readOnly value={upiVpa} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg font-mono text-emerald-400 font-bold" />
          <button type="button" onClick={onCopy} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 shrink-0">
            {copiedUpi ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const CardPaymentTab: React.FC<{
  cardHolder: string; setCardHolder: (v: string) => void;
  cardNumber: string; setCardNumber: (v: string) => void;
  cardExpiry: string; setCardExpiry: (v: string) => void;
  cardCvv: string; setCardCvv: (v: string) => void;
}> = ({ cardHolder, setCardHolder, cardNumber, setCardNumber, cardExpiry, setCardExpiry, cardCvv, setCardCvv }) => (
  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
    <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-xs font-bold text-emerald-400">
      <div className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Credit / Debit Card</div>
      <span className="text-[10px] text-slate-400 flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-400" /> 256-Bit Encrypted</span>
    </div>
    <div><label className="block font-semibold text-slate-400 mb-1">Cardholder Name</label><input type="text" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} className={inputClass} /></div>
    <div><label className="block font-semibold text-slate-400 mb-1">Card Number</label><input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} maxLength={19} className={inputClass} /></div>
    <div className="grid grid-cols-2 gap-3">
      <div><label className="block font-semibold text-slate-400 mb-1">Expiry Date</label><input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} className={inputClass} /></div>
      <div><label className="block font-semibold text-slate-400 mb-1">CVV</label><input type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} maxLength={4} className={inputClass} /></div>
    </div>
  </div>
);

export const NetbankingPaymentTab: React.FC<{ selectedBank: string; setSelectedBank: (v: string) => void }> = ({ selectedBank, setSelectedBank }) => (
  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
    <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold text-emerald-400"><Building2 className="w-4 h-4" /> Net Banking</div>
    <div>
      <label className="block font-semibold text-slate-400 mb-1">Select Bank</label>
      <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 font-semibold">
        <option value="HDFC Bank">HDFC Bank</option><option value="ICICI Bank">ICICI Bank</option><option value="State Bank of India">State Bank of India (SBI)</option><option value="Axis Bank">Axis Bank</option><option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
      </select>
    </div>
  </div>
);

export const CryptoPaymentTab: React.FC<{
  connectedWallet: string; setConnectedWallet: (v: string) => void;
  selectedChain: 'sepolia' | 'amoy'; setSelectedChain: (v: 'sepolia' | 'amoy') => void;
}> = ({ connectedWallet, setConnectedWallet, selectedChain, setSelectedChain }) => (
  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
    <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-xs font-bold text-emerald-400"><div className="flex items-center gap-2"><Wallet className="w-4 h-4" /> Web3 Crypto Wallet</div><Badge variant="success">EVM Compatible</Badge></div>
    <div><label className="block font-semibold text-slate-400 mb-1">Connected Address</label><input type="text" value={connectedWallet} onChange={(e) => setConnectedWallet(e.target.value)} className={inputClass} /></div>
    <div>
      <label className="block font-semibold text-slate-400 mb-1">Network</label>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setSelectedChain('sepolia')} className={`py-1.5 px-3 rounded-lg border font-bold ${selectedChain === 'sepolia' ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>Ethereum Sepolia</button>
        <button type="button" onClick={() => setSelectedChain('amoy')} className={`py-1.5 px-3 rounded-lg border font-bold ${selectedChain === 'amoy' ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>Polygon Amoy</button>
      </div>
    </div>
  </div>
);
