'use client';

import React, { useState, useCallback } from 'react';
import { Clock, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { createTimeEntry } from '@/app/actions/timeActions';
import { useToastStore } from '../../lib/store/useToastStore';
import { useRouter } from 'next/navigation';
import AiTextAssistant from '@/components/ai/AiTextAssistant';

type MatterOption = {
  id: string;
  title: string;
  clientName: string;
  matterCode: string;
};

interface NewTimeEntryManualProps {
  matters: MatterOption[];
}

export default function NewTimeEntryManual({ matters }: NewTimeEntryManualProps) {
  const router = useRouter();
  const { addToast, updateToast } = useToastStore();
  const [saving, setSaving] = useState(false);
  const [refNo] = useState(() => `TK-2024-${String(Math.floor(Math.random() * 9000) + 1000)}`);
  const [formData, setFormData] = useState({
    matterId: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    minutes: '',
    description: '',
    notes: '',
    billable: true,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedMatter = matters.find((m) => m.id === formData.matterId);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const totalHours = (parseFloat(formData.hours) || 0) + (parseFloat(formData.minutes) || 0) / 60;
    if (!formData.matterId || totalHours <= 0 || !formData.description.trim()) {
      addToast('Please fill in all required fields (matter, hours, description).', 'error');
      return;
    }

    setSaving(true);
    const toastId = addToast('Creating time entry...', 'pending');

    const result = await createTimeEntry({
      matterId: formData.matterId,
      description: formData.description,
      date: formData.date,
      hours: totalHours,
      rate: 850,
      billable: formData.billable,
      category: formData.category || undefined,
      notes: formData.notes || undefined,
    });

    if (result.success) {
      updateToast(toastId, result.message, 'success');
      router.push('/time');
    } else {
      updateToast(toastId, result.message, 'error');
    }
    setSaving(false);
  }, [formData, saving, addToast, router]);

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/time" className="inline-flex items-center gap-2 text-[#46464d] hover:text-[#0A1128] transition-colors mb-8 font-label-md text-[13px] font-bold uppercase tracking-wider">
        <ArrowLeft size={18} />
        Back to Time Logger
      </Link>

      <div className="bg-white border border-[#c6c6ce]/20 shadow-sm p-12">
        <header className="mb-10 flex justify-between items-end border-b border-[#c6c6ce]/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Clock size={22} className="text-[#735c00]" />
              <h2 className="font-headline-sm text-[24px] font-bold text-[#0A1128]">New Time Entry</h2>
            </div>
            <p className="text-[#46464d] font-body-md text-[15px]">Capture billable activities with precision.</p>
          </div>
          <div className="text-right">
            <span className="font-label-sm text-[12px] text-[#46464d] block mb-1">REFERENCE NO.</span>
            <span className="font-label-md text-[13px] text-[#0A1128] tracking-widest font-bold">{refNo}</span>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="font-label-md text-[12px] text-[#0A1128] block uppercase tracking-tighter font-bold">Client</label>
              <select
                value={selectedMatter ? selectedMatter.clientName : ''}
                onChange={(e) => {
                  const matter = matters.find((m) => m.clientName === e.target.value);
                  if (matter) setFormData(prev => ({ ...prev, matterId: matter.id }));
                }}
                className="w-full bg-transparent border-b-2 border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 py-3 font-body-md text-[15px] text-[#0A1128] outline-none"
              >
                <option value="">Select Client</option>
                {Array.from(new Set(matters.map((m) => m.clientName))).map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-[12px] text-[#0A1128] block uppercase tracking-tighter font-bold">Matter</label>
              <select
                value={formData.matterId}
                onChange={(e) => handleChange('matterId', e.target.value)}
                className="w-full bg-transparent border-b-2 border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 py-3 font-body-md text-[15px] text-[#0A1128] outline-none"
                required
              >
                <option value="">Select Matter</option>
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>{m.clientName} - {m.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-4 space-y-2">
              <label className="font-label-md text-[12px] text-[#0A1128] block uppercase tracking-tighter font-bold">Task Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full bg-transparent border-b-2 border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 py-3 font-body-md text-[15px] text-[#0A1128] outline-none"
              >
                <option value="">Select Category</option>
                <option>Drafting & Revision</option>
                <option>Client Consultation</option>
                <option>Legal Research</option>
                <option>Court Appearance</option>
              </select>
            </div>
            <div className="col-span-4 space-y-2">
              <label className="font-label-md text-[12px] text-[#0A1128] block uppercase tracking-tighter font-bold">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full bg-transparent border-b-2 border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 py-3 font-body-md text-[15px] text-[#0A1128] outline-none"
                required
              />
            </div>
            <div className="col-span-4 space-y-2">
              <label className="font-label-md text-[12px] text-[#0A1128] block uppercase tracking-tighter font-bold">Duration</label>
              <div className="flex items-end gap-4">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={formData.hours}
                    onChange={(e) => handleChange('hours', e.target.value)}
                    placeholder="00"
                    step="0.25"
                    className="w-full bg-transparent border-b-2 border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 py-3 font-body-md text-[15px] text-center outline-none"
                  />
                  <span className="absolute -bottom-5 left-0 right-0 text-center font-label-sm text-[12px] text-[#46464d]">HRS</span>
                </div>
                <span className="pb-3 font-bold text-[#76767e]">:</span>
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={formData.minutes}
                    onChange={(e) => handleChange('minutes', e.target.value)}
                    placeholder="00"
                    className="w-full bg-transparent border-b-2 border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 py-3 font-body-md text-[15px] text-center outline-none"
                  />
                  <span className="absolute -bottom-5 left-0 right-0 text-center font-label-sm text-[12px] text-[#46464d]">MIN</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex justify-between items-center">
              <label className="font-label-md text-[12px] text-[#0A1128] uppercase tracking-tighter font-bold">Narrative Description</label>
              <span className="font-label-sm text-[12px] text-[#46464d] italic">Billable Text</span>
            </div>
            <AiTextAssistant
              value={formData.description}
              onChange={(v) => handleChange('description', v)}
              placeholder="Provide a detailed account of legal services rendered..."
              rows={6}
              required
              className="w-full bg-[#f8f9ff]/50 border border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] p-4 font-body-md text-[15px] outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="font-label-md text-[12px] text-[#46464d] uppercase tracking-tighter flex items-center gap-2 font-bold">
              Internal Notes
            </label>
            <AiTextAssistant
              value={formData.notes}
              onChange={(v) => handleChange('notes', v)}
              placeholder="Non-billable internal context..."
              rows={2}
              className="w-full bg-transparent border-b border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 p-2 font-body-md text-[15px] outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-10 border-t border-[#c6c6ce]/10">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.billable}
                  onChange={(e) => handleChange('billable', e.target.checked)}
                  className="w-5 h-5 border-2 border-[#76767e] text-[#0A1128] focus:ring-[#D4AF37]"
                />
                <span className="font-label-md text-[13px] text-[#46464d] group-hover:text-[#0A1128] transition-colors">Apply Billable Rate</span>
              </label>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/time" className="px-8 py-3 font-label-md text-[13px] text-[#46464d] hover:text-[#0A1128] transition-colors uppercase tracking-widest font-bold">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-10 py-4 bg-[#D4AF37] text-[#241a00] font-label-md text-[13px] uppercase tracking-[0.2em] font-bold shadow-md hover:bg-[#ffe088] transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={18} className="inline mr-2" />
                {saving ? 'Saving...' : 'Save Time Entry'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
