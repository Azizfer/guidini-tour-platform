"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import Link from "next/link"
import Header from "./Header"
import Image from "next/image"

// Decorative flower
function DecorativeFlower({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="12" cy="12" r="3" className="text-pink-300" />
      <circle cx="12" cy="6" r="2" className="text-pink-200" />
      <circle cx="18" cy="12" r="2" className="text-pink-200" />
      <circle cx="12" cy="18" r="2" className="text-pink-200" />
      <circle cx="6" cy="12" r="2" className="text-pink-200" />
    </svg>
  )
}

export default function TunisiaHeroClean() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <Header />

      {/* Minimal decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute top-32 left-16"
        >
          <DecorativeFlower className="w-4 h-4 text-pink-200" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute top-48 right-32"
        >
          <DecorativeFlower className="w-5 h-5 text-pink-300" />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[85vh]">
          {/* Left Side - Content */}
          <div className="space-y-6">
            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-800 leading-tight tracking-tight">
                <span className="relative inline-block">
                  Aventures
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-transparent rounded-full"></span>
                </span>
                <br />
                <span className="text-blue-600 drop-shadow-sm bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  Tunisiennes
                </span>{" "}
                &
                <br />
                <span className="relative inline-block">
                  Évasions
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-transparent rounded-full"></span>
                </span>
                <br />
                <span className="text-blue-600 drop-shadow-sm bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  Authentiques
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg text-gray-600 max-w-lg leading-relaxed font-light"
            >
              Planifiez et réservez votre voyage parfait avec nos conseils d'experts, informations sur les destinations
              et inspiration authentique.
            </motion.p>

            {/* Action Button - Repositioned and narrower */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="pt-6" // Added padding-top to move button down
            >
              <Button
                size="default"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm font-medium w-auto"
                asChild
              >
                <Link href="/carte-interactive">
                  <MapPin className="h-4 w-4" />
                  <span>Explorez</span>
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Right Side - Visual with layered circles */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative flex justify-center items-center"
          >
            {/* Layered Blue Circles with different animations */}
            <div className="relative flex justify-center items-center">
              {/* Outer circle - slowest movement */}
              <motion.div
                className="absolute w-[520px] h-[520px] bg-blue-500/20 rounded-full"
                animate={{
                  scale: [1, 1.03, 1],
                  rotate: [0, 5, 0],
                  borderRadius: ["50%", "48%", "50%"],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 20,
                  ease: "easeInOut",
                }}
              ></motion.div>

              {/* Middle circle - medium movement */}
              <motion.div
                className="absolute w-[500px] h-[500px] bg-blue-500/40 rounded-full"
                animate={{
                  scale: [1, 1.02, 1],
                  rotate: [0, -3, 0],
                  borderRadius: ["50%", "49%", "50%"],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 15,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              ></motion.div>

              {/* Inner circle - main blue background */}
              <motion.div
                className="absolute w-[480px] h-[480px] bg-gradient-to-br from-blue-500 to-blue-600 rounded-full"
                animate={{
                  scale: [1, 1.01, 1],
                  rotate: [0, 2, 0],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 10,
                  ease: "easeInOut",
                  delay: 1,
                }}
              ></motion.div>

              {/* Guide and Tourist Image - Even bigger */}
              <div className="relative z-10 w-[500px] h-[550px] flex justify-center items-center">
                <Image
                  src="/images/Guide tourist.png"
                  alt="Guide et touriste en Tunisie"
                  width={500}
                  height={550}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
