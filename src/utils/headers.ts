import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_API } from '../services/api';
import { APP_CONSTANTS } from './constants';

export interface GetHeadersOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
}

export interface SecureHeaders {
  'Content-Type': string;
  'Accept': string;
  'Authorization': string;
  'API_KEY': string;
  'X-Signature'?: string;
  'X-Timestamp'?: string;
}

export const getHeaders = async (options?: GetHeadersOptions): Promise<SecureHeaders> => {
  try {
    // This function is ONLY called for authenticated requests
    const token = await AsyncStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
    
    if (!token) {
      throw new Error('Unauthorized: No token found. Please login again.');
    }

    const baseHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // Get API key using the token
    const apiKeyResponse = await axios.get<{ api_key: string }>(
      `${BASE_API}security/api-key`,
      { headers: baseHeaders }
    );

    const fullHeaders: SecureHeaders = {
      ...baseHeaders,
      'API_KEY': apiKeyResponse.data.api_key,
    };

    // Generate signature for non-GET requests with body
    if (options?.method && options.method !== 'GET' && options.body) {
      const timestamp = Math.floor(Date.now() / 1000);
      
      const signatureResponse = await axios.post<{ signature: string }>(
        `${BASE_API}security/signature`,
        {
          timestamp,
          payload: options.body
        },
        { headers: fullHeaders }
      );

      return {
        ...fullHeaders,
        'X-Signature': signatureResponse.data.signature,
        'X-Timestamp': timestamp.toString(),
      };
    }

    return fullHeaders;
  } catch (error: any) {
    console.error('Failed to generate headers:', error);
    
    if (error.response?.status === 401) {
      // Clear invalid token
      await AsyncStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER_DATA);
      throw new Error('Session expired. Please login again.');
    }
    
    throw error;
  }
};