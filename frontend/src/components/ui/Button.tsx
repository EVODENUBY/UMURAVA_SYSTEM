"use client";

import { ButtonHTMLAttributes, forwardRef, useState, useRef, useEffect, ReactNode } from 'react';

const BRAND_COLOR = "#2b71f0";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, onClick, disabled, ...props }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;

      setIsLoading(true);
      setShowSpinner(true);

      try {
        const result = onClick?.(e);
        if (result && typeof result === 'object' && 'then' in result) {
          await result;
        }
      } finally {
        timeoutRef.current = setTimeout(() => {
          setIsLoading(false);
          setShowSpinner(false);
        }, 300);
      }
    };

    const baseStyles = 'relative font-bold uppercase tracking-wider rounded-xl transition-all duration-200';
    
    const variants = {
      primary: `text-white shadow-lg shadow-blue-500/25 ${isLoading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'}`,
      secondary: 'bg-slate-900 text-white hover:bg-slate-800',
      outline: 'border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50',
      ghost: 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    };

    const spinnerColors = {
      primary: 'border-white/30 border-t-white',
      secondary: 'border-slate-400/30 border-t-slate-400',
      outline: 'border-slate-300/30 border-t-slate-400',
      ghost: 'border-slate-300/30 border-t-slate-400',
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles} 
          ${variants[variant]} 
          ${sizes[size]} 
          ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : ''}
          ${className}
        `}
        {...props}
      >
        {showSpinner && (
          <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-inherit">
            <div className={`w-4 h-4 rounded-full border-2 ${spinnerColors[variant]} animate-spin`} />
          </span>
        )}
        <span className={`flex items-center justify-center gap-2 transition-opacity ${showSpinner ? 'opacity-0' : 'opacity-100'}`}>
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
