'use client';

import React from 'react';
import { CheckCircle2, Clock, Circle, ExternalLink } from 'lucide-react';
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

export const DonationTimeline: React.FC<{ timeline: TimelineStep[]; currentStep: number }> = ({ timeline }) => {
  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:to-slate-800">
      {timeline.map((item) => {
        const isComp = item.status === 'COMPLETED';
        const isProg = item.status === 'IN_PROGRESS';

        return (
          <div key={item.step} className="relative">
            <div className="absolute -left-[31px] top-0 flex items-center justify-center">
              {isComp ? (
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center ring-4 ring-slate-900"><CheckCircle2 className="w-4 h-4" /></div>
              ) : isProg ? (
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-slate-900 z-10"><Clock className="w-4 h-4 animate-spin" /></div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-900 text-slate-500 flex items-center justify-center border border-slate-700 ring-4 ring-slate-900"><Circle className="w-3.5 h-3.5" /></div>
              )}
            </div>

            <div className={`p-4 rounded-xl border text-xs ${isProg ? 'bg-emerald-950/40 border-emerald-500/50' : isComp ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-60'}`}>
              <div className="flex justify-between items-center mb-1.5 font-bold">
                <div className="flex items-center gap-2"><span className="font-mono text-slate-400">STEP {item.step}</span><h4 className="text-slate-100">{item.title}</h4></div>
                <Badge variant={isComp ? 'success' : isProg ? 'warning' : 'neutral'}>{isComp ? 'Completed ✓' : isProg ? 'In Progress ◉' : 'Pending ○'}</Badge>
              </div>

              <p className="text-slate-300 mb-2 leading-relaxed">{item.details}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-[10px]">
                <div><span className="text-slate-400 uppercase block font-semibold">Actor</span><span className="text-slate-200">{item.actor}</span></div>
                <div><span className="text-slate-400 uppercase block font-semibold">Timestamp</span><span className="text-slate-300 font-mono">{item.timestamp}</span></div>
                <div>
                  <span className="text-slate-400 uppercase block font-semibold">Ref ID / Tx</span>
                  {item.reference.startsWith('0x') ? (
                    <a href={getExplorerTxUrl(item.reference)} target="_blank" rel="noreferrer" className="text-emerald-400 font-mono inline-flex items-center gap-1">{item.reference.substring(0, 10)}... <ExternalLink className="w-3 h-3" /></a>
                  ) : <span className="text-emerald-400 font-mono font-semibold">{item.reference}</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
