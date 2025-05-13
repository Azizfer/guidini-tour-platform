"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

export default function SuccessMessage() {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 flex flex-col items-center text-center"
    >
      <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
        <Check className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-2">Réservation confirmée !</h3>
      <p className="text-gray-600 mb-4">
        Merci pour votre réservation. Vous recevrez un email de confirmation dans les plus brefs délais.
      </p>
    </motion.div>
  )
}
