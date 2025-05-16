"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/LogingContext/AuthContext"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Create a custom event type for logout confirmation
export const openLogoutConfirmation = () => {
  window.dispatchEvent(new CustomEvent("openLogoutConfirmation"))
}

export default function GlobalLogoutConfirmation() {
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Listen for the custom event to open the logout confirmation
    const handleOpenLogoutConfirmation = () => {
      setIsOpen(true)
    }

    window.addEventListener("openLogoutConfirmation", handleOpenLogoutConfirmation)

    return () => {
      window.removeEventListener("openLogoutConfirmation", handleOpenLogoutConfirmation)
    }
  }, [])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="z-[200]">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmation de déconnexion</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir vous déconnecter de votre compte?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600"
          >
            Déconnexion
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
