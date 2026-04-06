import { createContext, useCallback, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

export interface ToastItem {
  id: string;
  message: string;
  tone: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  toasts: ToastItem[];
  pushToast: (message: string, tone?: ToastItem['tone']) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (message: string, tone: ToastItem['tone'] = 'info') => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, message, tone }]);

      window.setTimeout(() => {
        removeToast(id);
      }, 3800);
    },
    [removeToast],
  );

  const value = useMemo(
    () => ({
      toasts,
      pushToast,
      removeToast,
    }),
    [pushToast, removeToast, toasts],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
