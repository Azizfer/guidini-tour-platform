"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, X, Users, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { countryCodes } from "../data/countryCodes"
import { StepOne, StepTwo, StepThree, SuccessMessage } from "./ReservationSteps"
import { initializePayment } from "@/services/paymentService"
import { useAuth } from "@/app/LogingContext/AuthContext"

interface ReservationPopoverProps {
  activity: {
    id: number | string
    title: string
    image: string
    price: number
    duration: string
    maxParticipants: number
    dates?: string[]
  }
  isOpen?: boolean
  closeModal?: () => void
  onReservationComplete?: (reservationData: any) => void
}

export default function ReservationPopover({ activity, isOpen: externalIsOpen, closeModal, onReservationComplete }: ReservationPopoverProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(externalIsOpen || false)
  
  // Sync with external isOpen state
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen)
    }
  }, [externalIsOpen])

  const [step, setStep] = useState(1)
  const [date, setDate] = useState<Date | undefined>(
    activity.dates && activity.dates.length > 0 ? new Date(activity.dates[0]) : undefined,
  )
  const [participants, setParticipants] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    countryCode: "+216", // Default to Tunisia
  })
  const [phoneError, setPhoneError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Find the selected country info
  const selectedCountry = countryCodes.find((country) => country.code === formData.countryCode) || countryCodes[0]

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1)
        setDate(activity.dates && activity.dates.length > 0 ? new Date(activity.dates[0]) : undefined)
        setParticipants(1)
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          countryCode: "+216",
        })
        setPhoneError("")
        setIsSubmitting(false)
        setIsComplete(false)
        setShowCloseConfirmation(false)
      }, 300)
    }
  }, [isOpen, activity.dates])

  // Validate phone number when it changes or country changes
  useEffect(() => {
    if (formData.phoneNumber) {
      // Remove spaces and other non-digit characters for validation
      const digitsOnly = formData.phoneNumber.replace(/\D/g, "")

      if (digitsOnly.length !== selectedCountry.length) {
        setPhoneError(`Le numéro doit contenir ${selectedCountry.length} chiffres (format: ${selectedCountry.format})`)
      } else {
        setPhoneError("")
      }
    } else {
      setPhoneError("")
    }
  }, [formData.phoneNumber, formData.countryCode, selectedCountry])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "phoneNumber") {
      // Allow only digits and spaces for phone numbers
      const sanitizedValue = value.replace(/[^\d\s]/g, "")
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleNextStep = () => {
    // Validate before proceeding to next step
    if (step === 2) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
        return // Don't proceed if required fields are empty
      }

      if (phoneError) {
        return // Don't proceed if phone number is invalid
      }
    }

    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setPaymentError(null)
    
    // Du00e9boguer les valeurs de l'activitu00e9
    console.log('Activity details:', {
      id: activity.id,
      title: activity.title,
      price: activity.price
    })

    try {
      // Format data for Konnekt payment
      const paymentData = {
        tourId: String(activity.id || ''),
        userId: user?.id || user?._id || 'dev-user-id', // Get user ID from auth context
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        email: formData.email || '',
        phoneNumber: formData.countryCode && formData.phoneNumber ? 
          `${formData.countryCode}${formData.phoneNumber.replace(/\s/g, "")}` : '',
        amount: (activity.price || 0) * (participants || 1),
        description: `Ru00e9servation pour ${activity.title || 'activitu00e9'}`,
        orderId: `tour-${activity.id || 'unknown'}-${Date.now()}`
      }

      console.log('Initializing payment with data:', {
        ...paymentData,
        amount: paymentData.amount,
        tourId: paymentData.tourId,
        userId: paymentData.userId
      })

      // Initialize payment with Konnekt
      const response = await initializePayment(paymentData)
      
      console.log('Payment initialization response:', response)
      
      if (response.success && response.payUrl) {
        // Store reservation data and payment reference in localStorage for retrieval after payment
        const reservationData = {
          ...paymentData,
          date,
          participants,
          paymentRef: response.paymentRef || ''
        }
        
        localStorage.setItem('pendingReservation', JSON.stringify(reservationData))
        
        // Notify parent component about the reservation
        if (onReservationComplete) {
          onReservationComplete(reservationData)
        }
        
        console.log('Payment initialized successfully, redirecting to:', response.payUrl)
        
        // Redirect to Konnekt payment page
        window.location.href = response.payUrl
      } else {
        setPaymentError(response.message || 'Une erreur est survenue lors de l\'initialisation du paiement. Veuillez réessayer.')
        setIsSubmitting(false)
      }
      
    } catch (error: any) {
      console.error('Error processing payment:', error)
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code outside 2xx range
        console.error('Error response:', error.response.data)
        setPaymentError(error.response.data?.message || 'Une erreur est survenue lors de l\'initialisation du paiement. Veuillez réessayer.')
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request)
        setPaymentError('Aucune réponse du serveur. Vérifiez votre connexion internet et réessayez.')
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message)
        setPaymentError('Une erreur est survenue lors de l\'initialisation du paiement. Veuillez réessayer.')
      }
      
      setIsSubmitting(false)
    }
  }

  // Handle confirmation dialog
  const handleCloseConfirmation = (confirm: boolean) => {
    setShowCloseConfirmation(false)
    if (confirm) {
      setIsOpen(false)
    }
  }

  // Handle close attempt
  const handleCloseAttempt = () => {
    if (step > 1 && !isComplete) {
      setShowCloseConfirmation(true)
    } else {
      setIsOpen(false)
    }
  }

  // Handle open change
  const handleOpenChange = (open: boolean) => {
    // If trying to close and we're in the middle of the process (step > 1)
    if (!open && step > 1 && !isComplete) {
      setShowCloseConfirmation(true)
      return // Don't close yet
    }

    // Otherwise just set the open state
    setIsOpen(open)
    
    // Call external closeModal if provided
    if (!open && closeModal) {
      closeModal()
    }
  }

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseAttempt()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [isOpen, step, isComplete])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={handleCloseAttempt}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Modal */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md mx-auto my-8 bg-white rounded-2xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleCloseAttempt}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
                aria-label="Fermer"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>

              <AnimatePresence mode="wait">
                {isComplete ? (
                  <SuccessMessage />
                ) : (
                  <motion.div
                    key={`step-${step}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Header with gradient and activity info */}
                    <div className="relative h-28 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/90 to-blue-500/90 z-10"></div>
                      <div
                        className="absolute inset-0 bg-center bg-cover z-0 opacity-40"
                        style={{
                          backgroundImage: `url(${activity.image || "/placeholder.svg"})`,
                        }}
                      ></div>
                      <div className="absolute inset-x-0 bottom-0 z-20 p-4 text-white">
                        <h3 className="text-lg font-bold drop-shadow-md">{activity.title}</h3>
                        <div className="flex items-center mt-1 text-xs">
                          <div className="flex items-center mr-4">
                            <Users className="w-3.5 h-3.5 mr-1" />
                            <span>Max {activity.maxParticipants}</span>
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                            <span>{activity.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-medium">
                            {step}
                          </div>
                          <span className="ml-2 font-medium text-sm">
                            {step === 1 ? "Détails" : step === 2 ? "Informations" : "Paiement"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500">Étape {step} sur 3</span>
                        </div>
                      </div>

                      {step === 1 && (
                        <StepOne
                          activity={activity}
                          date={date}
                          setDate={setDate}
                          participants={participants}
                          setParticipants={setParticipants}
                        />
                      )}

                      {step === 2 && (
                        <StepTwo
                          formData={formData}
                          handleInputChange={handleInputChange}
                          setFormData={setFormData}
                          phoneError={phoneError}
                          countryCodes={countryCodes}
                        />
                      )}

                      {step === 3 && (
                        <StepThree activity={activity} date={date} participants={participants} formData={formData} />
                      )}

                      {paymentError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4">
                          {paymentError}
                        </div>
                      )}
                      
                      <div className="pt-5 flex justify-between">
                        {step > 1 ? (
                          <Button variant="outline" onClick={handlePrevStep} size="sm">
                            Retour
                          </Button>
                        ) : (
                          <div></div>
                        )}

                        {step < 3 ? (
                          <Button onClick={handleNextStep} className="bg-teal-600 hover:bg-teal-700" size="sm">
                            Suivant
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={handleSubmit}
                            className="bg-teal-600 hover:bg-teal-700 min-w-[120px]"
                            disabled={isSubmitting}
                            size="sm"
                          >
                            {isSubmitting ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Traitement...
                              </>
                            ) : (
                              "Réserver"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Confirmation Dialog */}
          {showCloseConfirmation && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
              onClick={() => handleCloseConfirmation(false)}
              style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-2">Quitter le processus de réservation ?</h3>
                <p className="text-gray-600 mb-4">
                  Êtes-vous sûr de vouloir quitter ? Vos informations de réservation seront perdues.
                </p>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => handleCloseConfirmation(false)}>
                    Annuler
                  </Button>
                  <Button variant="destructive" onClick={() => handleCloseConfirmation(true)}>
                    Quitter
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}
