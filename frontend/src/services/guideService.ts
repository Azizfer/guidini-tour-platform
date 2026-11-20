import axios from 'axios';

// URL directe vers le backend - use environment variable if available
const DIRECT_API_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL 
  : 'http://localhost:5001/api';

// Données de guide par défaut pour le développement
const DEFAULT_GUIDE_DATA = {
  _id: 'dev-guide-id',
  name: 'Guide Touristique',
  email: 'guide@guidini.com',
  userType: 'guide',
  profileImage: '/placeholder.svg',
  avatar: '/placeholder.svg',
  languages: ['Français', 'Anglais', 'Arabe'],
  expertise: ['Histoire', 'Culture', 'Gastronomie'],
  coveredGovernorates: ['Tunis', 'Sousse', 'Sfax'],
  yearsOfExperience: 5,
  experience: 5,
  description: 'Guide professionnel spécialisé dans les circuits culturels et historiques en Tunisie.',
  bio: 'Guide professionnel spécialisé dans les circuits culturels et historiques en Tunisie.',
  website: 'https://guidini.com',
  location: 'Tunis, Tunisie',
  rating: 4.8,
  reviewCount: 24,
  toursCount: 15,
  touristsCount: 120,
  totalRevenue: 4500,
  paymentsReceived: 28,
  unreadMessages: 3
};

export interface Guide {
  _id: string;
  name: string;
  email: string;
  userType: string;
  profileImage?: string;
  avatar?: string;
  languages?: string[];
  expertise?: string[];
  coveredGovernorates?: string[];
  yearsOfExperience?: number;
  experience?: number;
  description?: string;
  bio?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  toursCount?: number;
  touristsCount?: number;
  totalRevenue?: number;
  paymentsReceived?: number;
  unreadMessages?: number;
  location?: string;
  error?: string; // Indicateur d'erreur
  stats?: {
    totalBookings?: number;
    averageRating?: number;
    completedTours?: number;
    activeTours?: number;
    paymentsReceived?: number;
  }
}

export interface GuideUpdateData {
  name?: string;
  email?: string;
  bio?: string; // maps to description in backend
  expertise?: string[]; // Domaines d'expertise du guide
  languages?: string[]; // Langues parlées par le guide
  yearsOfExperience?: number; // Années d'expérience
  website?: string;
  location?: string;
}


const guideService = {
  // Récupérer tous les guides
  getAllGuides: async (): Promise<Guide[]> => {
    try {
      const response = await axios.get<Guide[]>(`${DIRECT_API_URL}/guides`);
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des guides:', error);
      return [];
    }
  },

  // Récupérer un guide par son ID
  getGuideById: async (id: string): Promise<Guide> => {
    try {
      if (!id) {
        console.error('ID du guide non fourni');
        throw new Error('ID du guide non fourni');
      }
      
      console.log('Récupération du guide avec ID:', id);
      
      const response = await axios.get<Guide>(`${DIRECT_API_URL}/users/guides/${id}`);
      console.log('Guide récupéré avec succès:', response.data);
      
      if (!response.data || !response.data._id) {
        throw new Error('Données de guide invalides reçues du serveur');
      }
      
      // Adapter les données pour correspondre à l'interface attendue par le frontend
      const guide: Guide = {
        ...response.data,
        avatar: response.data.profileImage || '/placeholder.svg',
        bio: response.data.description || '',
        experience: response.data.yearsOfExperience || 0,
        rating: response.data.rating || 0,
        reviewCount: response.data.reviewCount || 0,
        toursCount: response.data.toursCount || 0,
        touristsCount: response.data.touristsCount || 0,
        totalRevenue: response.data.totalRevenue || 0,
        paymentsReceived: response.data.paymentsReceived || 0,
        unreadMessages: response.data.unreadMessages || 0
      };
      
      return guide;
    } catch (error: any) {
      console.error(`Erreur lors de la récupération du guide:`, error);
      
      // Construire un message d'erreur détaillé
      let errorMessage = 'Impossible de récupérer les données du guide';
      
      if (error.response) {
        // Erreur de réponse du serveur (4xx, 5xx)
        errorMessage += ` - Statut: ${error.response.status}`;
        if (error.response.data && error.response.data.message) {
          errorMessage += ` - ${error.response.data.message}`;
        }
      } else if (error.request) {
        // Pas de réponse du serveur
        errorMessage += ` - Le serveur backend n'a pas répondu. Vérifiez que le backend est en cours d'exécution.`;
      } else {
        // Erreur lors de la configuration de la requête
        errorMessage += ` - ${error.message}`;
      }
      
      // Log the error safely without throwing exceptions
      try {
        // Use a safer logging approach that works in both client and server
        console.log('[Guide Service Error]', errorMessage);
      } catch (logError) {
        // Fallback if even logging fails
        console.log('Failed to log error');
      }
      // Retourner un objet guide avec une propriété d'erreur au lieu de lancer une exception
      return {
        _id: id,
        name: 'Erreur',
        email: '',
        userType: 'guide',
        error: errorMessage
      };
    }
  },

  // Mettre à jour le profil d'un guide
  updateGuide: async (id: string, guideData: GuideUpdateData): Promise<Guide> => {
    try {
      if (!id) {
        throw new Error('ID du guide non fourni');
      }
      
      console.log('Mise à jour du guide avec ID:', id);
      
      // Adapter les données pour le backend
      const backendData = {
        name: guideData.name,
        email: guideData.email,
        description: guideData.bio, // Convertir bio en description pour le backend
        expertise: guideData.expertise,
        languages: guideData.languages, // Ajouter les langues
        yearsOfExperience: guideData.yearsOfExperience, // Années d'expérience
        website: guideData.website,
        location: guideData.location
      };
      
      console.log('Sending languages:', guideData.languages);
      console.log('Sending yearsOfExperience:', guideData.yearsOfExperience);
      
      console.log('Données à envoyer au backend:', backendData);
      
      // More detailed logging for debugging
      console.log('===== DEBUG: GUIDE UPDATE REQUEST =====');
      console.log('Original guideData:', JSON.stringify(guideData, null, 2));
      console.log('Processed backendData:', JSON.stringify(backendData, null, 2));
      console.log('Languages type:', Array.isArray(guideData.languages) ? 'Array' : typeof guideData.languages);
      console.log('Languages value:', guideData.languages);
      console.log('YearsOfExperience type:', typeof guideData.yearsOfExperience);
      console.log('YearsOfExperience value:', guideData.yearsOfExperience);
      
      const response = await axios.put<Guide>(
        `${DIRECT_API_URL}/users/guides/${id}`,
        backendData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Guide mis à jour avec succès:', response.data);
      
      // Adapter les données pour correspondre à l'interface attendue par le frontend
      const updatedGuide: Guide = {
        ...response.data,
        avatar: response.data.profileImage || '/placeholder.svg',
        bio: response.data.description || '',
        experience: response.data.yearsOfExperience || 0
      };
      
      return updatedGuide;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du guide:', error);
      throw error;
    }
  },
  
  // Upload profile image for a guide
  uploadProfileImage: async (id: string, file: File): Promise<Guide> => {
    try {
      if (!id) {
        throw new Error('ID du guide non fourni');
      }
      
      console.log('Uploading profile image for guide ID:', id);
      
      // Get the authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Create form data for the image upload
      const formData = new FormData();
      formData.append('profileImage', file);
      
      // Log the request details for debugging
      console.log(`Making request to: ${DIRECT_API_URL}/users/${id}/profile-image`);
      console.log('Form data contains file:', !!file);
      
      // Make sure we're not setting Content-Type header for multipart/form-data
      // Axios will set the correct boundary automatically
      const response = await axios.post<{success: boolean; profileImage: string}>(
        `${DIRECT_API_URL}/users/${id}/profile-image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
            // Don't set Content-Type for multipart/form-data
          }
        }
      );
      
      console.log('Profile image uploaded successfully:', response.data);
      
      // Return updated guide data with new profile image
      const updatedGuide = await guideService.getGuideById(id);
      return updatedGuide;
    } catch (error: unknown) {
      console.log('Error uploading profile image');
      
      // Provide more detailed error information in a type-safe way
      if (error && typeof error === 'object') {
        // Safe way to check for Axios error properties
        const err = error as any;
        if (err.response) {
          console.log('Response error status:', err.response.status);
        } else if (err.request) {
          console.log('No response received');
        } else if (err.message) {
          console.log('Error message:', err.message);
        }
      } else if (error instanceof Error) {
        console.log('Error message:', error.message);
      }
      
      throw error;
    }
  }
};

export default guideService;