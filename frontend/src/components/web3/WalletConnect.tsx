'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Wallet, CheckCircle2, Globe, ShieldCheck } from 'lucide-react';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string) => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [selectedChain, setSelectedChain] = useState<'sepolia' | 'amoy'>('sepolia');
  const [connecting, setConnecting] = useState(false);

  const handleConnect = (provider: string) => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      onConnect(provider === 'metamask' ? '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' : '0x991823abf772183e910293a8172bc9102931bc77');
    }, 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Web3 Wallet" subtitle="Select your wallet to sign donation and audit transactions">
      <div className="space-y-5 text-xs">
        <div>
          <label className="block font-semibold text-slate-300 mb-2 uppercase">Select Network</label>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setSelectedChain('sepolia')} className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${selectedChain === 'sepolia' ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
              <Globe className="w-5 h-5 text-emerald-400" /><div className="text-left"><p className="font-bold text-slate-100">Ethereum Sepolia</p><p className="text-[10px] text-slate-400">Chain ID: 11155111</p></div>
            </button>
            <button onClick={() => setSelectedChain('amoy')} className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${selectedChain === 'amoy' ? 'bg-purple-950/40 border-purple-500 text-purple-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
              <Globe className="w-5 h-5 text-purple-400" /><div className="text-left"><p className="font-bold text-slate-100">Polygon Amoy</p><p className="text-[10px] text-slate-400">Chain ID: 80002</p></div>
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          <button onClick={() => handleConnect('metamask')} disabled={connecting} className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between group transition-all">
            <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><Wallet className="w-5 h-5" /></div><div className="text-left"><p className="font-bold text-slate-100 group-hover:text-emerald-400">MetaMask</p><p className="text-[10px] text-slate-400">Connect using extension or mobile wallet</p></div></div>
            <CheckCircle2 className="w-5 h-5 text-slate-600 group-hover:text-emerald-400" />
          </button>
          <button onClick={() => handleConnect('walletconnect')} disabled={connecting} className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 flex items-center justify-between group transition-all">
            <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-sky-500/10 text-sky-400"><ShieldCheck className="w-5 h-5" /></div><div className="text-left"><p className="font-bold text-slate-100 group-hover:text-sky-400">WalletConnect / Coinbase</p><p className="text-[10px] text-slate-400">Scan QR code with mobile Web3 app</p></div></div>
            <CheckCircle2 className="w-5 h-5 text-slate-600 group-hover:text-sky-400" />
          </button>
        </div>

        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>ReliefTrack never requests private keys or seed phrases. All transactions are signed safely client-side.</p>
        </div>
      </div>
    </Modal>
  );
};
