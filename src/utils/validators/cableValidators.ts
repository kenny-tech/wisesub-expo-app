export interface CableFormData {
  decoderNumber: string;
  provider: string | null;
  plan: string | null;
  phoneNumber: string;
  amount: string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class CableValidators {
  static validateCableForm(data: CableFormData): ValidationResult {
    const errors: Record<string, string> = {};

    // Provider validation
    if (!data.provider) {
      errors.provider = 'Please select a cable TV provider';
    }

    // Plan validation
    if (!data.plan) {
      errors.plan = 'Please select a cable plan';
    }

    // Decoder validation
    if (!data.decoderNumber.trim()) {
      errors.decoderNumber = 'Decoder number is required';
    } else if (!/^\d{10,}$/.test(data.decoderNumber.trim())) {
      errors.decoderNumber = 'Please enter a valid decoder number (min 10 digits)';
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
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}