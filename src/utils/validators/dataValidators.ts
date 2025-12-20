export class DataValidators {
  static validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
    const trimmedPhone = phone.trim();
    
    if (!trimmedPhone) {
      return { isValid: false, error: 'Phone number is required' };
    }
    
    if (!/^\d{11}$/.test(trimmedPhone)) {
      return { isValid: false, error: 'Phone number must be 11 digits' };
    }
    
    return { isValid: true };
  }

  static validateNetwork(network: string | null): { isValid: boolean; error?: string } {
    if (!network) {
      return { isValid: false, error: 'Please select a network provider' };
    }
    
    return { isValid: true };
  }

  static validateDataPlan(plan: string | null): { isValid: boolean; error?: string } {
    if (!plan) {
      return { isValid: false, error: 'Please select a data plan' };
    }
    
    return { isValid: true };
  }

  static validateDataForm(data: {
    phone: string;
    network: string | null;
    plan: string | null;
  }): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    
    const phoneValidation = this.validatePhoneNumber(data.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error || '';
    }
    
    const networkValidation = this.validateNetwork(data.network);
    if (!networkValidation.isValid) {
      errors.network = networkValidation.error || '';
    }
    
    const planValidation = this.validateDataPlan(data.plan);
    if (!planValidation.isValid) {
      errors.plan = planValidation.error || '';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}