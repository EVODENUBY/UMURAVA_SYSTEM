"use client";

import { ReactNode } from 'react';

interface LoadingButtonProps {
  children: ReactNode;
  onClick?: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const BRAND_COLOR = "#2b71f0";

export default function LoadingButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
}: LoadingButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-sm',
  };

  const variantClasses = {
    primary: 'text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    outline: 'border-2 border-slate-200 hover:bg-slate-50',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        flex items-center justify-center gap-2 
        font-bold uppercase tracking-wider 
        transition-all rounded-xl 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        ${className}
      `}
      style={variant === 'primary' ? { backgroundColor: loading ? '#93c5fd' : BRAND_COLOR } : {}}
    >
      {loading && (
        <div 
          className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" 
        />
      )}
      {children}
    </button>
  );
}
