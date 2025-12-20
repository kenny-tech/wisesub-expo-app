import { api, API_ENDPOINTS } from './api';

export interface DataPlan {
  variation_code: string;
  name: string;
  variation_amount: string | number;
  validity?: string;
  description?: string;
}

export interface DataPlansResponse {
  success: boolean;
  content?: {
    varations: DataPlan[];
  };
  message?: string;
}

export interface PurchaseDataPayload {
  serviceID: string;
  variation_code: string;
  customer: string;
  type: string;
  service_type: string;
  provider_logo?: string;
  name: string;
  billersCode: string;
  phone: string;
  amount: number;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  data?: {
    transactionId: string;
    status: string;
  };
}

export interface NetworkProvider {
  value: string;
  name: string;
  serviceID: string;
  logo?: string;
}

export interface ValidateDecoderPayload {
  serviceID: string;
  billersCode: string;
}

export interface ValidateDecoderResponse {
  success: boolean;
  message?: string;
  data?: {
    code: string;
    content: {
      Customer_Name?: string;
      error?: string;
    };
  };
}

class BillService {
  async getDataPlans(serviceID: string): Promise<DataPlansResponse> {
    try {
      const response = await api.get(`${API_ENDPOINTS.VTPASS_VARIATION_CODES}?serviceID=${serviceID}`);
      console.log('Raw API response:', response.data);
      return {
        success: response.data.response_description === "000",
        content: response.data.content,
        message: response.data.response_description
      };
    } catch (error: any) {
      this.handleApiError(error);
    }
  }

  async purchaseData(payload: PurchaseDataPayload): Promise<PurchaseResponse> {
    try {
      const response = await api.post<PurchaseResponse>(API_ENDPOINTS.PAY_BILL, payload);
      return response.data;
    } catch (error: any) {
      return this.handleApiError(error);
    }
  }

 async validateDecoder(payload: ValidateDecoderPayload): Promise<ValidateDecoderResponse> {
    try {
      const response = await api.post(`${API_ENDPOINTS.VERIFY_DECODER_NUMBER}`, payload);
      
      console.log('Decoder validation response:', response.data);
      
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Decoder validation error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Validation failed. Please try again.'
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

export const billService = new BillService();