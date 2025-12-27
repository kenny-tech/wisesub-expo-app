import { api, API_ENDPOINTS } from './api';

export interface WalletBalanceResponse {
  success: boolean;
  data: string;
  message?: string;
}

export interface Transaction {
  id: number;
  name: string;
  type: string;
  created_at: string;
  amount: string;
  provider_logo?: string;
  electricity_token?: string;
  customer?: string;
  units?: string;
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  message?: string;
}

export interface TransactionsParams {
  page?: number;
  limit?: number;
  type?: string;
}

export interface BankTransferRequest {
  email: string;
  amount: number;
}

export interface BankTransferData {
  account_number: string;
  account_status: string;
  amount: string;
  bank_name: string;
  created_at: string;
  expiry_date: string;
  flw_ref: string;
  frequency: number;
  note: string;
  order_ref: string;
  response_code: string;
  response_message: string;
}

export interface BankTransferResponse {
  status: 'success' | 'error';
  data: BankTransferData;
  message: string;
}

export interface CardPaymentRequest {
  amount: number;
  tx_ref: string;
  status: string;
  transaction_id: string;
}

export interface CardPaymentResponse {
  success: boolean;
  message: string;
  data?: {
    transaction_id: string;
    amount: number;
    status: string;
    reference: string;
  };
}

export interface CommissionTotal {
  type: string;
  total_amount: string;
  transaction_count: number;
}

export interface CommissionTotalsResponse {
  success: boolean;
  data: CommissionTotal[];
  message?: string;
}

export interface CommissionTotalsParams {
  type?: 'COMMISSION' | 'REFERRAL_COMMISSION' | string;
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

  async getTransactions(params?: TransactionsParams): Promise<TransactionsResponse> {
    try {
      const response = await api.get<TransactionsResponse>(API_ENDPOINTS.TRANSACTIONS, {
        params: {
          limit: params?.limit || 5,
          page: params?.page || 1,
          ...(params?.type && { type: params.type }),
        }
      });
      return response.data;
    } catch (error: any) {
      this.handleApiError(error);
    }
  }

  async getCommissionTotals(params?: CommissionTotalsParams): Promise<CommissionTotalsResponse> {
    try {
      const response = await api.get<CommissionTotalsResponse>(
        API_ENDPOINTS.COMMISSION_TOTAL,
        {
          params: {
            type: params?.type || 'COMMISSION',
          }
        }
      );
      return response.data;
    } catch (error: any) {
      this.handleApiError(error);
    }
  }

  async getCommissions(params?: TransactionsParams): Promise<TransactionsResponse> {
    try {
      const response = await api.get<TransactionsResponse>(API_ENDPOINTS.TRANSACTIONS, {
        params: {
          limit: params?.limit || 20,
          page: params?.page || 1,
          type: 'COMMISSION',
        }
      });
      return response.data;
    } catch (error: any) {
      this.handleApiError(error);
    }
  }


  async generateBankTransfer(data: BankTransferRequest): Promise<BankTransferResponse> {
    try {
      const response = await api.post<BankTransferResponse>(
        API_ENDPOINTS.GENERATE_BANK_TRANSFER,
        data
      );
      return response.data;
    } catch (error: any) {
      return this.handleApiError(error);
    }
  }

  async createCardPayment(data: CardPaymentRequest): Promise<CardPaymentResponse> {
    try {
      const response = await api.post<CardPaymentResponse>(
        API_ENDPOINTS.CREATE_PAYMENT,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('Card payment error:', error);
      return this.handleCardPaymentError(error);
    }
  }

  private handleCardPaymentError(error: any): CardPaymentResponse {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 422) {
        // Validation errors
        let errorMessage = 'Validation failed';
        if (data.errors) {
          const errors = data.errors;
          errorMessage = errorMessage;
        }
        return {
          success: false,
          message: errorMessage,
        };
      }

      if (status === 401) {
        return {
          success: false,
          message: 'Unauthenticated. Please login again.',
        };
      }

      return {
        success: false,
        message: data?.message || 'Payment processing failed',
      };
    }

    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
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