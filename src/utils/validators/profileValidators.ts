export class ProfileValidators {
  static validatePhone(phone: string): { isValid: boolean; error?: string } {
    const trimmedPhone = phone.trim();
    
    if (trimmedPhone === '') {
      return { isValid: false, error: 'Phone number is required' };
    }
    
    if (!/^\d{11}$/.test(trimmedPhone)) {
      return { isValid: false, error: 'Please enter a valid 11-digit phone number' };
    }
    
    return { isValid: true };
  }

  static validateProfileUpdate(data: { phone: string }): { 
    isValid: boolean; 
    errors: Record<string, string> 
  } {
    const errors: Record<string, string> = {};
    
    const phoneValidation = this.validatePhone(data.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error || '';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}