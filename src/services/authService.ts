import { API_ENDPOINTS, authApi } from './api';

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  referral_code?: string;
  channel: string;
  device_id?: string;
}

export interface LoginData {
  email: string;
  password: string;
  channel: string;
  device_id?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    name: string;
    email: string;
    phone: string;
    referral_code: string;
    token: string;
  };
  message: string;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
  otp_type: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  password: string;
  confirm_password: string;
}

export interface ApiError {
  message?: string;
  errors?: Record<string, string[]>;
}

class AuthService {
  // Register new user - uses authApi (no token needed)
  async register(data: RegisterData) {
    try {
      const response = await authApi.post(API_ENDPOINTS.REGISTER, data);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // Login user - uses authApi (no token needed)
  async login(data: LoginData): Promise<LoginResponse> {
    try {
      const response = await authApi.post<LoginResponse>(API_ENDPOINTS.LOGIN, data);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // Verify Signup OTP - uses authApi (no token needed)
  async verifySignupOtp(data: VerifyOtpData) {
    try {
      const response = await authApi.post(API_ENDPOINTS.VERIFY_SIGNUP_OTP, data);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // Verify Forgot Password OTP - uses authApi (no token needed)
  async verifyForgotPasswordOtp(data: VerifyOtpData) {
    try {
      const response = await authApi.post(API_ENDPOINTS.VERIFY_FORGOT_PASSWORD_OTP, data);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // Verify OTP - uses authApi (no token needed)
  async verifyOtp(data: VerifyOtpData) {
    try {
      const response = await authApi.post(API_ENDPOINTS.VERIFY_OTP, data);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // Forgot password - uses authApi (no token needed)
  async forgotPassword(email: string) {
    try {
      const response = await authApi.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // Reset password - uses authApi (no token needed)
  async resetPassword(data: ResetPasswordData) {
    try {
      const response = await authApi.post(API_ENDPOINTS.RESET_PASSWORD, data);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // Resend OTP - uses authApi (no token needed)
  async resendOtp(email: string, otpType: string) {
    try {
      const response = await authApi.post(API_ENDPOINTS.RESEND_OTP, {
        email,
        otp_type: otpType
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // Activate account - uses authApi (no token needed)
  async activateAccount(email: string, otp: string) {
    try {
      const response = await authApi.post(API_ENDPOINTS.ACTIVATE_ACCOUNT, {
        email,
        otp
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // Handle API errors
  private handleApiError(error: any): never {
    if (error.response) {
      const apiError: ApiError = error.response.data;
      throw apiError;
    } else if (error.request) {
      throw { message: 'Network error. Please check your connection.' };
    } else {
      throw { message: 'An unexpected error occurred.' };
    }
  }
}

export const authService = new AuthService();