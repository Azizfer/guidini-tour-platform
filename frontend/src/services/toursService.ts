import axios from 'axios';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// Use environment variable if available, otherwise fallback to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/tours` 
  : 'http://localhost:5001/api/tours';

// Fallback data for when the API is not available
const fallbackTours = [
  {
    id: '1',
    title: 'Visite guidée des ruines de Carthage',
    description: 'Découvrez l\'histoire fascinante de l\'ancienne Carthage avec un guide expert.',
    location: 'Carthage, Tunis',
    duration: '3 heures',
    price: 45,
    maxParticipants: 15,
    date: '2025-06-15',
    time: '09:00',
    isPublic: true,
    image: '/images/carthage-ruins.jpg',
    category: 'Histoire',
    guideId: '101',
  },
  {
    id: '2',
    title: 'Balade dans les ruelles de Sidi Bou Said',
    description: 'Flânez dans les charmantes ruelles du village pittoresque de Sidi Bou Said.',
    location: 'Sidi Bou Said, Tunis',
    duration: '2 heures',
    price: 30,
    maxParticipants: 10,
    date: '2025-06-20',
    time: '14:00',
    isPublic: true,
    image: '/images/sidi-bou-said.jpg',
    category: 'Culture',
    guideId: '102',
  },
  {
    id: '3',
    title: 'Excursion dans le désert du Sahara',
    description: 'Partez à l\'aventure dans le désert du Sahara et profitez d\'une balade à dos de chameau.',
    location: 'Sud Tunisien',
    duration: '2 jours',
    price: 150,
    maxParticipants: 12,
    date: '2025-07-10',
    time: '08:00',
    isPublic: true,
    image: '/images/sahara.jpg',
    category: 'Aventure',
    guideId: '103',
  }
];

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
  isPublic: boolean;
  image?: string;
  bookings?: number;
  category: string | string[]; // Peut être une chaîne ou un tableau de chaînes
  guideId?: string;
  rating?: number;
  reviewCount?: number;
}

// Récupérer tous les tours
export const getAllTours = async (): Promise<Tour[]> => {
  try {
    const response = await axios.get<Tour[]>(API_URL);
    return response.data;
  } catch (error) {
    console.log('Erreur lors de la récupération des tours:', error);
    console.log('Utilisation des données de secours');
    // Return fallback data when API is unavailable
    return fallbackTours;
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

// Créer un nouveau tour
export const createTour = async (tourData: Omit<Tour, 'id' | '_id'>): Promise<Tour | null> => {
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
    
    console.log('Envoi de données au serveur:', {
      url: API_URL,
      data: tourWithGuideId,
      token: token ? 'Présent' : 'Absent'
    });
    
    const response = await axios.post<Tour>(API_URL, tourWithGuideId, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Tour créé avec succès:', response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'création du tour');
    return null;
  }
};

// Mettre à jour un tour
export const updateTour = async (id: string, tourData: Partial<Tour>): Promise<Tour | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await axios.put<Tour>(`${API_URL}/${id}`, tourData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    handleError(error, 'mise à jour du tour');
    return null;
  }
};

// Supprimer un tour
export const deleteTour = async (id: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return true;
  } catch (error) {
    handleError(error, 'suppression du tour');
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
      const fetchedTours = await getAllTours();
      setTours(fetchedTours);
    } catch (err) {
      setError('Erreur lors de la récupération des tours');
      console.error('Erreur dans le store de tours:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les tours au montage du composant
  useEffect(() => {
    fetchTours();
  }, []);

  const refreshTours = async () => {
    await fetchTours();
  };

  return { tours, loading, error, refreshTours };
};
