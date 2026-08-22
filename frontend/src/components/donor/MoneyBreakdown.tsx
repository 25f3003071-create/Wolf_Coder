import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';
import { Receipt, ShieldCheck, ArrowDownRight } from 'lucide-react';

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-5 text-xs">
        <div><span className="block font-bold text-slate-400 uppercase">Total Donated</span><span className="text-lg font-black text-white">{formatCurrency(totalAmount)}</span></div>
        <div><span className="block font-bold text-slate-400 uppercase">Allocated</span><span className="text-lg font-black text-emerald-400">{formatCurrency(allocatedAmount)}</span></div>
        <div><span className="block font-bold text-slate-400 uppercase">Actual Spent</span><span className="text-lg font-black text-sky-400">{formatCurrency(spentAmount)}</span></div>
        <div><span className="block font-bold text-slate-400 uppercase">Remaining</span><span className="text-lg font-black text-amber-400">{formatCurrency(remainingAmount)}</span></div>
      </div>

      <div className="mb-5 text-xs">
        <div className="flex justify-between text-slate-400 mb-1 font-medium"><span>Fund Utilization Progress</span><span>{Math.round((spentAmount / totalAmount) * 100)}% Spent</span></div>
        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div style={{ width: `${(spentAmount / totalAmount) * 100}%` }} className="bg-emerald-500 h-full" />
          <div style={{ width: `${(remainingAmount / totalAmount) * 100}%` }} className="bg-amber-500/80 h-full" />
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5"><Receipt className="w-4 h-4 text-emerald-400" /> Itemized Verified Expenditure Ledger</h4>
        <div className="space-y-2.5">
          {expenses.map((expense) => (
            <div key={expense.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2"><span className="font-mono font-bold text-emerald-400">{expense.id}</span><span className="font-bold text-slate-100">{expense.category}</span><Badge variant="success" className="text-[10px] py-0">{expense.verificationState}</Badge></div>
                  <p className="text-slate-400 mt-0.5">{expense.purpose}</p>
                </div>
                <div className="text-right"><span className="font-extrabold text-slate-100 text-sm">{formatCurrency(expense.amount)}</span><span className="block text-[10px] text-slate-400 font-mono">{expense.date}</span></div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-900 flex justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /><span>Evidence ID: <span className="font-mono text-slate-300">{expense.evidenceId}</span></span></div>
                <div className="font-mono">Tx: {expense.txHash.substring(0, 14)}...</div>
              </div>
            </div>
          ))}
          {remainingAmount > 0 && (
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between text-xs text-amber-300 font-medium">
              <div className="flex items-center gap-1.5"><ArrowDownRight className="w-4 h-4 text-amber-400" /><span>Unspent Reserved Balance (Held in Campaign Escrow)</span></div>
              <span className="font-bold">{formatCurrency(remainingAmount)}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
