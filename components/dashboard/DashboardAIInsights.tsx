'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Bot, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import AgentInsightCard from '../ai/AgentInsightCard';

type Suggestion = {
  priority: 'high' | 'medium' | 'low';
  category: string;
  message: string;
};

type AgentResponse = {
  suggestion: string | null;
  toolResults?: Array<{ type: string; result: Suggestion[] }>;
};

export default function DashboardAIInsights() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setSuggestions([]);
    setSummary(null);
    setError(null);
    try {
      const resp = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoSuggest: true }),
      });
      if (!resp.ok) throw new Error(`Request failed (${resp.status})`);
      const data: AgentResponse = await resp.json();
      setSummary(data.suggestion);
      const toolResult = data.toolResults?.find((t) => t.type === 'tool.suggestActions');
      if (toolResult?.result) {
        setSuggestions(toolResult.result as Suggestion[]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    const initialFetch = async () => {
      try {
        const resp = await fetch('/api/ai/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ autoSuggest: true }),
        });
        if (!resp.ok) throw new Error(`Request failed (${resp.status})`);
        const data: AgentResponse = await resp.json();
        setSummary(data.suggestion);
        const toolResult = data.toolResults?.find((t) => t.type === 'tool.suggestActions');
        if (toolResult?.result) {
          setSuggestions(toolResult.result as Suggestion[]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    initialFetch();
  }, []);

  return (
    <div className="bg-white border border-outline-variant rounded-none p-6 shadow-[0_2px_10px_0_rgba(10,17,40,0.03)]">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          <h2 className="text-[24px] font-headline-sm text-on-background font-semibold">AI Insights</h2>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="text-label-sm font-label-sm text-secondary hover:underline font-semibold transition flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-[#76767e]">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Analyzing...
        </div>
      )}

      {error && !loading && (
        <div className="text-red-500 text-[13px] p-3 bg-red-50 border border-red-100">
          {error}
          <button onClick={fetchInsights} className="block mt-1 underline cursor-pointer">Retry</button>
        </div>
      )}

      {summary && !loading && (
        <div className="flex items-start gap-2 p-3 bg-[#f8f9ff] border border-outline-variant/30 mb-4">
          <Bot className="h-5 w-5 text-[#D4AF37] mt-0.5 shrink-0" />
          <p className="font-body-md text-[14px] text-[#46464d]">{summary}</p>
        </div>
      )}

      {suggestions.length > 0 && !loading && !error && (
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <AgentInsightCard key={i} title={s.category} message={s.message} priority={s.priority} category={s.category} />
          ))}
        </div>
      )}

      {!loading && suggestions.length === 0 && !summary && !error && (
        <div className="text-center py-8 text-[#76767e]">
          <Bot className="h-8 w-8 mx-auto mb-2 text-[#c6c6ce]" />
          <p className="font-body-md text-[14px]">No insights available.</p>
        </div>
      )}
    </div>
  );
}
