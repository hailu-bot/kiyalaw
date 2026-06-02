'use client';

import React, { useState, useCallback, useRef } from 'react';
import { parseNaturalLanguageTime, createTimeEntry, getTimeEntries, getDailyMetrics } from '@/app/actions/timeActions';
import { Clock, Sparkles, Plus, Loader2, Check, AlertCircle } from 'lucide-react';
import DailyTimeLogBreakdown from './DailyTimeLogBreakdown';

type TimeEntriesResult = Awaited<ReturnType<typeof getTimeEntries>>;
type Entry = TimeEntriesResult['entries'][number];
type Metrics = Awaited<ReturnType<typeof getDailyMetrics>>;

export default function AITimeLogger({ initialEntries, metrics: initialMetrics }: { initialEntries: Entry[]; metrics: Metrics }) {
  const [input, setInput] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<{ description: string; hours: number; matterId: string; matterTitle: string; clientName: string; date: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const entries = initialEntries;
  const metrics = initialMetrics;
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleParse = useCallback(async () => {
    if (!input.trim()) return;
    setParsing(true);
    setError(null);
    setParsedResult(null);
    try {
      const result = await parseNaturalLanguageTime(input.trim());
      setParsedResult(result);
      if (!result.matterId) {
        setError('Could not match a matter. Entry will be created without a matter link.');
      }
    } catch {
      setError('Failed to parse input. Please try again.');
    } finally {
      setParsing(false);
    }
  }, [input]);

  const handleSave = useCallback(async () => {
    if (!parsedResult || parsedResult.hours <= 0) return;
    setSaving(true);
    try {
      if (!parsedResult.matterId) {
        setError('Could not determine the matter from your description. Please try again or log time manually.');
        setSaving(false);
        return;
      }
      await createTimeEntry({
        matterId: parsedResult.matterId,
        description: parsedResult.description,
        date: parsedResult.date,
        hours: parsedResult.hours,
        billable: true,
        rate: 850,
      });
      setParsedResult(null);
      setInput('');
      window.location.reload();
    } catch {
      setError('Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [parsedResult]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleParse();
    }
  }, [handleParse]);

  const totalHours = entries.reduce((s, e) => s + Number(e.hours), 0);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h2 className="font-headline-md text-[32px] font-semibold text-[#0A1128] tracking-tight">AI Time Logger</h2>
        <p className="font-body-md text-[16px] text-[#46464d] max-w-2xl">
          Seamlessly capture billable hours. Use natural language to describe your activities, and the AI will format them for professional billing.
        </p>
      </header>

      <section className="relative">
        <div className="relative w-full bg-white border border-[#c6c6ce] flex flex-col md:flex-row items-stretch overflow-hidden shadow-[0_8px_30px_rgba(10,17,40,0.08)]">
          <div className="flex-1 flex items-center px-6 py-4 md:py-6 gap-4">
            <Clock size={24} className="text-[#46464d] flex-shrink-0" />
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none outline-none font-body-lg text-[18px] text-[#0A1128] placeholder:text-[#c6c6ce] focus:ring-0 p-0"
              placeholder='Type natural language... e.g., 1.5h call with Oracle rep regarding compliance'
            />
          </div>
          <div className="bg-[#f8f9ff] p-4 md:p-6 border-t md:border-t-0 md:border-l border-[#c6c6ce]/50 flex items-center justify-end">
            <button
              onClick={handleParse}
              disabled={parsing || !input.trim()}
              className="bg-[#0A1128] text-white flex items-center gap-2 px-6 py-3 hover:bg-[#162244] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {parsing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-[#D4AF37]" />}
              <span className="font-label-md text-[14px] font-semibold uppercase tracking-wider">Magic Wand</span>
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-2 bg-[#fff0f0] border border-[#ffcccc] px-4 py-3 text-[#cc0000] text-[13px] font-medium">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {parsedResult && (
        <div className="bg-white border border-[#c6c6ce]/40 overflow-hidden">
          <div className="bg-[#faf8f0] border-b border-[#c6c6ce]/30 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-[#1a6b1a]" />
              <span className="font-label-md text-[12px] font-bold uppercase tracking-widest text-[#0A1128]">Parsed Entry</span>
            </div>
            <span className="text-[11px] text-[#46464d]">Review and save</span>
          </div>
          <div className="p-5 grid grid-cols-[1fr_120px] gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7c839f] mb-1">Description</p>
              <p className="font-body-md text-[14px] text-[#0A1128]">{parsedResult.description}</p>
              {parsedResult.matterTitle && (
                <p className="text-[11px] text-[#46464d] mt-1">
                  Matter: {parsedResult.matterTitle}
                  {parsedResult.clientName && <span> - {parsedResult.clientName}</span>}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7c839f] mb-1">Hours</p>
              <p className="font-headline-sm text-[24px] font-bold text-[#0A1128]">{parsedResult.hours}</p>
              <p className="text-[10px] text-[#46464d] mt-1">{parsedResult.date}</p>
            </div>
          </div>
          <div className="border-t border-[#c6c6ce]/30 px-5 py-3 flex justify-end gap-3">
            <button
              onClick={() => { setParsedResult(null); setInput(''); setError(null); }}
              className="px-5 py-2 border border-[#c6c6ce] text-[#46464d] font-label-md text-[12px] uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving || parsedResult.hours <= 0}
              className="px-5 py-2 bg-[#0A1128] text-white font-label-md text-[12px] uppercase tracking-wider hover:bg-[#162244] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              <Plus size={14} /> Add to Log
            </button>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-end border-b border-[#c6c6ce] pb-4">
          <h3 className="font-headline-sm text-[24px] text-[#0A1128]">Today&apos;s Log</h3>
          <div className="font-label-sm text-[12px] text-[#46464d] bg-[#f8f9ff] px-3 py-1 border border-[#c6c6ce]/30">
            Total: {totalHours.toFixed(1)} Hours
          </div>
        </div>
        <DailyTimeLogBreakdown entries={entries} metrics={metrics} />
      </section>
    </div>
  );
}
