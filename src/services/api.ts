import axios from 'axios';

// Base API URL
export const BASE_API = 'https://2710-154-120-84-45.ngrok-free.app/api/v1/';
export const IMAGE_BASE_URL = 'https://2710-154-120-84-45.ngrok-free.app/images';
export const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK_TEST-dad71b8b91c86582c306fcc0f6bce4a0-X';

// Create UNAUTHENTICATED axios instance for auth endpoints (login, register, etc.)
export const authApi = axios.create({
  baseURL: BASE_API,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Create AUTHENTICATED axios instance for protected endpoints
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
  // Security endpoints (require token)
  API_KEY: 'security/api-key',
  SIGNATURE: 'security/signature',

  // Auth endpoints (NO token required)
  REGISTER: 'auth/register',
  LOGIN: 'auth/login',
  VERIFY_OTP: 'auth/verify_otp',
  ACTIVATE_ACCOUNT: 'auth/activate_account',
  FORGOT_PASSWORD: 'auth/forgot_password',
  RESET_PASSWORD: 'auth/reset_password',
  RESEND_OTP: 'auth/resend_otp',
  VERIFY_SIGNUP_OTP: 'auth/verify_user_otp',
  VERIFY_FORGOT_PASSWORD_OTP: 'auth/verify_otp',

  // Pay bill endpoints
  VTPASS_VARIATION_CODES: 'vtpass/get-variation-codes',
  PAY_BILL: 'user/wallet/pay_bill',
  VERIFY_DECODER_NUMBER: '/vtpass/verify-decoder-number',
  VERIFY_METER_NUMBER: '/vtpass/verify-meter-number',
  VTPASS_COMMISSION: '/vtpass/commission',

  // Wallet endpoints
  WALLET_BALANCE: 'user/wallet/get_balance',
  GENERATE_BANK_TRANSFER: 'user/virtual_account_number',
  CREATE_PAYMENT: 'user/payment/create',

  // Transaction endpoints
  TRANSACTIONS: 'user/transaction/get_user_transactions',
  COMMISSION_TOTAL: 'user/transaction/sum_user_transaction_by_type',
  COMMISSIONS: 'user/transaction/get_user_commissions',

  // Profile endpoints
  GET_PROFILE: 'profile',
  UPDATE_PROFILE: 'user/update_profile',
  CHANGE_PASSWORD: 'user/change_password',
  DELETE_ACCOUNT: 'user/delete-account',
  LOGOUT: 'user/logout',
};

// Generic API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

// Request interceptor for AUTHENTICATED requests only
api.interceptors.request.use(
  async (config) => {
    try {
      // Import getHeaders here using require to avoid circular dependency
      const { getHeaders } = require('../utils/headers');
      
      const options = {
        method: (config.method?.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'),
        body: config.data,
      };

      const headers = await getHeaders(options);
      config.headers = { ...config.headers, ...headers };
    } catch (error: any) {
      console.error('Failed to set headers:', error);
      
      // Check if it's an auth error
      if (error.message?.includes('Unauthorized') || error.message?.includes('Session expired')) {
        throw new Error('Session expired. Please login again.');
      }
      
      throw error;
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for authenticated requests
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized - session expired');
      // Optionally, you could dispatch a logout action here
    }
    return Promise.reject(error);
  }
);