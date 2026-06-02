'use client';

import React, { useActionState } from 'react';
import Image from 'next/image';
import { Building2, Upload } from 'lucide-react';
import { updateFirmProfile, uploadFirmLogo } from '@/app/actions/settingsActions';
import { useToastStore } from '@/lib/store/useToastStore';
import AiTextAssistant from '@/components/ai/AiTextAssistant';

interface FirmProfileData {
  firmName: string;
  defaultRate: number;
  timezone: string;
  dateFormat: string;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  billingCycleDays?: number;
  billingLeadDays?: number;
}

export default function TabFirmProfile({ data }: { data: FirmProfileData }) {
  const [state, formAction, pending] = useActionState(
    async (prev: { success: boolean; message?: string } | null, formData: FormData) => {
      return updateFirmProfile(formData);
    },
    null
  );
  const addToast = useToastStore((s) => s.addToast);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);
    const result = await uploadFirmLogo(formData);
    addToast(result.message || 'Logo uploaded', result.success ? 'success' : 'error');
  };

  return (
    <section className="bg-white border border-[#c6c6ce]/30 shadow-[0_4px_40px_rgba(10,17,40,0.03)]">
      <div className="px-6 py-5 border-b border-[#c6c6ce]/20 bg-[#f8f9ff]/50 flex items-center gap-3">
        <Building2 size={20} className="text-[#0A1128]" />
        <h2 className="font-headline-sm text-headline-sm text-[#0A1128]">Firm Profile</h2>
      </div>

      <form action={formAction} className="p-6 space-y-6" id="firm-profile-form">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#c6c6ce]/10">
          <div className="flex-1">
            <h3 className="font-label-md text-label-md text-[#0A1128] mb-1">Firm Name</h3>
            <p className="font-body-md text-body-md text-[#46464d]">Legal name displayed across the platform.</p>
          </div>
          <div className="w-full sm:w-64">
            <input
              type="text"
              name="firmName"
              defaultValue={data.firmName}
              className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 px-3 py-2 font-body-md text-body-md text-[#0A1128] outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#c6c6ce]/10">
          <div className="flex-1">
            <h3 className="font-label-md text-label-md text-[#0A1128] mb-1">Default Billable Rate</h3>
            <p className="font-body-md text-body-md text-[#46464d]">Standard hourly rate for new matters.</p>
          </div>
          <div className="w-full sm:w-32">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#46464d] font-body-md">$</span>
              <input
                type="number"
                name="defaultRate"
                defaultValue={data.defaultRate}
                className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 pl-8 pr-3 py-2 font-body-md text-body-md text-[#0A1128] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#c6c6ce]/10">
          <div className="flex-1">
            <h3 className="font-label-md text-label-md text-[#0A1128] mb-1 flex items-center gap-2"><Building2 size={16} /> Timezone</h3>
          </div>
          <div className="w-full sm:w-48">
            <select
              name="timezone"
              defaultValue={data.timezone}
              className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 px-3 py-2 font-body-md text-body-md text-[#0A1128] outline-none"
            >
              <option value="America/New_York">America/New_York</option>
              <option value="America/Chicago">America/Chicago</option>
              <option value="America/Denver">America/Denver</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#c6c6ce]/10">
          <div className="flex-1">
            <h3 className="font-label-md text-label-md text-[#0A1128] mb-1 flex items-center gap-2"><Building2 size={16} /> Date Format</h3>
          </div>
          <div className="w-full sm:w-48">
            <select
              name="dateFormat"
              defaultValue={data.dateFormat}
              className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 px-3 py-2 font-body-md text-body-md text-[#0A1128] outline-none"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#c6c6ce]/10">
          <div className="flex-1">
            <h3 className="font-label-md text-label-md text-[#0A1128] mb-1">Address</h3>
            <p className="font-body-md text-body-md text-[#46464d]">Firm address for invoices.</p>
          </div>
          <div className="w-full sm:w-64">
            <AiTextAssistant
              name="address"
              defaultValue={data.address ?? ''}
              rows={3}
              className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 px-3 py-2 font-body-md text-body-md text-[#0A1128] outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#c6c6ce]/10">
          <div className="flex-1">
            <h3 className="font-label-md text-label-md text-[#0A1128] mb-1">Phone</h3>
            <p className="font-body-md text-body-md text-[#46464d]">Firm contact number.</p>
          </div>
          <div className="w-full sm:w-64">
            <input
              type="tel"
              name="phone"
              defaultValue={data.phone ?? ''}
              className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 px-3 py-2 font-body-md text-body-md text-[#0A1128] outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#c6c6ce]/10">
          <div className="flex-1">
            <h3 className="font-label-md text-label-md text-[#0A1128] mb-1">Email</h3>
            <p className="font-body-md text-body-md text-[#46464d]">Firm contact email.</p>
          </div>
          <div className="w-full sm:w-64">
            <input
              type="email"
              name="email"
              defaultValue={data.email ?? ''}
              className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 px-3 py-2 font-body-md text-body-md text-[#0A1128] outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#c6c6ce]/10">
          <div className="flex-1">
            <h3 className="font-label-md text-label-md text-[#0A1128] mb-1">Website</h3>
            <p className="font-body-md text-body-md text-[#46464d]">Firm website URL.</p>
          </div>
          <div className="w-full sm:w-64">
            <input
              type="url"
              name="website"
              defaultValue={data.website ?? ''}
              placeholder="https://"
              className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 px-3 py-2 font-body-md text-body-md text-[#0A1128] outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#c6c6ce]/10">
          <div className="flex-1">
            <h3 className="font-label-md text-label-md text-[#0A1128] mb-1">Billing Cycle</h3>
            <p className="font-body-md text-body-md text-[#46464d]">How often to auto-generate invoices (days).</p>
          </div>
          <div className="w-full sm:w-32">
            <input
              type="number"
              name="billingCycleDays"
              defaultValue={data.billingCycleDays ?? 30}
              min={7} max={365}
              className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 px-3 py-2 font-body-md text-body-md text-[#0A1128] outline-none text-right"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#c6c6ce]/10">
          <div className="flex-1">
            <h3 className="font-label-md text-label-md text-[#0A1128] mb-1">Billing Lead Time</h3>
            <p className="font-body-md text-body-md text-[#46464d]">Days before cycle end to auto-generate draft invoices.</p>
          </div>
          <div className="w-full sm:w-32">
            <input
              type="number"
              name="billingLeadDays"
              defaultValue={data.billingLeadDays ?? 5}
              min={0} max={30}
              className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 px-3 py-2 font-body-md text-body-md text-[#0A1128] outline-none text-right"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-label-md text-label-md text-[#0A1128] mb-1">Firm Logo</h3>
            <p className="font-body-md text-body-md text-[#46464d]">Upload your firm&apos;s branding mark.</p>
          </div>
          <label className="relative cursor-pointer group">
            {data.logoUrl ? (
              <Image src={data.logoUrl} alt="Firm logo" width={64} height={64} className="object-cover border border-[#c6c6ce]" />
            ) : (
              <div className="w-16 h-16 bg-[#eff4ff] border border-[#c6c6ce] flex items-center justify-center group-hover:bg-[#e0e7ff] transition-colors">
                <Upload size={20} className="text-[#7c839f]" />
              </div>
            )}
            <input type="file" name="logo" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </label>
        </div>

        {state?.success && (
          <div className="bg-[#e8f5e9] border border-[#4caf50] text-[#2e7d32] px-4 py-3 text-[13px] font-medium">Settings saved.</div>
        )}
        {state?.message && !state.success && (
          <div className="bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a] px-4 py-3 text-[13px] font-medium">{state.message}</div>
        )}

        <div className="flex justify-end pt-4 border-t border-[#c6c6ce]/10">
          <button
            type="submit"
            disabled={pending}
            className="px-6 py-2.5 bg-[#0A1128] text-white font-label-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#162244] transition-colors disabled:opacity-60"
          >
            {pending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
}

