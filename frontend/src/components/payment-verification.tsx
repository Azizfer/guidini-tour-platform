"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import notificationService from '@/services/notificationService'

export default function PaymentVerification() {
  const router = useRouter()
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const verifyPayment = async () => {
      // Check if we have payment data in localStorage
      const paymentRef = localStorage.getItem('currentPaymentRef')
      const orderId = localStorage.getItem('currentOrderId')
      
      console.log('Payment verification check:', { paymentRef, orderId })
      
      if (!paymentRef || !orderId) {
        console.log('No payment data found in localStorage')
        return // No payment to verify
      }

      try {
        // Get payment details from localStorage
        const amount = parseFloat(localStorage.getItem('currentPaymentAmount') || '0')
        const tourTitle = localStorage.getItem('currentTourTitle') || 'Tour'
        const tourId = localStorage.getItem('currentTourId') || ''
        const guideId = localStorage.getItem('currentGuideId') || ''
        const userId = localStorage.getItem('currentUserId') || ''
        
        console.log('Payment details retrieved:', { 
          amount, 
          tourTitle, 
          tourId, 
          guideId, 
          userId 
        })

        // Create notifications for both tourist and guide
        if (amount > 0 && tourId && (guideId || userId)) {
          console.log('Creating payment notifications...')
          // Create notifications for both tourist and guide
          const result = await notificationService.createPaymentNotification(
            tourId,
            tourTitle,
            amount,
            guideId,
            userId
          )
          
          console.log('Notification creation result:', result)
          
          // Force notification service to clear cache so new notifications appear immediately
          notificationService.clearCache()
          console.log('Notification cache cleared')
        } else {
          console.warn('Missing required data for notification creation:', { 
            hasAmount: amount > 0, 
            hasTourId: Boolean(tourId), 
            hasUserOrGuide: Boolean(guideId || userId) 
          })
        }

        // Clear payment data from localStorage
        localStorage.removeItem('currentPaymentRef')
        localStorage.removeItem('currentOrderId')
        localStorage.removeItem('currentPaymentAmount')
        localStorage.removeItem('currentTourTitle')
        localStorage.removeItem('currentTourId')
        localStorage.removeItem('currentGuideId')
        localStorage.removeItem('currentUserId')
        
        console.log('Payment data cleared from localStorage')
        setVerified(true)
      } catch (error) {
        console.error('Error verifying payment:', error)
      }
    }

    verifyPayment()
  }, [])

  return null // This component doesn't render anything
}
