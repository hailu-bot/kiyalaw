'use client';

import React, { useState } from 'react';
import { Zap, Settings as SettingsIcon, Bell, Info, Bolt } from 'lucide-react';

export default function AutomationSettings() {
  const [requireApproval, setRequireApproval] = useState(true);
  const [autoArchive, setAutoArchive] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(true);
  const [notifyClient, setNotifyClient] = useState(false);
  const [notifyDelegation, setNotifyDelegation] = useState(true);
  const [leadTime, setLeadTime] = useState(5);
  const [docFormat, setDocFormat] = useState('docx');

  return (
    <div>
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Bolt size={28} className="text-[#D4AF37]" />
            <h1 className="font-headline-sm text-[28px] font-bold text-[#0A1128]">Automation Settings</h1>
          </div>
          <p className="font-body-md text-[15px] text-[#46464d] max-w-2xl">Configure firm-wide automated workflows, trigger conditions, and notification preferences.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 border border-[#76767e] text-[#0A1128] font-label-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors">
            Discard Changes
          </button>
          <button className="px-6 py-2.5 bg-[#0A1128] text-white font-label-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#162244] transition-colors shadow-sm">
            Save Configuration
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white border border-[#c6c6ce]/30 shadow-[0_4px_40px_rgba(10,17,40,0.03)] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#c6c6ce]/20 bg-[#f8f9ff]/50 flex items-center gap-3">
              <Zap size={20} className="text-[#0A1128]" />
              <h2 className="font-headline-sm text-[20px] font-bold text-[#0A1128]">Default Workflow Triggers</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#c6c6ce]/10">
                <div className="flex-1">
                  <h3 className="font-label-md text-[13px] font-bold text-[#0A1128] mb-1">New Matter Intake</h3>
                  <p className="font-body-md text-[14px] text-[#46464d]">Automatically trigger standard onboarding sequence when a new matter is opened.</p>
                </div>
                <div className="w-full sm:w-48">
                  <label className="block font-label-sm text-[11px] text-[#46464d] mb-1 uppercase tracking-wider font-bold">Sequence Type</label>
                  <select className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 px-3 py-2 font-body-md text-[14px] text-[#0A1128] outline-none">
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
                    value={leadTime}
                    onChange={(e) => setLeadTime(Number(e.target.value))}
                    min={1}
                    max={30}
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
                  <select className="w-full bg-[#f8f9ff] border-b border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 px-3 py-2 font-body-md text-[14px] text-[#0A1128] outline-none">
                    <option>Partner → Client</option>
                    <option>Associate → Partner</option>
                    <option>Client Direct (E-Sign)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#0A1128] text-white border border-[#162244] shadow-[0_4px_40px_rgba(10,17,40,0.08)] overflow-hidden relative">
            <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
              <SettingsIcon size={20} className="text-[#D4AF37]" />
              <h2 className="font-headline-sm text-[20px] font-bold">Firm-Wide Policies</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex-1 pr-8">
                  <h3 className="font-label-md text-[13px] font-bold mb-1">Require Manual Approval for High-Value Invoices</h3>
                  <p className="font-body-md text-[14px] text-white/70">Invoices exceeding $5,000 will bypass auto-send and require partner sign-off.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" checked={requireApproval} onChange={(e) => setRequireApproval(e.target.checked)} className="sr-only peer" />
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
                    value={docFormat}
                    onChange={(e) => setDocFormat(e.target.value)}
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
                  <input type="checkbox" checked={autoArchive} onChange={(e) => setAutoArchive(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#7c839f]/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37] border border-white/20"></div>
                </label>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-[#c6c6ce]/30 shadow-[0_4px_40px_rgba(10,17,40,0.03)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#c6c6ce]/20 bg-[#f8f9ff]/50 flex items-center gap-3">
              <Bell size={20} className="text-[#0A1128]" />
              <h2 className="font-headline-sm text-[18px] font-bold text-[#0A1128]">Notification Preferences</h2>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <span className="font-label-md text-[13px] font-bold text-[#0A1128] block">Workflow Success Alerts</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" checked={notifySuccess} onChange={(e) => setNotifySuccess(e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-[#c6c6ce]/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A1128] border border-[#c6c6ce]/20"></div>
                </label>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <span className="font-label-md text-[13px] font-bold text-[#0A1128] block">System Error Notifications</span>
                  <span className="font-body-md text-[12px] text-[#ba1a1a] block mt-0.5 font-semibold">Critical</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" checked disabled className="sr-only peer" />
                  <div className="w-9 h-5 bg-[#c6c6ce]/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A1128] border border-[#c6c6ce]/20 opacity-60 cursor-not-allowed"></div>
                </label>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <span className="font-label-md text-[13px] font-bold text-[#0A1128] block">Client Receipt Confirmations</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" checked={notifyClient} onChange={(e) => setNotifyClient(e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-[#c6c6ce]/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A1128] border border-[#c6c6ce]/20"></div>
                </label>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <span className="font-label-md text-[13px] font-bold text-[#0A1128] block">Task Delegation Alerts</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" checked={notifyDelegation} onChange={(e) => setNotifyDelegation(e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-[#c6c6ce]/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A1128] border border-[#c6c6ce]/20"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-[#eff4ff] border border-[#c6c6ce]/20 p-5">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-[#735c00] mt-0.5" />
              <div>
                <h4 className="font-label-md text-[13px] font-bold text-[#0A1128] mb-1">Automation Audit Trail</h4>
                <p className="font-body-md text-[14px] text-[#46464d] mb-3">All automated actions are logged for compliance and review.</p>
                <button className="font-label-md text-[12px] font-bold text-[#0A1128] hover:text-[#735c00] underline underline-offset-2 transition-colors">
                  View Recent Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
