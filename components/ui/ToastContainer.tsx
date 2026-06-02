'use client';

import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToastStore } from '@/lib/store/useToastStore';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            relative overflow-hidden
            flex items-start gap-4 px-5 py-4 rounded-none shadow-2xl backdrop-blur-md
            animate-in slide-in-from-right-8 fade-in duration-300
            ${toast.type === 'success' ? 'bg-[#0A1128]/95 border border-[#D4AF37]/30 text-white' : ''}
            ${toast.type === 'error' ? 'bg-[#2A0808]/95 border border-[#ba1a1a]/50 text-white' : ''}
            ${toast.type === 'pending' ? 'bg-[#0A1128]/95 border border-white/10 text-white' : ''}
          `}
        >
          {toast.type === 'success' && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]" />
          )}
          {toast.type === 'error' && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ba1a1a]" />
          )}
          {toast.type === 'pending' && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7c839f]" />
          )}

          {toast.type === 'pending' && (
            <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37] shrink-0 mt-0.5" />
          )}
          {toast.type === 'success' && (
            <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" />
          )}
          
          <div className="flex-1 min-w-0">
            <p className="font-body-md text-sm font-medium leading-snug">{toast.message}</p>
          </div>
          
          <button 
            onClick={() => removeToast(toast.id)} 
            className="text-white/40 hover:text-white hover:bg-white/10 p-1 rounded-full transition-all shrink-0 -mt-1 -mr-2"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
