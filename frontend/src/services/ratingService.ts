import axios from 'axios';

// Use environment variable if available, otherwise fallback to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

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
  ? `${API_BASE_URL}/api/ratings`
  : 'http://localhost:5001/api/ratings';

export interface Rating {
  _id?: string;
  tourId: string;
  userId?: string;
  guideId?: string;
  rating: number;
  createdAt?: Date;
}

export interface RatingResponse {
  success: boolean;
  message: string;
  rating: Rating;
  tourRating: {
    average: number;
    count: number;
  };
}

// Add a rating to a tour
export const addRating = async (tourId: string, rating: number): Promise<RatingResponse | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await axios.post<RatingResponse>(API_URL, 
      { tourId, rating },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de l\'ajout de la note:', error);
    
    // Return a more detailed error message if available
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Erreur lors de l\'ajout de la note');
    }
    
    throw new Error('Erreur lors de l\'ajout de la note');
  }
};

// Get ratings for a tour
export const getTourRatings = async (tourId: string): Promise<Rating[]> => {
  try {
    const response = await axios.get<Rating[]>(`${API_URL}/tour/${tourId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des notes du tour:', error);
    return [];
  }
};

// Get ratings for a guide
export const getGuideRatings = async (guideId: string): Promise<Rating[]> => {
  try {
    const response = await axios.get<Rating[]>(`${API_URL}/guide/${guideId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des notes du guide:', error);
    return [];
  }
};

// Get user's rating for a specific tour
export const getUserTourRating = async (tourId: string): Promise<Rating | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await axios.get<Rating>(`${API_URL}/user/tour/${tourId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error: any) {
    // If 404 (no rating found), return null instead of throwing an error
    if (error.response && error.response.status === 404) {
      return null;
    }
    
    console.error('Erreur lors de la récupération de la note de l\'utilisateur:', error);
    return null;
  }
};
