'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, FileText, List as ListIcon,
  Trash2, PlusCircle, StickyNote, Bold, Italic,
  List, Link as LinkIcon, History, ShieldCheck
} from 'lucide-react';
import { updateInvoice } from '@/app/actions/billingActions';
import { useToastStore } from '../../lib/store/useToastStore';
import AiTextAssistant from '@/components/ai/AiTextAssistant';

type LineItemData = {
  id?: string;
  description: string;
  hours: number;
  rate: number;
  total: number;
};

type InvoiceData = {
  id: string;
  invoiceNumber: string;
  matterId: string;
  matterTitle: string;
  clientName: string;
  amount: number;
  dueDateLabel: string;
  notes: string | null;
  status: string;
  createdAt: string;
  lineItems: LineItemData[];
};

interface EditInvoiceFormProps {
  invoice: InvoiceData;
}

export default function EditInvoiceForm({ invoice }: EditInvoiceFormProps) {
  const router = useRouter();
  const { addToast, updateToast } = useToastStore();
  const [saving, setSaving] = useState(false);

  const [lineItems, setLineItems] = useState<LineItemData[]>(
    invoice.lineItems.length > 0
      ? invoice.lineItems
      : [{ id: crypto.randomUUID(), description: '', hours: 0, rate: 0, total: 0 }]
  );

  const [formFields, setFormFields] = useState({
    clientName: invoice.clientName,
    invoiceNumber: invoice.invoiceNumber,
    dueDateLabel: invoice.dueDateLabel,
    notes: invoice.notes || '',
  });

  const updateLineItem = useCallback((index: number, field: keyof Omit<LineItemData, 'id' | 'total'>, value: string | number) => {
    setLineItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'hours' || field === 'rate') {
        next[index].total = Number(next[index].hours) * Number(next[index].rate);
      }
      return next;
    });
  }, []);

  const removeLineItem = useCallback((index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addLineItem = useCallback(() => {
    setLineItems((prev) => [...prev, { id: crypto.randomUUID(), description: '', hours: 0, rate: 0, total: 0 }]);
  }, []);

  const total = useMemo(() => {
    return lineItems.reduce((acc, item) => acc + Number(item.hours) * Number(item.rate), 0);
  }, [lineItems]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);

  const handleSave = useCallback(async (status: 'Draft' | 'Finalized') => {
    if (saving) return;
    const validItems = lineItems.filter((li) => li.description.trim() && Number(li.hours) > 0 && Number(li.rate) > 0);
    if (validItems.length === 0) {
      addToast('Add at least one line item with description, hours, and rate.', 'error');
      return;
    }

    setSaving(true);
    const toastId = addToast(status === 'Draft' ? 'Saving draft...' : 'Saving and issuing invoice...', 'pending');

    const result = await updateInvoice(invoice.id, {
      invoiceNumber: formFields.invoiceNumber,
      clientName: formFields.clientName,
      amount: total,
      dueDateLabel: formFields.dueDateLabel,
      notes: formFields.notes,
      lineItems: validItems.map((li) => ({
        description: li.description,
        hours: Number(li.hours),
        rate: Number(li.rate),
        total: Number(li.hours) * Number(li.rate),
      })),
    });

    if (result.success) {
      updateToast(toastId, result.message, 'success');
      router.push(`/billing/${invoice.id}`);
    } else {
      updateToast(toastId, result.message, 'error');
    }
    setSaving(false);
  }, [formFields, lineItems, total, saving, addToast, router, invoice.id]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Main Editor Form (Left 8 Columns) */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Section 1: Client & Matter */}
        <section className="bg-white p-8 border border-[#c6c6ce]/40 shadow-sm rounded-none">
          <h3 className="font-label-md text-[13px] uppercase tracking-widest text-[#7c839f] mb-6 flex items-center font-bold">
            <Users size={18} className="mr-3" />
            Client & Matter Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 group">
              <label className="font-label-sm text-[12px] text-[#46464d] uppercase tracking-widest font-bold group-focus-within:text-[#D4AF37] transition-colors">Client Name</label>
              <input
                value={formFields.clientName}
                onChange={(e) => setFormFields((f) => ({ ...f, clientName: e.target.value }))}
                className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce]/60 focus:border-[#D4AF37] focus:ring-0 py-3 px-4 font-body-md text-[15px] text-[#0A1128] outline-none rounded-none transition-colors"
              />
            </div>
            <div className="space-y-2 group">
              <label className="font-label-sm text-[12px] text-[#46464d] uppercase tracking-widest font-bold group-focus-within:text-[#D4AF37] transition-colors">Matter</label>
              <p className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce]/60 py-3 px-4 font-body-md text-[15px] text-[#0A1128] rounded-none">
                {invoice.matterTitle}
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Invoice Details */}
        <section className="bg-white p-8 border border-[#c6c6ce]/40 shadow-sm rounded-none">
          <h3 className="font-label-md text-[13px] uppercase tracking-widest text-[#7c839f] mb-6 flex items-center font-bold">
            <FileText size={18} className="mr-3" />
            General Invoice Parameters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2 group">
              <label className="font-label-sm text-[12px] text-[#46464d] uppercase tracking-widest font-bold group-focus-within:text-[#D4AF37] transition-colors">Invoice Date</label>
              <p className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce]/60 py-3 px-4 font-body-md text-[15px] text-[#0A1128] rounded-none">
                {new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="space-y-2 group">
              <label className="font-label-sm text-[12px] text-[#46464d] uppercase tracking-widest font-bold group-focus-within:text-[#D4AF37] transition-colors">Due Date</label>
              <input
                value={formFields.dueDateLabel}
                onChange={(e) => setFormFields((f) => ({ ...f, dueDateLabel: e.target.value }))}
                className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce]/60 focus:border-[#D4AF37] py-3 px-4 font-body-md text-[15px] text-[#0A1128] outline-none rounded-none transition-colors"
                type="text"
              />
            </div>
            <div className="space-y-2 group">
              <label className="font-label-sm text-[12px] text-[#46464d] uppercase tracking-widest font-bold group-focus-within:text-[#D4AF37] transition-colors">Invoice Number</label>
              <input
                value={formFields.invoiceNumber}
                onChange={(e) => setFormFields((f) => ({ ...f, invoiceNumber: e.target.value }))}
                className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce]/60 focus:border-[#D4AF37] py-3 px-4 font-body-md text-[15px] text-[#0A1128] outline-none rounded-none transition-colors"
                type="text"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Itemized Services */}
        <section className="bg-white p-8 border border-[#c6c6ce]/40 shadow-sm rounded-none overflow-hidden">
          <h3 className="font-label-md text-[13px] uppercase tracking-widest text-[#7c839f] mb-6 flex items-center font-bold">
            <ListIcon size={18} className="mr-3" />
            Itemized Professional Services
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-[#0A1128] font-label-sm text-[11px] text-[#7c839f] uppercase tracking-widest">
                  <th className="py-4 px-2 font-bold">Description</th>
                  <th className="py-4 px-2 font-bold w-24">Hrs</th>
                  <th className="py-4 px-2 font-bold w-32">Rate ($)</th>
                  <th className="py-4 px-2 font-bold w-32">Total ($)</th>
                  <th className="py-4 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6ce]/30">
                {lineItems.map((item, index) => (
                  <tr key={index} className="hover:bg-[#f8f9ff] transition-colors duration-150 group">
                    <td className="py-4 px-2">
                      <input
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 font-body-md text-[15px] text-[#0A1128] p-0 outline-none"
                        type="text"
                        placeholder="Description of service"
                      />
                    </td>
                    <td className="py-4 px-2">
                      <input
                        value={item.hours || ''}
                        onChange={(e) => updateLineItem(index, 'hours', parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent border-none focus:ring-0 font-body-md text-[15px] text-[#0A1128] p-0 outline-none"
                        type="number"
                        step="0.1"
                      />
                    </td>
                    <td className="py-4 px-2">
                      <input
                        value={item.rate || ''}
                        onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent border-none focus:ring-0 font-body-md text-[15px] text-[#0A1128] p-0 outline-none"
                        type="number"
                        step="1"
                      />
                    </td>
                    <td className="py-4 px-2 font-bold text-[#0A1128]">
                      {formatCurrency(Number(item.hours) * Number(item.rate))}
                    </td>
                    <td className="py-4 px-2">
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="text-[#c6c6ce] hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove line item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center border-t border-[#c6c6ce]/30 pt-6 gap-6">
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center text-[#D4AF37] font-label-md text-[13px] uppercase tracking-widest font-bold hover:text-[#735c00] transition-colors"
            >
              <PlusCircle size={18} className="mr-2" />
              Add Line Item
            </button>
            <div className="text-right space-y-2 w-full md:w-auto">
              <div className="flex justify-between md:w-48 text-[#46464d] font-label-sm text-[13px]">
                <span>Subtotal:</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between md:w-48 text-[#0A1128] font-bold border-t-2 border-[#0A1128] pt-2">
                <span>TOTAL:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Notes & Payment Terms */}
        <section className="bg-white p-8 border border-[#c6c6ce]/40 shadow-sm rounded-none">
          <h3 className="font-label-md text-[13px] uppercase tracking-widest text-[#7c839f] mb-4 flex items-center font-bold">
            <StickyNote size={18} className="mr-3" />
            Notes & Payment Terms
          </h3>
          <div className="border border-[#c6c6ce]/40">
            <div className="flex items-center gap-4 px-4 py-3 bg-[#f8f9ff] border-b border-[#c6c6ce]/40">
              <button type="button" className="text-[#7c839f] hover:text-[#0A1128] transition-colors"><Bold size={18} /></button>
              <button type="button" className="text-[#7c839f] hover:text-[#0A1128] transition-colors"><Italic size={18} /></button>
              <button type="button" className="text-[#7c839f] hover:text-[#0A1128] transition-colors"><List size={18} /></button>
              <div className="w-[1px] h-4 bg-[#c6c6ce]/60"></div>
              <button type="button" className="text-[#7c839f] hover:text-[#0A1128] transition-colors"><LinkIcon size={18} /></button>
            </div>
            <AiTextAssistant
              value={formFields.notes}
              onChange={(v) => setFormFields((f) => ({ ...f, notes: v }))}
              className="w-full bg-white border-none focus:ring-0 p-6 font-body-md text-[15px] text-[#0A1128] outline-none resize-none leading-relaxed"
              placeholder="Enter custom terms or bank account details here..."
              rows={4}
            />
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 justify-end">
          <button
            type="button"
            onClick={() => handleSave('Draft')}
            disabled={saving}
            className="px-6 py-3.5 border border-[#c6c6ce] text-[#46464d] font-label-md text-[13px] font-bold uppercase tracking-widest hover:border-[#0A1128] hover:text-[#0A1128] hover:bg-[#f8f9ff] transition-all rounded-none disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSave('Finalized')}
            disabled={saving}
            className="px-8 py-3.5 bg-[#D4AF37] text-[#0A1128] font-label-md text-[13px] font-bold uppercase tracking-widest hover:bg-[#ffe088] shadow-md transition-all rounded-none border border-[#D4AF37] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save & Issue Invoice'}
          </button>
        </div>

      </div>

      {/* Status Summary Side Panel (Right 4 Columns) */}
      <aside className="lg:col-span-4 space-y-8">
        
        {/* Status Card */}
        <div className="bg-[#0A1128] p-8 shadow-md border border-[#162244] rounded-none">
          <h4 className="font-label-md text-[13px] text-[#D4AF37] uppercase tracking-widest mb-6 font-bold">Status Summary</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[#162244] pb-4">
              <span className="text-[#7c839f] font-label-sm text-[11px] uppercase tracking-widest">Current Status</span>
              <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] font-label-sm text-[10px] font-bold border border-[#D4AF37]/30 uppercase tracking-widest rounded-none">
                {invoice.status}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[#162244] pb-4">
              <span className="text-[#7c839f] font-label-sm text-[11px] uppercase tracking-widest">Currency</span>
              <span className="text-white font-body-md text-[14px]">USD - Dollar</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-[#7c839f] font-label-sm text-[11px] uppercase tracking-widest">Total</span>
              <span className="text-white font-body-md text-[14px] font-bold">{formatCurrency(total)}</span>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-[#162244]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-[#D4AF37]/50 flex items-center justify-center">
                <ShieldCheck size={20} className="text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold text-[#D4AF37] leading-tight tracking-widest">Kiya Law Certified</p>
                <p className="text-[9px] uppercase tracking-widest text-[#7c839f] mt-1">Secure Financial Transmission</p>
              </div>
            </div>
          </div>
        </div>

        {/* Draft Audit Log */}
        <div className="bg-white border border-[#c6c6ce]/40 shadow-sm p-8 rounded-none">
          <h4 className="font-label-md text-[13px] uppercase tracking-widest text-[#7c839f] mb-6 flex items-center font-bold">
            <History size={18} className="mr-3" />
            Draft Audit Log
          </h4>
          <div className="space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-px before:bg-[#c6c6ce]/60">
            
            <div className="relative pl-8">
              <div className="absolute left-0 top-1 w-6 h-6 bg-white flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
              </div>
              <p className="font-label-sm text-[13px] font-bold text-[#0A1128]">Invoice Created</p>
              <p className="text-[11px] text-[#7c839f] font-bold uppercase tracking-widest my-1">
                {new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="font-label-sm text-[13px] text-[#46464d] italic">Initial invoice draft generated.</p>
            </div>

          </div>
        </div>

        {/* Editor Insights Action Card */}
        <div className="bg-[#eff4ff] border-l-4 border-l-[#D4AF37] p-6 rounded-r-lg">
          <p className="font-label-sm text-[11px] font-bold text-[#D4AF37] uppercase tracking-widest mb-3">Editor Insights</p>
          <p className="font-body-md text-[14px] text-[#0A1128] leading-relaxed">
            This invoice exceeds the standard client retainer threshold. Ensure all time logs are approved by the lead partner before final issuance.
          </p>
        </div>

      </aside>

    </div>
  );
}
