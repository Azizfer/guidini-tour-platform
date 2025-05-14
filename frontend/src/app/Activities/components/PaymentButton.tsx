"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/app/LogingContext/AuthContext"
import { initializePayment } from "@/services/paymentService"
import { Loader2, CreditCard, User, Mail, Phone } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface PaymentButtonProps {
  tourId: string
  tourName: string
  price: number
  className?: string
}

export default function PaymentButton({ tourId, tourName, price, className }: PaymentButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  })
  const { user } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Validate form data
      if (!formData.firstName || !formData.lastName) {
        setError("Veuillez remplir votre nom et prénom")
        return
      }

      if (!formData.email) {
        setError("Veuillez fournir une adresse email valide")
        return
      }

      if (!formData.phoneNumber) {
        setError("Veuillez fournir un numéro de téléphone valide")
        return
      }

      // Initialize payment with Konnect
      const paymentData = {
        amount: price,
        description: `Réservation pour ${tourName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        tourId: tourId,
        userId: user?.id || user?._id,
        orderId: `tour-${tourId}-${Date.now()}`,
      }

      console.log("Initializing payment with data:", {
        ...paymentData,
        amount: paymentData.amount,
        tourId: paymentData.tourId,
        userId: paymentData.userId,
      })

      const response = await initializePayment(paymentData)

      if (response.success) {
        // Store payment reference in localStorage for later verification
        localStorage.setItem("currentPaymentRef", response.paymentRef)
        localStorage.setItem("currentOrderId", response.orderId)

        console.log("Payment initialized successfully, redirecting to:", response.payUrl)

        // Redirect to Konnect payment page
        window.location.href = response.payUrl
      } else {
        setError(
          response.message || "Une erreur est survenue lors de l'initialisation du paiement. Veuillez réessayer.",
        )
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`bg-emerald-600 hover:bg-emerald-700 text-white transition-colors duration-300 ${className}`}
      >
        <CreditCard className="w-4 h-4 mr-2" />
        Réserver
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-xl">
          <VisuallyHidden>
            <DialogTitle>Payment</DialogTitle>
          </VisuallyHidden>
          <div className="bg-emerald-600 text-white p-6">
            <h2 className="text-xl font-bold">Réservation</h2>
            <p className="text-emerald-100 mt-1 text-sm">{tourName}</p>
            <div className="mt-4 text-3xl font-bold">{price} TND</div>
          </div>

          <div className="p-6">
            <DialogDescription className="mb-6">
              Veuillez remplir vos informations pour procéder au paiement.
            </DialogDescription>

            <div className="grid gap-5 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    Prénom
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Prénom"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Nom
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Nom"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="votre@email.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium">
                  Numéro de téléphone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="22 123 456"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md my-4 text-sm">{error}</div>
            )}

            <DialogFooter className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                Annuler
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  "Procéder au paiement"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
