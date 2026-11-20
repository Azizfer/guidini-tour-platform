import axios from 'axios';

// Get the backend URL from environment variables or use a default
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
const API_URL = `${BACKEND_URL}/api/payments`;

// Konnect sandbox API URL
const KONNECT_API_URL = 'https://api.sandbox.konnect.network';
// Konnect checkout URL
const KONNECT_CHECKOUT_URL = 'https://konnect.network/pay';

// Types for payment
export interface PaymentInitialization {
  amount: number;
  description: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  orderId?: string;
  tourId?: string;
  userId?: string;
}

export interface PaymentResponse {
  success: boolean;
  payUrl: string;
  paymentRef: string;
  orderId: string;
  message?: string; // Error message if success is false
}

export interface PaymentStatus {
  success: boolean;
  payment: {
    id: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    amountDue: number;
    reachedAmount: number;
    amount: number;
    token: string;
    convertedAmount: number;
    exchangeRate: number;
    expirationDate: string;
    shortId: string;
    link: string;
    orderId: string;
    type: string;
    details: string;
    acceptedPaymentMethods: string[];
    transactions: any[];
  };
}

// Safe localStorage access
const getToken = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
};

// Initialize a payment with Konnect
export const initializePayment = async (paymentData: PaymentInitialization): Promise<PaymentResponse> => {
  try {
    // Log the request details for debugging
    console.log('Sending payment request to:', `${API_URL}/initialize`);
    console.log('Payment data:', JSON.stringify(paymentData, null, 2));
    
    // Make the API call to initialize payment
    const response = await axios.post(`${API_URL}/initialize`, paymentData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    // Log the complete response for debugging
    console.log('Complete payment response:', JSON.stringify(response.data, null, 2));
    
    // Validate response structure
    const data = response.data as any;
    if (!data) {
      console.error('Empty response received');
      return {
        success: false,
        payUrl: '',
        paymentRef: '',
        orderId: paymentData.orderId || '',
        message: 'Réponse vide du serveur'
      };
    }
    
    // Check if we have a payment reference
    if (!data.paymentRef) {
      console.error('No payment reference in response:', data);
      return {
        success: false,
        payUrl: '',
        paymentRef: '',
        orderId: paymentData.orderId || '',
        message: 'Référence de paiement manquante'
      };
    }
    
    // If we have a payment reference but no payUrl, construct one using the checkout URL
    if (!data.payUrl && data.paymentRef) {
      data.payUrl = `${KONNECT_CHECKOUT_URL}?paymentRef=${data.paymentRef}`;
      console.log('Constructed payment URL:', data.payUrl);
      data.success = true;
    }
    // If we have a payUrl but it's not a complete URL, fix it
    else if (data.payUrl && !data.payUrl.startsWith('http')) {
      if (data.payUrl.startsWith('/')) {
        data.payUrl = `${KONNECT_API_URL}${data.payUrl}`;
      } else {
        data.payUrl = `${KONNECT_API_URL}/${data.payUrl}`;
      }
      console.log('Fixed payment URL:', data.payUrl);
    }
    
    // Ensure success flag is set
    if (data.payUrl && data.paymentRef) {
      data.success = true;
    }
    
    // Log the final payment URL
    console.log('Final payment URL:', data.payUrl);
    
    return {
      success: !!data.payUrl && !!data.paymentRef,
      payUrl: data.payUrl || '',
      paymentRef: data.paymentRef || '',
      orderId: data.orderId || paymentData.orderId || '',
      message: data.message
    };
  } catch (error: any) {
    // Create a default error response
    const errorResponse: PaymentResponse = {
      success: false,
      payUrl: '',
      paymentRef: '',
      orderId: paymentData.orderId || '',
      message: 'Une erreur est survenue lors de l\'initialisation du paiement'
    };
    
    if (error.response) {
      // Server responded with an error status
      const status = error.response.status;
      const data = error.response.data;
      
      errorResponse.message = data?.message || 
        `Erreur ${status}: ${data?.error || 'Problème lors de l\'initialisation du paiement'}`;
      
      // Log error details for debugging (only in development)
      if (process.env.NODE_ENV !== 'production') {
        console.log('API error response:', {
          status,
          data: error.response.data
        });
      }
    } else if (error.request) {
      // Request was made but no response received
      errorResponse.message = 'Aucune réponse du serveur. Vérifiez votre connexion internet.';
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('No response received from server');
      }
    } else {
      // Error in setting up the request
      errorResponse.message = error.message || 'Erreur lors de la configuration de la requête';
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Request setup error:', error.message);
      }
    }
    
    return errorResponse;
  }
};

// Check the status of a payment
export const getPaymentStatus = async (paymentRef: string): Promise<PaymentStatus> => {
  try {
    const response = await axios.get(`${API_URL}/status/${paymentRef}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    return response.data as PaymentStatus;
  } catch (error: any) {
    console.log('Error checking payment status:', error);
    
    // Instead of throwing an error, return a default payment status object
    // This allows the UI to handle the error more gracefully
    return {
      success: false,
      payment: {
        id: '',
        status: 'failed',
        amountDue: 0,
        reachedAmount: 0,
        amount: 0,
        token: '',
        convertedAmount: 0,
        exchangeRate: 0,
        expirationDate: '',
        shortId: '',
        link: '',
        orderId: paymentRef,
        type: '',
        details: error.response?.data?.message || 'Erreur lors de la vérification du statut du paiement',
        acceptedPaymentMethods: [],
        transactions: []
      }
    };
  }
};

// Handle payment completion (called when user returns from payment page)
export const handlePaymentCompletion = async (
  paymentRef: string, 
  onSuccess: () => void, 
  onFailure: (errorMessage?: string) => void
): Promise<boolean> => {
  try {
    const paymentStatus = await getPaymentStatus(paymentRef);
    
    if (paymentStatus.payment.status === 'completed') {
      onSuccess();
      return true;
    } else {
      onFailure(`Le paiement n'est pas complété (statut: ${paymentStatus.payment.status})`);
      return false;
    }
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Error handling payment completion:', error);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    onFailure(errorMessage);
    return false;
  }
};
