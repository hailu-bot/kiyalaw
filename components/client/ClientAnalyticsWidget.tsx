import React from 'react';
import { TrendingUp, Clock, Receipt, FileText } from 'lucide-react';

type MatterSummary = {
  id: string;
  title: string;
  status: string;
  activityCount: number;
  invoiceTotal: number;
  createdAt: string;
};

function StatCard({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-4 text-center">
      <Icon size={18} className="mx-auto mb-1 text-[#D4AF37]" />
      <p className="font-headline-sm text-[22px] font-bold text-[#0A1128]">{value}</p>
      <p className="font-label-sm text-[10px] uppercase tracking-widest text-[#46464d]">{label}</p>
    </div>
  );
}

export default function ClientAnalyticsWidget({ matters }: { matters: MatterSummary[] }) {
  const activeMatters = matters.filter(m => m.status === 'Active');
  const totalBilled = matters.reduce((s, m) => s + m.invoiceTotal, 0);
  const totalActivities = matters.reduce((s, m) => s + m.activityCount, 0);
  const sorted = [...matters].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const recentMatter = sorted[0];

  return (
    <div className="bg-white border border-[#c6c6ce]/40 p-6">
      <h3 className="font-label-md text-[12px] font-bold uppercase tracking-widest text-[#0A1128] mb-5 flex items-center gap-2">
        <TrendingUp size={16} className="text-[#D4AF37]" /> Client Analytics
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard icon={Receipt} value={totalBilled.toLocaleString()} label="Total Billed" />
        <StatCard icon={FileText} value={String(activeMatters.length)} label="Active Matters" />
        <StatCard icon={Clock} value={String(totalActivities)} label="Activities" />
        <StatCard icon={TrendingUp} value={String(matters.length)} label="Total Matters" />
      </div>

      {recentMatter && (
        <div className="border-t border-[#c6c6ce]/20 pt-4">
          <p className="font-label-sm text-[10px] uppercase tracking-widest text-[#7c839f] mb-1">Most Recent Matter</p>
          <p className="font-body-md text-[14px] font-semibold text-[#0A1128] truncate">{recentMatter.title}</p>
          <p className="text-[11px] text-[#46464d]">{recentMatter.status} - ${recentMatter.invoiceTotal.toLocaleString()} billed</p>
        </div>
      )}
    </div>
  );
}
