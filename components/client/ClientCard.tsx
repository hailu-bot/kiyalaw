'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, ReceiptText, ArrowUpRight, Briefcase } from "lucide-react";

type ClientCardProps = {
  id: string;
  name: string;
  contactName: string;
  contactTitle: string;
  initials: string;
  activeMatters: number;
  email: string;
  phone: string;
  industry: string;
  status: string;
  avatarUrl?: string;
  createdAt: string;
  balance?: number;
};

export function ClientCard({ id, name, contactName, contactTitle, initials, activeMatters, email, industry, status, avatarUrl, balance }: ClientCardProps) {
  const router = useRouter();

  return (
    <div className="bg-white border border-[#c6c6ce]/50 flex flex-col hover:border-[#D4AF37]/50 transition-colors shadow-[0_8px_30px_rgba(10,17,40,0.04)] group">
      <Link href={`/clients/${id}`} className="block p-6 border-b border-[#c6c6ce]/30">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p className="font-label-sm text-label-sm text-[#735c00] uppercase tracking-widest mb-1 flex items-center gap-2">
              {name}
              <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider ${
                status === 'Active' ? 'bg-[#d9f0d9] text-[#1a6b1a]' :
                status === 'Inactive' ? 'bg-[#e5e7eb] text-[#6b7280]' :
                'bg-[#fef3c7] text-[#92400e]'
              }`}>{status}</span>
            </p>
            <h3 className="font-headline-sm text-headline-sm text-[#0A1128]">{contactName || 'Primary Contact'}</h3>
            <p className="font-body-md text-body-md text-[#46464d] mt-0.5">{contactTitle || industry || ''}</p>
          </div>
          <div className="flex items-start gap-2 shrink-0 ml-3">
            {avatarUrl ? (
              <div className="w-12 h-12 overflow-hidden border-2 border-white shadow-sm relative">
                <Image alt="" className="object-cover" fill sizes="48px" src={avatarUrl} />
              </div>
            ) : (
              <div className="w-12 h-12 bg-[#141a32] flex items-center justify-center">
                <span className="font-headline-sm text-headline-sm text-[#ffe088] font-bold">{initials}</span>
              </div>
            )}
            <ArrowUpRight size={16} className="text-[#c6c6ce] group-hover:text-[#D4AF37] transition-colors mt-1" />
          </div>
        </div>
      </Link>

      <div className="p-6 grid grid-cols-2 gap-4 flex-1">
        <div>
          <span className="font-label-sm text-label-sm text-[#46464d] block mb-1 uppercase tracking-wider">Active Matters</span>
          <span className="font-body-lg text-body-lg text-[#0A1128] font-semibold">{activeMatters}</span>
        </div>
        <div>
          <span className="font-label-sm text-label-sm text-[#46464d] block mb-1 uppercase tracking-wider">Email</span>
          <span className="font-body-md text-body-md text-[#0A1128] truncate block">{email || '—'}</span>
        </div>
        {balance !== undefined && (
          <div className="col-span-2">
            <span className="font-label-sm text-label-sm text-[#46464d] block mb-1 uppercase tracking-wider">Balance</span>
            <span className={`font-body-lg text-body-lg font-semibold ${balance > 0 ? 'text-[#b91c1c]' : 'text-[#15803d]'}`}>
              ${balance.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="bg-[#eff4ff] px-4 py-3 flex items-center gap-2 border-t border-[#c6c6ce]/30">
        <button
          onClick={(e) => { e.preventDefault(); router.push(`/matters?clientId=${id}`); }}
          className="flex-1 bg-white border border-[#c6c6ce] text-[#0A1128] px-2 py-2 font-label-sm text-label-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-1 hover:bg-[#f8f9ff] cursor-pointer"
        >
          <Briefcase className="h-4 w-4 shrink-0" />
          Matters
        </button>
        <button
          onClick={(e) => { e.preventDefault(); router.push(`/billing/new?clientId=${id}`); }}
          className="flex-1 bg-white border border-[#c6c6ce] text-[#0A1128] px-2 py-2 font-label-sm text-label-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-1 hover:bg-[#f8f9ff] cursor-pointer"
        >
          <ReceiptText className="h-4 w-4 shrink-0" />
          Invoice
        </button>
        <button
          onClick={(e) => { e.preventDefault(); router.push(`/documents?clientId=${id}`); }}
          className="flex-1 bg-[#0A1128] text-white px-2 py-2 font-label-sm text-label-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-1 hover:bg-[#162244] cursor-pointer"
        >
          <FileText className="h-4 w-4 shrink-0" />
          Document
        </button>
      </div>
    </div>
  );
}
