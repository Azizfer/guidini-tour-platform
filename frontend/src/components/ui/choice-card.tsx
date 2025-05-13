"use client"

import { motion } from "framer-motion"

interface ChoiceCardProps {
  label: string
  isSelected: boolean
  onClick: () => void
}

export function ChoiceCard({ label, isSelected, onClick }: ChoiceCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
        ${
          isSelected
            ? "border-2 border-teal-400 bg-teal-50/50 shadow-sm"
            : "border border-gray-200 hover:border-teal-200 hover:bg-gray-50"
        }
      `}
    >
      <div className="flex items-center">
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute left-3 flex items-center justify-center"
          >
            <div className="w-5 h-5 rounded-full bg-teal-400 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 3L4.5 8.5L2 6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>
        )}
        <span
          className={`
          ${isSelected ? "text-teal-600 font-medium ml-7" : "text-gray-700"}
        `}
        >
          {label}
        </span>
      </div>
    </motion.div>
  )
}
