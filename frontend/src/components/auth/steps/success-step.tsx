"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Star } from "lucide-react"

interface SuccessStepProps {
  onFinish: () => void
}

// Animated star component
function AnimatedStar({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x, y }}
      animate={{
        opacity: [0, 1, 0.8, 0],
        scale: [0, 1, 0.8, 0],
        y: y - 100,
      }}
      transition={{
        delay,
        duration: 2,
        ease: "easeOut",
        times: [0, 0.3, 0.8, 1],
      }}
      className="absolute"
    >
      <Star className={`text-yellow-300 w-${size} h-${size}`} fill="currentColor" />
    </motion.div>
  )
}

export default function SuccessStep({ onFinish }: SuccessStepProps) {
  // Generate random stars for animation
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    x: (Math.random() - 0.5) * 200,
    y: (Math.random() - 0.5) * 100,
    size: Math.floor(Math.random() * 3) + 3, // Size between 3 and 5
  }))

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Atmospheric effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5"></div>

      {/* Stars animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="relative w-full h-full">
          {stars.map((star) => (
            <AnimatedStar key={star.id} delay={star.delay} x={star.x} y={star.y} size={star.size} />
          ))}
        </div>
      </div>

      <div className="min-h-screen flex items-start justify-center px-4 pt-20 pb-8 relative z-10">
        <div className="w-full max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full"
          >
            {/* Header Section */}
            <div className="text-center mb-6">
              <p className="text-white text-2xl font-semibold mb-2 drop-shadow-lg">FÉLICITATIONS!</p>
              <p className="text-blue-100 text-base drop-shadow-md">Votre compte a été créé avec succès</p>
            </div>

            {/* Success Content */}
            <div className="space-y-6 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.3,
                }}
                className="flex justify-center"
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl">
                  <CheckCircle2 className="h-16 w-16 text-white" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center space-y-3"
              >
                <h2 className="text-xl font-bold text-white">Compte créé avec succès!</h2>
                <p className="text-white/80">
                  Votre aventure avec Guidini commence maintenant. Explorez la Tunisie authentique avec nos guides
                  experts.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                <Button
                  onClick={onFinish}
                  className="w-full h-12 bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-blue-600 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-base"
                >
                  Commencer l'aventure
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
