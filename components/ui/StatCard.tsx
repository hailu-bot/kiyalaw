import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isPrimary?: boolean;
}

export default function StatCard({ title, value, icon, isPrimary = false }: StatCardProps) {
  const bgClass = isPrimary 
    ? 'bg-brand-900 text-white' 
    : 'bg-white border border-surface-border dark:bg-brand-900 dark:border-brand-800';
  const glowClass = isPrimary ? 'text-brand-accent drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]' : '';

  return (
    <div className={`p-6 rounded-none ${bgClass} hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-brand-800/30 text-brand-accent">
          {icon}
        </div>
        {isPrimary && (
          <span className="text-xs font-bold px-2 py-1 rounded bg-brand-accent text-black">
            ACTION REQUIRED
          </span>
        )}
      </div>
      
      <h3 className="text-base font-medium text-brand-900 dark:text-white mb-1">{title}</h3>
      <p className={`text-3xl font-heading font-bold text-brand-900 dark:text-white ${glowClass} mb-4`}>
        {value}
      </p>
      
      <div className="h-1 w-full bg-gray-200 dark:bg-brand-800 rounded-full overflow-hidden">
        <div className={`h-full ${isPrimary ? 'bg-brand-accent' : 'bg-gray-400'}`} style={{ width: '75%' }}></div>
      </div>
    </div>
  );
}