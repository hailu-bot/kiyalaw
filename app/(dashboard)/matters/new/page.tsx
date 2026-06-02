'use client';

import { useState, useCallback, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronRight, ChevronDown, Lock, ShieldCheck, Wallet, FolderLock, Users } from 'lucide-react';
import Link from 'next/link';
import { createMatter } from '@/app/actions/matterActions';
import { useToastStore } from '@/lib/store/useToastStore';
import { getClients } from '@/app/actions/clientActions';
import { SelectClientModal } from '@/components/client/SelectClientModal';
import AiTextAssistant from '@/components/ai/AiTextAssistant';
import type { ClientDirectoryEntry } from '@/lib/types';

function NewMatterFormInner() {
  const router = useRouter();
  const { addToast, updateToast } = useToastStore();
  const [submitting, setSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const clientIdParam = searchParams.get('clientId') || '';
  const initialClientName = searchParams.get('clientName') || '';

  const [clients, setClients] = useState<ClientDirectoryEntry[]>([]);
  const [selectedClientId, setSelectedClientId] = useState(clientIdParam);
  const [selectedClientName, setSelectedClientName] = useState(initialClientName);
  const [showClientModal, setShowClientModal] = useState(false);

  useEffect(() => {
    getClients().then(setClients);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    const toastId = addToast('Creating matter...', 'pending');

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('clientId', selectedClientId);
      formData.set('clientName', selectedClientName);
      const result = await createMatter(formData);

      if (!result.success) {
        updateToast(toastId, result.message, 'error');
        setSubmitting(false);
        return;
      }

      updateToast(toastId, result.message, 'success');
      router.push('/matters');
    } catch {
      updateToast(toastId, 'An unexpected error occurred.', 'error');
      setSubmitting(false);
    }
  }, [submitting, addToast, router, selectedClientId, selectedClientName]);

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-container-max mx-auto w-full">

      
      {/* Breadcrumbs */}
      <div className="mb-8 flex items-center gap-2">
        <Link href="/matters" className="font-label-sm text-label-sm text-[#7c839f] uppercase tracking-widest hover:text-[#D4AF37] transition-colors">
          Matters
        </Link>
        <ChevronRight size={16} className="text-[#c6c6ce]" />
        <span className="font-label-sm text-label-sm text-[#0A1128] font-bold uppercase tracking-widest">
          Create New Matter
        </span>
      </div>

      {/* Page Header */}
      <div className="mb-10">
        <h2 className="text-[32px] md:text-[40px] font-headline-md font-bold text-[#0A1128] mb-3 tracking-tight">
          Create New Matter
        </h2>
        <p className="text-[16px] font-body-md text-[#46464d] max-w-2xl leading-relaxed">
          Initiate a formal matter by providing the core details below. This will create a centralized workspace for all related filings, documents, and time entries.
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-[#c6c6ce]/40 shadow-sm p-6 md:p-10 space-y-10 rounded-none">
        {/* Elite Accent Strip */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#0A1128]"></div>
        
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8"
        >

          
          {/* Matter Name */}
              <div className="col-span-full group">
            <label className="block font-label-md text-[13px] text-[#7c839f] mb-2 uppercase tracking-widest font-bold group-focus-within:text-[#D4AF37] transition-colors">Matter Code</label>
            <input 
              name="matterCode"
              className="w-full border-0 border-b border-[#c6c6ce]/60 bg-transparent py-3 text-[24px] font-headline-md placeholder:text-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 transition-colors outline-none text-[#0A1128]" 
              placeholder="e.g., MAT-2026-001" 
              type="text"
            />

            <label className="block font-label-md text-[13px] text-[#7c839f] mb-2 mt-6 uppercase tracking-widest font-bold group-focus-within:text-[#D4AF37] transition-colors">Matter Name</label>
            <input 
              name="title"
              className="w-full border-0 border-b border-[#c6c6ce]/60 bg-transparent py-3 text-[24px] font-headline-md placeholder:text-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 transition-colors outline-none text-[#0A1128]" 
              placeholder="e.g., Acquisition of Meridian Tech Group" 
              type="text"
            />
          </div>

          {/* Client Selection */}
          <div className="col-span-1 group">
            <label className="block font-label-md text-[13px] text-[#7c839f] mb-2 uppercase tracking-widest font-bold group-focus-within:text-[#D4AF37] transition-colors">Client Selection</label>
            <input type="hidden" name="clientId" value={selectedClientId} />
            <button
              type="button"
              onClick={() => setShowClientModal(true)}
              className="w-full flex items-center justify-between border-0 border-b border-[#c6c6ce]/60 bg-transparent py-3 text-[15px] font-body-md focus:outline-none text-[#0A1128] cursor-pointer hover:border-[#D4AF37] transition-colors"
            >
              <span className={selectedClientName ? 'text-[#0A1128]' : 'text-[#c6c6ce]'}>
                {selectedClientName || 'Select a client...'}
              </span>
              <Users size={18} className="text-[#c6c6ce] group-focus-within:text-[#D4AF37] transition-colors" />
            </button>

            {showClientModal && (
              <SelectClientModal
                open={showClientModal}
                onClose={() => setShowClientModal(false)}
                onSelect={(cid) => {
                  const client = clients.find(c => c.id === cid);
                  if (client) {
                    setSelectedClientId(cid);
                    setSelectedClientName(client.name);
                  }
                }}
                clients={clients}
              />
            )}
          </div>

          {/* Practice Area */}
          <div className="col-span-1 group">
            <label htmlFor="practice-area" className="block font-label-md text-[13px] text-[#7c839f] mb-2 uppercase tracking-widest font-bold group-focus-within:text-[#D4AF37] transition-colors">Practice Area</label>
            <div className="relative">
              <ChevronDown size={18} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#c6c6ce] pointer-events-none group-focus-within:text-[#D4AF37] transition-colors" />
              <select name="practiceArea" id="practice-area" aria-label="Practice Area" defaultValue="" className="w-full appearance-none border-0 border-b border-[#c6c6ce]/60 bg-transparent py-3 pr-8 text-[15px] font-body-md focus:ring-0 focus:border-[#D4AF37] transition-colors outline-none text-[#0A1128] cursor-pointer">
                <option value="" disabled>Select Practice Area</option>

                <option value="Corporate">Corporate</option>
                <option value="Litigation">Litigation</option>
                <option value="Intellectual Property">Intellectual Property</option>
                <option value="Real Estate">Real Estate</option>
              </select>

            </div>
          </div>

          {/* Case Type */}
          <div className="col-span-1 group">
            <label htmlFor="case-type" className="block font-label-md text-[13px] text-[#7c839f] mb-2 uppercase tracking-widest font-bold group-focus-within:text-[#D4AF37] transition-colors">Case Type</label>
            <div className="relative">
              <ChevronDown size={18} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#c6c6ce] pointer-events-none group-focus-within:text-[#D4AF37] transition-colors" />
              <select name="caseType" id="case-type" aria-label="Case Type" defaultValue="" className="w-full appearance-none border-0 border-b border-[#c6c6ce]/60 bg-transparent py-3 pr-8 text-[15px] font-body-md focus:ring-0 focus:border-[#D4AF37] transition-colors outline-none text-[#0A1128] cursor-pointer">
                <option value="" disabled>Select Case Type</option>

                <option value="Mergers & Acquisitions">Mergers &amp; Acquisitions</option>
                <option value="Securities Offering">Securities Offering</option>
                <option value="Governance Audit">Governance Audit</option>
                <option value="Joint Venture">Joint Venture</option>
              </select>

            </div>
          </div>

          {/* Assigned Attorney */}
          <div className="col-span-1 group">
            <label className="block font-label-md text-[13px] text-[#7c839f] mb-2 uppercase tracking-widest font-bold group-focus-within:text-[#D4AF37] transition-colors">Assigned Attorney</label>
            <div className="relative">
              <Search size={18} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#c6c6ce] group-focus-within:text-[#D4AF37] transition-colors" />
              <input 
                name="leadAttorneyName"
                className="w-full border-0 border-b border-[#c6c6ce]/60 bg-transparent py-3 pr-8 text-[15px] font-body-md focus:border-[#D4AF37] focus:ring-0 transition-colors outline-none text-[#0A1128]" 
                placeholder="Find lead counsel..." 
                type="text"
              />

            </div>
          </div>

          {/* Matter Description */}
          <div className="col-span-full group mt-4">
            <label className="block font-label-md text-[13px] text-[#7c839f] mb-3 uppercase tracking-widest font-bold group-focus-within:text-[#D4AF37] transition-colors">Matter Description</label>
            <AiTextAssistant 
              name="description"
              className="w-full border border-[#c6c6ce]/60 bg-transparent p-4 text-[15px] font-body-md resize-none focus:border-[#D4AF37] transition-colors outline-none text-[#0A1128] focus:ring-1 focus:ring-[#D4AF37]" 
              placeholder="Briefly overview the scope and critical objectives of this matter..." 
              rows={4}
            />

          </div>

          {/* Footer / Actions */}
          <div className="col-span-full pt-8 flex flex-col md:flex-row justify-between items-center border-t border-[#c6c6ce]/30 gap-6">
            <div className="flex items-center gap-2 text-[#7c839f]">
              <Lock size={16} />
              <span className="text-[11px] font-label-sm uppercase tracking-widest font-bold">Secure High-Authority Entry</span>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Link href="/matters" className="flex-1 md:flex-none text-center font-label-md text-[14px] text-[#7c839f] hover:text-[#0A1128] font-bold py-3 px-6 transition-colors rounded hover:bg-[#f8f9ff]">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 md:flex-none bg-[#0A1128] text-white text-[13px] font-label-md font-bold uppercase tracking-wider px-6 py-3 hover:bg-[#162244] transition-colors rounded shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create Matter'}
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Contextual Information (Bento Style Sidebar Glimpse) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-6 border border-[#c6c6ce]/40 bg-white rounded-none shadow-sm hover:shadow-md transition-shadow">
          <ShieldCheck size={28} className="text-[#D4AF37] mb-4" />
          <h4 className="font-label-md text-[13px] font-bold text-[#0A1128] mb-2 uppercase tracking-widest">Compliance Check</h4>
          <p className="font-body-md text-[14px] text-[#46464d] leading-relaxed">Automatic conflict-of-interest screening will trigger upon submission.</p>
        </div>
        
        <div className="p-6 border border-[#c6c6ce]/40 bg-white rounded-none shadow-sm hover:shadow-md transition-shadow">
          <Wallet size={28} className="text-[#D4AF37] mb-4" />
          <h4 className="font-label-md text-[13px] font-bold text-[#0A1128] mb-2 uppercase tracking-widest">Billing Structure</h4>
          <p className="font-body-md text-[14px] text-[#46464d] leading-relaxed">Default rate schedules for the selected practice area will be applied.</p>
        </div>
        
        <div className="p-6 border border-[#c6c6ce]/40 bg-white rounded-none shadow-sm hover:shadow-md transition-shadow">
          <FolderLock size={28} className="text-[#D4AF37] mb-4" />
          <h4 className="font-label-md text-[13px] font-bold text-[#0A1128] mb-2 uppercase tracking-widest">Auto-Provisioning</h4>
          <p className="font-body-md text-[14px] text-[#46464d] leading-relaxed">A dedicated secure document vault will be created automatically.</p>
        </div>

      </div>

    </div>
  );
}

export default function NewMatterPage() {
  return (
    <Suspense fallback={<div className="px-6 py-12 text-[#46464d]">Loading...</div>}>
      <NewMatterFormInner />
    </Suspense>
  );
}