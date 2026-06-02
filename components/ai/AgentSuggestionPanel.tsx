'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Bot, X, RefreshCw, Loader2, Lightbulb } from 'lucide-react';
import { useUIStore } from '@/lib/store/useUIStore';
import AgentInsightCard from './AgentInsightCard';

type Suggestion = {
  priority: 'high' | 'medium' | 'low';
  category: string;
  message: string;
};

type ResponseData = {
  suggestion: string;
  toolResults?: Array<{ type: string; result: unknown }>;
};

export default function AgentSuggestionPanel() {
  const isAiPanelOpen = useUIStore((s) => s.isAiPanelOpen);
  const toggleAiPanel = useUIStore((s) => s.toggleAiPanel);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoSuggest: true }),
      });
      if (!resp.ok) throw new Error('Failed to fetch suggestions');
      const data: ResponseData = await resp.json();

      setAiSummary(data.suggestion);

      if (data.toolResults) {
        const suggestResult = data.toolResults.find((t) => t.type === 'tool.suggestActions');
        if (suggestResult?.result) {
          setSuggestions(suggestResult.result as Suggestion[]);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load suggestions');
    }
    setLoading(false);
  }, []);

  const fetched = useRef(false);
  useEffect(() => {
    if (isAiPanelOpen && !fetched.current) {
      fetched.current = true;
      fetchSuggestions();
    }
    if (!isAiPanelOpen) {
      fetched.current = false;
    }
  }, [isAiPanelOpen, fetchSuggestions]);

  if (!isAiPanelOpen) return null;

  return (
    <div className="w-96 max-w-[calc(100vw-2rem)]">
      <div className="bg-white border border-[#c6c6ce]/50 shadow-2xl rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#c6c6ce]/30 bg-[#0A1128]">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-[#D4AF37]" />
            <h3 className="font-label-sm text-label-sm text-white uppercase tracking-wider font-bold">AI Suggestions</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={fetchSuggestions}
              disabled={loading}
              className="text-white/70 hover:text-white p-1 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={toggleAiPanel} className="text-white/70 hover:text-white p-1 transition-colors cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
          {loading && suggestions.length === 0 && (
            <div className="flex items-center justify-center py-8 text-[#76767e]">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Analyzing...
            </div>
          )}

          {error && (
            <div className="text-red-500 text-[13px] p-3 bg-red-50 border border-red-100">
              {error}
              <button onClick={fetchSuggestions} className="block mt-1 underline cursor-pointer">Retry</button>
            </div>
          )}

          {aiSummary && !loading && (
            <div className="flex items-start gap-2 p-3 bg-[#f8f9ff] border border-[#c6c6ce]/30">
              <Lightbulb className="h-5 w-5 text-[#D4AF37] mt-0.5 shrink-0" />
              <p className="font-body-md text-[13px] text-[#46464d]">{aiSummary}</p>
            </div>
          )}

          {suggestions.length > 0 && !loading && (
            <div className="space-y-2">
              <p className="font-label-sm text-label-sm text-[#76767e] uppercase tracking-wider font-bold">
                Action Items ({suggestions.length})
              </p>
              {suggestions.map((s, i) => (
                <AgentInsightCard
                  key={i}
                  title={s.category}
                  message={s.message}
                  priority={s.priority}
                  category={s.category}
                />
              ))}
            </div>
          )}

          {!loading && suggestions.length === 0 && !aiSummary && !error && (
            <div className="text-center py-8 text-[#76767e]">
              <Bot className="h-8 w-8 mx-auto mb-2 text-[#c6c6ce]" />
              <p className="font-body-md text-[14px]">No suggestions yet.</p>
              <button onClick={fetchSuggestions} className="mt-2 text-[#D4AF37] text-[13px] underline cursor-pointer">
                Analyze now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
