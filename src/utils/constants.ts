export const APP_CONSTANTS = {
  OTP_TYPES: {
    SIGNUP: 'signup_otp',
    FORGOT_PASSWORD: 'forgot_password_otp',
    ACCOUNT_ACTIVATION: 'account_activation_otp'
  },
  
  CHANNELS: {
    MOBILE: 'mobile',
    WEB: 'web'
  },
  
  STORAGE_KEYS: {
    AUTH_TOKEN: '@auth_token',
    USER_DATA: '@user_data',
    DEVICE_ID: '@device_id'
  }
};

export const OTP_TIMER_DURATION = 60; // seconds