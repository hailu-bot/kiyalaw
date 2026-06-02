import React from 'react';

interface ButtonProps {
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export default function Button({ variant = 'default', size = 'md', onClick, children, disabled = false }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded font-bold transition-colors duration-200';
  
  const variantClasses: Record<string, string> = {
    default: 'bg-surface border border-outline-variant text-on-background hover:bg-surface-container',
    primary: 'bg-primary-container text-on-primary hover:bg-on-primary-fixed-variant',
    secondary: 'bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary',
    danger: 'bg-error text-on-error hover:bg-[#93000a]',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}