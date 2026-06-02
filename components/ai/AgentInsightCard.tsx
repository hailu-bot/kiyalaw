'use client';

import { AlertTriangle, Clock, FileText, TrendingUp } from 'lucide-react';

type Props = {
  title: string;
  message: string;
  priority?: 'high' | 'medium' | 'low';
  category?: string;
};

const priorityConfig = {
  high: { border: 'border-l-red-500', bg: 'bg-red-50', icon: AlertTriangle, color: 'text-red-600' },
  medium: { border: 'border-l-amber-500', bg: 'bg-amber-50', icon: Clock, color: 'text-amber-600' },
  low: { border: 'border-l-blue-500', bg: 'bg-blue-50', icon: TrendingUp, color: 'text-blue-600' },
};

const categoryIcons: Record<string, React.ElementType> = {
  Billing: TrendingUp,
  Compliance: FileText,
  Matters: Clock,
  'Time Tracking': Clock,
  General: TrendingUp,
};

export default function AgentInsightCard({ title, message, priority = 'low', category }: Props) {
  const config = priorityConfig[priority];
  const Icon = (category && categoryIcons[category]) || config.icon;

  return (
    <div className={`border-l-4 ${config.border} ${config.bg} p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.color}`} />
        <div>
          <p className="font-label-md text-[13px] text-[#0A1128] font-bold mb-1">{title}</p>
          <p className="font-body-md text-[14px] text-[#46464d] leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}
