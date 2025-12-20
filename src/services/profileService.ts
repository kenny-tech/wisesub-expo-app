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