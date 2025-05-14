"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { handlePaymentCompletion } from '@/services/paymentService'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'

export default function PaymentCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>('Vérification du paiement...')

  useEffect(() => {
    const checkPayment = async () => {
      try {
        // Get payment reference from URL query parameters
        const urlParams = new URLSearchParams(window.location.search)
        const paymentRef = urlParams.get('payment_ref')

        if (!paymentRef) {
          setStatus('error')
          setMessage('Référence de paiement manquante.')
          return
        }

        // Get pending reservation data from localStorage
        const pendingReservationJson = localStorage.getItem('pendingReservation')
        if (!pendingReservationJson) {
          setStatus('error')
          setMessage('Données de réservation introuvables.')
          return
        }

        // Handle payment completion
        const success = await handlePaymentCompletion(
          paymentRef,
          () => {
            setStatus('success')
            setMessage('Paiement réussi! Votre réservation est confirmée.')
            // Clear the pending reservation data
            localStorage.removeItem('pendingReservation')
            
            // Set the pendingPayment flag for PaymentStatusChecker to display success message
            localStorage.setItem('pendingPayment', 'true')
            
            // Store the orderId for the success message
            const orderId = urlParams.get('order_id')
            if (orderId) {
              localStorage.setItem('currentOrderId', orderId)
            }
            
            // Check if there's a redirect URL stored
            const redirectUrl = localStorage.getItem('redirectAfterPayment') || '/Activities'
            
            // Automatically redirect after a short delay
            setTimeout(() => {
              router.push(redirectUrl)
              // Clear the redirect URL
              localStorage.removeItem('redirectAfterPayment')
            }, 2000) // 2 second delay to show success message
          },
          () => {
            setStatus('error')
            setMessage('Le paiement a échoué ou a été annulé.')
          }
        )

        // If payment was successful, you could also save the reservation to your database here
        // This would typically be handled by your backend via the Konnekt webhook
      } catch (error) {
        console.error('Error checking payment status:', error)
        setStatus('error')
        setMessage('Une erreur est survenue lors de la vérification du paiement.')
      }
    }

    checkPayment()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Traitement en cours</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Paiement réussi!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button 
              onClick={() => router.push('/Activities')} 
              className="bg-teal-600 hover:bg-teal-700"
            >
              Retour aux activités
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Échec du paiement</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button 
              onClick={() => router.push('/Activities')} 
              className="bg-teal-600 hover:bg-teal-700"
            >
              Retour aux activités
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
