import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
  icon?: React.ReactNode;
  color?: 'emerald' | 'sky' | 'purple' | 'amber' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendDirection = 'up',
  icon,
  color = 'emerald',
}) => {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</span>
          <span className="block text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1">{value}</span>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}

          {trend && (
            <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold">
              {trendDirection === 'up' ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span className={trendDirection === 'up' ? 'text-emerald-400' : 'text-rose-400'}>{trend}</span>
            </div>
          )}
        </div>

        {icon && (
          <div className={clsx('p-3 rounded-2xl border shrink-0', colorMap[color])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
