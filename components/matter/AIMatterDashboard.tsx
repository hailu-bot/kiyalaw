'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import AIMatterAnalyticsWidget from './AIMatterAnalyticsWidget';
import AIMatterSuggestionCard from './AIMatterSuggestionCard';
import AIActivitySummary from './AIActivitySummary';

const mockSuggestions = [
  { id: '1', type: 'time' as const, title: 'Log Review Hours', description: '2.5 hours spent reviewing M&A agreement Section 4.2', matterName: '2024 Merger & Acquisition Strategy', matterId: '1', confidence: 92 },
  { id: '2', type: 'document' as const, title: 'Generate NDA Draft', description: 'Mutual NDA template prepared for TechNova partnership', matterName: 'IP Portfolio Management', matterId: '2', confidence: 88 },
  { id: '3', type: 'action' as const, title: 'Deadline Reminder', description: 'Compliance filing due in 3 days for Q3 audit', matterName: 'Internal Compliance Audit', matterId: '3', confidence: 76 },
];

export default function AIMatterDashboard() {
  const [suggestions, setSuggestions] = useState(mockSuggestions);

  const handleDismiss = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  const handleApply = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Bot size={28} className="text-[#D4AF37]" />
            <h1 className="font-headline-sm text-[28px] font-bold text-[#0A1128]">AI Matter Intelligence</h1>
          </div>
          <p className="font-body-md text-[15px] text-[#46464d]">AI-powered insights, suggestions, and analytics across all matters.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[13px] font-label-md text-[#7c839f]">
          <Sparkles size={16} className="text-[#D4AF37]" />
          Updated 5m ago
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="font-label-sm text-[11px] text-[#46464d] uppercase tracking-widest font-bold">Active Matters</p>
              <p className="font-headline-sm text-[24px] font-bold text-[#0A1128]">12</p>
            </div>
          </div>
          <div className="text-[12px] font-label-md text-[#735c00]">+2 this quarter</div>
        </div>
        <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#eff4ff] text-[#0A1128] flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <p className="font-label-sm text-[11px] text-[#46464d] uppercase tracking-widest font-bold">Total Hours</p>
              <p className="font-headline-sm text-[24px] font-bold text-[#0A1128]">142.5</p>
            </div>
          </div>
          <div className="text-[12px] font-label-md text-[#735c00]">Week: 32.0h</div>
        </div>
        <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="font-label-sm text-[11px] text-[#46464d] uppercase tracking-widest font-bold">AI Suggestions</p>
              <p className="font-headline-sm text-[24px] font-bold text-[#0A1128]">{suggestions.length}</p>
            </div>
          </div>
          <div className="text-[12px] font-label-md text-[#735c00]">Pending review</div>
        </div>
        <Link
          href="/matters"
          className="bg-[#0A1128] text-white p-5 hover:bg-[#162244] transition-colors flex flex-col justify-center"
        >
          <span className="font-label-md text-[12px] text-[#D4AF37] uppercase tracking-widest font-bold">View All Matters</span>
          <span className="font-headline-sm text-[20px] font-bold mt-1">&rarr;</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="font-label-md text-[12px] font-bold uppercase tracking-widest text-[#46464d] mb-4">AI Suggestions</h3>
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <AIMatterSuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onDismiss={handleDismiss}
                  onApply={handleApply}
                />
              ))}
              {suggestions.length === 0 && (
                <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-8 text-center">
                  <Sparkles size={32} className="text-[#D4AF37] mx-auto mb-3" />
                  <p className="font-body-md text-[15px] text-[#46464d]">All suggestions processed. New insights will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <AIMatterAnalyticsWidget />
          <AIActivitySummary />
        </div>
      </div>
    </div>
  );
}
