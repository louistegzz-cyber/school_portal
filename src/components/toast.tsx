import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Toast } from './ui';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

const ToastCtx = createContext<{ notify: (msg: string, type?: ToastState['type']) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const notify = useCallback((message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type });
  }, []);
  return (
    <ToastCtx.Provider value={{ notify }}>
      {children}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
