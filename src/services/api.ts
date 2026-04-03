import axios from 'axios';

// export const BASE_API = 'https://app.wisesub.com.ng/api/v1/';
// export const IMAGE_BASE_URL = 'https://app.wisesub.com.ng/images';
// export const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK-3fe10c6cd18ef925281db5aeffda7781-X';

// Base API URL
// export const BASE_API = process.env.EXPO_PUBLIC_BASE_API ?? '';
// export const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_IMAGE_BASE_URL ?? '';
// export const FLUTTERWAVE_PUBLIC_KEY = process.env.EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ?? '';
export const BASE_API = 'https://a3cf-154-120-102-131.ngrok-free.app/api/v1/';
export const IMAGE_BASE_URL = 'https://a3cf-154-120-102-131.ngrok-free.app/images';
export const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK-3fe10c6cd18ef925281db5aeffda7781-X';
export const PAYSTACK_PUBLIC_KEY = 'pk_test_f56969fa0d145995993a18768ed17412732bcc82';


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
  VTPASS_VARIATION_CODES: 'get-variation-codes',
  PAY_BILL: 'user/wallet/pay_bill',
  VERIFY_DECODER_NUMBER: 'verify-decoder-number',
  VERIFY_METER_NUMBER: 'verify-meter-number',
  VTPASS_COMMISSION: 'commission',

  AIDAPAY_PACKAGES: 'aidapay/packages',
  AIDAPAY_PRICING_CONFIG: 'aidapay/pricing-config',

  // Wallet endpoints
  WALLET_BALANCE: 'user/wallet/get_balance',
  GENERATE_BANK_TRANSFER_PAYSTACK: 'user/virtual_account_number/create',
  CREATE_PAYSTACK_PAYMENT: 'user/payment/create-paystack',
  GENERATE_BANK_TRANSFER: 'user/virtual_account_number',
  CREATE_PAYMENT: 'user/payment/create',

  // Transaction endpoints
  TRANSACTIONS: 'user/transaction/get_user_transactions',
  RECENT_CUSTOMERS: 'user/transaction/get_recent_customers',

  COMMISSION_TOTAL: 'user/transaction/sum_user_transaction_by_type',
  COMMISSIONS: 'user/transaction/get_user_commissions',

  // Profile endpoints
  GET_PROFILE: 'profile',
  UPDATE_PROFILE: 'user/update_profile',
  CHANGE_PASSWORD: 'user/change_password',
  DELETE_ACCOUNT: 'user/delete-account',
  LOGOUT: 'user/logout',

  // Expo push notification endpoints
  CREATE_EXPO_TOKEN: 'user/create-expo-token',
  GET_EXPO_TOKEN: 'user/get-expo-token',
  DELETE_EXPO_TOKEN: 'user/delete-expo-token',
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