"use client"

import { useState, useEffect, useRef } from "react"
import { LogOut, ShoppingCart, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

interface UserProps {
  id: string
  name: string
  username: string
  email: string
  avatar?: string
}

interface ProfilePopoverProps {
  user: UserProps
  onLogout: () => void
}

export default function ProfilePopover({ user: initialUser, onLogout }: ProfilePopoverProps) {
  const [currentUser, setCurrentUser] = useState<UserProps>(initialUser)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Écouter l'événement de connexion pour mettre à jour l'avatar
  useEffect(() => {
    const handleUserLoggedIn = (event: any) => {
      const userData = event.detail
      setCurrentUser((prev) => ({
        ...prev,
        name: userData.name || "Utilisateur",
        email: userData.email || "",
        avatar: userData.profileImage || null,
      }))
    }

    window.addEventListener("userLoggedIn", handleUserLoggedIn as EventListener)
    return () => {
      window.removeEventListener("userLoggedIn", handleUserLoggedIn as EventListener)
    }
  }, [])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId")
        const token = localStorage.getItem("token")

        if (userId && token) {
          const response = await fetch(`/api/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const userData = await response.json()
            setCurrentUser(userData)
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
      }
    }

    fetchUserData()
  }, [initialUser])

  return (
    <div className="w-64 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-teal-100">
        <div className="flex items-center gap-3">
          {currentUser.avatar ? (
            <Avatar className="h-10 w-10 border border-gray-200">
              <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-white">
                {currentUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{currentUser.name}</span>
            <span className="text-xs text-gray-500">{currentUser.email}</span>
          </div>
        </div>
      </div>

      <ScrollArea className="max-h-[300px]">
        <div className="p-2">
          <Link href="/profile" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex gap-2 items-center justify-start text-gray-700 hover:text-teal-600 hover:bg-teal-50 transition-colors py-2"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Button>
          </Link>
          <Link href="/cart" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex gap-2 items-center justify-start text-gray-700 hover:text-teal-600 hover:bg-teal-50 transition-colors py-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Panier</span>
            </Button>
          </Link>
          <Link href="/settings" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex gap-2 items-center justify-start text-gray-700 hover:text-teal-600 hover:bg-teal-50 transition-colors py-2"
            >
              <Settings className="h-4 w-4" />
              <span>Paramètres</span>
            </Button>
          </Link>
        </div>
      </ScrollArea>

      <div className="p-2 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex gap-2 items-center justify-start text-red-500 hover:bg-red-50 transition-colors py-2"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </Button>
      </div>
    </div>
  )
}
