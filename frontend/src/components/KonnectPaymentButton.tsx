"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { initializePayment } from "@/services/paymentService";

interface KonnectPaymentButtonProps {
  paymentData: {
    tourId: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    amount: number;
    description: string;
    orderId?: string;
  };
  onSuccess?: () => void;
  onError?: (message: string) => void;
  className?: string;
  buttonText?: string;
}

export function KonnectPaymentButton({
  paymentData,
  onSuccess,
  onError,
  className = "",
  buttonText = "Procéder au paiement"
}: KonnectPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      console.log("Initializing payment with data:", paymentData);
      
      // Generate an orderId if not provided
      const finalPaymentData = {
        ...paymentData,
        orderId: paymentData.orderId || `tour-${paymentData.tourId}-${Date.now()}`
      };
      
      // Initialize payment with Konnect
      const response = await initializePayment(finalPaymentData);
      
      console.log("Payment initialization response:", response);
      
      if (response.success && response.payUrl) {
        // Store payment reference for later use
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "pendingReservation",
            JSON.stringify({
              ...finalPaymentData,
              paymentRef: response.paymentRef
            })
          );
        }
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Redirect to Konnect payment page
        window.location.href = response.payUrl;
      } else {
        // Handle error
        const errorMessage = response.message || "Erreur lors de l'initialisation du paiement";
        console.error("Payment initialization failed:", errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
        
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      
      const errorMessage = error.message || "Erreur lors de l'initialisation du paiement";
      
      if (onError) {
        onError(errorMessage);
      }
      
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className={`bg-teal-600 hover:bg-teal-700 ${className}`}
      type="button"
    >
      {isLoading ? (
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
        buttonText
      )}
    </Button>
  );
}
