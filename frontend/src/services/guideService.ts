import axios from 'axios';

// URL directe vers le backend
const DIRECT_API_URL = 'http://localhost:5001/api';

export interface Guide {
  _id: string;
  name: string;
  email: string;
  userType: string;
  profileImage?: string;
  avatar?: string; // Pour la compatibilité avec l'interface du frontend
  languages?: string[];
  expertise?: string[];
  coveredGovernorates?: string[];
  yearsOfExperience?: number;
  experience?: number; // Pour la compatibilité avec l'interface du frontend
  description?: string;
  bio?: string; // Pour la compatibilité avec l'interface du frontend
  website?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  toursCount?: number;
  reservationsCount?: number;
  touristsCount?: number;
  totalRevenue?: number;
  paymentsReceived?: number;
  unreadMessages?: number;
}

export interface GuideUpdateData {
  name?: string;
  email?: string;
  bio?: string; // maps to description in backend
  expertise?: string[]; // Domaines d'expertise du guide
  website?: string;
  location?: string;
}

const guideService = {
  // Récupérer tous les guides
  getAllGuides: async (): Promise<Guide[]> => {
    try {
      const response = await axios.get<Guide[]>(`${DIRECT_API_URL}/users/guides`);
      console.log('Guides récupérés avec succès:', response.data);
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
        throw new Error('ID du guide non fourni');
      }
      
      console.log('Récupération du guide avec ID:', id);
      
      const response = await axios.get<Guide>(`${DIRECT_API_URL}/users/guides/${id}`);
      console.log('Guide récupéré avec succès:', response.data);
      
      // Adapter les données pour correspondre à l'interface attendue par le frontend
      const guide: Guide = {
        ...response.data,
        avatar: response.data.profileImage || '/placeholder.svg',
        bio: response.data.description || '',
        experience: response.data.yearsOfExperience || 0,
        rating: 4.8, // Valeurs par défaut pour le développement
        reviewCount: 24,
        toursCount: 15,
        reservationsCount: 32,
        touristsCount: 120,
        totalRevenue: 4500,
        paymentsReceived: 28,
        unreadMessages: 3
      };
      
      return guide;
    } catch (error) {
      console.error(`Erreur lors de la récupération du guide:`, error);
      throw error;
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
        website: guideData.website,
        location: guideData.location
      };
      
      console.log('Données à envoyer au backend:', backendData);
      
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
  }
};

export default guideService;
