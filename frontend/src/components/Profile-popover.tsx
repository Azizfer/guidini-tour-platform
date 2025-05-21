"use client"

import { LogOut, User, Settings, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useLogoutConfirmation } from "./LogoutConfirmation"
import { useState, useEffect } from "react"

interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  username: string
  userType: string
}

interface ProfilePopoverProps {
  user: UserProfile
}

export default function ProfilePopover({ user }: ProfilePopoverProps) {
  // Use the hook to get the open function
  const { open: openLogoutConfirmation } = useLogoutConfirmation()
  // State to track online status and disconnect time
  const [isOnline, setIsOnline] = useState(true)
  const [disconnectTime, setDisconnectTime] = useState<Date | null>(null)
  const [disconnectMinutes, setDisconnectMinutes] = useState(0)

  // Update disconnect time every minute
  useEffect(() => {
    // If user is offline, calculate and update disconnect minutes
    if (!isOnline && disconnectTime) {
      const interval = setInterval(() => {
        const now = new Date()
        const diffMs = now.getTime() - disconnectTime.getTime()
        const diffMinutes = Math.floor(diffMs / 60000)
        setDisconnectMinutes(diffMinutes)
      }, 60000) // Update every minute

      return () => clearInterval(interval)
    }
  }, [isOnline, disconnectTime])

  // Simulate online/offline status (replace with real implementation)
  useEffect(() => {
    // For demo purposes, randomly go offline after some time
    const randomOffline = setTimeout(() => {
      // 30% chance to go offline for demo purposes
      if (Math.random() < 0.3) {
        setIsOnline(false)
        setDisconnectTime(new Date())
      }
    }, 5000)

    return () => clearTimeout(randomOffline)
  }, [])

  const handleLogout = () => {
    // Trigger the logout confirmation dialog
    openLogoutConfirmation(() => {
      // This callback will be executed when the user confirms logout
      // Add your logout logic here (e.g., calling an API, clearing cookies)
      console.log("Logout confirmed")
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-[250px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 absolute right-0"
    >
      {/* User info section */}
      <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
            {user?.avatar && user.avatar.trim() !== "" ? (
              <img
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  console.log("Image failed to load in ProfilePopover:", user?.avatar)

                  // Try to fix the URL if it's a relative path
                  if (user?.avatar && !user.avatar.startsWith("http") && !user.avatar.startsWith("/placeholder")) {
                    const fixedUrl = `http://localhost:5001${user.avatar.startsWith("/") ? "" : "/"}${user.avatar}`
                    console.log("Attempting with fixed URL:", fixedUrl)
                    e.currentTarget.src = fixedUrl
                  } else {
                    // If that doesn't work, use the placeholder
                    e.currentTarget.src = "/placeholder.svg"
                  }
                }}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
            )}
            {/* Online status indicator */}
            <div className="absolute bottom-0 right-0">
              <div className="h-3.5 w-3.5 rounded-full border-2 border-white">
                {isOnline ? (
                  <div className="h-full w-full rounded-full bg-green-500" />
                ) : (
                  <div className="h-full w-full rounded-full bg-gray-400 flex items-center justify-center">
                    <span className="text-[6px] font-bold text-white">{disconnectMinutes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm">{user.name}</h4>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1.5 px-1.5">
        <motion.a
          href="/profile"
          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
          whileHover={{ x: 4, backgroundColor: "rgba(249, 250, 251, 1)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
              <User className="h-3.5 w-3.5 text-gray-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Mon Profil</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        </motion.a>

        <motion.a
          href="/settings"
          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
          whileHover={{ x: 4, backgroundColor: "rgba(249, 250, 251, 1)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
              <Settings className="h-3.5 w-3.5 text-gray-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Paramètres</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        </motion.a>
      </div>

      {/* Logout button */}
      <div className="py-1.5 px-1.5 border-t border-gray-100">
        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 4, backgroundColor: "rgba(254, 242, 242, 1)" }}
          className={cn("w-full flex items-center gap-2.5 p-2 rounded-lg", "hover:bg-red-50 transition-colors")}
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-red-50 to-red-100">
            <LogOut className="h-3.5 w-3.5 text-red-500" />
          </div>
          <span className="text-xs font-medium text-red-600">Déconnexion</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
