'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText, ShieldCheck, ExternalLink } from 'lucide-react';
import { getExplorerTxUrl } from '@/lib/blockchain/adapter';

export default function AuditLogsPage() {
  const auditEntries = [
    {
      id: 'a1-1001',
      action: 'DONATION_CREATED',
      entity: 'DONATION_RECEIPT (DR-2026-8F72K9)',
      user: 'Rahul Sharma (Donor)',
      reasoning: 'Donor initiated ₹10,000 contribution for Emergency Medical Relief',
      blockchainRef: '0x8a7291bc44f128e932104975193a218f77361a90c4217734891a274191bc44f1',
      timestamp: '2026-08-22 10:21 AM',
    },
    {
      id: 'a1-1002',
      action: 'BENEFICIARY_VERIFIED',
      entity: 'BENEFICIARY (BEN-72A91)',
      user: 'Dr. Vikram Seth (Manager)',
      reasoning: 'Manager verified hospital cardiac surgery estimate and credentials',
      blockchainRef: 'VER-2026-9281',
      timestamp: '2026-08-22 11:02 AM',
    },
    {
      id: 'a1-1003',
      action: 'FUNDS_ALLOCATED',
      entity: 'ALLOCATION (ALLOC-2026-91A7)',
      user: 'Priya Mehta (Red Cross India)',
      reasoning: 'Approved ₹8,500 allocation from receipt DR-2026-8F72K9 to NGO-1042',
      blockchainRef: '0x991823abf772183e910293a8172bc9102931bc77261a90c4217734891a274191',
      timestamp: '2026-08-22 11:18 AM',
    },
    {
      id: 'a1-1004',
      action: 'EVIDENCE_SUBMITTED',
      entity: 'EVIDENCE (EVD-2026-72K9)',
      user: 'Priya Mehta (Red Cross India)',
      reasoning: 'NGO uploaded camera-verified surgery evidence and receipt hash',
      blockchainRef: 'EVD-2026-72K9',
      timestamp: '2026-08-22 11:42 AM',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2">
          <FileText className="w-7 h-7 text-emerald-400" />
          Immutable System Audit Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">Append-only chronological record of all state transitions, approvals, and vault requests</p>
      </div>

      <Card title="Audit History Trail" subtitle="Chronological timeline of system events">
        <div className="space-y-4">
          {auditEntries.map((log) => (
            <div key={log.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="info">{log.action}</Badge>
                  <span className="font-bold text-slate-200">{log.entity}</span>
                </div>
                <span className="font-mono text-slate-400">{log.timestamp}</span>
              </div>

              <p className="text-slate-300">{log.reasoning}</p>

              <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                <span>Actor: <strong className="text-slate-200">{log.user}</strong></span>
                {log.blockchainRef.startsWith('0x') ? (
                  <a
                    href={getExplorerTxUrl(log.blockchainRef, 'sepolia')}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Tx: {log.blockchainRef.substring(0, 14)}... <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="font-mono text-emerald-400">Ref: {log.blockchainRef}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
