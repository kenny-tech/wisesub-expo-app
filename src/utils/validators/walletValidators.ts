export interface BankTransferFormData {
  amount: string;
  email?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class WalletValidators {
  static validateBankTransferForm(data: BankTransferFormData): ValidationResult {
    const errors: Record<string, string> = {};

    // Amount validation
    if (!data.amount.trim()) {
      errors.amount = 'Amount is required';
    } else {
      const amountNum = parseFloat(data.amount);
      
      if (isNaN(amountNum)) {
        errors.amount = 'Please enter a valid amount';
      } else if (amountNum <= 0) {
        errors.amount = 'Amount must be greater than 0';
      } else if (amountNum < 100) {
        errors.amount = 'Minimum amount is ₦100';
      } else if (amountNum > 1000000) {
        errors.amount = 'Maximum amount is ₦1,000,000';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validateAmount(amount: string): string | null {
    if (!amount.trim()) {
      return 'Amount is required';
    }

    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum)) {
      return 'Please enter a valid amount';
    }
    
    if (amountNum <= 0) {
      return 'Amount must be greater than 0';
    }
    
    if (amountNum < 100) {
      return 'Minimum amount is ₦100';
    }
    
    if (amountNum > 1000000) {
      return 'Maximum amount is ₦1,000,000';
    }
    
    return null;
  }
}