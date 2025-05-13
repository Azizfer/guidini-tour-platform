"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SectionDividerProps {
  className?: string
  variant?: "wave" | "curve" | "triangle" | "zigzag"
  invert?: boolean
  color?: string
}

export default function SectionDivider({
  className,
  variant = "wave",
  invert = false,
  color = "white",
}: SectionDividerProps) {
  const getPath = () => {
    switch (variant) {
      case "wave":
        return invert ? "M0,32 C320,0 480,64 1440,32 L1440,64 L0,64 Z" : "M0,0 C320,32 480,0 1440,32 L1440,0 L0,0 Z"
      case "curve":
        return invert ? "M0,0 C720,64 1440,0 1440,0 L1440,64 L0,64 Z" : "M0,64 C720,0 1440,64 1440,64 L1440,0 L0,0 Z"
      case "triangle":
        return invert ? "M0,0 L1440,0 L720,64 Z" : "M0,64 L1440,64 L720,0 Z"
      case "zigzag":
        return invert
          ? "M0,0 L360,32 L720,0 L1080,32 L1440,0 L1440,64 L0,64 Z"
          : "M0,64 L360,32 L720,64 L1080,32 L1440,64 L1440,0 L0,0 Z"
      default:
        return invert ? "M0,32 C320,0 480,64 1440,32 L1440,64 L0,64 Z" : "M0,0 C320,32 480,0 1440,32 L1440,0 L0,0 Z"
    }
  }

  return (
    <div className={cn("relative w-full h-24 -mt-24 overflow-hidden", className)}>
      <motion.svg
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewBox="0 0 1440 64"
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-0 left-0 w-full"
        preserveAspectRatio="none"
      >
        <path d={getPath()} />
      </motion.svg>
    </div>
  )
}
