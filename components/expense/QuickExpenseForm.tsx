'use client';

import { useRef } from 'react';
import { useToastStore } from '@/lib/store/useToastStore';
import { createExpense } from '@/app/actions/expenseActions';
import { Plus } from 'lucide-react';
import AiTextAssistant from '@/components/ai/AiTextAssistant';

type MatterOption = { id: string; title: string };

export default function QuickExpenseForm({ matters, categories }: { matters: MatterOption[]; categories: string[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const addToast = useToastStore((s) => s.addToast);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        const data = {
          matterId: String(formData.get('matterId') ?? '').trim() || undefined,
          description: String(formData.get('description') ?? '').trim(),
          amount: parseFloat(String(formData.get('amount') ?? '0')),
          category: String(formData.get('category') ?? 'Other').trim(),
          date: String(formData.get('date') ?? new Date().toISOString().split('T')[0]),
          billable: formData.get('billable') === 'on',
          notes: String(formData.get('notes') ?? '').trim() || undefined,
        };

        const result = await createExpense(data);
        addToast(result.message, result.success ? 'success' : 'error');
        if (result.success) formRef.current?.reset();
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#7c839f] mb-1">Description *</label>
        <AiTextAssistant name="description" className="w-full border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37] transition-colors" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-[#7c839f] mb-1">Amount *</label>
          <input name="amount" type="number" step="0.01" min="0" required className="w-full border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37] transition-colors" />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-[#7c839f] mb-1">Date *</label>
          <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37] transition-colors" />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#7c839f] mb-1">Category</label>
        <select name="category" className="w-full border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37]">
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#7c839f] mb-1">Matter (optional)</label>
        <select name="matterId" className="w-full border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37]">
          <option value="">No matter</option>
          {matters.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#7c839f] mb-1">Notes</label>
        <AiTextAssistant name="notes" className="w-full border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37] transition-colors resize-none" rows={2} />
      </div>

      <label className="flex items-center gap-2 text-[13px] font-body-md text-[#46464d]">
        <input name="billable" type="checkbox" defaultChecked className="accent-[#D4AF37]" />
        Billable to client
      </label>

      <button type="submit" className="w-full bg-[#0A1128] text-white py-2.5 text-[12px] font-bold uppercase tracking-wider hover:bg-[#162244] transition-colors flex items-center justify-center gap-2 cursor-pointer">
        <Plus size={16} />
        Record Expense
      </button>
    </form>
  );
}
