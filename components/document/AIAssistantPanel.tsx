"use client";

import React from "react";
import { Sparkles, Send, Loader2, X } from "lucide-react";

interface AIAssistantPanelProps {
  isAiOpen: boolean;
  aiMessages: Array<{ sender: "user" | "ai"; text: string; html?: string }>;
  aiPrompt: string;
  isAiProcessing: boolean;
  onToggle: () => void;
  onPromptChange: (value: string) => void;
  onSend: () => void;
}

export default function AIAssistantPanel({
  isAiOpen, aiMessages, aiPrompt, isAiProcessing,
  onToggle, onPromptChange, onSend,
}: AIAssistantPanelProps) {
  if (!isAiOpen) return null;

  return (
    <aside className="transition-all duration-300 ease-in-out border-l border-outline-variant bg-surface flex flex-col z-10 w-96 opacity-100">
      <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-primary-container text-white select-none min-w-[24rem]">
        <h3 className="font-headline-sm text-sm flex items-center gap-2 font-bold tracking-wide">
          <Sparkles className="w-5 h-5 text-secondary-fixed" />
          AI Writer
        </h3>
        <button onClick={onToggle} className="p-1 hover:bg-white/10 rounded-none transition-colors text-white/70 hover:text-white" title="Close AI Assistant">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-w-[24rem]">
        {aiMessages.map((msg, idx) => (
          <div key={`${msg.sender}-${idx}-${msg.text.slice(0, 20)}`} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            <div className={`p-3 rounded-none max-w-[85%] text-xs shadow-sm ${msg.sender === "user" ? "bg-secondary text-white rounded-tr-none" : "bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant"}`}>
              {!msg.text ? <Loader2 className="w-4 h-4 animate-spin text-secondary" /> :
               msg.sender === "ai" && msg.html ? <div className="prose prose-xs max-w-none" dangerouslySetInnerHTML={{ __html: msg.html }} /> :
               msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-outline-variant bg-surface-bright flex gap-2 min-w-[24rem]">
        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Draft an Indemnity Clause..."
          className="w-full text-xs p-2.5 bg-white border border-outline rounded-none outline-none focus:ring-2 focus:ring-secondary/50 shadow-inner"
          disabled={isAiProcessing}
        />
        <button
          onClick={onSend}
          disabled={isAiProcessing}
          className="bg-primary text-white p-2.5 rounded-none hover:bg-primary-container disabled:opacity-50 cursor-pointer shadow-sm transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
