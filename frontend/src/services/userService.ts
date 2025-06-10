import axios from 'axios';
import guideService from './guideService';

// Use environment variable if available, otherwise fallback to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/users` 
  : 'http://localhost:5001/api/users';

// Fallback user data for when the API is not available
const fallbackUsers = {
  '101': {
    id: '101',
    _id: '101',
    name: 'Ahmed Benali',
    email: 'ahmed@guidini.com',
    role: 'guide',
    profilePicture: '/images/guides/ahmed.jpg'
  },
  '102': {
    id: '102',
    _id: '102',
    name: 'Leila Trabelsi',
    email: 'leila@guidini.com',
    role: 'guide',
    profilePicture: '/images/guides/leila.jpg'
  },
  '103': {
    id: '103',
    _id: '103',
    name: 'Karim Mejri',
    email: 'karim@guidini.com',
    role: 'guide',
    profilePicture: '/images/guides/karim.jpg'
  }
};

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
}

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // Check if we have a fallback user for this ID
    if (fallbackUsers[userId as keyof typeof fallbackUsers]) {
      console.log(`Using fallback data for user ${userId}`);
      return fallbackUsers[userId as keyof typeof fallbackUsers];
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return null;
    }
    
    // First try to get user from the users API
    try {
      const response = await axios.get<User>(`${API_URL}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.name) {
        console.log(`Successfully fetched user data for ${userId}:`, response.data.name);
        return response.data;
      }
    } catch (userError) {
      console.log('User not found in users API, trying guides API...');
    }
    
    // If user not found, try to get guide information
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    try {
      // Utiliser le bon endpoint pour les guides
      const guideResponse = await axios.get(`${API_BASE_URL}/api/users/guides/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Guide API response:', guideResponse.data);
      
      // Define an interface for the guide data to handle TypeScript errors
      interface GuideData {
        _id?: string;
        id?: string;
        name?: string;
        email?: string;
        profileImage?: string;
      }
      
      const guideData = guideResponse.data as GuideData;
      
      if (guideData && guideData.name) {
        console.log(`Successfully fetched guide data for ${userId}:`, guideData.name);
        return {
          id: guideData._id || guideData.id || userId,
          _id: guideData._id || guideData.id || userId,
          name: guideData.name,
          email: guideData.email || `guide@guidini.com`,
          role: 'guide',
          profilePicture: guideData.profileImage
        };
      }
    } catch (guideError) {
      console.error('Guide not found in guides API:', guideError);
    }
    
    // If we have a fallback user for this ID, return it
    if (fallbackUsers[userId as keyof typeof fallbackUsers]) {
      console.log(`Using fallback data for user ${userId} after API errors`);
      return fallbackUsers[userId as keyof typeof fallbackUsers];
    }
    
    // Create a generic user if we don't have a specific fallback
    console.warn(`Could not find real data for guide ${userId}, using generic placeholder`);
    return {
      id: userId,
      _id: userId,
      name: `Guide Professionnel`,
      email: `guide@guidini.com`,
      role: 'guide'
    };
  } catch (error) {
    console.error('Error in getUserById:', error);
    
    // Return a generic guide instead of showing the ID
    return {
      id: userId,
      _id: userId,
      name: `Guide Professionnel`,
      email: `guide@guidini.com`,
      role: 'guide'
    };
  }
};

// Cache for user data to avoid multiple requests for the same user
const userCache = new Map<string, User>();

// Get user with caching
export const getCachedUserById = async (userId: string): Promise<User | null> => {
  if (!userId) return null;
  
  // Check if user is in cache
  if (userCache.has(userId)) {
    const cachedUser = userCache.get(userId);
    console.log(`Using cached user data for ${userId}:`, cachedUser?.name);
    return cachedUser || null;
  }
  
  try {
    // Essayer d'abord d'utiliser directement le service de guide
    try {
      console.log('Trying to get guide data directly from guideService for ID:', userId);
      const guideData = await guideService.getGuideById(userId);
      
      if (guideData && guideData.name && !guideData.error) {
        console.log('Successfully retrieved guide data from guideService:', guideData.name);
        
        // Convert guide data to user format
        const user: User = {
          id: guideData._id,
          _id: guideData._id,
          name: guideData.name,
          email: guideData.email,
          role: 'guide',
          profilePicture: guideData.profileImage || guideData.avatar
        };
        
        // Cache the user data
        userCache.set(userId, user);
        return user;
      }
    } catch (guideError) {
      console.log('Failed to get guide from guideService, falling back to getUserById');
    }
    
    // Fallback to regular getUserById
    const user = await getUserById(userId);
    if (user) {
      userCache.set(userId, user);
    }
    return user;
  } catch (error) {
    console.error('Error in getCachedUserById:', error);
    return null;
  }
};

// Search users by name or email
export const searchUsers = async (query: string): Promise<User[]> => {
  if (!query.trim()) return [];
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const response = await axios.get<User[]>(`${API_BASE}/api/users/search`, {
      params: { query },
      headers: {
        // Token is optional for public search, add if exists
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined,
      },
      timeout: 10000,
    });
    return response.data || [];
  } catch (error) {
    console.error('searchUsers error:', error);
    return [];
  }
};

// Export default object for convenience
export default {
  getUserById,
  getCachedUserById,
  searchUsers,
};
