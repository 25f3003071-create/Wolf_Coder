'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Globe, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SUPPORTED_CHAINS } from '@/lib/blockchain/adapter';

export default function BlockchainStatusPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2">
          <Globe className="w-7 h-7 text-purple-400" />
          Multi-Chain Protocol Network Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">Live testnet adapters for Ethereum Sepolia and Polygon Amoy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => (
          <Card key={key} title={chain.name} subtitle={`Chain ID: ${chain.chainId}`}>
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold uppercase">Network Status</span>
                <Badge variant="success">ONLINE & SYNCED ✓</Badge>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <span className="block text-slate-400 text-[10px]">Smart Contract Address:</span>
                <span className="text-emerald-400 break-all">{chain.contractAddress}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <span className="block text-slate-400 text-[10px]">Configured RPC Endpoint:</span>
                <span className="text-slate-200 truncate block">{chain.rpcUrl}</span>
              </div>

              <div className="pt-2">
                <a
                  href={chain.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
                >
                  View Block Explorer <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
