import React from 'react';
import Link from 'next/link';
import CreateInvoiceForm from '../../../../components/invoice/CreateInvoiceForm';
import { getMattersForSelect } from '@/app/actions/billingActions';
import { getClients } from '@/app/actions/clientActions';
import { getFirmProfile } from '@/app/actions/settingsActions';

export const dynamic = 'force-dynamic';

export default async function CreateInvoicePage({ searchParams }: { searchParams: Promise<{ clientId?: string }> }) {
  const { clientId } = await searchParams;
  const [matters, clients, firmProfile] = await Promise.all([getMattersForSelect(), getClients(), getFirmProfile()]);

  const firm = firmProfile ? {
    logoUrl: firmProfile.logoUrl ?? null,
    address: firmProfile.address ?? null,
    phone: firmProfile.phone ?? null,
    email: firmProfile.email ?? null,
    website: firmProfile.website ?? null,
  } : null;

  return (
    <div className="px-6 md:px-12 py-8 md:py-12 max-w-[1000px] mx-auto w-full flex-1 flex flex-col">
      
      {/* Top Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between pb-8 mb-8 border-b border-[#c6c6ce]/40 gap-4">
        <div>
          <h2 className="font-headline-lg text-[32px] md:text-[40px] font-bold text-[#0A1128] tracking-tight mb-2">Create New Invoice</h2>
          <p className="font-body-md text-[16px] text-[#46464d]">Draft and finalize billing statements.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Link href="/billing" className="w-full md:w-auto text-center bg-[#eff4ff] text-[#0A1128] font-label-md text-[13px] py-3 px-6 border border-[#c6c6ce]/50 rounded-none uppercase tracking-widest font-bold hover:bg-[#d3e4fe] transition-colors">
            Save Draft
          </Link>
        </div>
      </header>

      {/* Render the extracted form component */}
      <CreateInvoiceForm matters={matters} clients={clients} initialClientId={clientId || ''} firm={firm} />

    </div>
  );
}
