"use client"

import { LogOut, User, Settings, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { openLogoutConfirmation } from "./LogoutConfirmation"

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
  const handleLogout = () => {
    // Directly trigger the logout confirmation dialog
    openLogoutConfirmation()
  }

  return (
    <div className="w-[280px] bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 absolute right-0">
      {/* User info section */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-full overflow-hidden border border-gray-200">
            {user.avatar ? (
              <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-1 ring-white" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{user.name}</h4>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="p-2">
        <motion.a
          href="/profile"
          className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors"
          whileHover={{ x: 4 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Mon Profil</span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </motion.a>

        <motion.a
          href="/settings"
          className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors"
          whileHover={{ x: 4 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
              <Settings className="h-4 w-4 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Paramètres</span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </motion.a>
      </div>

      {/* Logout button */}
      <div className="p-2 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className={cn("w-full flex items-center gap-3 p-2 rounded-md", "hover:bg-red-50 transition-colors")}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50">
            <LogOut className="h-4 w-4 text-red-500" />
          </div>
          <span className="text-sm font-medium text-red-600">Déconnexion</span>
        </button>
      </div>
    </div>
  )
}
