"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

interface EmailVerificationStepProps {
  email: string
  name: string
  onVerificationSuccess: (verificationToken: string) => void
  onPrev: () => void
}

export default function EmailVerificationStep({
  email,
  name,
  onVerificationSuccess,
  onPrev,
}: EmailVerificationStepProps) {
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      setError("Veuillez entrer un code de vérification valide")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Mock verification - replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onVerificationSuccess("mock_verification_token")
    } catch (error: any) {
      console.error("Erreur de vérification:", error)
      setError("Erreur lors de la vérification du code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    setError("")

    try {
      // Mock resend - replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error: any) {
      console.error("Erreur d'envoi de code:", error)
      setError("Erreur lors de l'envoi du code")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Atmospheric effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5"></div>

      <div className="min-h-screen flex items-start justify-center px-4 pt-20 pb-8 relative z-10">
        <div className="w-full max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full"
          >
            {/* Header Section */}
            <div className="text-center mb-6">
              <p className="text-white text-2xl font-semibold mb-2 drop-shadow-lg">VÉRIFICATION EMAIL</p>
              <p className="text-blue-100 text-base drop-shadow-md">Nous avons envoyé un code à votre email</p>
            </div>

            {/* Form Content */}
            <div className="space-y-5 backdrop-blur-sm">
              <div className="space-y-4">
                <p className="text-white/80 text-center drop-shadow-sm text-sm">
                  Veuillez entrer le code de vérification à 6 chiffres que nous avons envoyé à{" "}
                  <span className="font-medium text-white">{email}</span>
                </p>

                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Code de vérification"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full h-12 rounded-xl bg-white/95 backdrop-blur-sm border-2 border-white/20 focus:border-white focus:ring-2 focus:ring-white/30 text-gray-800 placeholder:text-gray-500 text-center text-lg tracking-widest shadow-lg transition-all duration-300"
                    maxLength={6}
                  />
                  {error && <p className="text-sm text-red-200">{error}</p>}
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="text-sm text-white/70 hover:text-white flex items-center transition-colors drop-shadow-sm"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Renvoyer le code"
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-3 space-y-3">
                <Button
                  onClick={handleVerifyCode}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-blue-600 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    "Vérifier"
                  )}
                </Button>

                <Button
                  onClick={onPrev}
                  variant="outline"
                  className="w-full h-11 bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all duration-300"
                >
                  Retour
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
