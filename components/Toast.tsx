import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000); // Auto-close dopo 4s
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3 min-w-[300px] p-4 rounded-xl backdrop-blur-xl border shadow-2xl animate-in slide-in-from-right-full duration-300
              ${toast.type === 'success' ? 'bg-green-950/60 border-green-500/30 text-green-100' :
                toast.type === 'error' ? 'bg-red-950/60 border-red-500/30 text-red-100' :
                toast.type === 'warning' ? 'bg-yellow-950/60 border-yellow-500/30 text-yellow-100' :
                'bg-blue-950/60 border-blue-500/30 text-blue-100'}
            `}
          >
            <div className={`p-2 rounded-full ${
                toast.type === 'success' ? 'bg-green-500/20 text-green-400' :
                toast.type === 'error' ? 'bg-red-500/20 text-red-400' :
                toast.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
            }`}>
                {toast.type === 'success' && <CheckCircle size={18} />}
                {toast.type === 'error' && <XCircle size={18} />}
                {toast.type === 'warning' && <AlertTriangle size={18} />}
                {toast.type === 'info' && <Info size={18} />}
            </div>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-white/40 hover:text-white transition-colors">
                <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};