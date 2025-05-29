import axios from 'axios';

// Define the API URL from environment variables or use a default
// Make sure the URL doesn't have a trailing slash or /api at the end
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// The API URL with the /api prefix - this is the correct URL structure based on our tests
const API_URL = BASE_URL;

console.log('Backend server is running at:', BASE_URL);

// For debugging
console.log('Using API URL:', API_URL);

// Helper function to normalize email (trim and lowercase)
const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

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
  // Check if email exists
  checkEmail: async (email: string): Promise<{ message: string }> => {
    try {
      const normalizedEmail = normalizeEmail(email);
      console.log('Checking if email exists:', normalizedEmail);
      
      const response = await axios.post<{ message: string }>(`${API_URL}/api/auth/check-email`, {
        email: normalizedEmail
      });
      
      return response.data;
    } catch (error) {
      console.error('Email check error:', error);
      throw error;
    }
  },
  
  // Pre-register a user (send verification code)
  preRegister: async (email: string, name: string): Promise<{ message: string; email: string }> => {
    try {
      const normalizedEmail = normalizeEmail(email);
      console.log('Pre-registering user:', normalizedEmail);
      
      const response = await axios.post<{ message: string; email: string }>(`${API_URL}/api/auth/pre-register`, {
        email: normalizedEmail,
        name
      });
      
      return response.data;
    } catch (error) {
      console.error('Pre-registration error:', error);
      throw error;
    }
  },
  
  // Verify registration code
  verifyRegistration: async (email: string, otp: string): Promise<{ message: string; token: string }> => {
    try {
      const normalizedEmail = normalizeEmail(email);
      console.log('Verifying registration code for:', normalizedEmail);
      
      const response = await axios.post<{ message: string; token: string }>(`${API_URL}/api/auth/verify-registration`, {
        email: normalizedEmail,
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
    console.log('Preparing registration data for API');
    
    // Normalize email before sending
    const normalizedData = {
      ...data,
      email: normalizeEmail(data.email)
    };
    
    console.log('Normalized registration data:', normalizedData);
    
    const formData = createFormData(normalizedData);
    
    // Add verification token if provided
    if (verificationToken) {
      formData.append('verificationToken', verificationToken);
    }
    
    // Log form data contents for debugging
    console.log('Form data entries:');
    // Use Array.from to convert FormData entries to array to avoid TypeScript iterator error
    Array.from(formData.entries()).forEach(pair => {
      // Don't log file contents, just their presence
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}: [File] ${pair[1].name} (${pair[1].size} bytes)`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    });
    
    try {
      console.log('Sending registration request to:', `${API_URL}/api/auth/register`);
      
      // Set a timeout for the request
      const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout for file uploads
      });
      
      // Note: Removed onUploadProgress due to TypeScript errors
      
      console.log('Registration successful:', response.data);
      
      // Store token and user data in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userId', response.data.user._id);
        
        // Set authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Erreur lors de l\'inscription';
      
      // Type guard for AxiosError
      const axiosError = error as { 
        response?: { 
          data?: any, 
          status?: number, 
          statusText?: string 
        },
        request?: any
      };
      
      if (axiosError.response) {
        // Server responded with an error
        console.error('Server error response:', axiosError.response.data);
        errorMessage = axiosError.response.data?.error || axiosError.response.data?.message || `Erreur ${axiosError.response.status}: ${axiosError.response.statusText}`;
      } else if (axiosError.request) {
        // Request was made but no response received
        console.error('No response received from server');
        errorMessage = 'Aucune réponse du serveur. Vérifiez votre connexion réseau et que le backend est en cours d\'exécution.';
        
        // Add more detailed debugging information
        console.log('Backend URL used:', API_URL);
        console.log('Request details:', {
          method: 'POST',
          url: `${API_URL}/api/auth/register`,
          formData: 'multipart/form-data content'
        });
        
        // Add additional troubleshooting information
        console.log('Troubleshooting tips:');
        console.log('1. Verify the backend server is running on port 5001');
        console.log('2. Check for any CORS issues in the browser console');
        console.log('3. Ensure the API routes are correctly defined in the backend');
        console.log('4. Check if there are any network connectivity issues');
      } else {
        // Error setting up the request
        console.error('Request error:', (error as any).message);
        errorMessage = (error as any).message;
      }
      
      // Return a more user-friendly error object instead of throwing
      return Promise.reject({
        error: true,
        message: errorMessage
      });
    }
  },
  
  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      // Normalize email before sending
      const normalizedData = {
        ...data,
        email: normalizeEmail(data.email)
      };
      
      console.log('Attempting login with normalized email:', normalizedData.email);
      console.log('Login request URL:', `${API_URL}/api/auth/login`);
      
      // Set a timeout for the request
      const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/login`, normalizedData, {
        timeout: 10000 // 10 seconds timeout
      });
      
      console.log('Login successful:', response.data);
      
      // Store token and user data in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userId', response.data.user._id);
        
        // Set authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Erreur lors de la connexion';
      
      if (error.response) {
        // Server responded with an error
        console.error('Server error response:', error.response.data);
        
        // Handle specific error cases
        if (error.response.status === 401) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else {
          errorMessage = error.response.data?.error || error.response.data?.message || `Erreur ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received from server');
        errorMessage = 'Aucune réponse du serveur. Vérifiez votre connexion réseau et que le backend est en cours d\'exécution.';
        
        // Add more detailed debugging information
        console.log('Backend URL used:', API_URL);
        console.log('Request details:', {
          method: 'POST',
          url: `${API_URL}/api/auth/login`,
          data: { email: normalizeEmail(data.email) }
        });
        
        // Add additional troubleshooting information
        console.log('Troubleshooting tips:');
        console.log('1. Verify the backend server is running on port 5001');
        console.log('2. Check for any CORS issues in the browser console');
        console.log('3. Ensure the API routes are correctly defined in the backend');
        console.log('4. Check if there are any network connectivity issues');
      } else {
        // Error setting up the request
        console.error('Request error:', error.message);
        errorMessage = error.message;
      }
      
      // Return a more user-friendly error object instead of throwing
      return Promise.reject({
        error: true,
        message: errorMessage
      });
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
