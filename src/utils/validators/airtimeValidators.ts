export interface AirtimeFormData {
  phone: string;
  network: string | null;
  amount: string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class AirtimeValidators {
  static validateAirtimeForm(data: AirtimeFormData): ValidationResult {
    const errors: Record<string, string> = {};

    // Network validation
    if (!data.network) {
      errors.network = 'Please select a network provider';
    }

    // Phone validation
    if (!data.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{11}$/.test(data.phone.trim())) {
      errors.phone = 'Please enter a valid 11-digit phone number';
    }

    // Amount validation
    if (!data.amount) {
      errors.amount = 'Amount is required';
    } else if (parseFloat(data.amount) < 50) {
      errors.amount = 'Minimum amount is ₦50';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}