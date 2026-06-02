'use client';

import { BUSINESS_TYPES } from '@/lib/constants';
import type { WizardData } from './types';

type Props = {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  errors: Partial<Record<keyof WizardData, string>>;
};

export default function StepCompanyInfo({ data, updateField, errors }: Props) {
  return (
    <div className="space-y-6">
      <h3 className="font-headline-sm text-headline-sm text-[#0A1128]">Company Information</h3>
      <p className="font-body-md text-body-md text-[#46464d] -mt-4">Enter the corporate details of the client entity.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        <div className="md:col-span-2">
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Client Name *</label>
          <input
            name="name"
            value={data.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
            placeholder="e.g., Acme Corp"
          />
          {errors.name && <p className="text-red-500 text-[12px] mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Registration Number</label>
          <input
            name="registrationNumber"
            value={data.registrationNumber}
            onChange={(e) => updateField('registrationNumber', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
            placeholder="e.g., EIN 00-1234567"
          />
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Tax ID</label>
          <input
            name="taxId"
            value={data.taxId}
            onChange={(e) => updateField('taxId', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">VAT Number</label>
          <input
            name="vatNumber"
            value={data.vatNumber}
            onChange={(e) => updateField('vatNumber', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Business Type</label>
          <select
            name="businessType"
            value={data.businessType}
            onChange={(e) => updateField('businessType', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
          >
            <option value="">Select type...</option>
            {BUSINESS_TYPES.map((bt) => (
              <option key={bt.value} value={bt.value}>{bt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Date of Incorporation</label>
          <input
            name="dateOfIncorporation"
            type="date"
            value={data.dateOfIncorporation}
            onChange={(e) => updateField('dateOfIncorporation', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Jurisdiction</label>
          <input
            name="jurisdiction"
            value={data.jurisdiction}
            onChange={(e) => updateField('jurisdiction', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
            placeholder="e.g., Delaware, USA"
          />
        </div>
      </div>
    </div>
  );
}
