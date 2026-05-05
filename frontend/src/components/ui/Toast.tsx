import { useState, useEffect, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const typeStyles = {
  success: 'border-green text-green',
  error: 'border-red text-red',
  info: 'border-accent text-accent',
  warning: 'border-yellow text-yellow',
};

export function ToastContainer({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'bp-card flex items-center gap-3 border-l-4 min-w-[280px]',
            typeStyles[toast.type]
          )}
        >
          <span className="t-body flex-1">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-fg-3 hover:text-fg-1"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3 3l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// Simple toast hook
let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = `toast-${++toastId}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts: { toasts, removeToast }, addToast };
}
