'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, PlusCircle, Send, Trash2, Users } from 'lucide-react';
import { createInvoice } from '@/app/actions/billingActions';
import { useToastStore } from '../../lib/store/useToastStore';
import { SelectClientModal } from '../client/SelectClientModal';
import AiTextAssistant from '@/components/ai/AiTextAssistant';
import type { ClientDirectoryEntry } from '@/lib/types';

interface LineItem {
  id: string;
  description: string;
  hours: number;
  rate: number;
}

type MatterOption = {
  id: string;
  title: string;
  clientName: string;
  clientId: string | null;
};

type FirmData = {
  logoUrl: string | null;
  firmName?: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
};

function createEmptyRow(): LineItem {
  return { id: crypto.randomUUID(), description: '', hours: 0, rate: 0 };
}

export default function CreateInvoiceForm({
  matters, clients, initialClientId, firm,
}: {
  matters: MatterOption[];
  clients: ClientDirectoryEntry[];
  initialClientId?: string;
  firm?: FirmData | null;
}) {
  const router = useRouter();
  const { addToast, updateToast } = useToastStore();
  const [submitting, setSubmitting] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(initialClientId || '');
  const [billToAddress, setBillToAddress] = useState('');
  const [billToEmail, setBillToEmail] = useState('');
  const [billToPhone, setBillToPhone] = useState('');

  const filteredMatters = useMemo(() => {
    if (!selectedClientId) return matters;
    return matters.filter(m => m.clientId === selectedClientId);
  }, [matters, selectedClientId]);

  const selectedClientName = useMemo(() => {
    if (!selectedClientId) return '';
    const c = clients.find(c => c.id === selectedClientId);
    return c?.name || '';
  }, [clients, selectedClientId]);

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: 'Legal Consultation - M&A Strategy', hours: 4.5, rate: 850 },
    { id: crypto.randomUUID(), description: 'Document Drafting and Review', hours: 12, rate: 650 },
  ]);

  const [formFields, setFormFields] = useState(() => {
    const now = Date.now();
    const firstMatter = matters.length > 0 ? matters[0].id : '';
    return {
      clientMatter: firstMatter,
      invoiceDate: new Date(now).toISOString().split('T')[0],
      dueDate: new Date(now + 30 * 86400000).toISOString().split('T')[0],
      invoiceNumber: `INV-${now}`,
      notes: 'Payment is due within 30 days. Please include the invoice number on your check or wire transfer reference.',
    };
  });

  const updateLineItem = useCallback((id: string, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: field === 'description' ? String(value) : Number(value) } : item
      )
    );
  }, []);

  const removeLineItem = useCallback((id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addLineItem = useCallback(() => {
    setLineItems((prev) => [...prev, createEmptyRow()]);
  }, []);

  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, item) => acc + Number(item.hours) * Number(item.rate), 0);
  }, [lineItems]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (submitting) return;

      if (!formFields.clientMatter) {
        addToast('Please select a client or matter.', 'error');
        return;
      }

      const validItems = lineItems.filter((li) => li.description.trim() && Number(li.hours) > 0 && Number(li.rate) > 0);
      if (validItems.length === 0) {
        addToast('Add at least one line item with description, hours, and rate.', 'error');
        return;
      }

      const selectedMatter = matters.find(m => m.id === formFields.clientMatter);
      const clientName = selectedMatter?.clientName || '';

      setSubmitting(true);
      const toastId = addToast('Generating invoice...', 'pending');

      try {
        const payload = {
          invoiceNumber: formFields.invoiceNumber,
          matterId: formFields.clientMatter,
          clientName,
          amount: Number(subtotal) || 0,
          dueDateLabel: formFields.dueDate,
          notes: formFields.notes,
          lineItems: validItems.map((li) => ({
            description: String(li.description).trim(),
            hours: Number(li.hours) || 0,
            rate: Number(li.rate) || 0,
            total: (Number(li.hours) || 0) * (Number(li.rate) || 0),
          })),
        };

        const result = await createInvoice(payload);

        if (!result.success) {
          updateToast(toastId, result.message, 'error');
          setSubmitting(false);
          return;
        }

        updateToast(toastId, `Invoice ${formFields.invoiceNumber} successfully transmitted to approval queue.`, 'success');
        router.push('/billing');
      } catch {
        addToast('Database transmission failed. Please inspect input formats.', 'error');
        setSubmitting(false);
      }
    },
    [formFields, lineItems, subtotal, submitting, addToast, router, matters]
  );

  const handleClientSelect = useCallback((cid: string) => {
    setSelectedClientId(cid);
    const clientMatters = matters.filter(m => m.clientId === cid);
    setFormFields(f => ({ ...f, clientMatter: clientMatters.length > 0 ? clientMatters[0].id : '' }));
    const client = clients.find(c => c.id === cid);
    if (client) {
      const addr = client.billingAddress as Record<string, string> | string | null | undefined;
      const formatted = addr
        ? (typeof addr === 'string' ? addr : [addr.street, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(', '))
        : '';
      setBillToAddress(formatted);
      setBillToEmail(client.email || '');
      setBillToPhone(client.phone || '');
    }
  }, [matters, clients]);

  return (
    <div className="bg-white border border-[#c6c6ce] shadow-sm relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#0A1128]"></div>

      <form className="p-8 md:p-10 flex flex-col gap-6" onSubmit={handleSubmit}>
        {/* Invoice Header — matches InvoiceDetail layout */}
        <div className="flex justify-between items-start mb-2">
          <div>
            {(firm?.logoUrl || true) && (
              <img
                src={firm?.logoUrl || '/Asset 1.png'}
                alt=""
                className="max-h-[60px] w-auto object-contain mb-2"
              />
            )}
            <div className="text-[11px] text-[#46464d] leading-relaxed">
              {firm?.address && <div>{firm.address}</div>}
              <div className="flex gap-2 flex-wrap">
                {firm?.phone && <span>{firm.phone}</span>}
                {firm?.phone && firm?.email && <span className="text-[#c6c6ce]">|</span>}
                {firm?.email && <span>{firm.email}</span>}
                {firm?.email && firm?.website && <span className="text-[#c6c6ce]">|</span>}
                {firm?.website && <span>{firm.website}</span>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#7c839f] uppercase tracking-[2px] font-bold mb-1">Invoice</div>
            <div className="text-[22px] font-headline-sm text-[#0A1128]">{formFields.invoiceNumber}</div>
          </div>
        </div>

        <div className="border-t border-[#0A1128]" />

        {/* Bill To */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] text-[#7c839f] uppercase tracking-[1.5px] font-bold">Bill To</span>
            <button type="button" onClick={() => setShowClientModal(true)} className="text-[#D4AF37] hover:text-[#b8962e] transition-colors" title="Select client">
              <Users size={14} />
            </button>
          </div>

          {selectedClientId ? (
            <div className="space-y-1">
              <div className="font-headline-sm text-[16px] text-[#0A1128]">{selectedClientName}</div>
              <input
                type="text"
                value={billToAddress}
                onChange={e => setBillToAddress(e.target.value)}
                placeholder="Street, City, State, ZIP"
                className="w-full text-[12px] border-0 border-b border-[#c6c6ce]/60 p-1 outline-none focus:border-[#D4AF37] transition-colors"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={billToEmail}
                  onChange={e => setBillToEmail(e.target.value)}
                  placeholder="Email"
                  className="flex-1 text-[12px] border-0 border-b border-[#c6c6ce]/60 p-1 outline-none focus:border-[#D4AF37] transition-colors"
                />
                <input
                  type="text"
                  value={billToPhone}
                  onChange={e => setBillToPhone(e.target.value)}
                  placeholder="Phone"
                  className="flex-1 text-[12px] border-0 border-b border-[#c6c6ce]/60 p-1 outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClientModal(true)}
              className="text-[13px] text-[#D4AF37] hover:text-[#b8962e] font-bold underline underline-offset-2 transition-colors"
            >
              + Select Client
            </button>
          )}
        </div>

        {/* Matter + Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-[#c6c6ce]/50">
          <div className="md:col-span-1">
            <label className="text-[9px] text-[#7c839f] uppercase tracking-[1.5px] font-bold block mb-1">Matter</label>
            <div className="relative">
              <select
                className="w-full bg-transparent border-0 border-b border-[#c6c6ce]/60 text-[#0A1128] text-[13px] py-2 pr-8 focus:border-[#D4AF37] transition-colors appearance-none outline-none cursor-pointer"
                value={formFields.clientMatter}
                onChange={(e) => setFormFields((f) => ({ ...f, clientMatter: e.target.value }))}
              >
                {filteredMatters.length === 0 && <option value="">{selectedClientId ? 'No matters for this client' : 'Select a client first'}</option>}
                {filteredMatters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.clientName} — {m.title}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-1 top-1/2 -translate-y-1/2 text-[#c6c6ce] pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-[9px] text-[#7c839f] uppercase tracking-[1.5px] font-bold block mb-1">Date</label>
            <input
              type="date"
              value={formFields.invoiceDate}
              onChange={(e) => setFormFields((f) => ({ ...f, invoiceDate: e.target.value }))}
              className="w-full bg-transparent border-0 border-b border-[#c6c6ce]/60 text-[13px] text-[#0A1128] py-2 outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
          <div>
            <label className="text-[9px] text-[#7c839f] uppercase tracking-[1.5px] font-bold block mb-1">Due</label>
            <input
              type="date"
              value={formFields.dueDate}
              onChange={(e) => setFormFields((f) => ({ ...f, dueDate: e.target.value }))}
              className="w-full bg-transparent border-0 border-b border-[#c6c6ce]/60 text-[13px] text-[#0A1128] py-2 outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
        </div>

        {/* Line Items */}
        <div>
          <div className="grid grid-cols-12 gap-2 text-[9px] text-[#7c839f] uppercase tracking-[1.5px] font-bold pb-2 border-b border-[#0A1128] mb-1">
            <div className="col-span-5">Description</div>
            <div className="col-span-2 text-right">Hours</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          {lineItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 py-2 border-b border-[#c6c6ce]/30 items-center group">
              <div className="col-span-5">
                <input
                  type="text"
                  placeholder="Service description"
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  className="w-full bg-transparent border-0 text-[12px] text-[#0A1128] p-1 outline-none focus:border-b focus:border-[#D4AF37] transition-all"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="0"
                  step="0.1"
                  min="0"
                  value={item.hours || ''}
                  onChange={(e) => updateLineItem(item.id, 'hours', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent border-0 text-[12px] text-[#0A1128] p-1 text-right outline-none focus:border-b focus:border-[#D4AF37] transition-all"
                />
              </div>
              <div className="col-span-2">
                <div className="flex items-center justify-end">
                  <span className="text-[11px] text-[#46464d] mr-0.5">$</span>
                  <input
                    type="number"
                    placeholder="0"
                    step="0.01"
                    min="0"
                    value={item.rate || ''}
                    onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent border-0 text-[12px] text-[#0A1128] p-1 text-right outline-none focus:border-b focus:border-[#D4AF37] transition-all"
                  />
                </div>
              </div>
              <div className="col-span-2 text-right text-[12px] text-[#0A1128] font-bold">
                {formatCurrency(Number(item.hours) * Number(item.rate))}
              </div>
              <div className="col-span-1 text-center">
                <button
                  type="button"
                  onClick={() => removeLineItem(item.id)}
                  className="text-[#c6c6ce] hover:text-[#ba1a1a] transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove line item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          <div className="mt-2">
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-1 text-[#D4AF37] text-[11px] font-bold uppercase tracking-wider hover:text-[#735c00] transition-colors"
            >
              <PlusCircle size={14} />
              Add Line Item
            </button>
          </div>
        </div>

        {/* Totals — right-aligned, matches InvoiceDetail */}
        <div className="flex justify-end mt-2">
          <div className="w-1/3">
            <div className="flex justify-between py-1 text-[12px] text-[#46464d]">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between py-1 text-[14px] font-bold text-[#0A1128] border-t border-[#0A1128] pt-2 mt-1">
              <span>Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="pt-4 border-t border-[#c6c6ce]/40">
          <label className="text-[9px] text-[#7c839f] uppercase tracking-[1.5px] font-bold block mb-2">Notes &amp; Payment Terms</label>
          <AiTextAssistant
            value={formFields.notes}
            onChange={(v) => setFormFields((f) => ({ ...f, notes: v }))}
            className="w-full bg-[#f8f9ff] border border-[#c6c6ce]/60 text-[13px] text-[#0A1128] p-3 focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors resize-none outline-none"
            rows={3}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#D4AF37] text-[#0A1128] font-label-md text-[13px] font-bold py-3.5 px-10 flex items-center justify-center gap-3 hover:bg-[#ffe088] shadow-md transition-all uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <Send size={16} />
            )}
            {submitting ? 'Issuing Invoice...' : 'Save & Issue Invoice'}
          </button>
        </div>
      </form>

      <SelectClientModal
        open={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSelect={handleClientSelect}
        clients={clients}
      />
    </div>
  );
}