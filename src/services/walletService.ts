import { api, API_ENDPOINTS } from './api';

export interface WalletBalanceResponse {
  success: boolean;
  data: string;
  message?: string;
}

class WalletService {
  async getWalletBalance(): Promise<WalletBalanceResponse> {
    try {
      const response = await api.get<WalletBalanceResponse>(API_ENDPOINTS.WALLET_BALANCE);
      return response.data;
    } catch (error: any) {
      this.handleApiError(error);
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

export const walletService = new WalletService();