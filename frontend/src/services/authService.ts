import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Type definitions
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  userType: string;
  languages?: string[];
  travelPurpose?: string[];
  travelCompanions?: string[];
  budget?: string[];
  expertise?: string[];
  coveredGovernorates?: string[];
  yearsOfExperience?: number;
  description?: string;
  profileImage?: File | null;
  idCard?: File | null;
  certificate?: File | null;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    userType: string;
    profileImage?: string;
  };
  token: string;
  message: string;
}

// Helper function to create FormData from object
const createFormData = (data: RegisterData): FormData => {
  const formData = new FormData();
  
  // Add text fields
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'profileImage' && key !== 'idCard' && key !== 'certificate') {
      if (Array.isArray(value)) {
        // Handle array values (like languages, preferences, etc.)
        value.forEach(item => {
          formData.append(key, item);
        });
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    }
  });
  
  // Add file fields
  if (data.profileImage) {
    formData.append('profileImage', data.profileImage);
  }
  
  if (data.idCard) {
    formData.append('idCard', data.idCard);
  }
  
  if (data.certificate) {
    formData.append('certificate', data.certificate);
  }
  
  return formData;
};

// Auth Service functions
const authService = {
  // Pre-register a user (send verification code)
  preRegister: async (email: string, name: string): Promise<{ message: string; email: string }> => {
    try {
      const response = await axios.post<{ message: string; email: string }>(`${API_URL}/auth/pre-register`, {
        email,
        name
      });
      
      return response.data;
    } catch (error) {
      console.error('Pre-registration error:', error);
      throw error;
    }
  },
  
  // Verify registration code
  verifyRegistration: async (email: string, otp: string): Promise<{ message: string; verificationToken: string }> => {
    try {
      const response = await axios.post<{ message: string; verificationToken: string }>(`${API_URL}/auth/verify-registration`, {
        email,
        otp
      });
      
      return response.data;
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    }
  },
  
  // Register a new user
  register: async (data: RegisterData, verificationToken?: string): Promise<AuthResponse> => {
    console.log('Sending registration data to API:', data);
    
    const formData = createFormData(data);
    
    // Add verification token if provided
    if (verificationToken) {
      formData.append('verificationToken', verificationToken);
    }
    
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, data);
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Logout user
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // Get current user
  getCurrentUser: (): any => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  
  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};

export default authService;
