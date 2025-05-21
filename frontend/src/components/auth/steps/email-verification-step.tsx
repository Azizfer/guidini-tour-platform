"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import HandWrittenTitle from "@/components/ui/hand-written-title"
import { toast } from "@/components/ui/use-toast"
import authService from "@/services/authService"

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
      // Utiliser le service d'authentification pour vérifier le code
      const response = await authService.verifyRegistration(email, verificationCode)
      
      // Si la vérification est réussie, on passe à l'étape suivante
      onVerificationSuccess(response.verificationToken)
      
      toast({
        title: "Vérification réussie",
        description: "Votre email a été vérifié avec succès.",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Erreur de vérification:", error)
      setError(
        error.response?.data?.error ||
        error.message ||
        "Erreur lors de la vérification du code"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    setError("")

    try {
      // Utiliser le service d'authentification pour renvoyer le code
      await authService.preRegister(email, name)

      toast({
        title: "Code envoyé",
        description: "Un nouveau code de vérification a été envoyé à votre adresse email.",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Erreur d'envoi de code:", error)
      setError(
        error.response?.data?.error ||
        error.message ||
        "Erreur lors de l'envoi du code"
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex flex-col">
      <HandWrittenTitle
        title="Vérification de votre email"
        subtitle="Nous avons envoyé un code à votre adresse email"
        size="sm"
        className="mb-6"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6 w-full"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Veuillez entrer le code de vérification à 6 chiffres que nous avons envoyé à{" "}
            <span className="font-medium text-teal-600">{email}</span>
          </p>

          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Code de vérification"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="text-center text-lg py-6 tracking-widest"
              maxLength={6}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleResendCode}
              disabled={isResending}
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center"
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

        <div className="pt-4 space-y-3">
          <Button
            onClick={handleVerifyCode}
            disabled={isLoading}
            className="w-full py-6 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              "Vérifier"
            )}
          </Button>

          <Button
            onClick={onPrev}
            variant="outline"
            className="w-full"
          >
            Retour
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
