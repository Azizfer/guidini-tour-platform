import axios from 'axios';

// Get the backend URL from environment variables or use a default
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
const API_URL = `${BACKEND_URL}/api/payments`;

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
    if (process.env.NODE_ENV !== 'production') {
      console.log('Sending payment request to:', `${API_URL}/initialize`);
    }
    
    const response = await axios.post(`${API_URL}/initialize`, paymentData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    // Validate response structure
    const data = response.data as any;
    if (!data || !data.payUrl || !data.paymentRef) {
      return {
        success: false,
        payUrl: '',
        paymentRef: '',
        orderId: paymentData.orderId || '',
        message: 'Réponse invalide du serveur'
      };
    }
    
    return data as PaymentResponse;
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
    if (process.env.NODE_ENV !== 'production') {
      console.log('Error checking payment status:', error);
    }
    
    throw new Error(error.response?.data?.message || 'Erreur lors de la vérification du statut du paiement');
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
