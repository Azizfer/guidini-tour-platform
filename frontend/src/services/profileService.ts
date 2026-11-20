import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Set a default timeout of 5 seconds
axios.defaults.timeout = 5000;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  userType: 'guide' | 'tourist';
  bio?: string;
  avatar?: string;
  stats?: {
    activeTours: number;
    completedTours: number;
  };
  recentReviews?: Review[];
}

function isUserProfile(data: unknown): data is UserProfile {
  return (
    typeof data === 'object' && data !== null &&
    'id' in data && typeof data.id === 'string' &&
    'name' in data && typeof data.name === 'string' &&
    'email' in data && typeof data.email === 'string' &&
    'userType' in data && (data.userType === 'guide' || data.userType === 'tourist') &&
    'bio' in data && (typeof data.bio === 'string' || data.bio === undefined) &&
    'avatar' in data && (typeof data.avatar === 'string' || data.avatar === undefined)
  );
}

// Helper function to check backend connectivity
const checkBackendConnection = async () => {
  try {
    await axios.get(`${API_BASE_URL}/api/health`);
    return true;
  } catch (error) {
    console.error('Backend connection failed:', error);
    return false;
  }
};

// Generate mock profile data for development
const getMockProfile = (userId: string): UserProfile => ({
  id: userId,
  name: "Mock User",
  email: "mock@example.com",
  userType: 'guide',
  bio: "This is mock data because backend is unavailable",
  avatar: "/default-avatar.jpg",
  stats: {
    activeTours: 5,
    completedTours: 10
  }
});

// Enhanced version with connection checking and mock data fallback
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    console.log(`Fetching profile for user ${userId}`);
    const isBackendAvailable = await checkBackendConnection();
    
    if (!isBackendAvailable) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock profile data - backend unavailable');
        return getMockProfile(userId);
      }
      throw new Error('Backend service unavailable');
    }

    const token = localStorage.getItem('token');
    const response = await axios.get<any>(`${API_BASE_URL}/api/profiles/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    
    let raw = response.data;

    // Normalise id field regardless of backend shape
    const normaliseProfileId = (data: any): string | undefined => {
      if (!data) return undefined;
      if (typeof data.id === 'string') return data.id;
      if (typeof data._id === 'string') return data._id;
      // Some APIs nest user object
      if (data.user) return normaliseProfileId(data.user);
      return undefined;
    };

    const id = normaliseProfileId(raw) ?? userId;

    const profileData: UserProfile = {
      ...raw,
      id
    } as UserProfile;

    console.log('Profile data normalised:', profileData);
    return profileData;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error details:', {
        url: `${API_BASE_URL}/api/profiles/${userId}`,
        error: error.message
      });
    } else {
      console.error('Unknown error occurred while fetching profile');
    }
    
    // In development, return mock data when API fails
    if (process.env.NODE_ENV === 'development') {
      console.warn('Falling back to mock profile data due to error');
      return getMockProfile(userId);
    }
    
    throw error;
  }
};

export const getProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/profiles/${userId}`, {
      headers: getAuthHeader()
    });
    
    if (!isUserProfile(response.data)) {
      throw new Error('Invalid profile data received from API');
    }
    
    return response.data;
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      return getMockProfile(userId);
    }
    
    if (error instanceof Error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }
    
    throw new Error('Unknown error occurred while fetching profile');
  }
};

// Enhanced version of other functions with better error handling
export const updateProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const isBackendAvailable = await checkBackendConnection();
    if (!isBackendAvailable) {
      throw new Error('Backend service unavailable');
    }

    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    const response = await axios.put<UserProfile>(`${API_BASE_URL}/api/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!isUserProfile(response.data)) {
      throw new Error('Invalid profile data received');
    }
    
    return response.data;
  } catch (error) {
    console.error('Profile update failed:', error);
    throw error; // Re-throw to let caller handle it
  }
};

// Add connection check to all API calls
const withConnectionCheck = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  const isBackendAvailable = await checkBackendConnection();
  if (!isBackendAvailable) {
    throw new Error('Backend service unavailable');
  }
  return apiCall();
};

// Enhanced toggleFollow with connection check
export const toggleFollow = async (userId: string) => {
  return withConnectionCheck(async () => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/api/profiles/${userId}/follow`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  });
};

// Similarly enhance other functions...

export const uploadAvatar = async (file: File) => {
  return withConnectionCheck(async () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axios.post(`${API_BASE_URL}/api/profiles/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  });
};

// Add this to your backend health check endpoint
export const checkBackendHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`, {
      timeout: 3000 // Faster timeout for health check
    });
    return response.status === 200;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error checking backend health:', error.message);
    } else {
      console.error('Unknown error occurred while checking backend health');
    }
    return false;
  }
};

export interface GuideStats {
  activeTours: number;
  completedTours: number;
}

export const getGuideTourStats = async (guideId: string): Promise<GuideStats> => {
  try {
    if (!(await checkBackendHealth())) {
      throw new Error('Backend unavailable');
    }

    const response = await axios.get<GuideStats>(`${API_BASE_URL}/api/guides/${guideId}/stats`, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching guide stats:', error.message);
    } else {
      console.error('Unknown error occurred while fetching guide stats');
    }
    throw error;
  }
};

export interface Tour {
  _id: string;
  id: string; 
  title: string;
  description: string;
  location?: string;
  duration: string;
  price: number;
  maxParticipants: number;
  date?: string;
  time?: string;
  tourStatus?: 'active'|'completed'|'private';
  image: string;
  bookings?: number;
  category: string;
  rating?: number;
  reviewCount?: number;
  guideId: string;
  createdAt?: string;
  highlights: string[];
  isActive: boolean;
  completedCount?: number;
  completedDate?: string;
  completedTime?: string;
}

export const getGuideTours = async (guideId: string, status?: string): Promise<Tour[]> => {
  const url = `${API_BASE_URL}/api/tours/guide/${guideId}${status ? `?status=${status}` : ''}`;
  console.log('Fetching tours from:', url);
  const response = await axios.get<Tour[]>(url, {
    headers: getAuthHeader()
  });
  return response.data;
};

export interface Review {
  _id: string;
  tourId: string;
  userId: string;
  guideId: string;
  rating: number;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export const getGuideReviews = async (guideId: string): Promise<Review[]> => {
  try {
    const response = await axios.get<Review[]>(`${API_BASE_URL}/api/tour-reviews/guide/${guideId}`, {
      headers: getAuthHeader()
    });
    
    // Validate each review has required fields
    return response.data.filter(review => 
      review?._id &&
      review?.tourId &&
      review?.guideId &&
      review?.rating &&
      review?.message
    );
  } catch (error: unknown) {
    console.error('Error fetching guide reviews:', error);
    throw error;
  }
};

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default {
  getUserProfile,
  getProfile,
  updateProfile,
  toggleFollow,
  uploadAvatar,
  checkBackendHealth,
  getGuideTourStats,
  getGuideTours,
  getGuideReviews
};