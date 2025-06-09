"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Calendar, LogOut, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLogoutConfirmation } from "./LogoutConfirmation"
import { useAuth } from "@/app/LogingContext/AuthContext"
import Link from "next/link"

interface UserProfile {
  id?: string
  _id?: string
  name?: string
  email?: string
  avatar?: string
  profileImage?: string
  username?: string
  userType?: string
  role?: "tourist" | "guide"
}

interface ProfilePopoverProps {
  user: UserProfile
}

export default function ProfilePopover({ user: initialUser }: ProfilePopoverProps) {
  // Use the authentication context
  const auth = useAuth()
  // Use the hook to get the open function
  const { open: openLogoutConfirmation } = useLogoutConfirmation()

  // State for user data
  const [userData, setUserData] = useState<UserProfile>(initialUser)

  // Fetch user data from context or localStorage on mount
  useEffect(() => {
    const fetchUserData = () => {
      // Try to get user from auth context first
      if (auth?.user) {
        console.log("Using user data from auth context:", auth.user)
        setUserData({
          id: auth.user.id || auth.user._id,
          _id: auth.user._id || auth.user.id,
          name: auth.user.name || auth.user.username || "Utilisateur",
          email: auth.user.email || "",
          avatar: auth.user.profileImage || "/placeholder.svg",
          role: auth.user.userType === "guide" ? "guide" : "tourist",
        })
        return
      }

      // If not in context, try localStorage
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          console.log("Using user data from localStorage:", parsedUser)
          setUserData({
            id: parsedUser.id || parsedUser._id,
            _id: parsedUser._id || parsedUser.id,
            name: parsedUser.name || parsedUser.username || "Utilisateur",
            email: parsedUser.email || "",
            avatar: parsedUser.profileImage || "/placeholder.svg",
            role: parsedUser.userType === "guide" ? "guide" : "tourist",
          })
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error)
      }
    }

    fetchUserData()
  }, [auth?.user])

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const updatedUser = event.detail
      console.log("Profile updated event received:", updatedUser)
      setUserData((prevData) => ({
        ...prevData,
        name: updatedUser.name || prevData.name,
        email: updatedUser.email || prevData.email,
        avatar: updatedUser.profileImage || prevData.avatar,
        role: updatedUser.userType === "guide" ? "guide" : "tourist",
      }))
    }

    // Add event listener for profile updates
    window.addEventListener("userProfileUpdated", handleProfileUpdate as EventListener)

    return () => {
      window.removeEventListener("userProfileUpdated", handleProfileUpdate as EventListener)
    }
  }, [])

  const handleLogout = () => {
    // Trigger the logout confirmation dialog
    openLogoutConfirmation(() => {
      // This callback will be executed when the user confirms logout
      localStorage.removeItem("token")

      // Dispatch an event to notify the header that the user has logged out
      window.dispatchEvent(new Event("userLoggedOut"))

      console.log("Logout confirmed")
      // Redirect to homepage
      window.location.href = "/"
    })
  }

  const menuItems = [
    {
      icon: User,
      label: "Mon Profil",
      href: userData.id ? `/Profile/${userData.id}` : "/login", // Fallback to login if ID is not available
      color: "blue",
    },
    {
      icon: Calendar,
      label: "Réservations",
      href: "/reservations",
      color: "green",
    },
    ...(userData.role === "guide"
      ? [
          {
            icon: LayoutDashboard,
            label: "Tableau de bord",
            href: "/profileGuide",
            color: "purple",
          },
        ]
      : []),
  ]

  return (
    <motion.div
      className="w-56 overflow-hidden rounded-2xl shadow-xl border border-gray-100 bg-white"
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Header section */}
      <div className="p-1.5 bg-gradient-to-br from-blue-50 to-amber-50 border-b border-gray-100">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-white shadow-md">
              {userData?.avatar && userData.avatar.trim() !== "" ? (
                <img
                  src={userData.avatar || "/placeholder.svg"}
                  alt={userData.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // @ts-ignore
                    e.target.src = "/placeholder.svg"
                  }}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-blue-600 to-amber-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-900 text-sm truncate">{userData.name}</h3>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-0.5">
        {menuItems.map((item, index) => (
          <Link key={item.href} href={item.href} className="block">
            <motion.div
              className="px-3 py-1 hover:bg-gray-50 transition-colors cursor-pointer group"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    item.color === "blue" && "bg-blue-100 group-hover:bg-blue-200",
                    item.color === "green" && "bg-green-100 group-hover:bg-green-200",
                    item.color === "purple" && "bg-purple-100 group-hover:bg-purple-200",
                    item.color === "gray" && "bg-gray-100 group-hover:bg-gray-200",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-3.5 w-3.5",
                      item.color === "blue" && "text-blue-600",
                      item.color === "green" && "text-green-600",
                      item.color === "purple" && "text-purple-600",
                      item.color === "gray" && "text-gray-600",
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-xs group-hover:text-gray-700">{item.label}</h4>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Logout button */}
      <div className="border-t border-gray-100 pt-0.5 pb-0.5 px-1">
        <motion.button
          onClick={handleLogout}
          className="w-full px-3 py-1 text-left hover:bg-red-50 transition-colors flex items-center gap-2 rounded-lg group"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: menuItems.length * 0.05 }}
        >
          <div className="bg-red-100 group-hover:bg-red-200 p-1.5 rounded-lg transition-colors">
            <LogOut className="h-3.5 w-3.5 text-red-600" />
          </div>
          <span className="text-xs font-medium text-red-600 group-hover:text-red-700">Déconnexion</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
