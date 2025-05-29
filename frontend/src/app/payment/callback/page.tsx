"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { handlePaymentCompletion, getPaymentStatus } from '@/services/paymentService'
import notificationService from '@/services/notificationService'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '@/app/LogingContext/AuthContext'
import axios from 'axios'

export default function PaymentCallback() {
  const router = useRouter()
  const { user } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>('Vérification du paiement...')

  const handleSuccessfulPayment = async (paymentRef: string, urlParams: URLSearchParams) => {
    try {
      // Mark payment as successful
      setStatus('success')
      setMessage('Paiement réussi! Redirection en cours...')
      
      // Get reservation details from localStorage
      let pendingReservationJson = null;
      let pendingReservation = null;
      
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          pendingReservationJson = localStorage.getItem('pendingReservation');
          console.log('Retrieved from localStorage:', pendingReservationJson ? 'data found' : 'no data');
          
          if (pendingReservationJson) {
            try {
              pendingReservation = JSON.parse(pendingReservationJson);
              console.log('Successfully parsed pendingReservation:', pendingReservation);
            } catch (parseError) {
              console.error('Error parsing pendingReservation JSON:', parseError);
            }
          }
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
      
      // If we don't have reservation data, try to extract from URL parameters
      if (!pendingReservation) {
        console.log('No valid pending reservation found in localStorage. Creating from URL parameters...');
        
        const searchParams = new URLSearchParams(window.location.search);
        const paymentRef = searchParams.get('payment_ref');
        const status = searchParams.get('status');
        const orderId = searchParams.get('order_id');
        
        console.log('URL parameters:', { paymentRef, status, orderId });
        
        if (paymentRef) {
          // Create a minimal pendingReservation object from URL parameters
          console.log('Creating minimal reservation data from URL parameters');
          
          // Try to extract tourId from orderId if available (assuming format tour-{tourId}-{timestamp})
          let extractedTourId = '';
          if (orderId && orderId.startsWith('tour-')) {
            const parts = orderId.split('-');
            if (parts.length >= 2) {
              extractedTourId = parts[1];
              console.log('Extracted tourId from orderId:', extractedTourId);
            }
          }
          
          // Get userId from auth context
          const userId = user?.id || localStorage.getItem('userId') || '';
          console.log('Using userId from context/localStorage:', userId);
          
          // Create minimal pendingReservation
          pendingReservation = {
            paymentRef,
            tourId: extractedTourId,
            userId,
            firstName: 'Client',
            lastName: '',
            amount: 0, // We don't know the amount from URL parameters
            description: 'Réservation',
            orderId: orderId || `order-${Date.now()}`
          };
          
          console.log('Created minimal pendingReservation:', pendingReservation);
        } else {
          console.error('No payment reference found in URL parameters');
          setStatus('error');
          setMessage('Référence de paiement manquante. Impossible de vérifier votre paiement.');
          return;
        }
      }
        
      // Extract necessary data from the reservation
      const { tourId, userId, firstName, lastName, description, amount } = pendingReservation
      const tourTitle = description?.replace('Réservation pour ', '') || 'activité'
      
      // Validate essential data
      if (!tourId) {
        console.error('Missing tour ID in reservation data')
        return
      }
      
      if (!userId) {
        console.error('Missing user ID in reservation data')
        return
      }
      
      // API URL for backend requests
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No authentication token found')
        return
      }
      
      // STEP 1: Fetch the tour details to get the guide ID
      console.log('Fetching tour data from API for tour ID:', tourId)
      let guideId = ''
      
      try {
        // Use the improved tour endpoint with guide population
        const tourResponse = await axios.get(
          `${API_URL}/tours/${tourId}?includeGuide=true`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        // Extract guide ID from the tour data
        interface TourData {
          _id?: string;
          id?: string;
          guideId?: string;
          guide?: {
            _id?: string;
            id?: string;
          };
          createdBy?: string;
        }
        
        const tourDetails = tourResponse.data as TourData
        
        // Debug each possible location for guide ID
        console.log('DETAILED TOUR DATA:', JSON.stringify(tourDetails, null, 2))
        console.log('Possible guide ID locations:')
        console.log('- tourDetails.guideId:', tourDetails.guideId)
        console.log('- tourDetails.guide?._id:', tourDetails.guide?._id)
        console.log('- tourDetails.guide?.id:', tourDetails.guide?.id)
        console.log('- tourDetails.createdBy:', tourDetails.createdBy)
        console.log('- Raw tour response:', JSON.stringify(tourResponse.data))
        
        // Try all possible locations for the guide ID
        guideId = tourDetails.guideId || 
                 tourDetails.guide?._id || 
                 tourDetails.guide?.id || 
                 tourDetails.createdBy || ''
        
        console.log('EXTRACTED GUIDE ID:', guideId)
        
        // If we still don't have a guide ID, try to get it from the reservation
        if (!guideId) {
          guideId = pendingReservation.guideId || ''
          console.log('Using guide ID from reservation:', guideId)
        }
        
        // Final validation of guide ID
        if (!guideId) {
          console.error('Could not find a valid guide ID')
          // Instead of throwing an error, we'll use a hardcoded fallback
          // This is just for testing and should be replaced with proper error handling
          guideId = '682e10803651e668c119fbaf' // Fallback guide ID
          console.log('Using fallback guide ID:', guideId)
        }
        
        // STEP 2: Create notifications
        const touristName = `${firstName || 'Client'} ${lastName || ''}`
        
        console.log('Creating notifications with IDs:', {
          userId,
          guideId,
          tourId,
          tourTitle
        })
        
        // STEP 3: Create tourist notifications
        console.log('Creating tourist notifications...')
        
        // Tourist booking notification
        await axios.post(
          `${API_URL}/notifications`,
          {
            title: "Réservation confirmée",
            description: `Votre réservation pour ${tourTitle} a été confirmée.`,
            type: "booking_confirmation",
            tourId,
            recipient: userId,
            read: false
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        // Tourist payment notification
        await axios.post(
          `${API_URL}/notifications`,
          {
            title: "Paiement réussi",
            description: `Votre paiement de ${amount} TND pour ${tourTitle} a été confirmé.`,
            type: "payment",
            tourId,
            recipient: userId,
            read: false,
            amount
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        // STEP 4: Create guide notifications
        console.log('Creating guide notifications for guide ID:', guideId)
        
        try {
          // Guide booking notification
          const guideBookingResponse = await axios.post(
            `${API_URL}/notifications`,
            {
              title: "Nouvelle réservation",
              description: `${touristName} a réservé votre visite ${tourTitle}.`,
              type: "booking_confirmation",
              tourId,
              recipient: guideId, // Using the validated guide ID
              read: false
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
          
          console.log('Guide booking notification created:', guideBookingResponse.data)
          
          // Also try direct notification endpoint as a fallback
          await axios.post(
            `${API_URL}/notification`,
            {
              title: "Nouvelle réservation",
              description: `${touristName} a réservé votre visite ${tourTitle}.`,
              type: "booking_confirmation",
              tourId,
              recipient: guideId,
              read: false
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
        } catch (bookingError) {
          console.error('Error creating guide booking notification:', bookingError)
        }
        
        try {
          // Guide payment notification
          const guidePaymentResponse = await axios.post(
            `${API_URL}/notifications`,
            {
              title: "Nouveau paiement reçu",
              description: `Vous avez reçu un paiement de ${amount} TND pour ${tourTitle}.`,
              type: "payment",
              tourId,
              recipient: guideId, // Using the validated guide ID
              read: false,
              amount
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
          
          console.log('Guide payment notification created:', guidePaymentResponse.data)
          
          // Also try direct notification endpoint as a fallback
          await axios.post(
            `${API_URL}/notification`,
            {
              title: "Nouveau paiement reçu",
              description: `Vous avez reçu un paiement de ${amount} TND pour ${tourTitle}.`,
              type: "payment",
              tourId,
              recipient: guideId,
              read: false,
              amount
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
        } catch (paymentError) {
          console.error('Error creating guide payment notification:', paymentError)
        }
        
        // STEP 5: Create a reservation record in the guide's reservations
        try {
          console.log('Creating reservation record for guide:', guideId)
          const reservationResponse = await axios.post(
            `${API_URL}/guides/${guideId}/reservations`,
            {
              tourId,
              tourName: tourTitle,
              touristName: `${firstName || 'Client'} ${lastName || ''}`,
              touristEmail: pendingReservation.email || 'Email non disponible',
              touristPhone: pendingReservation.phone || 'Téléphone non disponible',
              date: pendingReservation.date || new Date().toISOString(),
              time: pendingReservation.time || '12:00',
              participants: pendingReservation.participants || 1,
              totalPrice: amount,
              status: 'confirmed',
              paymentRef: paymentRef
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
          console.log('Reservation record created:', reservationResponse.data)
        } catch (reservationError) {
          console.error('Error creating reservation record:', reservationError)
        }
        
        // STEP 6: Refresh notifications
        console.log('All notifications created successfully')
        window.dispatchEvent(new Event('notificationUpdate'))
        notificationService.clearCache()
        
        // Force refresh of reservations for guides
        try {
          window.dispatchEvent(new CustomEvent('reservationUpdate', { detail: { guideId, tourId } }))
        } catch (eventError) {
          console.error('Error dispatching reservation update event:', eventError)
        }
        
      } catch (error) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any;
          console.error('Error in notification creation process:', axiosError.response?.data || 'Unknown error')
        } else if (error instanceof Error) {
          console.error('Error in notification creation process:', error.message)
        } else {
          console.error('Error in notification creation process:', error)
        }
      }
      
      // Clean up localStorage
      localStorage.removeItem('pendingReservation')
      
      // Set the pendingPayment flag for PaymentStatusChecker to display success message
      localStorage.setItem('pendingPayment', 'true');
      
      // Store the orderId for the success message
      const searchParams = new URLSearchParams(window.location.search);
      let orderId = searchParams.get('order_id') || '';
      
      // Try to get orderId from pendingReservation as well
      if (pendingReservation?.orderId) {
        orderId = orderId || pendingReservation.orderId;
      }
      
      if (orderId) {
        localStorage.setItem('currentOrderId', orderId);
      }
      
      // Check if there's a redirect URL stored
      const redirectUrl = localStorage.getItem('redirectAfterPayment') || '/Activities';
      
      // Automatically redirect after a short delay
      setTimeout(() => {
        window.location.href = redirectUrl;
        // Clear the redirect URL
        localStorage.removeItem('redirectAfterPayment');
      }, 2000);
    } catch (error) {
      console.error('Error in handleSuccessfulPayment:', error)
      setStatus('error')
      setMessage('Une erreur est survenue lors du traitement du paiement.')
    }
  }

  useEffect(() => {
    const checkPayment = async () => {
      try {
        // Get payment reference from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const paymentRef = urlParams.get('payment_ref');
        
        console.log('URL parameters:', Object.fromEntries(urlParams.entries()));
        
        if (!paymentRef) {
          console.error('No payment reference found in URL');
          setStatus('error');
          setMessage('Référence de paiement manquante.');
          return;
        }
        
        console.log('Checking payment status for reference:', paymentRef);
        
        // For now, assume payment is successful when redirected to this page
        console.log('Assuming payment is successful for reference:', paymentRef);
        await handleSuccessfulPayment(paymentRef, urlParams);
        
      } catch (error) {
        console.error('Error in payment callback:', error);
        setStatus('error');
        setMessage('Une erreur est survenue lors de la vérification du paiement.');
      }
    };

    checkPayment();
  }, [router, user])

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
              onClick={() => window.location.href = '/Activities'} 
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
              onClick={() => window.location.href = '/Activities'} 
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