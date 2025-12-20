import { api, API_ENDPOINTS } from './api';

export interface CommissionConfig {
  id?: number;
  commission_type: 'percent' | 'fixed';
  customer_commission: number;
  agent_commission: number;
  service_type: string;
  created_at?: string;
  updated_at?: string;
}

export interface CommissionResponse {
  success: boolean;
  data?: CommissionConfig;
  message?: string;
}

class CommissionService {
  /**
   * Fetch commission configuration for a specific service type
   * @param serviceType - Type of service (e.g., 'Data', 'Airtime', 'Electricity')
   */
  async getCommissionConfig(serviceType: string): Promise<CommissionResponse> {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.VTPASS_COMMISSION}?type=${serviceType}`
      );
      
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Error fetching commission config:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch commission configuration'
      };
    }
  }

  /**
   * Calculate commission based on amount and commission configuration
   * @param amount - Transaction amount
   * @param commissionConfig - Commission configuration object
   * @returns Calculated commission amount
   */
  calculateCommission(amount: number, commissionConfig: CommissionConfig | null): number {
    if (!commissionConfig || amount <= 0) {
      return 0;
    }

    if (commissionConfig.commission_type === 'percent') {
      return (commissionConfig.customer_commission / 100) * amount;
    } else {
      return commissionConfig.customer_commission;
    }
  }

  /**
   * Format commission for display
   * @param commission - Commission amount
   * @param commissionConfig - Commission configuration
   * @returns Formatted commission text
   */
  getCommissionText(commission: number, commissionConfig: CommissionConfig | null): string {
    if (commission <= 0 || !commissionConfig) {
      return '';
    }

    if (commissionConfig.commission_type === 'percent') {
      return `You will earn ${commissionConfig.customer_commission}% (₦${commission.toFixed(2)})`;
    } else {
      return `You will earn: ₦${commission.toFixed(2)}`;
    }
  }
}

export const commissionService = new CommissionService();