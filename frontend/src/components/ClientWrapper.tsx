"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

// This component handles client-side only functionality
export default function ClientWrapper() {
  const [mounted, setMounted] = useState(false)
  const { setTheme, theme } = useTheme()

  // Avoid hydration mismatch - Only run client-side code after component is mounted
  useEffect(() => {
    setMounted(true)
    
    // Only access localStorage after component is mounted (client-side only)
    if (typeof window !== 'undefined') {
      // Check for user's preferred theme in localStorage
      const savedTheme = localStorage.getItem("theme")
      if (savedTheme && theme !== savedTheme) {
        setTheme(savedTheme)
      }
    }

    // Listen for theme changes and save to localStorage
    const handleThemeChange = () => {
      if (theme && typeof window !== 'undefined') {
        localStorage.setItem("theme", theme)
      }
    }

    // Set up event listeners only on client side
    if (typeof window !== 'undefined') {
      window.addEventListener("themeChange", handleThemeChange)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("themeChange", handleThemeChange)
      }
    }
  }, [theme, setTheme])

  if (!mounted) {
    return null
  }

  return null // This component doesn't render anything visible
}
