'use client';

import type { WizardData } from './types';

type Props = {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
};

export default function StepContactAddress({ data, updateField }: Props) {
  return (
    <div className="space-y-6">
      <h3 className="font-headline-sm text-headline-sm text-[#0A1128]">Contact & Address</h3>
      <p className="font-body-md text-body-md text-[#46464d] -mt-4">Primary contact person and registered address details.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Contact Name</label>
          <input
            name="contactName"
            value={data.contactName}
            onChange={(e) => updateField('contactName', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
            placeholder="e.g., John Doe"
          />
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Contact Title</label>
          <input
            name="contactTitle"
            value={data.contactTitle}
            onChange={(e) => updateField('contactTitle', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
            placeholder="e.g., CEO"
          />
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Email</label>
          <input
            name="email"
            type="email"
            value={data.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
            placeholder="john@acme.com"
          />
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Phone</label>
          <input
            name="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Website</label>
          <input
            name="website"
            value={data.website}
            onChange={(e) => updateField('website', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
            placeholder="https://acme.com"
          />
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Industry</label>
          <input
            name="industry"
            value={data.industry}
            onChange={(e) => updateField('industry', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
            placeholder="e.g., Technology, Finance"
          />
        </div>
      </div>

      <hr className="border-[#c6c6ce]/30 my-4" />

      <h4 className="font-label-md text-label-sm text-[#0A1128] uppercase tracking-wider font-bold">Registered Address</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        <div className="md:col-span-2">
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Street</label>
          <input
            name="registeredAddressStreet"
            value={data.registeredAddressStreet}
            onChange={(e) => updateField('registeredAddressStreet', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">City</label>
          <input
            name="registeredAddressCity"
            value={data.registeredAddressCity}
            onChange={(e) => updateField('registeredAddressCity', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">State / Province</label>
          <input
            name="registeredAddressState"
            value={data.registeredAddressState}
            onChange={(e) => updateField('registeredAddressState', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">ZIP / Postal Code</label>
          <input
            name="registeredAddressZip"
            value={data.registeredAddressZip}
            onChange={(e) => updateField('registeredAddressZip', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Country</label>
          <input
            name="registeredAddressCountry"
            value={data.registeredAddressCountry}
            onChange={(e) => updateField('registeredAddressCountry', e.target.value)}
            className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <input
          type="checkbox"
          id="billingAddressSame"
          checked={data.billingAddressSame}
          onChange={(e) => updateField('billingAddressSame', e.target.checked)}
          className="h-4 w-4 accent-[#D4AF37]"
        />
        <label htmlFor="billingAddressSame" className="font-body-md text-body-md text-[#46464d]">Billing address same as registered</label>
      </div>

      {!data.billingAddressSame && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mt-4">
          <h4 className="md:col-span-2 font-label-md text-label-sm text-[#0A1128] uppercase tracking-wider font-bold">Billing Address</h4>
          <div className="md:col-span-2">
            <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Street</label>
            <input
              name="billingAddressStreet"
              value={data.billingAddressStreet}
              onChange={(e) => updateField('billingAddressStreet', e.target.value)}
              className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">City</label>
            <input
              name="billingAddressCity"
              value={data.billingAddressCity}
              onChange={(e) => updateField('billingAddressCity', e.target.value)}
              className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">State / Province</label>
            <input
              name="billingAddressState"
              value={data.billingAddressState}
              onChange={(e) => updateField('billingAddressState', e.target.value)}
              className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">ZIP / Postal Code</label>
            <input
              name="billingAddressZip"
              value={data.billingAddressZip}
              onChange={(e) => updateField('billingAddressZip', e.target.value)}
              className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider font-bold mb-1 block">Country</label>
            <input
              name="billingAddressCountry"
              value={data.billingAddressCountry}
              onChange={(e) => updateField('billingAddressCountry', e.target.value)}
              className="w-full border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[15px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
}
