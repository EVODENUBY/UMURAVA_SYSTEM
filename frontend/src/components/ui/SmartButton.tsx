"use client";

import { ReactNode } from 'react';

const BRAND_COLOR = "#2b71f0";

interface SmartButtonProps {
  children: ReactNode;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  icon?: ReactNode;
}

export default function SmartButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  fullWidth = false,
  icon,
}: SmartButtonProps) {
  const sizeClasses = {
    sm: size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs',
    md: size === 'sm' ? 'px-4 py-2 text-xs' : size === 'lg' ? 'px-8 py-4 text-base' : 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const variantStyles = {
    primary: {
      bg: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl',
      spinner: 'border-white/30 border-t-white',
    },
    secondary: {
      bg: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
      spinner: 'border-slate-300 border-t-slate-500',
    },
    outline: {
      bg: 'border-2 border-slate-200 hover:bg-slate-50 text-slate-700',
      spinner: 'border-slate-300 border-t-slate-500',
    },
    ghost: {
      bg: 'hover:bg-slate-100 text-slate-700',
      spinner: 'border-slate-300 border-t-slate-500',
    },
  };

  return (
    <SmartButtonInner
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      sizeClasses={sizeClasses[size]}
      variantStyles={variantStyles}
      className={className}
      type={type}
      fullWidth={fullWidth}
      icon={icon}
    >
      {children}
    </SmartButtonInner>
  );
}

import { useState, useRef, useEffect } from 'react';

function SmartButtonInner({
  children,
  onClick,
  disabled,
  variant,
  sizeClasses,
  variantStyles,
  className,
  type,
  fullWidth,
  icon,
}: {
  children: ReactNode;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  sizeClasses: string;
  variantStyles: Record<string, { bg: string; spinner: string }>;
  className: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  icon?: ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = async () => {
    if (disabled || loading) return;

    setLoading(true);
    setShowSpinner(true);

    try {
      const result = onClick?.();
      if (result && typeof result === 'object' && 'then' in result) {
        await result;
      }
    } finally {
      timeoutRef.current = setTimeout(() => {
        setLoading(false);
        setShowSpinner(false);
      }, 300);
    }
  };

  const style = variant === 'primary' 
    ? { backgroundColor: loading ? '#93c5fd' : BRAND_COLOR }
    : {};

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative flex items-center justify-center gap-2 
        font-bold uppercase tracking-wider 
        transition-all duration-200
        rounded-xl
        disabled:opacity-60 disabled:cursor-not-allowed
        ${sizeClasses}
        ${variantStyles[variant].bg}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={style}
    >
      {showSpinner && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
          <div className={`w-4 h-4 rounded-full border-2 ${variantStyles[variant].spinner} animate-spin`} />
        </span>
      )}
      <span className={`flex items-center gap-2 transition-opacity ${showSpinner ? 'opacity-0' : 'opacity-100'}`}>
        {icon && <span className="text-current">{icon}</span>}
        {children}
      </span>
    </button>
  );
}
