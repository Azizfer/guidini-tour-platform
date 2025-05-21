"use client"

import { useState, useEffect, useCallback } from "react"
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

// Custom event names
const OPEN_LOGOUT_EVENT = "openLogoutConfirmation"

// Create a type for the callback function
type LogoutCallback = () => void;

// Create a global variable to store the callback
// This avoids TypeScript errors with window properties
let logoutCallbackFn: LogoutCallback | null = null;

// Create a custom hook for logout confirmation
export function useLogoutConfirmation() {
  // Function to open the logout confirmation dialog with an optional callback
  const open = useCallback((callback?: LogoutCallback) => {
    // Store the callback if provided
    if (callback) {
      logoutCallbackFn = callback;
    }
    window.dispatchEvent(new CustomEvent(OPEN_LOGOUT_EVENT))
  }, [])

  return { open }
}

// For backward compatibility
export const openLogoutConfirmation = () => {
  window.dispatchEvent(new CustomEvent(OPEN_LOGOUT_EVENT))
}

export default function GlobalLogoutConfirmation() {
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Listen for the custom event to open the logout confirmation
    const handleOpenLogoutConfirmation = () => {
      setIsOpen(true)
    }

    window.addEventListener(OPEN_LOGOUT_EVENT, handleOpenLogoutConfirmation)

    return () => {
      window.removeEventListener(OPEN_LOGOUT_EVENT, handleOpenLogoutConfirmation)
    }
  }, [])

  const handleLogout = () => {
    // Execute the auth logout
    logout()
    
    // Execute the callback if it exists
    if (logoutCallbackFn) {
      logoutCallbackFn()
      // Reset the callback after execution
      logoutCallbackFn = null
    }
    
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
