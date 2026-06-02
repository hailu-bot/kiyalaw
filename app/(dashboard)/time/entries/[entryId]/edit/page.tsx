'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { getTimeEntryById, updateTimeEntry, deleteTimeEntry } from '@/app/actions/timeActions';
import { useToastStore } from '@/lib/store/useToastStore';
import AiTextAssistant from '@/components/ai/AiTextAssistant';

type TimeEntryData = {
  id: string;
  matterId: string;
  clientId: string | null;
  description: string;
  date: string;
  hours: number;
  rate: number;
  billable: boolean;
  category: string | null;
  attorneyName: string | null;
  notes: string | null;
  createdAt: string;
  matter: { title: string; clientName: string; matterCode: string };
};

export default function EditTimeEntryPage({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = use(params);
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [entry, setEntry] = useState<TimeEntryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getTimeEntryById(entryId).then((data) => {
      if (data) setEntry(data as TimeEntryData);
      setLoading(false);
    });
  }, [entryId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A1128]"></div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full flex-1">
        <div className="text-center py-20">
          <h2 className="font-headline-sm text-[28px] font-bold text-[#0A1128] mb-4">Time Entry Not Found</h2>
          <Link href="/time" className="text-[#D4AF37] hover:underline font-label-md text-[13px] font-bold uppercase tracking-wider">Back to Time Logger</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    const result = await updateTimeEntry(entryId, {
      description: String(formData.get('description') ?? ''),
      date: String(formData.get('date') ?? ''),
      hours: parseFloat(String(formData.get('hours') ?? '0')),
      billable: formData.get('billable') === 'true',
      category: String(formData.get('category') ?? '') || undefined,
      notes: String(formData.get('notes') ?? '') || undefined,
    });
    if (result.success) {
      addToast(result.message, 'success');
      router.push(`/time/entries/${entryId}`);
    } else {
      addToast(result.message, 'error');
    }
    setSubmitting(false);
  }

  async function handleDelete() {
    if (!window.confirm('Delete this time entry?')) return;
    const result = await deleteTimeEntry(entryId);
    if (result.success) {
      addToast(result.message, 'success');
      router.push('/time');
    } else {
      addToast(result.message, 'error');
    }
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full flex-1">
      <Link href={`/time/entries/${entryId}`} className="inline-flex items-center gap-2 text-[#46464d] hover:text-[#0A1128] transition-colors mb-8 font-label-md text-[13px] font-bold uppercase tracking-wider">
        <ArrowLeft size={18} /> Back to Entry
      </Link>

      <form action={handleSubmit} className="bg-white border border-[#c6c6ce]/40 shadow-sm p-8 md:p-10 max-w-3xl">
        <h1 className="text-[24px] font-headline-sm font-bold text-[#0A1128] mb-8">Edit Time Entry</h1>

        <div className="space-y-6">
          <div>
            <label className="font-label-sm text-[12px] font-bold uppercase tracking-widest text-[#46464d] block mb-2">Description</label>
            <AiTextAssistant name="description" defaultValue={entry.description} className="w-full border border-[#c6c6ce]/50 p-3 text-[15px] focus:outline-none focus:border-[#D4AF37]" rows={3} required />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="font-label-sm text-[12px] font-bold uppercase tracking-widest text-[#46464d] block mb-2">Date</label>
              <input type="date" name="date" defaultValue={entry.date.split('T')[0]} className="w-full border border-[#c6c6ce]/50 p-3 text-[15px] focus:outline-none focus:border-[#D4AF37]" required />
            </div>
            <div>
              <label className="font-label-sm text-[12px] font-bold uppercase tracking-widest text-[#46464d] block mb-2">Hours</label>
              <input type="number" name="hours" step="0.1" defaultValue={entry.hours} className="w-full border border-[#c6c6ce]/50 p-3 text-[15px] focus:outline-none focus:border-[#D4AF37]" required />
            </div>
          </div>

          <div>
            <label className="font-label-sm text-[12px] font-bold uppercase tracking-widest text-[#46464d] block mb-2">Billable</label>
            <select name="billable" defaultValue={String(entry.billable)} className="w-full border border-[#c6c6ce]/50 p-3 text-[15px] focus:outline-none focus:border-[#D4AF37]">
              <option value="true">Billable</option>
              <option value="false">Non-Billable</option>
            </select>
          </div>

          <div>
            <label className="font-label-sm text-[12px] font-bold uppercase tracking-widest text-[#46464d] block mb-2">Category</label>
            <input type="text" name="category" defaultValue={entry.category ?? ''} className="w-full border border-[#c6c6ce]/50 p-3 text-[15px] focus:outline-none focus:border-[#D4AF37]" />
          </div>

          <div>
            <label className="font-label-sm text-[12px] font-bold uppercase tracking-widest text-[#46464d] block mb-2">Internal Notes</label>
            <AiTextAssistant name="notes" defaultValue={entry.notes ?? ''} className="w-full border border-[#c6c6ce]/50 p-3 text-[15px] focus:outline-none focus:border-[#D4AF37]" rows={3} />
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#c6c6ce]/30">
          <button type="button" onClick={handleDelete} className="text-red-600 hover:text-red-800 transition-colors font-label-md text-[13px] font-bold uppercase tracking-wider">
            Delete Entry
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-[#0A1128] text-white font-label-md text-[13px] font-bold uppercase tracking-wider px-8 py-3.5 hover:bg-[#162244] transition-colors shadow-md disabled:opacity-60"
          >
            <Save size={16} />
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
