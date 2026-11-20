"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import PaymentVerification from "./payment-verification"
import axios from 'axios';
import { toast } from "@/components/ui/use-toast";

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

  // Global Axios interceptor for handling 404 errors
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 404) {
          // Silently handle 404 errors without showing a toast
          if (process.env.NODE_ENV === 'development') {
            console.warn('404 - Resource not found:', error.config?.url);
          }
        }
        return Promise.reject(error)
      }
    )

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(responseInterceptor)
    }
  }, [])

  if (!mounted) {
    return null
  }

  return <PaymentVerification />
}
