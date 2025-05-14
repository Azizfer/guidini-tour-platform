"use client"

import { useState, useEffect, useRef } from "react"
import { Globe, Bell, MessageSquare, User, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/app/LogingContext/AuthContext"
import ProfilePopover from "./Profile-popover"
import NotificationPopover from "./notification-popover"
import MessagePopover from "./message-popover"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Define a user type that matches what ProfilePopover expects
interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  username: string
  userType: string
}

export default function Header() {
  const [language, setLanguage] = useState("Français")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { isAuthenticated, user: authUser, logout } = useAuth()

  // Transform auth user to the format expected by our components
  const user: UserProfile = authUser
    ? {
        id: authUser.id || "default-id",
        name: authUser.name || "Utilisateur",
        email: authUser.email || "",
        avatar: authUser.profileImage,
        username: authUser.username || authUser.name || "user",
        userType: authUser.userType || "touriste",
      }
    : ({} as UserProfile)
  const router = useRouter()

  // Popover states
  const [showProfilePopover, setShowProfilePopover] = useState(false)
  const [showNotificationPopover, setShowNotificationPopover] = useState(false)
  const [showMessagePopover, setShowMessagePopover] = useState(false)

  // Refs for popover positioning
  const profileRef = useRef<HTMLButtonElement>(null)
  const notificationRef = useRef<HTMLButtonElement>(null)
  const messageRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setIsMounted(true)
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)

    // Listen for logout event
    const handleLogout = () => {
      setShowProfilePopover(false)
      setShowNotificationPopover(false)
      setShowMessagePopover(false)
    }

    window.addEventListener("userLoggedOut", handleLogout)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("userLoggedOut", handleLogout)
    }
  }, [])

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfilePopover(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationPopover(false)
      }
      if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
        setShowMessagePopover(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Navigate to the auth pages
  const navigateToLogin = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push("/auth/login")
  }
  
  const navigateToRegister = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push("/auth/register")
  }

  // Handle logout
  const handleLogout = () => {
    logout()
    setShowProfilePopover(false)
  }

  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm py-3">
        <div className="container mx-auto px-0 flex items-center justify-between">
          <Link href="/">
            <div className="h-10 w-24 bg-gray-200/50 rounded animate-pulse" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-8 w-20 bg-gray-200/50 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200/50 rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-sm shadow-md py-2" : "bg-white shadow-sm py-4"
      }`}
    >
      <div className="container mx-auto px-0 relative z-10">
        <div className="w-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-12 w-40">
              <img src="/placeholder.svg?height=40&width=120&text=Guidini" alt="Guidini Logo" className="h-10" />
            </div>
          </Link>

          {/* Right side actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-2 md:gap-4"
          >
            {/* Language Selector */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 rounded-full px-3 hover:bg-teal-50 hover:text-teal-600"
                >
                  <Globe className="h-4 w-4" />
                  <span>{language}</span>
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-0" align="end">
                <div className="rounded-md overflow-hidden">
                  <button
                    onClick={() => setLanguage("Français")}
                    className={`w-full text-left px-3 py-2 text-sm ${language === "Français" ? "bg-teal-50 text-teal-600 font-medium" : "hover:bg-gray-50"}`}
                  >
                    Français
                  </button>
                  <button
                    onClick={() => setLanguage("English")}
                    className={`w-full text-left px-3 py-2 text-sm ${language === "English" ? "bg-teal-50 text-teal-600 font-medium" : "hover:bg-gray-50"}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage("العربية")}
                    className={`w-full text-left px-3 py-2 text-sm ${language === "العربية" ? "bg-teal-50 text-teal-600 font-medium" : "hover:bg-gray-50"}`}
                  >
                    العربية
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Auth Buttons or User Actions */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* Message Icon with Popover */}
                <div className="relative">
                  <button
                    ref={messageRef}
                    onClick={() => {
                      setShowMessagePopover(!showMessagePopover)
                      setShowNotificationPopover(false)
                      setShowProfilePopover(false)
                    }}
                    className="p-2 rounded-full hover:bg-teal-50 transition-colors relative group"
                  >
                    <MessageSquare className="h-5 w-5 text-gray-600 group-hover:text-teal-600 transition-colors" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                      3
                    </span>
                  </button>
                  <AnimatePresence>
                    {showMessagePopover && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 z-50"
                      >
                        <MessagePopover
                          onOpenChat={(user) => {
                            console.log("Opening chat with", user.name)
                            setShowMessagePopover(false)
                          }}
                          onViewAllMessages={() => {
                            console.log("Viewing all messages")
                            router.push("/messages")
                            setShowMessagePopover(false)
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Notification Icon with Popover */}
                <div className="relative">
                  <button
                    ref={notificationRef}
                    onClick={() => {
                      setShowNotificationPopover(!showNotificationPopover)
                      setShowMessagePopover(false)
                      setShowProfilePopover(false)
                    }}
                    className="p-2 rounded-full hover:bg-teal-50 transition-colors relative group"
                  >
                    <Bell className="h-5 w-5 text-gray-600 group-hover:text-teal-600 transition-colors" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                      2
                    </span>
                  </button>
                  <AnimatePresence>
                    {showNotificationPopover && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 z-50"
                      >
                        <NotificationPopover />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Icon with Popover */}
                <div className="relative">
                  <button
                    ref={profileRef}
                    onClick={() => {
                      setShowProfilePopover(!showProfilePopover)
                      setShowNotificationPopover(false)
                      setShowMessagePopover(false)
                    }}
                    className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 hover:from-teal-200 hover:to-teal-300 transition-all duration-300 overflow-hidden border border-teal-200 shadow-sm"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-teal-700" />
                    )}
                  </button>
                  <AnimatePresence>
                    {showProfilePopover && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 z-50"
                      >
                        <ProfilePopover user={user} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => navigateToLogin(e)}
                  className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-all duration-300"
                >
                  Se connecter
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => navigateToRegister(e)}
                  className="bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white transition-all duration-300 shadow hover:shadow-md rounded-full px-4 py-2 text-sm font-medium border border-teal-400/50"
                >
                  S'inscrire
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </header>
  )
}
