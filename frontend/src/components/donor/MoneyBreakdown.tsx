import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';
import { Receipt, CheckCircle2, ShieldCheck, FileText, ArrowDownRight } from 'lucide-react';

interface ExpenseItem {
  id: string;
  category: string;
  purpose: string;
  amount: number;
  date: string;
  verificationState: string;
  evidenceId: string;
  txHash: string;
}

interface MoneyBreakdownProps {
  totalAmount: number;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  expenses: ExpenseItem[];
}

export const MoneyBreakdown: React.FC<MoneyBreakdownProps> = ({
  totalAmount,
  allocatedAmount,
  spentAmount,
  remainingAmount,
  expenses,
}) => {
  return (
    <Card title="Donation Money Breakdown" subtitle="Complete financial accounting of how your donation was allocated and spent">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-6">
        <div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Donated</span>
          <span className="text-xl font-black text-white">{formatCurrency(totalAmount)}</span>
        </div>
        <div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Allocated</span>
          <span className="text-xl font-black text-emerald-400">{formatCurrency(allocatedAmount)}</span>
        </div>
        <div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actual Spent</span>
          <span className="text-xl font-black text-sky-400">{formatCurrency(spentAmount)}</span>
        </div>
        <div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Remaining</span>
          <span className="text-xl font-black text-amber-400">{formatCurrency(remainingAmount)}</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
          <span>Fund Utilization Progress</span>
          <span>{Math.round((spentAmount / totalAmount) * 100)}% Spent</span>
        </div>
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div style={{ width: `${(spentAmount / totalAmount) * 100}%` }} className="bg-emerald-500 h-full transition-all" />
          <div style={{ width: `${(remainingAmount / totalAmount) * 100}%` }} className="bg-amber-500/80 h-full transition-all" />
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
          <Receipt className="w-4 h-4 text-emerald-400" />
          Itemized Verified Expenditure Ledger
        </h4>

        <div className="space-y-3">
          {expenses.map((expense) => (
            <div key={expense.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400">{expense.id}</span>
                    <span className="text-sm font-bold text-slate-100">{expense.category}</span>
                    <Badge variant="success" className="text-[10px] py-0">{expense.verificationState}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{expense.purpose}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-100">{formatCurrency(expense.amount)}</span>
                  <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{expense.date}</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-900 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Evidence ID: <span className="font-mono text-slate-300">{expense.evidenceId}</span></span>
                </div>
                <div className="font-mono text-[10px] text-slate-400">
                  Tx: {expense.txHash.substring(0, 14)}...
                </div>
              </div>
            </div>
          ))}

          {remainingAmount > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-amber-400" />
                <span>Unspent Reserved Balance (Held in Campaign Escrow)</span>
              </div>
              <span className="font-bold">{formatCurrency(remainingAmount)}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
