"use client"

import { motion } from "framer-motion"

interface HandWrittenTitleProps {
  title?: string
  subtitle?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function HandWrittenTitle({
  title = "Hand Written",
  subtitle,
  size = "md",
  className = "",
}: HandWrittenTitleProps) {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2, ease: [0.43, 0.13, 0.23, 0.96] },
        opacity: { duration: 0.5 },
      },
    },
  }

  const sizeClasses = {
    sm: "py-10",
    md: "py-16",
    lg: "py-24",
  }

  const titleSizes = {
    sm: "text-2xl md:text-3xl",
    md: "text-3xl md:text-4xl",
    lg: "text-4xl md:text-6xl",
  }

  const subtitleSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  }

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${sizeClasses[size]} ${className}`}>
      <div className="absolute inset-0">
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 600"
          initial="hidden"
          animate="visible"
          className="w-full h-full"
        >
          <motion.path
            d="M 950 90 
               C 1250 300, 1050 480, 600 520
               C 250 520, 150 480, 150 300
               C 150 120, 350 80, 600 80
               C 850 80, 950 180, 950 180"
            fill="none"
            strokeWidth="12"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={draw}
            className="text-teal-500/20 dark:text-teal-400/20"
          />
        </motion.svg>
      </div>
      <div className="relative text-center z-10 flex flex-col items-center justify-center">
        <motion.h1
          className={`${titleSizes[size]} text-teal-700 dark:text-teal-400 tracking-tighter flex items-center gap-2 font-bold`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className={`${subtitleSizes[size]} text-gray-600 dark:text-gray-300 mt-2`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </div>
  )
}
