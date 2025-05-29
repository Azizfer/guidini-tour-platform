"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/app/LogingContext/AuthContext" // Using your provided AuthContext path
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import ProfilePopover from "./profile-popover"
import NotificationPopover from "./notifications/NotificationIcon"
import notificationService, { Notification as NotificationType } from "@/services/notificationService"
import MessagePopover from "./message-popover"
import GlobalLogoutConfirmation from "./LogoutConfirmation"
import { useChat } from "@/contexts/chat-context"

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
  const [language, setLanguage] = useState("FR")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { isAuthenticated, user: authUser, logout } = useAuth()
  const { unreadCount: unreadMessageCount = 0 } = useChat()
  
  // State to store the transformed user data
  const [userData, setUserData] = useState<UserProfile | null>(null)

  // Transform auth user to the format expected by our components
  useEffect(() => {
    if (authUser) {
      const transformedUser: UserProfile = {
        id: authUser.id || authUser._id || "default-id",
        name: authUser.name || "Utilisateur",
        email: authUser.email || "",
        // Ensure the profile image URL is properly formatted
        avatar: authUser.profileImage ? 
          (authUser.profileImage.startsWith('http') ? 
            authUser.profileImage : 
            `http://localhost:5001${authUser.profileImage.startsWith('/') ? '' : '/'}${authUser.profileImage}`
          ) : "",
        username: authUser.username || authUser.name || "user",
        userType: authUser.userType || "touriste",
      };
      setUserData(transformedUser);
    } else {
      setUserData({
        id: "guest",
        name: "Invité",
        email: "",
        avatar: "",
        username: "guest",
        userType: "guest",
      });
    }
  }, [authUser]);
  
  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const updatedUser = event.detail;
      console.log("Profile updated event received in Header:", updatedUser);
      
      if (userData) {
        setUserData({
          ...userData,
          name: updatedUser.name,
          email: updatedUser.email
        });
      }
    };

    // Add event listener for profile updates
    window.addEventListener("userProfileUpdated", handleProfileUpdate as EventListener);
    
    return () => {
      window.removeEventListener("userProfileUpdated", handleProfileUpdate as EventListener);
    };
  }, [userData]);

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

    // Listen for notification click event
    const handleNotificationClick = () => {
      setShowNotificationPopover(false)
    }

    window.addEventListener("userLoggedOut", handleLogout)
    window.addEventListener("notificationClicked", handleNotificationClick)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("userLoggedOut", handleLogout)
      window.removeEventListener("notificationClicked", handleNotificationClick)
    }
  }, [])

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside profile button and popover
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        // Check if click is inside profile popover
        const profilePopover = document.querySelector('.profile-popover-container');
        const isClickInsideProfilePopover = profilePopover ? profilePopover.contains(event.target as Node) : false;
        
        if (!isClickInsideProfilePopover) {
          setShowProfilePopover(false)
        }
      }
      
      // Check if click is outside notification button and popover
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        // Check if click is inside notification popover
        const notificationPopover = document.querySelector('.notification-popover-container');
        const isClickInsideNotificationPopover = notificationPopover ? notificationPopover.contains(event.target as Node) : false;
        
        if (!isClickInsideNotificationPopover) {
          setShowNotificationPopover(false)
        }
      }
      
      // Check if click is outside message button and popover
      if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
        // Check if click is inside message popover
        const messagePopover = document.querySelector('.message-popover-container');
        const isClickInsideMessagePopover = messagePopover ? messagePopover.contains(event.target as Node) : false;
        
        if (!isClickInsideMessagePopover) {
          setShowMessagePopover(false)
        }
      }
    }
    
    // Add listener for the custom force close event
    const handleForceCloseMessagePopover = () => {
      console.log('Force closing message popover');
      // Only close the message popover without affecting other popovers
      if (showMessagePopover) {
        setShowMessagePopover(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('forceCloseMessagePopover', handleForceCloseMessagePopover);
    window.addEventListener('closeMessagePopover', handleForceCloseMessagePopover);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('forceCloseMessagePopover', handleForceCloseMessagePopover);
      window.removeEventListener('closeMessagePopover', handleForceCloseMessagePopover);
    }
  }, [])

  // Prefetch important pages to reduce loading time
  useEffect(() => {
    // Prefetch common navigation targets
    router.prefetch('/auth/login')
    router.prefetch('/auth/register')
    router.prefetch('/')
    // Add other important routes as needed
  }, [router])
  
  // Fetch notifications periodically and update unread count
  useEffect(() => {
    // Only fetch notifications if user is authenticated
    if (!isAuthenticated) return;
    
    const fetchNotifications = async () => {
      try {
        const fetchedNotifications = await notificationService.getUserNotifications();
        setNotifications(fetchedNotifications);
        // Calculate unread count
        const unreadNotifications = fetchedNotifications.filter(notification => !notification.read);
        setUnreadCount(unreadNotifications.length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    // Initial fetch
    fetchNotifications();
    
    // Set up periodic refresh (every 15 seconds)
    const intervalId = setInterval(fetchNotifications, 15000);
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated])

  // Navigate to the auth pages - using direct window.location for immediate navigation
  const navigateToLogin = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.location.href = "/auth/login"
  }

  const navigateToRegister = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.location.href = "/auth/register"
  }

  // This function is no longer needed as the logout is now handled by the LogoutConfirmation component
  // We keep the reference for compatibility, but it's not directly used anymore

  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm py-3">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/">
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <GlobalLogoutConfirmation />
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled ? "bg-white/95 backdrop-blur-sm shadow-md py-2" : "bg-white shadow-sm py-3"
        }`}
      >
        <div className="w-full pl-4 pr-0 relative z-10">
          <div className="w-full flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative h-8">
                <img src="/placeholder.svg?height=32&width=100&text=Guidini" alt="Guidini Logo" className="h-8" />
              </div>
            </Link>

            {/* Right side actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-3 ml-auto mr-4"
            >
              {/* Language Selector */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                      />
                    </svg>
                    <span className="absolute -bottom-1 -right-1 text-[10px] font-medium text-gray-700 bg-gray-200 rounded-full px-1 min-w-5 text-center">
                      {language}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-0" align="end">
                  <div className="rounded-md overflow-hidden">
                    <button
                      onClick={() => setLanguage("FR")}
                      className={`w-full text-left px-3 py-2 text-sm ${language === "FR" ? "bg-gray-100 text-gray-900 font-medium" : "hover:bg-gray-50"}`}
                    >
                      Français
                    </button>
                    <button
                      onClick={() => setLanguage("EN")}
                      className={`w-full text-left px-3 py-2 text-sm ${language === "EN" ? "bg-gray-100 text-gray-900 font-medium" : "hover:bg-gray-50"}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLanguage("AR")}
                      className={`w-full text-left px-3 py-2 text-sm ${language === "AR" ? "bg-gray-100 text-gray-900 font-medium" : "hover:bg-gray-50"}`}
                    >
                      العربية
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Auth Buttons or User Actions */}
              {isAuthenticated && userData ? (
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
                      className="message-button flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 relative"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5 text-gray-700"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                        />
                      </svg>
                      {unreadMessageCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                          {unreadMessageCount}
                        </span>
                      )}
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
                            onViewAllMessages={() => {
                              console.log("Closing message popover without navigation")
                              // Don't navigate to /messages since it doesn't exist
                              // router.push("/messages")
                              setShowMessagePopover(false)
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Notification Icon with Popover */}
                  <div className="relative">
                    <NotificationPopover />
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
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 overflow-hidden border border-gray-200"
                    >
                      {userData && userData.avatar && userData.avatar.trim() !== "" ? (
                        <img
                          src={userData.avatar}
                          alt={userData.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            console.log("Image failed to load:", userData.avatar);
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-5 text-gray-700"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
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
                          {userData && <ProfilePopover user={userData} />}
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
                    className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300"
                  >
                    Se connecter
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => navigateToRegister(e)}
                    className="bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 shadow hover:shadow-md rounded-full px-4 py-1.5 text-sm font-medium"
                  >
                    S'inscrire
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </header>
    </>
  )
}

