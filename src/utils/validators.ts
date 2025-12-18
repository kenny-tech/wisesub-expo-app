export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class AuthValidators {
  // Email validation
  static validateEmail(email: string): string | null {
    if (!email.trim()) return 'Email is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  // Password validation
  static validatePassword(password: string): string | null {
    if (!password.trim()) return 'Password is required';
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }
    return null;
  }

  // Phone validation
  static validatePhone(phone: string): string | null {
    if (!phone.trim()) return 'Phone number is required';
    
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(phone.trim())) {
      return 'Phone number must be 11 digits';
    }
    return null;
  }

  // Name validation
  static validateName(name: string): string | null {
    if (!name.trim()) return 'Name is required';
    
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    return null;
  }

  // OTP validation
  static validateOtp(otp: string): string | null {
    if (!otp.trim()) return 'OTP is required';
    
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp.trim())) {
      return 'OTP must be 6 digits';
    }
    return null;
  }

  // Confirm password validation
  static validateConfirmPassword(password: string, confirmPassword: string): string | null {
    if (!confirmPassword.trim()) return 'Please confirm your password';
    
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  }

  // Complete registration validation
  static validateRegistration(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }): ValidationResult {
    const errors: Record<string, string> = {};
    
    const nameError = this.validateName(data.name);
    if (nameError) errors.name = nameError;
    
    const emailError = this.validateEmail(data.email);
    if (emailError) errors.email = emailError;
    
    const phoneError = this.validatePhone(data.phone);
    if (phoneError) errors.phone = phoneError;
    
    const passwordError = this.validatePassword(data.password);
    if (passwordError) errors.password = passwordError;
    
    const confirmError = this.validateConfirmPassword(data.password, data.confirmPassword);
    if (confirmError) errors.confirmPassword = confirmError;
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Login validation
  static validateLogin(data: {
    email: string;
    password: string;
  }): ValidationResult {
    const errors: Record<string, string> = {};
    
    const emailError = this.validateEmail(data.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = this.validatePassword(data.password);
    if (passwordError) errors.password = passwordError;
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}