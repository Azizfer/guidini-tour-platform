"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowLeft, Loader2, CheckCircle, X, Check } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const passwordRequirements = [
  { label: "8+ caractères", test: (v: string) => v.length >= 8 },
  { label: "Chiffre", test: (v: string) => /\d/.test(v) },
  { label: "Minuscule", test: (v: string) => /[a-z]/.test(v) },
  { label: "Majuscule", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Caractère spécial (!@#$)", test: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
]

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  // Calculate password strength
  const getStrength = (value: string): number => {
    if (!value) return 0
    return passwordRequirements.filter((req) => req.test(value)).length * 20
  }

  const strength = getStrength(password)
  const strengthLabel = strength <= 40 ? "Faible" : strength <= 80 ? "Moyen" : "Fort"

  // Get color based on strength
  const getStrengthColor = () => {
    if (strength <= 20) return "bg-red-500"
    if (strength <= 40) return "bg-orange-500"
    if (strength <= 60) return "bg-yellow-500"
    if (strength <= 80) return "bg-blue-500"
    return "bg-green-500"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!password) {
      setError("Veuillez entrer un mot de passe")
      return
    }

    if (strength < 60) {
      setError("Veuillez utiliser un mot de passe plus fort")
      return
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    setIsLoading(true)

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Resetting password with token:", token)
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const navigateToLogin = () => {
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="w-full h-32 relative mb-6 flex items-center justify-center">
          <img
            src="/placeholder.svg?height=100&width=100&text=Guidini"
            alt="Guidini Logo"
            className="h-24 object-contain"
          />
        </div>

        <Card className="w-full border shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center mb-2">
              <button
                onClick={navigateToLogin}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-2"
                aria-label="Retour"
              >
                <ArrowLeft className="h-4 w-4 text-gray-600" />
              </button>
              <CardTitle className="text-2xl font-bold text-teal-700">Réinitialiser le mot de passe</CardTitle>
            </div>
            <CardDescription className="text-gray-600">Créez un nouveau mot de passe pour votre compte</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-4 py-4"
              >
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Mot de passe réinitialisé</h3>
                <p className="text-gray-600 max-w-xs">
                  Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre
                  nouveau mot de passe.
                </p>
                <Button
                  onClick={navigateToLogin}
                  className="mt-4 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium"
                >
                  Se connecter
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Nouveau mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 h-11 rounded-lg border-gray-200 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
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

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-3 space-y-2">
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getStrengthColor()} transition-all duration-500 ease-out`}
                          style={{ width: `${strength}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Force: <span className="font-medium">{strengthLabel}</span>
                      </p>

                      {/* Password Requirements */}
                      <div className="space-y-1.5 text-xs text-gray-500 pt-1">
                        {passwordRequirements.map(({ label, test }) => (
                          <div key={label} className="flex items-center gap-2">
                            {test(password) ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            <span>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                    Confirmer le mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10 h-11 rounded-lg border-gray-200 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Cacher le mot de passe" : "Montrer le mot de passe"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && confirmPassword && (
                    <div className="flex items-center gap-2 mt-1">
                      {password === confirmPassword ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-xs text-green-600">Les mots de passe correspondent</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-xs text-red-600">Les mots de passe ne correspondent pas</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
