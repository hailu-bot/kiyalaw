import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'error' | 'warning';
  children: React.ReactNode;
}

export default function Badge({ variant = 'default', children }: BadgeProps) {
  const colors = {
    default: 'bg-surface-tint text-surface-tint',
    primary: 'bg-primary-container text-on-primary',
    success: 'bg-green-600 text-white',
    error: 'bg-error text-on-error',
    warning: 'bg-amber-500 text-white',
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-bold ${colors[variant]}`}>
      {children}
    </span>
  );
}