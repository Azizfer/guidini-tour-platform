"use client"

import type React from "react"

import { Check } from "lucide-react"
import { motion } from "framer-motion"

interface SelectionCardProps {
  label: string
  description?: string
  isSelected: boolean
  onClick: () => void
  icon?: React.ReactNode
}

export function SelectionCard({ label, description, isSelected, onClick, icon }: SelectionCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-3 border rounded-lg cursor-pointer transition-all ${
        isSelected ? "border-teal-500 bg-teal-50 shadow-sm" : "border-gray-200 hover:border-teal-200 hover:bg-gray-50"
      }`}
      layout
    >
      <div className="flex items-center">
        {icon && <div className="mr-3">{icon}</div>}
        <div className="flex-1">
          <div className="flex items-center">
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center mr-2"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}
            <span className={`font-medium ${isSelected ? "text-teal-700" : "text-gray-700"}`}>{label}</span>
          </div>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
      </div>
    </motion.div>
  )
}
