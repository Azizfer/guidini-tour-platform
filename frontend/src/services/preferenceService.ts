import axios from 'axios';

// URL directe vers le backend
const DIRECT_API_URL = 'http://localhost:5001/api';

export interface Preference {
  _id: string;
  userId: string;
  username?: string;
  languages: string[];
  travelPurpose: string[];
  travelCompanions: string[];
  budget: string[];
  createdAt: string;
  updatedAt: string;
}

const preferenceService = {
  // Récupérer les préférences de l'utilisateur courant
  getUserPreferences: async (userId: string): Promise<Preference> => {
    try {
      if (!userId) {
        throw new Error('ID de l\'utilisateur non fourni');
      }
      
      console.log('Récupération des préférences pour l\'utilisateur:', userId);
      
      const response = await axios.get<Preference>(`${DIRECT_API_URL}/preferences/${userId}`);
      console.log('Préférences récupérées avec succès:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
      // Return default empty preferences instead of throwing
      return {
        _id: '',
        userId: '',
        languages: [],
        travelPurpose: [],
        travelCompanions: [],
        budget: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  },

  // Mettre à jour les préférences de l'utilisateur
  updateUserPreferences: async (userId: string, preferences: Partial<Preference>): Promise<Preference> => {
    try {
      if (!userId) {
        throw new Error('ID de l\'utilisateur non fourni');
      }
      
      console.log('Mise à jour des préférences pour l\'utilisateur:', userId);
      
      const response = await axios.put<Preference>(
        `${DIRECT_API_URL}/preferences/${userId}`,
        preferences,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Préférences mises à jour avec succès:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      throw error;
    }
  }
};

export default preferenceService;
