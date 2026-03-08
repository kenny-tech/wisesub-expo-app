import { api, API_ENDPOINTS } from './api';

export interface DataPlan {
  variation_code: string;
  name: string;
  variation_amount: string | number;
  validity?: string;
  description?: string;

  // AWUF data plan fields (AidaPay)
  package_api_code?: string;
  package_name?: string;
  price?: string | number;
  aidapay_price?: string | number;
  provider_code?: string;

  // Flag to identify plan type
  isAwuf?: boolean;
}

export interface DataPlansResponse {
  success: boolean;
  content?: {
    varations: DataPlan[];
  };
  message?: string;
}

// AidaPay specific interfaces
export interface AidapayPackagesResponse {
  success: boolean;
  message?: string;
  data?: DataPlan[];
}

export interface AidapayPricingConfig {
  additional_amount: number;
  id: number;
}

export interface AidapayPricingResponse {
  success: boolean;
  message?: string;
  data?: AidapayPricingConfig;
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

  // AWUF specific fields (AidaPay)
  provider_code?: string;
  package_code?: string;
  aidapay_amount?: number;
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

export interface ValidateMeterPayload {
  serviceID: string;
  billersCode: string;
  type: string; // prepaid or postpaid
}

export interface ValidateMeterResponse {
  success: boolean;
  message?: string;
  data?: {
    code: string;
    response_description?: string;
    content: {
      Customer_Name?: string;
      Min_Purchase_Amount?: string;
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

  /**
   * Fetch AWUF data plans from AidaPay
   */
  async getAwufDataPlans(providerCode: string): Promise<AidapayPackagesResponse> {
    try {
      const response = await api.get(`${API_ENDPOINTS.AIDAPAY_PACKAGES}?provider_code=${providerCode}`);
      console.log('AidaPay API response:', response.data);

      // Transform AidaPay data to match our DataPlan interface
      if (response.data.success && response.data.data) {
        const plans = response.data.data.map((plan: any) => ({
          package_api_code: plan.package_api_code,
          package_name: plan.package_name,
          price: plan.price,
          aidapay_price: plan.aidapay_price,
          provider_code: providerCode,
          isAwuf: true
        }));

        return {
          success: true,
          data: plans,
          message: 'AWUF plans fetched successfully'
        };
      }

      return {
        success: false,
        message: response.data.message || 'Failed to fetch AWUF plans',
        data: []
      };
    } catch (error: any) {
      console.error('Failed to fetch AidaPay packages:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch AWUF plans',
        data: []
      };
    }
  }

  /**
   * Fetch AidaPay pricing configuration
   */
  async getAwufPricingConfig(): Promise<AidapayPricingResponse> {
    try {
      const response = await api.get(API_ENDPOINTS.AIDAPAY_PRICING_CONFIG);

      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Failed to fetch AidaPay pricing config:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch pricing config'
      };
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

  async validateMeter(payload: ValidateMeterPayload): Promise<ValidateMeterResponse> {
    try {
      const response = await api.post(`${API_ENDPOINTS.VERIFY_METER_NUMBER}`, payload);

      console.log('Meter validation response:', response.data);

      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Meter validation error:', error);
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