"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { initializePayment } from "@/services/paymentService"
import notificationService from "@/services/notificationService"
import { ArrowRight, ArrowLeft, Users, CreditCard, Loader2, User, Phone, Check } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/LogingContext/AuthContext"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ParticipantCounter from "./participant-counter"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface PaymentCardProps {
  activity?: {
    title: string
    price: number
    date?: string
    maxParticipants?: number
    id: string | number
    guideId?: string
  }
  onCheckout?: (participants: number) => void
  currency?: string
  onClose?: () => void
}

export default function PaymentCard({
  activity = {
    title: "Activité",
    price: 0,
    id: "default",
  },
  onCheckout,
  currency = "TND",
  onClose,
}: PaymentCardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1) // Step 1: Select participants, Step 2: Enter details, Step 3: Success
  const [participants, setParticipants] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const subtotal = (activity?.price || 0) * participants
  const tax = 0 // No tax in this example
  const total = subtotal

  const [formData, setFormData] = useState({
    fullName: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    countryCode: "+216", // Default to Tunisia country code
  })

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handleParticipantChange = (count: number) => {
    setParticipants(count)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleContinue = () => {
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handlePayment = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Validate form data
      if (!formData.fullName) {
        setError("Veuillez remplir votre nom et prénom")
        return
      }

      if (!formData.phoneNumber) {
        setError("Veuillez fournir un numéro de téléphone valide")
        return
      }


      // Initialize payment with Konnect
      const paymentData = {
        amount: total,
        description: `Réservation pour ${activity.title} - ${participants} personne(s)`,
        fullName: formData.fullName,
        email: user?.email || "",
        phoneNumber: `${formData.countryCode}${formData.phoneNumber.replace(/\s/g, '')}`,
        tourId: activity.id.toString(),
        userId: user?.id || user?._id,
        orderId: `tour-${activity.id}-${Date.now()}`,
        participants: participants,
        date: activity.date,
      }

      console.log("Initializing payment with data:", paymentData)

      // Utiliser la fonction initializePayment pour rediriger vers Konnect
      const response = await initializePayment(paymentData)
      
      if (response.success) {
        // Store payment reference in localStorage for later verification
        localStorage.setItem('currentPaymentRef', response.paymentRef)
        localStorage.setItem('currentOrderId', response.orderId)
        localStorage.setItem('currentPaymentAmount', total.toString())
        localStorage.setItem('currentTourTitle', activity.title)
        localStorage.setItem('currentTourId', activity.id.toString())
        localStorage.setItem('currentGuideId', activity.guideId || '')
        localStorage.setItem('currentUserId', user?.id || user?._id || '')
        
        console.log('Payment initialized successfully, redirecting to:', response.payUrl)
        
        // Redirect to Konnect payment page in the same window
        // Store the redirect URL for after payment completion
        localStorage.setItem('redirectAfterPayment', '/Activities')
        window.location.href = response.payUrl
      } else {
        setIsLoading(false)
        setError(response.message || "Une erreur est survenue lors de l'initialisation du paiement. Veuillez réessayer.")
      }
    } catch (error: any) {
      console.error("Erreur de paiement:", error)

      // Handle different types of errors
      if (error.response) {
        console.error("Error response:", error.response.data)
        setError(
          error.response.data?.message ||
            "Une erreur est survenue lors de l'initialisation du paiement. Veuillez réessayer.",
        )
      } else if (error.request) {
        console.error("No response received:", error.request)
        setError("Aucune réponse du serveur. Vérifiez votre connexion internet et réessayez.")
      } else {
        console.error("Error message:", error.message)
        setError("Une erreur est survenue lors de l'initialisation du paiement. Veuillez réessayer.")
      }
      setIsLoading(false)
    }
  }

  // If no activity is provided, show a placeholder state
  if (!activity) {
    return (
      <div className="w-full max-w-[400px] rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 flex items-center justify-center h-[300px]">
        <p className="text-zinc-500 dark:text-zinc-400">Aucune activité sélectionnée</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "w-full max-w-[400px]",
        "bg-white dark:bg-zinc-900",
        "shadow-sm transition-all duration-300",
        "overflow-hidden rounded-xl border border-zinc-200/50 dark:border-zinc-800/50",
        "relative"
      )}
    >
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-5">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Réserver cette activité</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Activité</p>

              <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Participants</span>
                  </div>
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">
                    {participants} {participants > 1 ? "personnes" : "personne"}
                  </span>
                </div>

                <div className="mt-3">
                  <ParticipantCounter
                    compact={true}
                    onChange={handleParticipantChange}
                    maxCount={activity.maxParticipants || 10}
                  />
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Prix par personne</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{formatPrice(activity.price)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Sous-total ({participants} {participants > 1 ? "personnes" : "personne"})
                  </span>
                  <span className="text-zinc-900 dark:text-zinc-100">{formatPrice(subtotal)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mt-4 flex justify-between items-center pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Total</span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{formatPrice(total)}</span>
              </div>

              {/* Continue Button */}
              <Button
                onClick={handleContinue}
                className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300 flex items-center justify-center gap-2 rounded-md"
              >
                Réserver maintenant
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <>
            <button
              onClick={handleBack}
              className="absolute left-4 top-4 z-10"
              aria-label="Retour"
            >
              <ArrowLeft className="h-4 w-4 text-gray-500" />
            </button>
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-5 pt-8">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-2">Vos informations</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{activity.title}</p>

              <div className="mt-5 grid gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm">
                    Nom et prénom
                  </Label>
                  <div className="relative">
                    <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                    <div className="h-9 pl-8 flex items-center border rounded-md bg-gray-50 text-gray-600">
                      {formData.fullName || "Non connecté"}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phoneNumber" className="text-sm">
                    Numéro de téléphone
                  </Label>
                  <div className="flex">
                    <div className="relative w-24">
                      <select
                        id="countryCode"
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleInputChange}
                        className="h-9 rounded-l-md border border-r-0 border-input bg-background pl-3 pr-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-full"
                      >
                        <option value="+216">+216</option>
                        <option value="+33">+33</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+49">+49</option>
                      </select>
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="22 123 456"
                        className="pl-8 h-9 rounded-l-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 p-2 rounded-md text-sm">{error}</div>
              )}

              {/* Payment Button */}
              <Button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300 flex items-center justify-center gap-2 rounded-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    Procéder au paiement
                    <CreditCard className="w-4 h-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mt-3">
                En cliquant sur "Procéder au paiement", vous serez redirigé vers la plateforme sécurisée Konnect.
              </p>
            </div>
          </motion.div>
          </>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="p-6 flex flex-col items-center"
          >
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
                scale: {
                  type: "spring",
                  damping: 15,
                  stiffness: 200,
                },
              }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 blur-xl bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.2,
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                />
                <div className="relative z-10 h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="space-y-4 text-center w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Activité</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{activity.title}</span>
                </div>

                {activity.date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Date</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {new Date(activity.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Participants</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {participants} {participants > 1 ? "personnes" : "personne"}
                  </span>
                </div>

                <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Montant payé</span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <Link href="/Activities">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md mt-4">
                    Terminer
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
