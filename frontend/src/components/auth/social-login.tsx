"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface SocialLoginProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function SocialLogin({ onSuccess, onError }: SocialLoginProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true)
    try {
      // Mock Google sign-in
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Signing in with Google")
      onSuccess?.()
    } catch (error) {
      console.error("Google sign-in error:", error)
      onError?.(error as Error)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="w-full h-11 font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
        {isGoogleLoading ? "Connexion en cours..." : "Se connecter avec Google"}
      </Button>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg
      className="mr-2 h-4 w-4"
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="google"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 488 512"
    >
      <path
        fill="currentColor"
        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
      ></path>
    </svg>
  )
}
