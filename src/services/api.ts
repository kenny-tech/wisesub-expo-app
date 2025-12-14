import axios from 'axios';

const BASE_API = 'https://56ed06cf7480.ngrok-free.app/api/v1/';

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
  REGISTER: `${BASE_API}auth/register`,
  LOGIN: `${BASE_API}auth/login`,
  VERIFY_SIGNUP_OTP: `${BASE_API}auth/verify_user_otp`,
  VERIFY_FORGOT_PASSWORD_OTP: `${BASE_API}auth/verify_otp`,
  VERIFY_OTP: `${BASE_API}auth/verify_otp`,
  ACTIVATE_ACCOUNT: `${BASE_API}auth/activate_account`,
  FORGOT_PASSWORD: `${BASE_API}auth/forgot_password`,
  RESET_PASSWORD: `${BASE_API}auth/reset_password`,
  RESEND_OTP: `${BASE_API}auth/resend_otp`,
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