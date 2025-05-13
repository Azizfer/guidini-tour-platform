"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div className="w-5 h-5 rounded-full bg-white shadow"></div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center transition-colors duration-300"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        className="absolute left-0.5 w-5 h-5 rounded-full flex items-center justify-center"
        animate={{
          left: theme === "dark" ? "calc(100% - 1.25rem - 0.125rem)" : "0.125rem",
          backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {theme === "dark" ? <Moon className="h-3 w-3 text-yellow-300" /> : <Sun className="h-3 w-3 text-yellow-500" />}
      </motion.div>
    </button>
  )
}
