import axios from 'axios';
import { getHeaders } from '../utils/headers';

// Base API URL
export const BASE_API = 'https://cdfc8fa2c1d5.ngrok-free.app/api/v1/';
export const IMAGE_BASE_URL='https://cdfc8fa2c1d5.ngrok-free.app/images';

// Create axios instance
export const api = axios.create({
  baseURL: BASE_API,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// API endpoints
export const API_ENDPOINTS = {
  // Security endpoints
  API_KEY: 'security/api-key',
  SIGNATURE: 'security/signature',

  // Auth endpoints
  REGISTER: 'auth/register',
  LOGIN: 'auth/login',
  VERIFY_OTP: 'auth/verify_otp',
  ACTIVATE_ACCOUNT: 'auth/activate_account',
  FORGOT_PASSWORD: 'auth/forgot_password',
  RESET_PASSWORD: 'auth/reset_password',
  RESEND_OTP: 'auth/resend_otp',

  // Pay bill endpoints
  VTPASS_VARIATION_CODES: 'vtpass/get-variation-codes',
  PAY_BILL: 'user/wallet/pay_bill',
  VERIFY_DECODER_NUMBER: '/vtpass/verify-decoder-number',
  VTPASS_COMMISSION: '/vtpass/commission',

  // Wallet endpoints
  WALLET_BALANCE: 'user/wallet/get_balance',

  // Transaction endpoints
  TRANSACTIONS: 'user/transaction/get_user_transactions',

  // Profile endpoints
  GET_PROFILE: 'profile',
  UPDATE_PROFILE: 'user/update_profile',
  CHANGE_PASSWORD: 'auth/change-password',
};

// Request interceptor for adding signature headers
api.interceptors.request.use(
  async (config) => {
    try {
      // Skip signature for security endpoints
      const isSecurityEndpoint = config.url?.includes('security/');

      if (!isSecurityEndpoint) {
        const options = {
          method: (config.method?.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'),
          body: config.data,
        };

        const headers = await getHeaders(options);
        config.headers = { ...config.headers, ...headers };
      }
    } catch (error) {
      console.error('Failed to set headers:', error);
      throw error;
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized - session may have expired');
    }
    return Promise.reject(error);
  }
);

// Generic API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}