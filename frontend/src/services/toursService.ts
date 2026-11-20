import axios from 'axios';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// Use environment variable if available, otherwise fallback to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
// Make sure the URL is valid before using it
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    console.error('Invalid API URL:', url);
    return false;
  }
};

// Validate and construct the API URL
const API_URL = isValidUrl(API_BASE_URL) 
  ? `${API_BASE_URL}/api/tours`
  : 'http://localhost:5001/api/tours';

// No more fallback data - all data comes from the API now

export type TourStatus = 'active' | 'completed' | 'private';

export interface Tour {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  price: number;
  maxParticipants: number;
  date: string;
  time: string;
  tourStatus: TourStatus; // Single field to track if a tour is active or completed
  image?: string;
  bookings?: number;
  category: string | string[]; // Peut être une chaîne ou un tableau de chaînes
  guideId?: string;
  guideName?: string; // Added for storing the guide's name
  guide?: { // Added for populated guide information
    _id?: string;
    id?: string;
    name?: string;
    profilePicture?: string;
  };
  rating?: number;
  reviewCount?: number;
  createdAt?: string | Date; // Added for sorting by creation date
  
  // Legacy fields - kept for backward compatibility with backend
  // These will be removed once backend is updated
  isCompleted?: boolean;
  status?: string;
}

// Récupérer tous les tours
export const getAllTours = async (): Promise<Tour[]> => {
  try {
    // Add token to headers if available
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // Use includeGuide=true parameter to get guide information with the tours
    const response = await axios.get<Tour[]>(`${API_URL}?includeGuide=true`, { headers });
    
    // Log API response for debugging
    console.log('API Response:', response.data);
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format from API');
    }
    
    // Process tours to ensure guide information is available
    const processedTours = await Promise.all(response.data.map(async (tour) => {
      // Define guide interface to fix TypeScript errors
      interface GuideInfo {
        _id?: string;
        id?: string;
        name?: string;
        profilePicture?: string;
      }
      
      // If the tour already has guide information, use it
      if (tour.guide) {
        const guideInfo = tour.guide as GuideInfo;
        if (guideInfo.name) {
          return {
            ...tour,
            guideName: guideInfo.name
          };
        }
      }
      
      // If the tour has a guideId but no guide name, try to fetch it
      if (tour.guideId) {
        try {
          // Define the expected user response type
          interface UserResponse {
            _id?: string;
            id?: string;
            name: string;
            email?: string;
            profilePicture?: string;
          }
          
          // Try to get guide name from the user API
          const userResponse = await axios.get<UserResponse>(`${API_BASE_URL}/api/users/${tour.guideId}`, { headers });
          const userData = userResponse.data;
          
          if (userData && userData.name) {
            return {
              ...tour,
              guideName: userData.name
            };
          }
        } catch (error) {
          console.error(`Error fetching guide info for tour ${tour._id || tour.id}:`, error);
        }
      }
      
      // Return the original tour if we couldn't add guide information
      return tour;
    }));
    
    return processedTours;
  } catch (error: unknown) {
    console.error('Error fetching tours:', error);
    
    // Check if it's an Axios error by looking for specific properties
    if (error && typeof error === 'object' && error !== null) {
      const errorObj = error as any;
      if (errorObj.response || errorObj.request) {
        if (errorObj.response) {
          throw new Error(`Server responded with ${errorObj.response.status}: ${errorObj.response.data?.message || 'Unknown error'}`);
        } else if (errorObj.request) {
          throw new Error('No response from server. Please check your internet connection.');
        } else {
          throw new Error('Error setting up request: ' + errorObj.message);
        }
      }
    }
    
    // For other errors, just log and rethrow
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred');
  }
};

// Récupérer les tours d'un guide spécifique
export const getToursByGuide = async (guideId: string): Promise<Tour[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Aucun token trouvé');
      return [];
    }
    
    const response = await axios.get<Tour[]>(`${API_URL}/guide/${guideId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.log('Erreur lors de la récupération des tours du guide:', error);
    return [];
  }
};

// Créer un nouveau tour (gère également l'upload d'image)
export const createTour = async (tourData: Omit<Tour, 'id' | '_id'> & { imageFile?: File }): Promise<Tour | null> => {
  try {
    // Vérifier si le token est présent
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Authentification requise');
      return null;
    }
    
    // S'assurer que le guideId est inclus
    const userId = localStorage.getItem('userId');
    const tourWithGuideId = {
      ...tourData,
      guideId: tourData.guideId || userId
    };
    
    let response;
    
    // Si une imageFile est présente, utiliser FormData pour l'upload multipart
    if (tourData.imageFile) {
      const formData = new FormData();
      // Append fields
      Object.entries(tourWithGuideId).forEach(([key, value]) => {
        if (key === 'imageFile') {
          formData.append('image', value as File); // champ attendu côté backend
        } else {
          // Éviter d'envoyer le champ texte 'image' lorsque l'imageFile est présent pour éviter un double champ
          if (key !== 'image' && value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        }
      });
      
      console.log('Envoi multipart/form-data (createTour)');
      
      response = await axios.post<Tour>(API_URL, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // NE PAS définir Content-Type pour laisser axios définir le boundary
        }
      });
    } else {
      // Sinon, envoyer en JSON classique
      response = await axios.post<Tour>(API_URL, tourWithGuideId, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    }
    
    console.log('Tour créé avec succès:', response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'création du tour');
    return null;
  }
};

// Mettre à jour un tour (supporte également l'upload d'image)
export const updateTour = async (id: string, tourData: Partial<Tour> & { imageFile?: File }): Promise<Tour | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    let response;
    
    if (tourData.imageFile) {
      const formData = new FormData();
      Object.entries(tourData).forEach(([key, value]) => {
        if (key === 'imageFile') {
          formData.append('image', value as File);
        } else {
          if (key !== 'image' && value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        }
      });
      
      response = await axios.put<Tour>(`${API_URL}/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } else {
      response = await axios.put<Tour>(`${API_URL}/${id}`, tourData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    }
    
    return response.data;
  } catch (error) {
    handleError(error, 'mise à jour du tour');
    return null;
  }
};

// Supprimer un tour - méthode directe
export const deleteTour = async (id: string): Promise<boolean> => {
  try {
    // Obtenir le token d'authentification
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Authentification requise pour supprimer un tour');
      return false;
    }
    
    // Faire une requête directe au backend pour supprimer le tour
    console.log(`Tentative de suppression directe du tour avec ID: ${id}`);
    
    // Utiliser fetch au lieu d'axios pour éviter tout problème potentiel
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Vérifier si la suppression a réussi
    if (response.ok) {
      console.log(`Tour ${id} supprimé avec succès`);
      return true;
    } else {
      const errorData = await response.json();
      console.error(`Échec de la suppression du tour:`, errorData);
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du tour:', error);
    return false;
  }
};

// Changer la visibilité d'un tour
export const toggleTourVisibility = async (id: string): Promise<Tour | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await axios.patch<Tour>(`${API_URL}/${id}/toggle-visibility`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    handleError(error, 'changement de visibilité');
    return null;
  }
};

// Marquer un tour comme complété
export const markTourAsCompleted = async (id: string): Promise<Tour | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    // Updated to use the new status field
    const response = await axios.patch<Tour>(`${API_URL}/${id}/mark-completed`, {
      status: 'completed'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    handleError(error, 'marquage comme complété');
    return null;
  }
};

// Fonction utilitaire pour gérer les erreurs
function handleError(error: any, operation: string): void {
  console.log(`Erreur lors de la ${operation}:`, error);
  
  if (error && typeof error === 'object') {
    if ('response' in error && error.response) {
      console.log('Détails de l\'erreur:', {
        status: error.response.status,
        message: error.response.data?.message || 'Erreur serveur'
      });
    } else if ('request' in error) {
      console.log('Aucune réponse du serveur');
    } else if ('message' in error) {
      console.log('Message d\'erreur:', error.message);
    }
  }
}

// Tours Store Implementation
// Utilisation d'un hook simple pour gérer l'état des tours
export const useToursStore = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTours = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Force API call instead of using fallbacks
      console.log('Forcing direct API call to get tours');
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
      
      // Make a direct API call to ensure we get the latest data
      const response = await axios.get<Tour[]>(API_URL, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`Successfully fetched ${response.data.length} tours from API`);
        setTours(response.data);
      } else {
        console.error('API returned invalid data format:', response.data);
        setError('Format de données invalide');
        setTours([]);
      }
    } catch (err: any) {
      console.error('Erreur dans le store de tours:', err);
      setError(`Erreur lors de la récupération des tours: ${err.message || 'Erreur inconnue'}`);
      // Do NOT set fallback data here - if the API fails, show an empty state
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les tours au montage du composant
  useEffect(() => {
    fetchTours();
    
    // Set up a refresh interval to keep data fresh
    const intervalId = setInterval(() => {
      console.log('Refreshing tours data...');
      fetchTours();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, []);

  const refreshTours = async () => {
    await fetchTours();
  };

  return { tours, loading, error, refreshTours }
};