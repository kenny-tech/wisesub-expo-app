export const BASE_URL = 'http://localhost:8000/images';

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

export const NETWORK_PROVIDERS = [
    { name: "MTN", value: "mtn", logo: `${BASE_URL}/mtn.png` },
    { name: "Airtel", value: "airtel", logo: `${BASE_URL}/airtel.png` },
    { name: "Glo", value: "glo", logo: `${BASE_URL}/glo.png` },
    { name: "9 Mobile", value: "nineMobile", logo: `${BASE_URL}/ninemobile.png` }
];

export const PROVIDERS = [
    { name: "DSTV", value: "dstv", logo: `${BASE_URL}/dstv.png` },
    { name: "GOtv", value: "gotv", logo: `${BASE_URL}/gotv.png` },
    { name: "Startimes", value: "startimes", logo: `${BASE_URL}/startimes.png` }
];
