'use client';

import { Trash2 } from 'lucide-react';
import { deleteExpense } from '@/app/actions/expenseActions';
import { useToastStore } from '@/lib/store/useToastStore';

type ExpenseRow = {
  id: string;
  matterId: string | null;
  matterTitle: string | null;
  clientName: string | null;
  description: string;
  amount: number;
  category: string;
  date: string;
  billable: boolean;
  notes: string | null;
  createdAt: string;
};

export default function ExpenseList({ expenses }: { expenses: ExpenseRow[] }) {
  const addToast = useToastStore((s) => s.addToast);

  if (expenses.length === 0) {
    return <p className="text-[#7c839f] text-[14px]">No expenses found.</p>;
  }

  return (
    <div className="space-y-2">
      {expenses.map((exp) => (
        <div key={exp.id} className="flex items-center justify-between p-3 bg-surface-bright border border-outline-variant hover:bg-surface-container-low transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#eff4ff] border border-[#c6c6ce]/30 text-[#46464d]">{exp.category}</span>
              {!exp.billable && <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700">Non-billable</span>}
            </div>
            <p className="text-on-background font-semibold truncate mt-1">{exp.description}</p>
            {exp.matterTitle && (
              <p className="text-surface-variant text-sm truncate">{exp.clientName ? `${exp.clientName} - ` : ''}{exp.matterTitle}</p>
            )}
            {exp.notes && <p className="text-[11px] text-[#7c839f] mt-0.5">{exp.notes}</p>}
          </div>
          <div className="text-right shrink-0 ml-4 flex items-center gap-3">
            <div>
              <p className="text-on-background font-bold">${exp.amount.toFixed(2)}</p>
              <p className="text-surface-variant text-sm">{new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
            <form action={async () => {
              const result = await deleteExpense(exp.id);
              addToast(result.success ? 'Expense deleted' : 'Failed to delete expense', result.success ? 'success' : 'error');
            }}>
              <button type="submit" className="p-1.5 text-[#7c839f] hover:text-[#ba1a1a] transition-colors cursor-pointer">
                <Trash2 size={14} />
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
