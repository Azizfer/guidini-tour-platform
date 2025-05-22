import axios from 'axios';

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
    
    const response = await axios.get<User>(`${API_URL}/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    
    // If we have a fallback user for this ID, return it
    if (fallbackUsers[userId as keyof typeof fallbackUsers]) {
      console.log(`Using fallback data for user ${userId} after API error`);
      return fallbackUsers[userId as keyof typeof fallbackUsers];
    }
    
    // Create a generic user if we don't have a specific fallback
    return {
      id: userId,
      _id: userId,
      name: `Guide ${userId.substring(0, 4)}`,
      email: `guide${userId.substring(0, 4)}@guidini.com`,
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
    return userCache.get(userId) || null;
  }
  
  try {
    // Fetch user and store in cache
    const user = await getUserById(userId);
    if (user) {
      userCache.set(userId, user);
    }
    
    return user;
  } catch (error) {
    console.error('Error in getCachedUserById:', error);
    
    // If we have a fallback user for this ID, return and cache it
    if (fallbackUsers[userId as keyof typeof fallbackUsers]) {
      const fallbackUser = fallbackUsers[userId as keyof typeof fallbackUsers];
      userCache.set(userId, fallbackUser);
      return fallbackUser;
    }
    
    return null;
  }
};
