'use client';

import React, { useActionState } from 'react';
import { Zap, Settings as SettingsIcon, Bell, Bolt } from 'lucide-react';
import { updateAutomationSettings } from '@/app/actions/settingsActions';

interface AutomationData {
  requireApproval: boolean;
  autoArchive: boolean;
  notifySuccess: boolean;
  notifyClient: boolean;
  notifyDelegation: boolean;
  leadTime: number;
  docFormat: string;
}

export default function TabAutomation({ data }: { data: AutomationData }) {
  const [state, formAction, pending] = useActionState(
    async (prev: { success: boolean; message?: string } | null, formData: FormData) => {
      return updateAutomationSettings(formData);
    },
    null
  );

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Bolt size={24} className="text-[#D4AF37]" />
        <h2 className="font-headline-sm text-headline-sm text-[#0A1128]">Automation Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white border border-[#c6c6ce]/30 shadow-[0_4px_40px_rgba(10,17,40,0.03)] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#c6c6ce]/20 bg-[#f8f9ff]/50 flex items-center gap-3">
              <Zap size={20} className="text-[#0A1128]" />
              <h2 className="font-headline-sm text-[20px] font-bold text-[#0A1128]">Default Workflow Triggers</h2>
            </div>
            <form action={formAction} className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#c6c6ce]/10">
                <div className="flex-1">
                  <h3 className="font-label-md text-[13px] font-bold text-[#0A1128] mb-1">New Matter Intake</h3>
                  <p className="font-body-md text-[14px] text-[#46464d]">Automatically trigger standard onboarding sequence when a new matter is opened.</p>
                </div>
                <div className="w-full sm:w-48">
                  <label className="block font-label-sm text-[11px] text-[#46464d] mb-1 uppercase tracking-wider font-bold">Sequence Type</label>
                  <select name="intakeSequence" className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 px-3 py-2 font-body-md text-[14px] text-[#0A1128] outline-none">
                    <option>Standard Corporate</option>
                    <option>High Net Worth</option>
                    <option>Litigation Fast-Track</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#c6c6ce]/10">
                <div className="flex-1">
                  <h3 className="font-label-md text-[13px] font-bold text-[#0A1128] mb-1">Invoice Generation Lead Time</h3>
                  <p className="font-body-md text-[14px] text-[#46464d]">Days before billing cycle end to draft preliminary invoices.</p>
                </div>
                <div className="w-full sm:w-32">
                  <label className="block font-label-sm text-[11px] text-[#46464d] mb-1 uppercase tracking-wider font-bold">Days</label>
                  <input
                    type="number"
                    name="leadTime"
                    defaultValue={data.leadTime}
                    min={1} max={30}
                    className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 px-3 py-2 font-body-md text-[14px] text-[#0A1128] outline-none text-right"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-label-md text-[13px] font-bold text-[#0A1128] mb-1">Document Finalization Routing</h3>
                  <p className="font-body-md text-[14px] text-[#46464d]">Default signatory routing path for finalized legal documents.</p>
                </div>
                <div className="w-full sm:w-48">
                  <label className="block font-label-sm text-[11px] text-[#46464d] mb-1 uppercase tracking-wider font-bold">Default Path</label>
                  <select name="docRouting" className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 px-3 py-2 font-body-md text-[14px] text-[#0A1128] outline-none">
                    <option>Partner → Client</option>
                    <option>Associate → Partner</option>
                    <option>Client Direct (E-Sign)</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-[#c6c6ce]/10 pt-6 mt-6">
                <div className="flex justify-end gap-4">
                  <button type="submit" disabled={pending}
                    className="px-6 py-2.5 bg-[#0A1128] text-white font-label-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#162244] transition-colors disabled:opacity-60"
                  >
                    {pending ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
                {state?.success && (
                  <div className="bg-[#e8f5e9] border border-[#4caf50] text-[#2e7d32] px-4 py-3 text-[13px] font-medium mt-4">Automation settings saved.</div>
                )}
              </div>
            </form>
          </section>

          <section className="bg-[#0A1128] text-white border border-[#162244] shadow-[0_4px_40px_rgba(10,17,40,0.08)] overflow-hidden relative">
            <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
              <SettingsIcon size={20} className="text-[#D4AF37]" />
              <h2 className="font-headline-sm text-[20px] font-bold">Firm-Wide Policies</h2>
            </div>
            <form action={formAction} className="p-6 space-y-6">
              <div className="flex items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex-1 pr-8">
                  <h3 className="font-label-md text-[13px] font-bold mb-1">Require Manual Approval for High-Value Invoices</h3>
                  <p className="font-body-md text-[14px] text-white/70">Invoices exceeding $5,000 will bypass auto-send and require partner sign-off.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" name="requireApproval" defaultChecked={data.requireApproval} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#7c839f]/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37] border border-white/20"></div>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex-1 pr-8">
                  <h3 className="font-label-md text-[13px] font-bold mb-1">Default Document Format</h3>
                  <p className="font-body-md text-[14px] text-white/70">Standard output format for all auto-generated drafts and briefs.</p>
                </div>
                <div className="w-full sm:w-48">
                  <select
                    name="docFormat"
                    defaultValue={data.docFormat}
                    className="w-full bg-[#0A1128] border-b border-white/30 focus:border-[#D4AF37] focus:ring-0 px-3 py-2 font-body-md text-[14px] text-white outline-none"
                  >
                    <option value="docx">.DOCX (Word)</option>
                    <option value="pdf">.PDF (Secure)</option>
                    <option value="txt">.TXT (Plain)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 pr-8">
                  <h3 className="font-label-md text-[13px] font-bold mb-1">Auto-Archive Completed Workflows</h3>
                  <p className="font-body-md text-[14px] text-white/70">Automatically move workflows to cold storage 30 days after finalization.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" name="autoArchive" defaultChecked={data.autoArchive} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#7c839f]/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37] border border-white/20"></div>
                </label>
              </div>
            </form>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-[#c6c6ce]/30 shadow-[0_4px_40px_rgba(10,17,40,0.03)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#c6c6ce]/20 bg-[#f8f9ff]/50 flex items-center gap-3">
              <Bell size={20} className="text-[#0A1128]" />
              <h2 className="font-headline-sm text-[18px] font-bold text-[#0A1128]">Notification Preferences</h2>
            </div>
            <form action={formAction} className="p-5 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <span className="font-label-md text-[13px] font-bold text-[#0A1128] block">Workflow Success Alerts</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" name="notifySuccess" defaultChecked={data.notifySuccess} className="sr-only peer" />
                  <div className="w-9 h-5 bg-[#c6c6ce]/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A1128] border border-[#c6c6ce]/20"></div>
                </label>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <span className="font-label-md text-[13px] font-bold text-[#0A1128] block">Client Receipt Confirmations</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" name="notifyClient" defaultChecked={data.notifyClient} className="sr-only peer" />
                  <div className="w-9 h-5 bg-[#c6c6ce]/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A1128] border border-[#c6c6ce]/20"></div>
                </label>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <span className="font-label-md text-[13px] font-bold text-[#0A1128] block">Task Delegation Alerts</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" name="notifyDelegation" defaultChecked={data.notifyDelegation} className="sr-only peer" />
                  <div className="w-9 h-5 bg-[#c6c6ce]/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A1128] border border-[#c6c6ce]/20"></div>
                </label>
              </div>

              <div className="pt-4 border-t border-[#c6c6ce]/10">
                <button type="submit" disabled={pending}
                  className="w-full px-6 py-2.5 bg-[#0A1128] text-white font-label-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#162244] transition-colors disabled:opacity-60"
                >
                  {pending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

