'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Check, Loader2 } from 'lucide-react';

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
  required?: boolean;
  label?: string;
};

const QUICK_PROMPTS = [
  { label: 'Fix Grammar', prompt: 'Fix grammar and spelling errors only, preserving the original meaning and tone.' },
  { label: 'Formal', prompt: 'Rewrite this in a formal professional legal tone.' },
  { label: 'Concise', prompt: 'Summarize this to be concise while keeping all key information.' },
  { label: 'Expand', prompt: 'Expand on this with more detail while maintaining professional tone.' },
];

export default function AiTextAssistant({
  value: controlledValue,
  onChange,
  name,
  defaultValue,
  placeholder,
  rows = 3,
  className = '',
  required,
  label,
}: Props) {
  const isControlled = controlledValue !== undefined;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');

  const currentValue = isControlled ? controlledValue : internalValue;

  const handleTextChange = (newVal: string) => {
    if (isControlled) {
      onChange?.(newVal);
    } else {
      setInternalValue(newVal);
      if (textareaRef.current) {
        textareaRef.current.value = newVal;
      }
    }
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
        setResult('');
        setPrompt('');
        setError('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleGenerate = async (promptText?: string) => {
    const p = promptText ?? prompt;
    if (!p.trim()) return;
    setStreaming(true);
    setError('');
    setResult('');

    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentValue, prompt: p.trim() }),
      });

      if (!res.ok) { setError('AI request failed'); setStreaming(false); return; }

      const reader = res.body?.getReader();
      if (!reader) { setError('No response stream'); setStreaming(false); return; }

      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';

      while (!done) {
        const { done: d, value: v } = await reader.read();
        done = d;
        if (v) {
          buffer += decoder.decode(v, { stream: !done });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) setResult((prev) => prev + parsed.text);
              } catch { /* skip */ }
            }
          }
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setStreaming(false);
    }
  };

  const handleApply = () => {
    if (result) {
      handleTextChange(result);
      setOpen(false);
      setResult('');
      setPrompt('');
      setError('');
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="font-label-md text-[12px] text-[#0A1128] uppercase tracking-tighter font-bold mb-1.5 block">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={isControlled ? controlledValue : undefined}
          defaultValue={!isControlled ? defaultValue : undefined}
          onChange={(e) => {
            if (isControlled) onChange?.(e.target.value);
            else setInternalValue(e.target.value);
          }}
          name={!isControlled ? name : undefined}
          placeholder={placeholder}
          rows={rows}
          required={required}
          className={className}
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="absolute bottom-2 right-2 p-1.5 text-[#D4AF37] hover:text-[#b8962e] hover:bg-[#f0f0f5] transition-colors cursor-pointer z-10"
          title="AI Assistant"
          tabIndex={-1}
        >
          <Sparkles size={16} />
        </button>
      </div>

      {open && (
        <div
          ref={popoverRef}
          className="absolute right-0 z-50 mt-1 w-[420px] max-w-[calc(100vw-2rem)] bg-white border border-[#c6c6ce]/50 shadow-lg"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#c6c6ce]/30 bg-[#f8f9ff]">
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#0A1128]">
              <Sparkles size={12} className="text-[#D4AF37]" />
              AI Text Assistant
            </span>
            <button type="button" onClick={() => { setOpen(false); setResult(''); setPrompt(''); setError(''); }} className="text-[#76767e] hover:text-[#0A1128] cursor-pointer">
              <X size={14} />
            </button>
          </div>

          <div className="px-3 pt-2 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#76767e]">Current Text</span>
            <p className="text-[13px] text-[#46464d] mt-0.5 line-clamp-3">{currentValue || <span className="italic text-[#76767e]">(empty)</span>}</p>
          </div>

          <div className="p-3 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  type="button"
                  disabled={streaming}
                  onClick={() => { setPrompt(qp.prompt); handleGenerate(qp.prompt); }}
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 border border-[#c6c6ce]/50 text-[#46464d] hover:bg-[#f8f9ff] hover:border-[#D4AF37] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#76767e] block mb-1">Custom instruction</label>
              <div className="flex gap-2">
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                  placeholder='e.g. "Make this more formal" or "Fix grammar"'
                  className="flex-1 border-b border-[#c6c6ce]/60 bg-transparent py-1.5 text-[13px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={streaming || !prompt.trim()}
                  className="bg-[#0A1128] text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider hover:bg-[#162244] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {streaming ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Go
                </button>
              </div>
            </div>

            {(result || streaming || error) && (
              <div className="border border-[#c6c6ce]/30 bg-[#f8f9ff] p-2.5 min-h-[60px]">
                {error ? (
                  <p className="text-[13px] text-red-600">{error}</p>
                ) : (
                  <div>
                    <p className="text-[13px] text-[#0A1128] whitespace-pre-wrap">{result}</p>
                    {streaming && <span className="inline-block w-2 h-4 bg-[#D4AF37] animate-pulse ml-0.5 align-middle" />}
                  </div>
                )}
              </div>
            )}

            {result && !streaming && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleApply}
                  className="bg-[#D4AF37] text-[#0A1128] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider hover:bg-[#b8962e] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check size={12} />
                  Apply to Text
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
