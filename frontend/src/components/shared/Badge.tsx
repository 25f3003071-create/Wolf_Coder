import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'info', className }) => {
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-950/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-950/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-rose-950/20',
    info: 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-purple-950/20',
    neutral: 'bg-slate-800/60 text-slate-300 border-slate-700 shadow-slate-950/20',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
