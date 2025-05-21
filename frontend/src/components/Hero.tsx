"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pacifico } from "next/font/google"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, MapPin, Search, X } from "lucide-react"
import Link from "next/link"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
})

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-linear-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]",
          )}
        />
      </motion.div>
    </motion.div>
  )
}

export default function HeroTunisia() {
  const [showSearch, setShowSearch] = useState(false)

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/background.jpg" alt="Tunisia Coastal View" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-blue-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-white/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-blue-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
          className="absolute bottom-[15%] right-[10%] w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/30 overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-500/30 backdrop-blur-sm" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-3/4 h-3/4 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center">
              <div className="w-1/2 h-1/2 rounded-full bg-blue-500/50 backdrop-blur-md" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 md:mb-3 tracking-tight">
              <span className="text-white">Découvrez</span>
              <br />
              <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-200 to-pink-200",
                  pacifico.className,
                )}
              >
                La Tunisie Authentique
              </span>
            </h1>
          </motion.div>

          <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
            <p className="text-xs sm:text-sm text-white mb-4 leading-relaxed font-light tracking-wide max-w-lg mx-auto px-4">
              Explorez les merveilles cachées, les plages magnifiques et la riche culture de la Tunisie
            </p>
          </motion.div>

          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center gap-6"
          >
            <div className="w-full max-w-sm mb-2">
              <AnimatePresence mode="wait">
                {showSearch ? (
                  <motion.div
                    key="search-input"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex w-full gap-2 overflow-hidden"
                  >
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder="Où voulez-vous aller?"
                        className="bg-white/90 text-black placeholder:text-gray-500 border-none focus-visible:ring-blue-500 h-9 text-sm pr-9 w-full"
                        autoFocus
                      />
                      <div className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
                        <motion.button 
                          onClick={() => setShowSearch(false)}
                          className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center justify-center p-0 m-0 bg-transparent border-none outline-none"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <X className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white border-none text-xs h-9">
                      Rechercher
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="search-button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Button
                      onClick={() => setShowSearch(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1 text-xs rounded-full transition-all duration-300 shadow-md hover:shadow-lg w-full h-8"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Rechercher
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1 text-xs rounded-full transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto h-8 mt-4"
            >
              <Link href="/carte-interactive/interactive-map">
                <MapPin className="mr-2 h-4 w-4" />
                Explorez la carte interactive
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-full h-12 w-12"
            onClick={() => {
              document.getElementById("destinations")?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            <ChevronDown className="h-6 w-6" />
            <span className="sr-only">Défiler vers le bas</span>
          </Button>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
    </div>
  )
}
