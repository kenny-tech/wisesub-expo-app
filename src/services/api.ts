import axios from 'axios';

// Base API URL - configure in your environment
const BASE_API = process.env.EXPO_PUBLIC_BASE_API || 'https://your-api.com/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: BASE_API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// API endpoints
export const API_ENDPOINTS = {
  REGISTER: 'auth/register',
  LOGIN: 'auth/login',
  VERIFY_OTP: 'auth/verify_otp',
  ACTIVATE_ACCOUNT: 'auth/activate_account',
  FORGOT_PASSWORD: 'auth/forgot_password',
  RESET_PASSWORD: 'auth/reset_password',
  RESEND_OTP: 'auth/resend_otp',
};

// Request interceptor for adding tokens
api.interceptors.request.use(
  async (config) => {
    // Add auth token if available
    const token = await getTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access - redirect to login');
    }
    return Promise.reject(error);
  }
);

// Helper function to get token (implement based on your storage)
async function getTokenFromStorage(): Promise<string | null> {
  // Implement your token retrieval logic
  return null;
}