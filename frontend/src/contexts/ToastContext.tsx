"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-500',
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          text: 'text-emerald-800'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          text: 'text-red-800'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-500',
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          text: 'text-amber-800'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          icon: <Info className="w-5 h-5 text-blue-500" />,
          text: 'text-blue-800'
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
        <AnimatePresence>
          {toasts.map(toast => {
            const styles = getToastStyles(toast.type);
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg ${styles.bg} ${styles.border}`}
              >
                {styles.icon}
                <p className={`text-sm font-medium ${styles.text} flex-1`}>{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}