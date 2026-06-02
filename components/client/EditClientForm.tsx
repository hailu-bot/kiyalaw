"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { updateClient } from "@/app/actions/clientActions";
import { useToastStore } from "@/lib/store/useToastStore";
import AiTextAssistant from "@/components/ai/AiTextAssistant";

type AddressFields = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

type EditClientDialogProps = {
  client: {
    id: string;
    name: string;
    contactName: string;
    contactTitle: string;
    email: string;
    phone: string;
    industry: string;
    status: string;
    notes: string;
    registrationNumber?: string;
    taxId?: string;
    vatNumber?: string;
    businessType?: string;
    dateOfIncorporation?: string;
    jurisdiction?: string;
    registeredAddress?: AddressFields;
    billingAddress?: AddressFields;
    website?: string;
    annualRevenueRange?: string;
    employeeCount?: number;
    billingTerms?: string;
    creditLimit?: number;
    referralSource?: string;
    tags?: string[];
  };
};

export function EditClientDialog({ client }: EditClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      const raStreet = formData.get('registeredAddress.street') as string;
      const raCity = formData.get('registeredAddress.city') as string;
      const raState = formData.get('registeredAddress.state') as string;
      const raZip = formData.get('registeredAddress.zip') as string;
      const raCountry = formData.get('registeredAddress.country') as string;
      if (raStreet || raCity || raState || raZip || raCountry) {
        formData.set('registeredAddress', JSON.stringify({ street: raStreet, city: raCity, state: raState, zip: raZip, country: raCountry }));
      } else {
        formData.delete('registeredAddress');
      }
      ['registeredAddress.street','registeredAddress.city','registeredAddress.state','registeredAddress.zip','registeredAddress.country'].forEach(k => formData.delete(k));

      const baStreet = formData.get('billingAddress.street') as string;
      const baCity = formData.get('billingAddress.city') as string;
      const baState = formData.get('billingAddress.state') as string;
      const baZip = formData.get('billingAddress.zip') as string;
      const baCountry = formData.get('billingAddress.country') as string;
      if (baStreet || baCity || baState || baZip || baCountry) {
        formData.set('billingAddress', JSON.stringify({ street: baStreet, city: baCity, state: baState, zip: baZip, country: baCountry }));
      } else {
        formData.delete('billingAddress');
      }
      ['billingAddress.street','billingAddress.city','billingAddress.state','billingAddress.zip','billingAddress.country'].forEach(k => formData.delete(k));

      const result = await updateClient(client.id, formData);
      if (!result.success) {
        addToast(result.message, "error");
        setSubmitting(false);
        return;
      }
      addToast(result.message, "success");
      setOpen(false);
      router.refresh();
    } catch {
      addToast("Failed to update client.", "error");
    }
    setSubmitting(false);
  }, [client.id, submitting, addToast, router]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2 border border-[#c6c6ce] text-[#0A1128] font-label-sm text-label-sm uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors cursor-pointer"
      >
        <PencilIcon className="h-3.5 w-3.5" /> Edit
      </button>
    );
  }

  const ra = client.registeredAddress ?? {};
  const ba = client.billingAddress ?? {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1128]/75 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-2xl bg-white border border-[#c6c6ce]/50 shadow-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#c6c6ce]/30 px-6 py-4 shrink-0">
          <h2 className="font-headline-sm text-headline-sm text-[#0A1128]">Edit Client</h2>
          <button onClick={() => setOpen(false)} className="text-[#76767e] hover:text-[#0A1128] cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

            <div className="md:col-span-2">
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Client Name *</label>
              <input name="name" defaultValue={client.name} required
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
            </div>

            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Contact Name</label>
              <input name="contactName" defaultValue={client.contactName}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Contact Title</label>
              <input name="contactTitle" defaultValue={client.contactTitle}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Email</label>
              <input name="email" type="email" defaultValue={client.email}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Phone</label>
              <input name="phone" type="tel" defaultValue={client.phone}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Industry</label>
              <input name="industry" defaultValue={client.industry}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Status</label>
              <select name="status" defaultValue={client.status}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Prospect">Prospect</option>
              </select>
            </div>

            <div className="md:col-span-2 border-t border-[#c6c6ce]/20 pt-4 mt-2">
              <span className="font-label-sm text-label-sm text-[#D4AF37] uppercase tracking-wider font-bold">Business Registration</span>
            </div>

            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Registration Number</label>
              <input name="registrationNumber" defaultValue={client.registrationNumber ?? ''}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Tax ID</label>
              <input name="taxId" defaultValue={client.taxId ?? ''}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">VAT Number</label>
              <input name="vatNumber" defaultValue={client.vatNumber ?? ''}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Business Type</label>
              <select name="businessType" defaultValue={client.businessType ?? ''}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors">
                <option value="">—</option>
                <option value="Corporation">Corporation</option>
                <option value="LLC">LLC</option>
                <option value="Partnership">Partnership</option>
                <option value="SoleProprietorship">Sole Proprietorship</option>
                <option value="NonProfit">Non-Profit</option>
              </select>
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Date of Incorporation</label>
              <input name="dateOfIncorporation" type="date" defaultValue={client.dateOfIncorporation ? client.dateOfIncorporation.split('T')[0] : ''}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Jurisdiction</label>
              <input name="jurisdiction" defaultValue={client.jurisdiction ?? ''}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Website</label>
              <input name="website" type="url" defaultValue={client.website ?? ''}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
            </div>

            <div className="md:col-span-2 border-t border-[#c6c6ce]/20 pt-4 mt-2">
              <span className="font-label-sm text-label-sm text-[#D4AF37] uppercase tracking-wider font-bold">Registered Address</span>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
              <div className="md:col-span-3">
                <input name="registeredAddress.street" defaultValue={ra.street ?? ''} placeholder="Street Address"
                  className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
              </div>
              <div>
                <input name="registeredAddress.city" defaultValue={ra.city ?? ''} placeholder="City"
                  className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
              </div>
              <div>
                <input name="registeredAddress.state" defaultValue={ra.state ?? ''} placeholder="State"
                  className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
              </div>
              <div className="flex gap-4">
                <input name="registeredAddress.zip" defaultValue={ra.zip ?? ''} placeholder="ZIP"
                  className="flex-1 border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
                <input name="registeredAddress.country" defaultValue={ra.country ?? ''} placeholder="Country"
                  className="flex-[2] border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
              </div>
            </div>

            <div className="md:col-span-2 border-t border-[#c6c6ce]/20 pt-4 mt-2">
              <span className="font-label-sm text-label-sm text-[#D4AF37] uppercase tracking-wider font-bold">Billing Address</span>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
              <div className="md:col-span-3">
                <input name="billingAddress.street" defaultValue={ba.street ?? ''} placeholder="Street Address"
                  className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
              </div>
              <div>
                <input name="billingAddress.city" defaultValue={ba.city ?? ''} placeholder="City"
                  className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
              </div>
              <div>
                <input name="billingAddress.state" defaultValue={ba.state ?? ''} placeholder="State"
                  className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
              </div>
              <div className="flex gap-4">
                <input name="billingAddress.zip" defaultValue={ba.zip ?? ''} placeholder="ZIP"
                  className="flex-1 border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
                <input name="billingAddress.country" defaultValue={ba.country ?? ''} placeholder="Country"
                  className="flex-[2] border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
              </div>
            </div>

            <div className="md:col-span-2 border-t border-[#c6c6ce]/20 pt-4 mt-2">
              <span className="font-label-sm text-label-sm text-[#D4AF37] uppercase tracking-wider font-bold">Financial & Other</span>
            </div>

            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Annual Revenue Range</label>
              <select name="annualRevenueRange" defaultValue={client.annualRevenueRange ?? ''}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors">
                <option value="">—</option>
                <option value="Under $1M">Under $1M</option>
                <option value="$1M - $10M">$1M - $10M</option>
                <option value="$10M - $50M">$10M - $50M</option>
                <option value="$50M - $100M">$50M - $100M</option>
                <option value="$100M+">$100M+</option>
              </select>
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Employee Count</label>
              <input name="employeeCount" type="number" defaultValue={client.employeeCount ?? ''}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Billing Terms</label>
              <select name="billingTerms" defaultValue={client.billingTerms ?? ''}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors">
                <option value="">—</option>
                <option value="Net15">Net 15</option>
                <option value="Net30">Net 30</option>
                <option value="Net45">Net 45</option>
                <option value="Net60">Net 60</option>
                <option value="DueOnReceipt">Due on Receipt</option>
              </select>
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Credit Limit ($)</label>
              <input name="creditLimit" type="number" step="0.01" defaultValue={client.creditLimit ?? ''}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Referral Source</label>
              <input name="referralSource" defaultValue={client.referralSource ?? ''}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Tags (comma-separated)</label>
              <input name="tags" defaultValue={client.tags?.join(', ') ?? ''}
                className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors" />
            </div>

            <div className="md:col-span-2">
              <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Notes</label>
              <AiTextAssistant name="notes" defaultValue={client.notes} rows={3}
                className="w-full border border-[#c6c6ce]/60 bg-transparent py-2 px-3 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-colors resize-none" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#c6c6ce]/30">
            <button type="button" onClick={() => setOpen(false)} className="px-5 py-2 border border-[#c6c6ce] text-[#0A1128] font-label-sm text-label-sm uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#0A1128] text-white font-label-sm text-label-sm uppercase tracking-wider hover:bg-[#162244] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}
