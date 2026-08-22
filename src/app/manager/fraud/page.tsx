'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

export default function FraudResolutionCenter() {
  const [flags, setFlags] = useState([
    {
      id: 'FRD-101',
      entity_type: 'EXPENSE',
      entity_id: 'EXP-2026-77A2',
      severity: 'MEDIUM',
      reason: 'Expense amount ₹65,000 triggered mandatory high-trust manager review threshold.',
      status: 'RESOLVED',
      resolution_notes: 'Verified against XYZ Hospital OT surgical invoice.',
      created_at: '2026-08-22 11:41 AM',
    },
    {
      id: 'FRD-102',
      entity_type: 'BENEFICIARY',
      entity_id: 'BEN-99C03',
      severity: 'HIGH',
      reason: 'Duplicate phone number check flagged across 2 distinct registration applications.',
      status: 'OPEN',
      resolution_notes: '',
      created_at: '2026-08-21 09:15 AM',
    },
  ]);

  const handleResolveFlag = (flagId: string) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === flagId ? { ...f, status: 'RESOLVED', resolution_notes: 'Resolved by Manager auditor.' } : f))
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-7 h-7 text-rose-500" />
          Fraud & Anomaly Detection Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">Rule-based engine monitoring duplicate hashes, over-allocations, and suspicious spending</p>
      </div>

      <Card title="Active Fraud Flags" subtitle="Manager resolution queue for automated risk alerts">
        <div className="space-y-4">
          {flags.map((flag) => (
            <div key={flag.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-rose-400">{flag.id}</span>
                  <Badge variant={flag.severity === 'HIGH' ? 'danger' : 'warning'}>{flag.severity} SEVERITY</Badge>
                  <span className="text-xs font-semibold text-slate-300">Entity: {flag.entity_type} ({flag.entity_id})</span>
                </div>
                <Badge variant={flag.status === 'RESOLVED' ? 'success' : 'warning'}>{flag.status}</Badge>
              </div>

              <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">{flag.reason}</p>

              {flag.status === 'RESOLVED' && flag.resolution_notes && (
                <div className="text-[11px] text-emerald-400 font-mono">
                  Resolution: {flag.resolution_notes}
                </div>
              )}

              {flag.status === 'OPEN' && (
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => handleResolveFlag(flag.id)}
                  >
                    RESOLVE & APPROVE CASE
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
