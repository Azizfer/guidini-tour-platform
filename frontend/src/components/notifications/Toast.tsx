"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastProps {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // en millisecondes
  onClose?: () => void;
}

export default function Toast({ id, title, message, type, duration = 5000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  // Fermer le toast après la durée spécifiée
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onClose && onClose();
      }, 300); // Attendre la fin de l'animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Déterminer les couleurs en fonction du type
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-500 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-500 text-blue-800';
    }
  };

  // Obtenir l'icône en fonction du type
  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-4 right-4 z-50 w-80 p-4 rounded-lg shadow-lg border-l-4 ${getToastStyles()}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <span className="text-xl">{getToastIcon()}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm">{title}</h3>
              <p className="text-sm mt-1">{message}</p>
            </div>
            <button
              onClick={() => {
                setVisible(false);
                setTimeout(() => {
                  onClose && onClose();
                }, 300);
              }}
              className="ml-3 flex-shrink-0 text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
