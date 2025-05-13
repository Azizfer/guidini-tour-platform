"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Import from the correct path where AuthContext is located
import { useAuth } from "@/app/LogingContext/AuthContext";
import { initializePayment } from "@/services/paymentService";
import { Loader2 } from "lucide-react";

interface PaymentButtonProps {
  tourId: string;
  tourName: string;
  price: number;
  className?: string;
}

export default function PaymentButton({ tourId, tourName, price, className }: PaymentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const { user } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate form data
      if (!formData.firstName || !formData.lastName) {
        setError("Veuillez remplir votre nom et prénom");
        return;
      }

      if (!formData.email) {
        setError("Veuillez fournir une adresse email valide");
        return;
      }

      if (!formData.phoneNumber) {
        setError("Veuillez fournir un numéro de téléphone valide");
        return;
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
        orderId: `tour-${tourId}-${Date.now()}`
      };

      console.log('Initializing payment with data:', {
        ...paymentData,
        amount: paymentData.amount,
        tourId: paymentData.tourId,
        userId: paymentData.userId
      });

      const response = await initializePayment(paymentData);
      
      if (response.success) {
        // Store payment reference in localStorage for later verification
        localStorage.setItem('currentPaymentRef', response.paymentRef);
        localStorage.setItem('currentOrderId', response.orderId);
        
        console.log('Payment initialized successfully, redirecting to:', response.payUrl);
        
        // Redirect to Konnect payment page
        window.location.href = response.payUrl;
      } else {
        setError(response.message || "Une erreur est survenue lors de l'initialisation du paiement. Veuillez réessayer.");
      }
    } catch (error: any) {
      console.error("Erreur de paiement:", error);
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.data);
        setError(error.response.data?.message || "Une erreur est survenue lors de l'initialisation du paiement. Veuillez réessayer.");
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        setError("Aucune réponse du serveur. Vérifiez votre connexion internet et réessayez.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        setError("Une erreur est survenue lors de l'initialisation du paiement. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        className={className}
      >
        Réserver
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Réservation pour {tourName}</DialogTitle>
            <DialogDescription>
              Veuillez remplir vos informations pour procéder au paiement via Konnect.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Nom"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="votre@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="22 123 456"
              />
            </div>
            <div className="space-y-2">
              <Label>Montant à payer</Label>
              <div className="text-lg font-semibold">{price} TND</div>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handlePayment} disabled={isLoading}>
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
        </DialogContent>
      </Dialog>
    </>
  );
}
