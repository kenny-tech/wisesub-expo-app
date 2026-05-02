import { api } from './api';

export interface ReferralUser {
  id: number;
  name: string;
}

export interface ReferralData {
  count: number;
  users: ReferralUser[];
}

export interface ReferralResponse {
  success: boolean;
  data: ReferralData;
  message: string;
}

class ReferralService {
  async getUserReferrals(): Promise<ReferralResponse> {
    try {
      const response = await api.get<ReferralResponse>('/user/referrals/user_referrals');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw error.response.data;
      } else if (error.request) {
        throw { message: 'Network error. Please check your connection.' };
      } else {
        throw { message: 'An unexpected error occurred.' };
      }
    }
  }
}

export const referralService = new ReferralService();