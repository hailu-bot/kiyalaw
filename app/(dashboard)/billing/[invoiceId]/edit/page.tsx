import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EditInvoiceForm from '../../../../../components/invoice/EditInvoiceForm';
import { getInvoiceWithLineItems } from '@/app/actions/billingActions';

export default async function EditInvoicePage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;
  const invoice = await getInvoiceWithLineItems(invoiceId);

  if (!invoice) {
    return (
      <div className="px-6 md:px-12 py-8 md:py-12 max-w-[1400px] mx-auto w-full">
        <div className="text-center py-20">
          <h2 className="font-headline-sm">Invoice Not Found</h2>
          <Link href="/billing" className="text-[#D4AF37] hover:underline font-label-md text-[13px] font-bold uppercase tracking-wider">
            Back to Billing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 py-8 md:py-12 max-w-[1400px] mx-auto w-full">
      
      {/* Page Header / Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-[#c6c6ce]/40 pb-6 gap-6">
        
        <div className="flex flex-col gap-2">
          <Link href={`/billing/${invoiceId}`} className="flex items-center gap-2 text-[#7c839f] hover:text-[#0A1128] transition-colors group w-fit">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-label-md text-[12px] font-bold uppercase tracking-widest">Back to Invoice</span>
          </Link>
          <h2 className="font-headline-lg">Edit Invoice #{invoice.invoiceNumber}
          </h2>
        </div>
      </div>

      {/* Render the extracted component layout */}
      <EditInvoiceForm invoice={invoice} />

      {/* Global Footer */}
      <footer className="mt-16 pt-8 border-t border-[#c6c6ce]/40 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[11px] text-[#7c839f] font-bold uppercase tracking-widest text-center md:text-left">
          © 2024 Kiya Law Elite Counsel Suite • Confidential Legal Work Product
        </p>
        <div className="flex gap-8">
          <Link href="#" className="text-[11px] text-[#7c839f] font-bold hover:text-[#0A1128] uppercase tracking-widest transition-colors">Privacy Protocol</Link>
          <Link href="#" className="text-[11px] text-[#7c839f] font-bold hover:text-[#0A1128] uppercase tracking-widest transition-colors">Billing Standards</Link>
        </div>
      </footer>

    </div>
  );
}
