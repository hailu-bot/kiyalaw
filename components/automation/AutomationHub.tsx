'use client';

import React, { useState } from 'react';
import { Bot, Zap, Flag, ReceiptText, Forward, ArrowRight, MoreHorizontal, Megaphone, CreditCard, Bolt } from 'lucide-react';
import Link from 'next/link';

export default function AutomationHub() {
  const [onboardingOn, setOnboardingOn] = useState(true);
  const [conflictOn, setConflictOn] = useState(false);
  const [retainerOn, setRetainerOn] = useState(true);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6">
        <div>
          <p className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-widest mb-2">Firm Operations</p>
          <h1 className="font-display-lg text-display-lg font-bold text-[#0A1128]">Automation Hub</h1>
        </div>
        <div className="flex gap-4">
          <Link
            href="/automation/settings"
            className="flex items-center gap-2 px-6 py-3 border border-[#c6c6ce] text-[#0A1128] font-label-md text-label-md uppercase tracking-wider transition-colors hover:bg-[#f8f9ff]"
          >
            <Bolt size={18} />
            Settings
          </Link>
          <button className="bg-[#0A1128] text-white font-label-md text-label-md px-6 py-3 uppercase tracking-wider flex items-center gap-3 hover:bg-[#162244] transition-colors">
            <Bot size={18} />
            Create New Workflow
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-4 border border-[#c6c6ce] bg-[#f8f9ff] p-6 flex flex-col shadow-[0_4px_24px_rgba(10,17,40,0.02)]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#c6c6ce]/30">
            <h2 className="font-headline-sm text-headline-sm text-[#0A1128]">Active Systems</h2>
            <Zap size={20} className="text-[#46464d]" />
          </div>
          <div className="flex flex-col gap-6 flex-1">
            <div className="flex items-center justify-between group cursor-pointer">
              <div>
                <p className="font-label-md text-label-md text-[#0A1128] mb-1">New Client Onboarding</p>
                <p className="font-label-sm text-label-sm text-[#46464d]">Triggers standard welcome packet.</p>
              </div>
              <div
                className={`w-10 h-5 rounded-full relative transition-colors duration-200 cursor-pointer ${onboardingOn ? 'bg-[#141a32]' : 'bg-[#c6c6ce]/50'}`}
                onClick={() => setOnboardingOn(!onboardingOn)}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200 ${onboardingOn ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>

            <div className="flex items-center justify-between group cursor-pointer">
              <div>
                <p className="font-label-md text-label-md text-[#0A1128] mb-1">Conflict Check Sweep</p>
                <p className="font-label-sm text-label-sm text-[#46464d]">Runs daily at 02:00 EST.</p>
              </div>
              <div
                className={`w-10 h-5 rounded-full relative transition-colors duration-200 cursor-pointer ${conflictOn ? 'bg-[#141a32]' : 'bg-[#c6c6ce]/50'}`}
                onClick={() => setConflictOn(!conflictOn)}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200 ${conflictOn ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>

            <div className="flex items-center justify-between group cursor-pointer">
              <div>
                <p className="font-label-md text-label-md text-[#0A1128] mb-1">Retainer Depletion Alert</p>
                <p className="font-label-sm text-label-sm text-[#46464d]">Warns partner at 20% threshold.</p>
              </div>
              <div
                className={`w-10 h-5 rounded-full relative transition-colors duration-200 cursor-pointer ${retainerOn ? 'bg-[#141a32]' : 'bg-[#c6c6ce]/50'}`}
                onClick={() => setRetainerOn(!retainerOn)}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200 ${retainerOn ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
          </div>
          <button className="mt-6 w-full text-center py-3 border border-[#c6c6ce] text-[#0A1128] font-label-sm text-label-sm uppercase tracking-widest hover:bg-[#eff4ff] transition-colors">
            View All Systems
          </button>
        </div>

        <div className="md:col-span-8 bg-[#0A1128] p-8 flex flex-col relative overflow-hidden shadow-[0_8px_32px_rgba(10,17,40,0.08)]">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          <div className="relative z-10 flex justify-between items-start mb-8">
            <div>
              <p className="font-label-sm text-label-sm text-[#D4AF37] uppercase tracking-widest mb-2 flex items-center gap-2">
                <Zap size={14} /> Live Builder Preview
              </p>
              <h2 className="font-headline-md text-headline-md text-white">Matter Closure Sequence</h2>
            </div>
            <button className="text-white/70 hover:text-[#D4AF37] transition-colors">
              <MoreHorizontal size={24} />
            </button>
          </div>
          <div className="relative z-10 flex-1 flex flex-col items-start gap-4">
            <div className="bg-white/10 border border-white/20 px-6 py-4 w-full max-w-md flex items-center gap-4">
              <div className="bg-[#D4AF37]/20 p-2 text-[#D4AF37]">
                <Flag size={18} />
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-[#7c839f] uppercase tracking-widest mb-1">Trigger</p>
                <p className="font-body-md text-body-md text-white">When Matter Status changes to <strong className="text-[#D4AF37] font-semibold">&ldquo;Closed&rdquo;</strong></p>
              </div>
            </div>
            <div className="w-px h-6 bg-white/20 ml-10"></div>
            <div className="bg-white/5 border border-white/10 px-6 py-4 w-full max-w-md flex items-center gap-4 border-l-2 border-l-[#D4AF37]">
              <div className="bg-white/5 p-2 text-white">
                <ReceiptText size={18} />
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-[#7c839f] uppercase tracking-widest mb-1">Action 1</p>
                <p className="font-body-md text-body-md text-white">Generate Final Invoice &amp; Trust Ledger</p>
              </div>
            </div>
            <div className="w-px h-6 bg-white/20 ml-10"></div>
            <div className="bg-white/5 border border-white/10 px-6 py-4 w-full max-w-md flex items-center gap-4 border-l-2 border-l-[#D4AF37]">
              <div className="bg-white/5 p-2 text-white">
                <Forward size={18} />
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-[#7c839f] uppercase tracking-widest mb-1">Action 2</p>
                <p className="font-body-md text-body-md text-white">Attach to Email Template: <span className="text-[#D4AF37] border-b border-[#D4AF37]/50 border-dotted">&ldquo;Closing Documents&rdquo;</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-6 border border-[#c6c6ce] bg-white p-8 shadow-[0_2px_12px_rgba(10,17,40,0.01)] hover:border-[#141a32]/30 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-[#eff4ff] flex items-center justify-center mb-6">
            <Megaphone size={24} className="text-[#0A1128]" />
          </div>
          <h3 className="font-headline-sm text-headline-sm text-[#0A1128] mb-3">Email Campaigns</h3>
          <p className="font-body-md text-body-md text-[#46464d] mb-6 h-12">Automate client updates, newsletter distribution, and critical firm announcements with precision timing.</p>
          <div className="border-t border-[#c6c6ce]/30 pt-6 flex justify-between items-center">
            <div>
              <p className="font-headline-md text-headline-md text-[#0A1128]">12</p>
              <p className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-widest">Active Sequences</p>
            </div>
            <ArrowRight size={20} className="text-[#0A1128] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div className="md:col-span-6 border border-[#c6c6ce] bg-white p-8 shadow-[0_2px_12px_rgba(10,17,40,0.01)] hover:border-[#141a32]/30 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-[#eff4ff] flex items-center justify-center mb-6">
            <CreditCard size={24} className="text-[#0A1128]" />
          </div>
          <h3 className="font-headline-sm text-headline-sm text-[#0A1128] mb-3">Invoice Automation</h3>
          <p className="font-body-md text-body-md text-[#46464d] mb-6 h-12">Set sophisticated billing schedules to auto-generate and securely dispatch invoices to client portfolios.</p>
          <div className="border-t border-[#c6c6ce]/30 pt-6 flex justify-between items-center">
            <div>
              <p className="font-headline-md text-headline-md text-[#0A1128]">85%</p>
              <p className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-widest">Collection Rate (30D)</p>
            </div>
            <ArrowRight size={20} className="text-[#0A1128] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
