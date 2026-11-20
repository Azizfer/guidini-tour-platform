"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, Loader2, CheckCircle, KeyRound } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import OtpInput from "@/components/ui/otp-input"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [step, setStep] = useState<"email" | "verification" | "reset" | "success">("email")
  const [otp, setOtp] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Veuillez entrer votre email")
      return
    }

    setIsLoading(true)

    try {
      // Send request to API to send verification code
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue')
      }

      // Move to verification step
      setStep("verification")
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (code: string) => {
    setOtp(code)
    setError("")
    setIsLoading(true)

    try {
      // Send request to API to verify OTP
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Code de vérification invalide')
      }

      // Store reset token and move to reset password step
      setResetToken(data.resetToken)
      setStep("reset")
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!newPassword) {
      setError("Veuillez entrer un nouveau mot de passe")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    setIsLoading(true)

    try {
      // Send request to API to reset password
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resetToken, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue')
      }

      // Move to success step
      setIsSuccess(true)
      setStep("success")
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
              <CardTitle className="text-2xl font-bold text-teal-700">Mot de passe oublié</CardTitle>
            </div>
            <CardDescription className="text-gray-600">
              {step === "email" && "Entrez votre email pour recevoir un code de vérification"}
              {step === "verification" && "Entrez le code de vérification reçu par email"}
              {step === "reset" && "Créez un nouveau mot de passe"}
            </CardDescription>
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
                  Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </p>
                <Button
                  onClick={navigateToLogin}
                  className="mt-4 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium"
                >
                  Retour à la connexion
                </Button>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                {step === "email" && (
                  <motion.form 
                    key="email-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmitEmail} 
                    className="space-y-4"
                  >
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

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isLoading ? "Envoi en cours..." : "Envoyer le code de vérification"}
                    </Button>
                  </motion.form>
                )}

                {step === "verification" && (
                  <motion.div
                    key="verification-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600 mb-1">
                        Nous avons envoyé un code de vérification à
                      </p>
                      <p className="font-medium text-gray-800">{email}</p>
                    </div>

                    <div className="flex justify-center">
                      <OtpInput onComplete={handleVerifyOTP} />
                    </div>

                    {isLoading && (
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                      </div>
                    )}

                    <div className="text-center text-sm">
                      <button 
                        type="button" 
                        onClick={() => setStep("email")}
                        className="text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Changer d'email
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "reset" && (
                  <motion.form
                    key="reset-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleResetPassword}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                        Nouveau mot de passe
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-10 h-11 rounded-lg border-gray-200 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                        Confirmer le mot de passe
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 h-11 rounded-lg border-gray-200 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
