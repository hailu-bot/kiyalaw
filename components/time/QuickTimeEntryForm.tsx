'use client';

import { useActionState, useEffect } from 'react';
import { createQuickTimeEntry } from '@/app/actions/timeActions';
import { useToastStore } from '../../lib/store/useToastStore';
import AiTextAssistant from '@/components/ai/AiTextAssistant';

type Matter = { id: string; title: string; clientName: string };
type ClientGroup = { client: string; matters: Matter[] };

type ActionState = { success: boolean; message: string } | null;

export default function QuickTimeEntryForm({ clientGroups }: { clientGroups: ClientGroup[] }) {
  const addToast = useToastStore((s) => s.addToast);
  const [state, formAction] = useActionState(
    async (_prevState: ActionState, formData: FormData) => {
      return createQuickTimeEntry(formData);
    },
    null
  );

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      addToast(state.message, 'success');
    } else {
      addToast(state.message, 'error');
    }
  }, [state, addToast]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="text-label-sm font-label-sm text-on-surface-variant block mb-2">Client</label>
        <select name="clientName" className="w-full bg-surface-container border border-outline-variant rounded-none px-4 py-2 text-on-background" required>
          <option value="">Select a client...</option>
          {clientGroups.map((g) => (
            <option key={g.client} value={g.client}>{g.client}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-label-sm font-label-sm text-on-surface-variant block mb-2">Matter</label>
        <select name="matterId" className="w-full bg-surface-container border border-outline-variant rounded-none px-4 py-2 text-on-background" required>
          <option value="">Select a matter...</option>
          {clientGroups.flatMap((g) => g.matters).map((m) => (
            <option key={m.id} value={m.id}>{m.title} ({m.clientName})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-label-sm font-label-sm text-on-surface-variant block mb-2">Date</label>
        <input type="date" name="date" className="w-full bg-surface-container border border-outline-variant rounded-none px-4 py-2 text-on-background" required defaultValue={new Date().toISOString().split('T')[0]} />
      </div>

      <div>
        <label className="text-label-sm font-label-sm text-on-surface-variant block mb-2">Hours</label>
        <input type="number" name="hours" step="0.1" className="w-full bg-surface-container border border-outline-variant rounded-none px-4 py-2 text-on-background" required />
      </div>

      <div>
        <label className="text-label-sm font-label-sm text-on-surface-variant block mb-2">Description</label>
        <AiTextAssistant name="description" className="w-full bg-surface-container border border-outline-variant rounded-none px-4 py-2 text-on-background h-32" required />
      </div>

      <button type="submit" className="w-full bg-primary-container text-on-primary font-bold py-3 rounded-none hover:bg-on-primary-fixed-variant transition-colors">
        Log Time Entry
      </button>
    </form>
  );
}