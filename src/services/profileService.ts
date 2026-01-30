import { api, API_ENDPOINTS } from './api';

export interface UpdateProfileData {
  phone: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: {
    phone: string;
  };
  errors?: Record<string, string[]>;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

class ProfileService {
  async updateProfile(data: UpdateProfileData): Promise<UpdateProfileResponse> {
    try {
      const response = await api.post<UpdateProfileResponse>(API_ENDPOINTS.UPDATE_PROFILE, data);
      return response.data;
    } catch (error: any) {
      return this.handleApiError(error);
    }
  }

  async logout(): Promise<LogoutResponse> {
    try {
      const response = await api.get<LogoutResponse>(API_ENDPOINTS.LOGOUT);
      return response.data;
    } catch (error: any) {
      console.error('Logout API error:', error);
      // Even if API call fails, we should still clear local storage
      return {
        success: true,
        message: 'Logged out locally'
      };
    }
  }

  private handleApiError(error: any): never {
    if (error.response) {
      const apiError = error.response.data;
      throw apiError;
    } else if (error.request) {
      throw { message: 'Network error. Please check your connection.' };
    } else {
      throw { message: 'An unexpected error occurred.' };
    }
  }
}

export const profileService = new ProfileService();