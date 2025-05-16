"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle2, X } from "lucide-react"
import confetti from "canvas-confetti"
import { useEffect } from "react"

interface SuccessStepProps {
  onFinish: () => void
}

export default function SuccessStep({ onFinish }: SuccessStepProps) {
  useEffect(() => {
    // Trigger confetti when component mounts
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#14b8a6", "#0d9488", "#0f766e"],
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#14b8a6", "#0d9488", "#0f766e"],
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          mass: 0.5,
        }}
        className="w-full max-w-sm mx-auto mb-8"
      >
        <div className="relative overflow-hidden rounded-lg border border-emerald-300 bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-800/30 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                delay: 0.2,
              }}
              className="rounded-full bg-emerald-200 dark:bg-emerald-900/50 p-1"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm font-medium text-emerald-900 dark:text-emerald-200"
            >
              Votre compte a été créé avec succès.
            </motion.p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          delay: 0.5,
        }}
        className="w-full"
      >
        <Button
          onClick={onFinish}
          className="w-full py-6 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium"
        >
          Se connecter
        </Button>
      </motion.div>
    </div>
  )
}
