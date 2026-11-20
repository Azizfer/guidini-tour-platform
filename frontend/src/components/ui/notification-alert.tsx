import React from "react";
import { CheckCircle2, AlertCircle, XCircle, InfoIcon } from "lucide-react";
import { motion } from "framer-motion";

type NotificationAlertProps = {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  onClose?: () => void;
};

export default function NotificationAlert({ 
  type = "info", 
  title, 
  message,
  onClose
}: NotificationAlertProps) {
  // Définir les couleurs et icônes en fonction du type
  const config = {
    success: {
      icon: <CheckCircle2 className="h-6 w-6 text-teal-500" />,
      bgColor: "bg-teal-50 dark:bg-teal-900/20",
      borderColor: "border-teal-200 dark:border-teal-800",
      titleColor: "text-teal-700 dark:text-teal-300",
      messageColor: "text-teal-600 dark:text-teal-400"
    },
    error: {
      icon: <XCircle className="h-6 w-6 text-red-500" />,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      titleColor: "text-red-700 dark:text-red-300",
      messageColor: "text-red-600 dark:text-red-400"
    },
    warning: {
      icon: <AlertCircle className="h-6 w-6 text-amber-500" />,
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      borderColor: "border-amber-200 dark:border-amber-800",
      titleColor: "text-amber-700 dark:text-amber-300",
      messageColor: "text-amber-600 dark:text-amber-400"
    },
    info: {
      icon: <InfoIcon className="h-6 w-6 text-blue-500" />,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      titleColor: "text-blue-700 dark:text-blue-300",
      messageColor: "text-blue-600 dark:text-blue-400"
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`w-full relative ${config[type].bgColor} border ${config[type].borderColor} shadow-[0_1px_6px_0_rgba(0,0,0,0.05)] rounded-xl p-4`}
    >
      <div className="flex gap-3">
        <div className="p-2 rounded-full">
          <div className="rounded-full bg-white dark:bg-zinc-900">
            {config[type].icon}
          </div>
        </div>

        <div className="space-y-0.5 flex-1">
          <h3 className={`text-sm font-medium ${config[type].titleColor}`}>
            {title}
          </h3>
          <p className={`text-[13px] ${config[type].messageColor}`}>
            {message}
          </p>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}
