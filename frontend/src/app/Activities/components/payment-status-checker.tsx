"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import PaymentSuccess from './payment-success'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export default function PaymentStatusChecker() {
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if we're returning from a payment
    const pendingPayment = localStorage.getItem('pendingPayment')
    
    if (pendingPayment === 'true') {
      // Clear the pending payment flag
      localStorage.removeItem('pendingPayment')
      
      // Show success dialog
      setShowSuccess(true)
      
      // Clear payment references after showing success
      setTimeout(() => {
        localStorage.removeItem('currentPaymentRef')
        localStorage.removeItem('currentOrderId')
        localStorage.removeItem('paymentAmount')
        localStorage.removeItem('paymentTourName')
        localStorage.removeItem('paymentDate')
        localStorage.removeItem('paymentParticipants')
      }, 5000) // Clear after 5 seconds to ensure dialog has time to display
    }
  }, [])

  const handleClose = () => {
    setShowSuccess(false)
  }

  // Get payment details from localStorage
  const getPaymentDetails = () => {
    try {
      const amount = localStorage.getItem('paymentAmount') ? 
        parseFloat(localStorage.getItem('paymentAmount') || '0') : 0
      const tourName = localStorage.getItem('paymentTourName') || 'Activité'
      const date = localStorage.getItem('paymentDate') || undefined
      const participants = localStorage.getItem('paymentParticipants') ? 
        parseInt(localStorage.getItem('paymentParticipants') || '1') : 1
      const orderId = localStorage.getItem('currentOrderId') || undefined
      
      return { amount, tourName, date, participants, orderId }
    } catch (error) {
      console.error('Error parsing payment details:', error)
      return { 
        amount: 0, 
        tourName: 'Activité', 
        participants: 1 
      }
    }
  }
  
  const paymentDetails = getPaymentDetails()

  return (
    <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-xl">
        <VisuallyHidden>
          <DialogTitle>Payment Success</DialogTitle>
        </VisuallyHidden>
        <PaymentSuccess 
          amount={paymentDetails.amount}
          tourName={paymentDetails.tourName}
          date={paymentDetails.date}
          participants={paymentDetails.participants}
          orderId={paymentDetails.orderId}
        />
      </DialogContent>
    </Dialog>
  )
}
