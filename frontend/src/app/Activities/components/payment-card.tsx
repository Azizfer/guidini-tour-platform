"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { initializePayment } from "@/services/paymentService"
import notificationService from "@/services/notificationService"
import { ArrowRight, ArrowLeft, Users, CreditCard, Loader2, User, Phone, Check, X, AlertCircle } from "lucide-react"
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
    date?: string | Date
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
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [participants, setParticipants] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const subtotal = (activity?.price || 0) * participants
  const tax = 0
  const total = subtotal

  const [formData, setFormData] = useState({
    fullName: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    countryCode: "+216",
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

      if (!formData.fullName) {
        setError("Veuillez remplir votre nom et prénom")
        return
      }

      if (!formData.phoneNumber) {
        setError("Veuillez fournir un numéro de téléphone valide")
        return
      }

      const paymentData = {
        amount: total,
        description: `Réservation pour ${activity.title} - ${participants} personne(s)`,
        fullName: formData.fullName,
        email: user?.email || "",
        phoneNumber: `${formData.countryCode}${formData.phoneNumber.replace(/\s/g, '')}`,
        tourId: String(activity.id) || '',
        userId: user?.id || '',
        orderId: `order-${Date.now()}`,
        participants: participants,
        date: activity.date,
      }

      console.log("Initializing payment with data:", paymentData)

      const response = await initializePayment(paymentData)
      
      if (response.success) {
        localStorage.setItem('currentPaymentRef', response.paymentRef)
        localStorage.setItem('currentOrderId', response.orderId)
        localStorage.setItem('currentPaymentAmount', total.toString())
        localStorage.setItem('currentTourTitle', activity.title)
        localStorage.setItem('currentTourId', String(activity.id))
        localStorage.setItem('currentParticipants', participants.toString())
        localStorage.setItem('currentGuideId', activity.guideId || '')
        localStorage.setItem('currentDate', activity.date ? new Date(activity.date).toISOString() : '')

        // If response.success is true, response.payUrl is guaranteed to be available
        // by the logic in initializePayment (success: !!data.payUrl && !!data.paymentRef).
        window.location.href = response.payUrl;
        
      } else {
        setError(response.message || "Une erreur est survenue lors de l'initialisation du paiement. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Payment error:", err)
      setError("Une erreur s'est produite. Veuillez réessayer plus tard.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!activity) {
    return (
      <div className="w-full rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg p-4 flex items-center justify-center h-[250px]">
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Aucune activité sélectionnée</p>
      </div>
    )
  }

  return (
    <div className="relative w-full bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Réserver cette activité</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-1">{activity.title}</p>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Participants</span>
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Max: {activity.maxParticipants || 10}
                  </span>
                </div>

                <div className="flex justify-center my-2">
                  <ParticipantCounter
                    compact={true}
                    onChange={handleParticipantChange}
                    maxCount={activity.maxParticipants || 10}
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400">Prix par personne</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatPrice(activity.price)}</span>
                </div>

                <div className="flex justify-between items-center pb-1.5 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Sous-total ({participants} {participants > 1 ? "pers." : "pers."})
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Total</span>
                <span className="font-bold text-blue-600 text-sm">{formatPrice(total)}</span>
              </div>

              <Button
                onClick={handleContinue}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-1 rounded-md py-2 text-xs font-medium"
              >
                Continuer
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        ) : step === 2 ? (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="p-4">
              <button
                onClick={handleBack}
                className="absolute left-3 top-3 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm"
                aria-label="Retour"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-gray-500" />
              </button>

              <div className="mb-4 pl-8">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Vos informations</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-1">{activity.title}</p>
              </div>

              <div className="grid gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="fullName" className="text-xs font-medium">
                    Nom et prénom
                  </Label>
                  <div className="relative">
                    <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-zinc-400 h-3 w-3" />
                    <div className="h-7 pl-7 flex items-center border rounded-md bg-gray-50 text-gray-600 text-xs">
                      {formData.fullName || "Non connecté"}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phoneNumber" className="text-xs font-medium">
                    Numéro de téléphone
                  </Label>
                  <div className="flex">
                    <div className="relative w-16">
                      <select
                        id="countryCode"
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleInputChange}
                        className="h-7 w-full pl-2 pr-1 border rounded-l-md bg-gray-50 text-gray-600 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="+216">+216</option>
                        <option value="+33">+33</option>
                        <option value="+1">+1</option>
                      </select>
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 text-zinc-400 h-3 w-3" />
                      <Input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        placeholder="XX XXX XXX"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="h-7 pl-7 text-xs rounded-l-none border-l-0 bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-2 bg-gray-50 dark:bg-zinc-800 rounded-lg text-xs">
                <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1.5">Récapitulatif</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Activité</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1 max-w-[150px] text-right">{activity.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Participants</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{participants}</span>
                  </div>
                  <div className="flex justify-between pt-1 mt-1 border-t border-gray-200 dark:border-zinc-700">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">Total</span>
                    <span className="font-bold text-blue-600">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-2 p-1.5 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs flex items-start">
                  <span className="shrink-0 mt-0.5 mr-1"><AlertCircle className="h-3 w-3" /></span>
                  <span>{error}</span>
                </div>
              )}

              <Button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-1 rounded-md py-2 text-xs font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payer {formatPrice(total)}</span>
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mt-2">
                En cliquant sur "Payer", vous serez redirigé vers la plateforme sécurisée Konnect.
              </p>
            </div>
          </motion.div>
        ) : step === 3 ? (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="p-4 flex flex-col items-center w-full"
          >
            <motion.div
              className="flex justify-center mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
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
            </motion.div>

            <motion.div
              className="space-y-6 text-center w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">Réservation confirmée !</h3>
              
              <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg p-3 border border-emerald-100 dark:border-emerald-800/20">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">Activité</span>
                    <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 max-w-[180px] text-right">{activity.title}</span>
                  </div>

                  {activity.date && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">Date</span>
                      <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                        {new Date(activity.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">Participants</span>
                    <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                      {participants} {participants > 1 ? "pers." : "pers."}
                    </span>
                  </div>

                  <div className="pt-2 mt-1 border-t border-emerald-200 dark:border-emerald-800/30">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Montant payé</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                Un email de confirmation vous a été envoyé.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <Link href="/Activities">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md mt-3 py-2 text-xs font-medium">
                    Terminer
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}