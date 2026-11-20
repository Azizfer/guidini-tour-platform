"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowRight, Mail, Lock, Loader2, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/app/LogingContext/AuthContext"
import { Checkbox } from "@/components/ui/checkbox"
import NotificationAlert from "@/components/ui/notification-alert"


function GuidiniLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img src="/logos/guidini-logo.svg" alt="Guidini" className="h-32 w-auto drop-shadow-2xl" />
    </div>
  )
}

// Simple decorative elements to replace 3D objects
function SimpleDecoration({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute ${className}`}>
      <div className="w-4 h-4 rounded-full bg-white/20 backdrop-blur-sm"></div>
    </div>
  )
}

export default function TunisiaLoginPageClean() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning" | "info"
    title: string
    message: string
  } | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const { login, isLoading } = useAuth()

  // Normalize email (trim whitespace and convert to lowercase)
  const normalizeEmail = (email: string) => {
    return email.trim().toLowerCase()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setNotification(null)

    if (!email.trim()) {
      setNotification({
        type: "warning",
        title: "Champ requis",
        message: "Veuillez entrer votre email",
      })
      return
    }

    if (!password) {
      setNotification({
        type: "warning",
        title: "Champ requis",
        message: "Veuillez entrer votre mot de passe",
      })
      return
    }

    try {
      const normalizedEmail = normalizeEmail(email)

      if (normalizedEmail !== email) {
        setEmail(normalizedEmail)
      }

      const result = await login(normalizedEmail, password)

      if (result) {
        router.push("/")
      } else {
        setNotification({
          type: "error",
          title: "Échec de connexion",
          message: "Email ou mot de passe incorrect",
        })
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        title: "Erreur de connexion",
        message: err.message || "Une erreur est survenue lors de la connexion",
      })
    }
  }

  const navigateToRegister = () => {
    router.push("/auth/login/register")
  }

  const navigateToForgotPassword = () => {
    router.push("/auth/forgot-password")
  }

  const navigateToHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Atmospheric effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5"></div>

      {/* Closure (X) button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={navigateToHome}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors text-white"
          aria-label="Fermer la connexion"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Simple decorative elements instead of 3D objects */}
      <SimpleDecoration className="top-20 left-20" />
      <SimpleDecoration className="top-32 right-24" />
      <SimpleDecoration className="bottom-32 left-16" />
      <SimpleDecoration className="bottom-24 right-32" />
      <SimpleDecoration className="top-48 left-1/3" />
      <SimpleDecoration className="bottom-48 right-1/4" />

      <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-6xl flex items-center justify-center">
          {/* Centered Login Form */}
          <div className="w-full max-w-md mx-auto -mt-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full"
            >
              {/* Logo Section */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-10"
                >
                  <GuidiniLogo />
                </motion.div>
                <p className="text-white text-2xl font-semibold mb-2 drop-shadow-lg">CONNEXION</p>
                <p className="text-blue-100 text-lg drop-shadow-md">Découvrez la Tunisie authentique</p>
              </div>

              {/* Form Content */}
              <div className="space-y-6 bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
                <AnimatePresence>
                  {notification && (
                    <motion.div
                      key="notification"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <NotificationAlert
                        type={notification.type}
                        title={notification.title}
                        message={notification.message}
                        onClose={() => setNotification(null)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-medium text-white drop-shadow-md">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre.email@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-14 rounded-2xl border-2 border-white/20 bg-white/95 backdrop-blur-sm focus:border-white focus:ring-2 focus:ring-white/30 focus:ring-opacity-50 transition-all text-gray-800 placeholder:text-gray-500 shadow-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium text-white drop-shadow-md">
                        Mot de passe
                      </Label>
                      <button
                        type="button"
                        onClick={navigateToForgotPassword}
                        className="text-xs font-medium text-white hover:text-blue-100 underline drop-shadow-md transition-colors"
                      >
                        Mot de passe oublié?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-14 rounded-2xl border-2 border-white/20 bg-white/95 backdrop-blur-sm focus:border-white focus:ring-2 focus:ring-white/30 focus:ring-opacity-50 transition-all text-gray-800 placeholder:text-gray-500 shadow-xl"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Cacher le mot de passe" : "Montrer le mot de passe"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="data-[state=checked]:bg-white data-[state=checked]:border-white shadow-md"
                    />
                    <label
                      htmlFor="remember-me"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white drop-shadow-md"
                    >
                      Se souvenir de moi
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-blue-600 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 font-semibold text-lg border-2 border-white/20"
                  >
                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    {isLoading ? "Connexion en cours..." : "Se connecter"}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-white text-sm drop-shadow-md">
                    Vous n'avez pas de compte?{" "}
                    <Link
                      href="/auth/login/register"
                      className="text-white font-medium hover:text-blue-100 inline-flex items-center underline transition-colors drop-shadow-md"
                    >
                      S'inscrire <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
