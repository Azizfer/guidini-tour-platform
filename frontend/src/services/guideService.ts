import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export interface Guide {
  _id: string;
  name: string;
  email: string;
  userType: string;
  profileImage: string;
  languages: string[];
  expertise: string[];
  coveredGovernorates: string[];
  yearsOfExperience: number;
  description: string;
}

const guideService = {
  // Récupérer tous les guides
  getAllGuides: async (): Promise<Guide[]> => {
    try {
      const response = await axios.get<Guide[]>(`${API_URL}/users/guides`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des guides:', error);
      throw error;
    }
  },

  // Récupérer un guide par son ID
  getGuideById: async (id: string): Promise<Guide> => {
    try {
      const response = await axios.get<Guide>(`${API_URL}/users/guides/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du guide ${id}:`, error);
      throw error;
    }
  }
};

export default guideService;
