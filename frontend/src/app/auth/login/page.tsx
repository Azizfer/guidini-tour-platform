"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowRight, Mail, Lock, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/app/LogingContext/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { SocialLogin } from "@/components/auth/social-login"
import NotificationAlert from "@/components/ui/notification-alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")  
  const [notification, setNotification] = useState<{type: "success" | "error" | "warning" | "info", title: string, message: string} | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const { login, isLoading } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setNotification(null)

    if (!email.trim()) {
      setNotification({
        type: "warning",
        title: "Champ requis",
        message: "Veuillez entrer votre email"
      })
      return
    }

    if (!password) {
      setNotification({
        type: "warning",
        title: "Champ requis",
        message: "Veuillez entrer votre mot de passe"
      })
      return
    }

    try {
      // Stocker le résultat de la connexion
      const result = await login(email, password)
      
      // Ne rediriger que si la connexion a réussi (result n'est pas null)
      if (result) {
        router.push("/")
      } else {
        // Si login renvoie null, c'est une erreur
        setNotification({
          type: "error",
          title: "Échec de connexion",
          message: "Email ou mot de passe incorrect"
        })
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        title: "Erreur de connexion",
        message: err.message || "Une erreur est survenue lors de la connexion"
      })
    }
  }

  const navigateToRegister = () => {
    router.push("/auth/login/register")
  }

  const navigateToForgotPassword = () => {
    router.push("/auth/forgot-password")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="w-full h-48 relative mb-6 flex items-center justify-center">
          <img
            src="/placeholder.svg?height=150&width=150&text=Guidini"
            alt="Guidini Logo"
            className="h-32 object-contain"
          />
        </div>

        <Card className="w-full border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-teal-700">Connexion</CardTitle>
            <CardDescription className="text-gray-600">Accédez à votre compte Guidini</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
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

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 rounded-lg border-gray-200 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mot de passe
                  </Label>
                  <button
                    type="button"
                    onClick={navigateToForgotPassword}
                    className="text-xs font-medium text-teal-600 hover:text-teal-700"
                  >
                    Mot de passe oublié?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 rounded-lg border-gray-200 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Cacher le mot de passe" : "Montrer le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                >
                  Se souvenir de moi
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            <SocialLogin
              onSuccess={() => router.push("/")}
              onError={(error: Error) => setError(error.message || "Erreur de connexion sociale")}
            />

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Vous n'avez pas de compte?{" "}
                <Link 
                  href="/auth/login/register"
                  className="text-teal-600 font-medium hover:text-teal-700 inline-flex items-center"
                >
                  S'inscrire <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
