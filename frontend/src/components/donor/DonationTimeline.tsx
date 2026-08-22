'use client';

import React from 'react';
import { CheckCircle2, Clock, Circle, ArrowRight, ShieldCheck, FileCheck2, Building2, UserCheck, Receipt, ExternalLink } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { getExplorerTxUrl } from '@/lib/blockchain/adapter';

export interface TimelineStep {
  step: number;
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  timestamp: string;
  actor: string;
  reference: string;
  details: string;
}

interface DonationTimelineProps {
  timeline: TimelineStep[];
  currentStep: number;
}

export const DonationTimeline: React.FC<DonationTimelineProps> = ({ timeline, currentStep }) => {
  return (
    <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-emerald-500/50 before:to-slate-800">
      {timeline.map((item) => {
        const isCompleted = item.status === 'COMPLETED';
        const isInProgress = item.status === 'IN_PROGRESS';
        const isPending = item.status === 'PENDING';

        return (
          <div key={item.step} className="relative group">
            <div className="absolute -left-[31px] top-0 flex items-center justify-center">
              {isCompleted && (
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-4 ring-slate-900">
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                </div>
              )}
              {isInProgress && (
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping" />
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-600/40 ring-4 ring-slate-900 z-10">
                    <Clock className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              {isPending && (
                <div className="w-7 h-7 rounded-full bg-slate-900 text-slate-500 flex items-center justify-center border border-slate-700 ring-4 ring-slate-900">
                  <Circle className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div
              className={`p-5 rounded-2xl border transition-all ${
                isInProgress
                  ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/50 shadow-xl shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                  : isCompleted
                  ? 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">STEP {item.step}</span>
                  <h4 className={`text-base font-bold tracking-tight ${isCompleted || isInProgress ? 'text-slate-100' : 'text-slate-400'}`}>
                    {item.title}
                  </h4>
                </div>
                <div>
                  {isCompleted && <Badge variant="success">Completed ✓</Badge>}
                  {isInProgress && <Badge variant="warning" className="animate-pulse">In Progress ◉</Badge>}
                  {isPending && <Badge variant="neutral">Pending ○</Badge>}
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-3 leading-relaxed">{item.details}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-800/60 text-[11px]">
                <div>
                  <span className="block text-slate-400 font-semibold uppercase text-[10px]">Actor</span>
                  <span className="text-slate-200 font-medium">{item.actor}</span>
                </div>

                <div>
                  <span className="block text-slate-400 font-semibold uppercase text-[10px]">Timestamp</span>
                  <span className="text-slate-300 font-mono">{item.timestamp}</span>
                </div>

                <div>
                  <span className="block text-slate-400 font-semibold uppercase text-[10px]">Ref ID / Tx Hash</span>
                  {item.reference.startsWith('0x') ? (
                    <a
                      href={getExplorerTxUrl(item.reference)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline font-mono inline-flex items-center gap-1"
                    >
                      {item.reference.substring(0, 10)}... <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-emerald-400 font-mono font-semibold">{item.reference}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
