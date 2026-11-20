"use client"

import { useEffect } from 'react'

// This component now only cleans up localStorage after payment
// without showing any UI
export default function PaymentStatusChecker() {
  useEffect(() => {
    // Check if we're returning from a payment
    const pendingPayment = localStorage.getItem('pendingPayment')
    
    if (pendingPayment === 'true') {
      // Clear all payment-related data from localStorage
      localStorage.removeItem('pendingPayment')
      localStorage.removeItem('currentPaymentRef')
      localStorage.removeItem('currentOrderId')
      localStorage.removeItem('paymentAmount')
      localStorage.removeItem('paymentTourName')
      localStorage.removeItem('paymentDate')
      localStorage.removeItem('paymentParticipants')
      
      console.log('Payment data cleared from localStorage')
    }
  }, [])

  // No UI is rendered
  return null
}
