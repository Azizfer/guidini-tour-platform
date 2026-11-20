"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import Toast, { ToastProps } from './Toast';

// Contexte pour le gestionnaire de toasts
type ToastContextType = {
  showToast: (toast: Omit<ToastProps, 'id'>) => void;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le gestionnaire de toasts
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé à l\'intérieur d\'un ToastProvider');
  }
  return context;
};

// Fournisseur de contexte pour les toasts
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  // Afficher un nouveau toast
  const showToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  // Masquer un toast spécifique
  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Masquer tous les toasts
  const hideAllToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast, hideAllToasts }}>
      {children}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-4">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
