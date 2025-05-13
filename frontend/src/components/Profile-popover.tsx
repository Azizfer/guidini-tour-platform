"use client"

import { LogOut, ShoppingCart, User, CreditCard, Heart, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { useAuth } from "@/app/LogingContext/AuthContext"
import { motion } from "framer-motion"

interface UserProps {
  id: string
  name: string
  email: string
  avatar?: string
  username: string
  userType: string
}

export default function ProfilePopover({ user: initialUser }: { user: UserProps }) {
  const { logout } = useAuth()

  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="w-72 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100"
    >
      {/* Header with user info and banner */}
      <div className="relative">
        <div className="h-20 bg-gradient-to-r from-teal-400 to-teal-500" />
        <div className="px-4 pb-4 pt-2 flex items-end -mt-10">
          <Avatar className="h-16 w-16 border-4 border-white shadow-md">
            <AvatarImage src={initialUser.avatar || "/placeholder.svg"} alt={initialUser.name} />
            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white text-lg">
              {initialUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3 pb-1">
            <h3 className="font-semibold text-gray-800">{initialUser.name}</h3>
            <p className="text-xs text-gray-500">@{initialUser.username}</p>
          </div>
        </div>
      </div>

      {/* User type badge */}
      <div className="px-4 pb-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
          {initialUser.userType}
        </span>
      </div>

      {/* Menu items */}
      <ScrollArea className="max-h-[220px]">
        <div className="p-2">
          <Link href="/profile" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg mb-1 font-normal"
            >
              <User className="h-4 w-4 mr-2" />
              Mon profil
            </Button>
          </Link>

          <Link href="/favorites" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg mb-1 font-normal"
            >
              <Heart className="h-4 w-4 mr-2" />
              Favoris
            </Button>
          </Link>

          <Link href="/trips" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg mb-1 font-normal"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Mes voyages
            </Button>
          </Link>

          <Link href="/cart" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg mb-1 font-normal"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Panier
            </Button>
          </Link>

          <Link href="/payments" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg mb-1 font-normal"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Paiements
            </Button>
          </Link>
        </div>
      </ScrollArea>

      {/* Logout button */}
      <div className="p-2 border-t border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg font-normal"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </motion.div>
  )
}
