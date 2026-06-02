'use client';

import { BILLING_TERMS } from '@/lib/constants';
import AiTextAssistant from '@/components/ai/AiTextAssistant';
import type { WizardData } from './types';

type Props = {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
};

export default function StepFinancialDetails({ data, updateField }: Props) {
  return (
    <div className="space-y-6">
      <h3 className="font-headline-sm text-headline-sm text-[#0A1128]">Financial & Operational Details</h3>
      <p className="font-body-md text-body-md text-[#46464d] -mt-4">Billing terms, revenue data, and internal notes.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Billing Terms</label>
          <select
            name="billingTerms"
            value={data.billingTerms}
            onChange={(e) => updateField('billingTerms', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
          >
            <option value="">Select terms...</option>
            {BILLING_TERMS.map((bt) => (
              <option key={bt.value} value={bt.value}>{bt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Credit Limit ($)</label>
          <input
            name="creditLimit"
            type="number"
            value={data.creditLimit}
            onChange={(e) => updateField('creditLimit', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
            placeholder="e.g., 50000"
          />
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Annual Revenue Range</label>
          <select
            name="annualRevenueRange"
            value={data.annualRevenueRange}
            onChange={(e) => updateField('annualRevenueRange', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
          >
            <option value="">Select range...</option>
            <option value="< $1M">&lt; $1M</option>
            <option value="$1M - $10M">$1M - $10M</option>
            <option value="$10M - $50M">$10M - $50M</option>
            <option value="$50M - $100M">$50M - $100M</option>
            <option value="$100M - $500M">$100M - $500M</option>
            <option value="$500M+">$500M+</option>
          </select>
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Number of Employees</label>
          <input
            name="employeeCount"
            type="number"
            value={data.employeeCount}
            onChange={(e) => updateField('employeeCount', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Referral Source</label>
          <input
            name="referralSource"
            value={data.referralSource}
            onChange={(e) => updateField('referralSource', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
            placeholder="e.g., Existing client, Partner referral"
          />
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Tags (comma-separated)</label>
          <input
            name="tags"
            value={data.tags}
            onChange={(e) => updateField('tags', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
            placeholder="e.g., vip, priority, international"
          />
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Status</label>
          <select
            name="status"
            value={data.status}
            onChange={(e) => updateField('status', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Prospect">Prospect</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Internal Notes</label>
          <AiTextAssistant
            value={data.notes}
            onChange={(v) => updateField('notes', v)}
            rows={3}
            className="w-full border border-[#c6c6ce]/60 bg-transparent py-2 px-3 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  );
}
