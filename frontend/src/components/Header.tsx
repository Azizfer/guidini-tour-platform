"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Bell, Mail } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import Modal from "@/components/Modal"
import ProfilePopover from "@/components/Profile-popover"
import NotificationPopover from "@/components/notification-popover"
import MessagePopover from "@/components/message-popover"
import ChatInterface from "@/components/Chat-Interface"

export default function Header() {
  const [language, setLanguage] = useState("Français")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState({
    id: "1",
    name: "Utilisateur",
    username: "user",
    email: "user@example.com",
    avatar: undefined,
  })
  const [showProfilePopover, setShowProfilePopover] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const [showChatInterface, setShowChatInterface] = useState(false)
  const [activeChatUser, setActiveChatUser] = useState<{ name: string; avatar?: string } | null>(null)

  useEffect(() => {
    setIsMounted(true)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    // Vérifier si l'utilisateur est connecté
    const checkUserLoggedIn = () => {
      const token = localStorage.getItem("token")
      if (token) {
        setIsLoggedIn(true)
      }
    }

    // Écouter l'événement de connexion
    const handleUserLoggedIn = (event: any) => {
      const userData = event.detail
      setUser({
        id: "1",
        name: userData.name || "Utilisateur",
        username: userData.name?.toLowerCase().replace(/\s/g, "") || "user",
        email: userData.email || "user@example.com",
        avatar: userData.profileImage,
      })
      setIsLoggedIn(true)
      localStorage.setItem("token", "dummy-token")
      localStorage.setItem("userId", "1")
    }

    // Écouter l'événement d'ouverture de chat
    const handleOpenChat = (event: any) => {
      const userData = event.detail
      setActiveChatUser({
        name: userData.name,
        avatar: userData.avatar,
      })
      setShowChatInterface(true)
    }

    window.addEventListener("scroll", handleScroll)
    window.addEventListener("userLoggedIn", handleUserLoggedIn as EventListener)
    window.addEventListener("openChat", handleOpenChat as EventListener)
    checkUserLoggedIn()

    // Fermer les popovers quand on clique ailleurs
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfilePopover(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setShowMessages(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("userLoggedIn", handleUserLoggedIn as EventListener)
      window.removeEventListener("openChat", handleOpenChat as EventListener)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
    setShowMessages(false)
    setShowProfilePopover(false)
  }

  const toggleMessages = () => {
    setShowMessages(!showMessages)
    setShowNotifications(false)
    setShowProfilePopover(false)
  }

  const toggleProfilePopover = () => {
    setShowProfilePopover(!showProfilePopover)
    setShowNotifications(false)
    setShowMessages(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("userId")
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    setShowProfilePopover(false)
    setShowNotifications(false)
    setShowMessages(false)
    setShowChatInterface(false)

    if (window.location.pathname.includes("/profileGuide")) {
      window.location.href = "/"
    } else {
      // Ne pas recharger la page, juste mettre à jour l'état
      // window.location.reload()
    }
  }

  const openChatInterface = (user: { name: string; avatar?: string }) => {
    setActiveChatUser(user)
    setShowChatInterface(true)
    setShowMessages(false)
  }

  const closeChatInterface = () => {
    setShowChatInterface(false)
    setActiveChatUser(null)
  }

  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 w-full bg-transparent py-4">
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
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled ? "bg-[#f8f7f4]/90 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-0 relative z-10">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="relative h-12 w-40">
                  <div className="relative flex items-center">
                    <div>
                      <img
                        src="/placeholder.svg?height=40&width=120&text=Guidini"
                        alt="Guidini Logo"
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-2 md:gap-4 pr-0"
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-sm font-medium tracking-wide text-gray-700 hover:text-teal-600 hover:bg-teal-50"
                  >
                    {language}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-gray-100">
                  <DropdownMenuItem
                    onClick={() => setLanguage("Français")}
                    className="text-gray-700 hover:text-teal-600"
                  >
                    Français
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLanguage("English")}
                    className="text-gray-700 hover:text-teal-600"
                  >
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLanguage("العربية")}
                    className="text-gray-700 hover:text-teal-600"
                  >
                    العربية
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isLoggedIn && (
                <>
                  {/* Icône de notifications */}
                  <div className="relative" ref={notificationsRef}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative rounded-full h-9 w-9 text-gray-700 hover:text-teal-600 hover:bg-teal-50"
                      onClick={toggleNotifications}
                    >
                      <Bell className="h-5 w-5" />
                      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                    </Button>
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 z-50">
                        <NotificationPopover />
                      </div>
                    )}
                  </div>

                  {/* Icône de messages */}
                  <div className="relative" ref={messagesRef}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative rounded-full h-9 w-9 text-gray-700 hover:text-teal-600 hover:bg-teal-50"
                      onClick={toggleMessages}
                    >
                      <Mail className="h-5 w-5" />
                      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                    </Button>
                    {showMessages && (
                      <div className="absolute right-0 mt-2 z-50">
                        <MessagePopover
                          onOpenChat={openChatInterface}
                          onViewAllMessages={() => { setShowMessages(false) }}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {isLoggedIn ? (
                <div className="relative" ref={profileRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleProfilePopover}
                    className="rounded-full h-10 w-10 p-0 overflow-hidden border-2 border-teal-200 hover:border-teal-300"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-teal-500 flex items-center justify-center text-white font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Button>
                  {showProfilePopover && (
                    <div className="absolute right-0 mt-2 z-50">
                      <ProfilePopover user={user} onLogout={handleLogout} />
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openModal}
                  className="border-teal-200 bg-white text-teal-700 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300"
                >
                  Se connecter
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </header>

      <AnimatePresence>{isModalOpen && <Modal isOpen={isModalOpen} closeModal={closeModal} />}</AnimatePresence>

      {/* Interface de chat */}
      {showChatInterface && activeChatUser && <ChatInterface user={activeChatUser} onClose={closeChatInterface} />}
    </>
  )
}
