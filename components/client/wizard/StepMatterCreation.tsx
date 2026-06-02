'use client';

import { Plus, Trash2, ChevronDown } from 'lucide-react';
import AiTextAssistant from '@/components/ai/AiTextAssistant';
import type { WizardData, WizardMatter } from './types';

type Props = {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  errors: Partial<Record<keyof WizardData, string>>;
};

const PRACTICE_AREAS = ['Corporate', 'Litigation', 'Intellectual Property', 'Real Estate', 'Tax', 'Employment', 'Regulatory', 'Family Law'];

function updateMatter(index: number, field: keyof WizardMatter, value: string, matters: WizardMatter[]): WizardMatter[] {
  const updated = matters.map((m, i) => (i === index ? { ...m, [field]: value } : m));
  return updated;
}

export default function StepMatterCreation({ data, updateField, errors }: Props) {
  const matters = data.matters;

  const addMatter = () => {
    updateField('matters', [
      ...matters,
      { title: '', matterCode: '', practiceArea: '', leadAttorneyName: '', description: '' },
    ]);
  };

  const removeMatter = (index: number) => {
    if (matters.length <= 1) return;
    updateField('matters', matters.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-[#0A1128]">Matter Creation</h3>
          <p className="font-body-md text-body-md text-[#46464d] mt-1">Create at least one matter for this client.</p>
        </div>
        <button
          type="button"
          onClick={addMatter}
          className="flex items-center gap-2 bg-[#0A1128] text-white px-4 py-2 font-label-sm text-label-sm uppercase tracking-wider hover:bg-[#162244] transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Matter
        </button>
      </div>

      {errors.matters && <p className="text-red-500 text-[12px]">{errors.matters}</p>}

      {matters.map((matter, index) => (
        <div
          key={index}
          className="border border-[#c6c6ce]/40 bg-white p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-label-md text-label-sm text-[#0A1128] uppercase tracking-wider font-bold">
              Matter #{index + 1}
            </h4>
            {matters.length > 1 && (
              <button
                type="button"
                onClick={() => removeMatter(index)}
                className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Matter Title *</label>
              <input
                value={matter.title}
                onChange={(e) => updateField('matters', updateMatter(index, 'title', e.target.value, matters))}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
                placeholder="e.g., Acquisition of Meridian Tech"
              />
            </div>

            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Matter Code</label>
              <input
                value={matter.matterCode}
                onChange={(e) => updateField('matters', updateMatter(index, 'matterCode', e.target.value, matters))}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
                placeholder="Auto-generated if blank"
              />
            </div>

            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Practice Area *</label>
              <div className="relative">
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-[#c6c6ce] pointer-events-none h-4 w-4" />
                <select
                  value={matter.practiceArea}
                  onChange={(e) => updateField('matters', updateMatter(index, 'practiceArea', e.target.value, matters))}
                  className="w-full appearance-none border-b border-[#c6c6ce]/60 bg-transparent py-2 pr-6 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors cursor-pointer"
                >
                  <option value="">Select...</option>
                  {PRACTICE_AREAS.map((pa) => (
                    <option key={pa} value={pa}>{pa}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Lead Attorney</label>
              <input
                value={matter.leadAttorneyName}
                onChange={(e) => updateField('matters', updateMatter(index, 'leadAttorneyName', e.target.value, matters))}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Description</label>
              <AiTextAssistant
                value={matter.description}
                onChange={(v) => updateField('matters', updateMatter(index, 'description', v, matters))}
                rows={2}
                className="w-full border border-[#c6c6ce]/60 bg-transparent py-2 px-3 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
