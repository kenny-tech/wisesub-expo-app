export interface ElectricityFormData {
  meterNumber: string;
  provider: string | null;
  phoneNumber: string;
  amount: string | null;
  meterType: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class ElectricityValidators {
  static validateElectricityForm(data: ElectricityFormData): ValidationResult {
    const errors: Record<string, string> = {};

    // Provider validation
    if (!data.provider) {
      errors.provider = 'Please select an electricity provider';
    }

    // Meter number validation
    if (!data.meterNumber.trim()) {
      errors.meterNumber = 'Meter number is required';
    } else if (!/^\d{11,}$/.test(data.meterNumber.trim())) {
      errors.meterNumber = 'Please enter a valid meter number (min 11 digits)';
    }

    // Phone number validation
    if (!data.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^(0|\+234)[7-9][0-1]\d{8}$/.test(data.phoneNumber.trim())) {
      errors.phoneNumber = 'Please enter a valid phone number (e.g., 08012345678 or +2348012345678)';
    }

    // Amount validation
    if (!data.amount) {
      errors.amount = 'Amount is required';
    } else if (parseFloat(data.amount) < 500) {
      errors.amount = 'Minimum amount is ₦500';
    }

    // Meter type validation
    if (!data.meterType) {
      errors.meterType = 'Please select meter type';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}