"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Globe, User, Menu, X, Bell, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import ProfilePopover from "./profile-popover"
import MessagePopover from "@/app/Message/message-popover"
import { useChat } from "@/contexts/chat-context"
import NotificationPopover from "./Notifications/NotificationPopover"
import CreateGroupDialog from "./CreateGroupDialog"

// Guidini Logo Component
function GuidiniLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img src="/logos/guidini-full-logo.svg" alt="Guidini" className="h-24 w-auto" />
    </div>
  )
}

export default function IntegratedHeader() {
  const [language, setLanguage] = useState("FR")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  
  // Access the chat context
  const { openChat, unreadCount } = useChat()
  const [userData, setUserData] = useState({
    id: "",
    name: "Utilisateur",
    email: "user@example.com",
    username: "",
    userType: "tourist",
    avatar: "",
    profileImage: ""
  })

  useEffect(() => {
    setIsMounted(true)
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)

    // Check authentication status and update state
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token")
      setIsAuthenticated(!!token)

      if (token) {
        try {
          const storedUser = localStorage.getItem("user")
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            setUserData({
              id: parsedUser.id || parsedUser._id || "",
              name: parsedUser.name || parsedUser.username || "Utilisateur",
              email: parsedUser.email || "user@example.com",
              username: parsedUser.username || "",
              userType: parsedUser.userType || "tourist",
              avatar: parsedUser.avatar || "",
              profileImage: parsedUser.profileImage || parsedUser.avatar || ""
            })
            return
          }
        } catch (err) {
          console.error("Failed to parse stored user:", err)
        }
      }

      // Fallback (not authenticated or no stored user)
      setUserData({
        id: "",
        name: "Utilisateur",
        email: "user@example.com",
        username: "",
        userType: "tourist",
        avatar: "",
        profileImage: ""
      })
    }

    // Initial check
    checkAuthStatus()

    // Listen for auth state changes (login/register)
    const handleAuthChange = () => {
      console.log("authStateChanged event detected in Header")
      checkAuthStatus()
    }

    // Listen for logout events
    const handleLogout = () => {
      console.log("Logout event detected in Header")
      setIsAuthenticated(false)
      checkAuthStatus()
    }
    
    window.addEventListener("userLoggedOut", handleLogout)
    window.addEventListener("authStateChanged", handleAuthChange)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("userLoggedOut", handleLogout)
      window.removeEventListener("authStateChanged", handleAuthChange)
    }
  }, [])

  const navigateToLogin = () => {
    window.location.href = "/auth/login"
  }

  const navigateToRegister = () => {
    window.location.href = "/auth/register"
  }

  if (!isMounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 py-4 bg-blue-500/90">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="h-6 w-16 bg-white/20 rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-white/20 rounded-full animate-pulse" />
            <div className="h-6 w-6 bg-white/20 rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  const navItems = [
    { name: "Guides", href: "/guides/components/AllGuides" },
    { name: "Destinations", href: "/Destinations" },
    { name: "Activités", href: "/Activities/components/AllActivities" }
  ]

  return (
    <>
      <header
        className={cn(
          isScrolled
            ? "fixed top-4 left-4 right-4 rounded-xl shadow-lg ring-1 ring-slate-200 backdrop-blur-md"
            : "absolute top-0 left-0 right-0",
          "z-50 transition-all duration-500 bg-gradient-to-br from-slate-50 to-blue-50"
        )}
      >
        <div className={cn("w-full px-0 flex items-center justify-between relative", isScrolled ? "h-16" : "h-20")}>
          {/* Logo */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="pl-6 flex items-center">
            <Link href="/" className="flex items-center">
              <GuidiniLogo />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            {navItems.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="mx-6 relative group"
              >
                <Link
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors duration-200"
                >
                  {item.name}
                </Link>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
              </motion.div>
            ))}
          </div>

          {/* Right side actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-4.5 ml-auto md:ml-0 mr-0 pr-2"
          >
            {/* Language Selector */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-700 hover:text-blue-600">
                  <Globe className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-32 p-0 bg-white border-gray-200" align="end">
                <div className="rounded-md overflow-hidden">
                  <button
                    onClick={() => setLanguage("FR")}
                    className={`w-full text-left px-3 py-1.5 text-sm ${language === "FR" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    Français
                  </button>
                  <button
                    onClick={() => setLanguage("EN")}
                    className={`w-full text-left px-3 py-1.5 text-sm ${language === "EN" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage("AR")}
                    className={`w-full text-left px-3 py-1.5 text-sm ${language === "AR" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    العربية
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Auth Buttons or User Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Create Group Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative flex items-center justify-center h-9 w-9 rounded-full bg-white/10 text-gray-700 hover:bg-gray-200 transition-colors ml-3"
                  onClick={() => setIsCreateGroupOpen(true)}
                >
                  <UserPlus className="h-5 w-5" />
                </Button>

                {/* Notification Icon */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative flex items-center justify-center h-9 w-9 rounded-full bg-white/10 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {/* Red badge with unread count (placeholder) */}
                      {false && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full ring-1 ring-white z-10">
                          0
                        </span>
                      )}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                      </svg>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto border-0 bg-transparent shadow-none" align="end">
                    <NotificationPopover />
                  </PopoverContent>
                </Popover>

                {/* Messages Icon with Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative flex items-center justify-center h-9 w-9 rounded-full bg-white/10 hover:bg-gray-200 text-gray-700 hover:text-gray-800 transition-colors"
                    >
                      {/* Unread count badge */}
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex items-center justify-center h-3.5 w-3.5 min-w-[0.875rem] rounded-full bg-red-600 text-white text-[9px] font-semibold border border-white transform translate-x-[15%] -translate-y-[15%]">
                          {unreadCount}
                        </span>
                      )}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                      </svg>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto border-0 bg-transparent shadow-none" align="end">
                    <MessagePopover onOpenChat={(message) => {
                      // Create a chat user from the message data
                      const chatUser = {
                        id: message.senderId,
                        name: message.senderName,
                        avatar: message.senderAvatar,
                        online: message.isOnline || false
                      };
                      
                      // Open the chat with this user using the chat context
                      openChat(chatUser);
                    }} />
                  </PopoverContent>
                </Popover>

                {/* Profile Icon with Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-400/20 hover:bg-amber-400/30 transition-colors overflow-hidden border border-amber-400/50"
                    >
                      <User className="h-4 w-4 text-amber-300" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto border-0 bg-transparent shadow-none" align="end">
                    <ProfilePopover user={userData} />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                  onClick={navigateToLogin}
                >
                  Se connecter
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={navigateToRegister}
                >
                  S'inscrire
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Mobile menu */}
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: isMobileMenuOpen ? 1 : 0, x: isMobileMenuOpen ? 0 : "100%" }}
          transition={{ duration: 0.3 }}
          className="md:hidden fixed inset-y-0 right-0 w-64 bg-white shadow-lg z-50 p-4"
        >
          <div className="flex justify-end mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {!isAuthenticated && (
            <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col space-y-2">
              <Button
                variant="ghost"
                onClick={navigateToLogin}
                className="w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                Se connecter
              </Button>
              <Button
                variant="default"
                onClick={navigateToRegister}
                className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white transition-colors rounded-md px-4 py-2 text-sm font-medium"
              >
                S'inscrire
              </Button>
            </div>
          )}
        </motion.div>
      </header>
      <CreateGroupDialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen} />
    </>
  )
}
