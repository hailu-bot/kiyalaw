'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, ChevronRight, ChevronDown, UploadCloud, Lock, Wallet, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useUIStore } from '../../lib/store/useUIStore';
import { useToastStore } from '../../lib/store/useToastStore';
import { createActivity } from '@/app/actions/matterActions';
import AiTextAssistant from '@/components/ai/AiTextAssistant';

export default function NewActivityForm({ matterId, matterTitle }: { matterId: string; matterTitle: string }) {
  const router = useRouter();
  const { setTopNavContent } = useUIStore();
  const { addToast, updateToast } = useToastStore();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('matterId', matterId);

    setSubmitting(true);
    const toastId = addToast('Saving activity...', 'pending');

    try {
      const result = await createActivity(formData);
      if (!result.success) {
        updateToast(toastId, result.message, 'error');
        setSubmitting(false);
        return;
      }
      updateToast(toastId, result.message, 'success');
      router.push(`/matters/${matterId}`);
    } catch {
      updateToast(toastId, 'Failed to save activity.', 'error');
      setSubmitting(false);
    }
  }, [matterId, submitting, addToast, router]);

  useEffect(() => {
    setTopNavContent(
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => router.push(`/matters/${matterId}`)}
          className="font-label-md text-[13px] font-bold uppercase tracking-wider text-[#46464d] hover:text-[#0A1128] px-4 py-2 transition-colors">Discard</button>
        <button type="button" onClick={() => { const form = document.querySelector('#activity-form') as HTMLFormElement; if (form) form.requestSubmit(); }}
          className="font-label-md text-[13px] font-bold uppercase tracking-wider bg-[#0A1128] text-white px-6 py-2 hover:bg-[#162244] transition-colors shadow-sm">Save Activity</button>
      </div>
    );
    return () => setTopNavContent(null);
  }, [setTopNavContent, matterId, router]);

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-container-max mx-auto w-full">
      <div className="mb-8 flex items-center gap-2">
        <Link href="/matters" className="font-label-sm text-label-sm text-[#7c839f] uppercase tracking-widest hover:text-[#D4AF37] transition-colors">Matters</Link>
        <ChevronRight className="text-[#c6c6ce]" />
        <Link href={`/matters/${matterId}`} className="font-label-sm text-label-sm text-[#0A1128] font-bold uppercase tracking-widest">{matterId}</Link>
        <ChevronRight className="text-[#c6c6ce]" />
        <span className="font-label-sm text-label-sm text-[#0A1128] font-bold uppercase tracking-widest">New Activity</span>
      </div>

      <div className="mb-10">
        <h2 className="text-[32px] md:text-[40px] font-headline-md font-bold text-[#0A1128] mb-3 tracking-tight leading-none">Log New Activity</h2>
        <p className="text-[16px] font-body-md text-[#46464d] max-w-2xl leading-relaxed">Initiate a formal matter by providing the core details below. This will create a centralized workspace for all related filings, documents, and time entries.</p>
      </div>

      <div className="bg-white border border-[#c6c6ce]/40 shadow-sm p-6 md:p-10 space-y-10 rounded-none">
        <form id="activity-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

          <div className="col-span-1 group">
            <label className="block font-label-md text-[13px] text-[#7c839f] mb-2 uppercase tracking-widest font-bold group-focus-within:text-[#D4AF37] transition-colors">Activity Type</label>
            <div className="relative">
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-[#c6c6ce] pointer-events-none group-focus-within:text-[#D4AF37] transition-colors" />
              <select name="type" defaultValue="" aria-label="Filter by activity type"
                className="w-full appearance-none border-0 border-b border-[#c6c6ce]/60 bg-transparent py-3 pr-8 text-[15px] font-body-md focus:ring-0 focus:border-[#D4AF37] transition-colors outline-none text-[#0A1128] cursor-pointer">
                <option disabled value="">Select Activity Type</option>
                <option value="time">Time Entry</option>
                <option value="document">Document Drafted</option>
                <option value="communication">Communication</option>
              </select>
            </div>
          </div>

          <div className="col-span-1 group mt-4">
            <label className="block font-label-md text-[13px] text-[#7c839f] mb-2 uppercase tracking-widest font-bold group-focus-within:text-[#D4AF37] transition-colors">Matter Reference</label>
            <div className="bg-[#f8f9ff] border border-[#c6c6ce]/40 p-4">
              <p className="text-[15px] font-body-md text-[#0A1128] font-semibold">{matterId} - {matterTitle}</p>
            </div>
          </div>

          <div className="col-span-full group mt-4">
            <label className="block font-label-md text-[13px] text-[#7c839f] mb-3 uppercase tracking-widest font-bold group-focus-within:text-[#D4AF37] transition-colors">Activity Description</label>
            <AiTextAssistant name="description"
              className="w-full border border-[#c6c6ce]/60 bg-transparent p-4 text-[15px] font-body-md resize-none focus:border-[#D4AF37] transition-colors outline-none text-[#0A1128] focus:ring-1 focus:ring-[#D4AF37]"
              placeholder="Enter a detailed professional narrative of the activity performed..." rows={4} />
          </div>

          <div className="col-span-full group mt-4">
            <label className="block font-label-md text-[13px] text-[#7c839f] mb-3 uppercase tracking-widest font-bold group-focus-within:text-[#D4AF37] transition-colors">Relevant Attachments</label>
            <div className="border-2 border-dashed border-[#c6c6ce]/60 bg-[#f8f9ff] p-10 text-center rounded-none hover:border-[#0A1128] transition-colors cursor-pointer">
              <UploadCloud size={48} className="mx-auto text-[#c6c6ce] mb-4 group-hover:text-[#0A1128] transition-colors" />
              <p className="text-[15px] font-body-md text-[#46464d]">Drag and drop legal documents or <span className="text-[#0A1128] font-bold underline">browse files</span></p>
              <p className="text-[12px] text-[#7c839f] mt-2 font-medium">Maximum file size: 50MB. Supported formats: .pdf, .docx, .xlsx</p>
            </div>
          </div>

          <div className="col-span-full pt-8 flex flex-col md:flex-row justify-between items-center border-t border-[#c6c6ce]/30 gap-6">
            <div className="flex items-center gap-2 text-[#7c839f]">
              <Lock size={16} />
              <span className="text-[11px] font-label-sm uppercase tracking-widest font-bold">Secure High-Authority Entry</span>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Link href={`/matters/${matterId}`} className="flex-1 md:flex-none px-6 py-3 text-[#7c839f] hover:text-[#0A1128] font-bold transition-colors hover:bg-[#f8f9ff]">Cancel</Link>
              <button type="submit" disabled={submitting}
                className="flex-1 md:flex-none bg-[#0A1128] text-white text-[13px] font-label-md font-bold uppercase tracking-wider px-6 py-3 hover:bg-[#162244] transition-colors rounded-none shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? 'Saving...' : 'Save Activity'}
              </button>
            </div>
          </div>

        </form>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border border-[#c6c6ce]/40 bg-white rounded-none shadow-sm hover:shadow-md transition-shadow">
          <Clock size={28} className="text-[#D4AF37] mb-4" />
          <h4 className="font-label-md text-[13px] font-bold text-[#0A1128] mb-2 uppercase tracking-widest">Last Entry</h4>
          <p className="text-[15px] font-body-md text-[#46464d] leading-relaxed">Partner Review & Revisions • Oct 24, 2023 • 2.5h</p>
        </div>
        <div className="p-6 border border-[#c6c6ce]/40 bg-white rounded-none shadow-sm hover:shadow-md transition-shadow">
          <Wallet size={28} className="text-[#D4AF37] mb-4" />
          <h4 className="font-label-md text-[13px] font-bold text-[#0A1128] mb-2 uppercase tracking-widest">Billable Status</h4>
          <p className="text-[15px] font-body-md text-[#46464d] leading-relaxed">142.5 hours logged (75% of target)</p>
        </div>
        <div className="p-6 border border-[#c6c6ce]/40 bg-white rounded-none shadow-sm hover:shadow-md transition-shadow">
          <ShieldCheck size={28} className="text-[#D4AF37] mb-4" />
          <h4 className="font-label-md text-[13px] font-bold text-[#0A1128] mb-2 uppercase tracking-widest">Compliance</h4>
          <p className="text-[15px] font-body-md text-[#46464d] leading-relaxed">Ethics review passed.</p>
        </div>
      </div>
    </div>
  );
}
