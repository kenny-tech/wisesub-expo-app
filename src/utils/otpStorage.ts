import AsyncStorage from '@react-native-async-storage/async-storage';

const OTP_PARAMS_KEY = 'otpParams';

export interface OtpParams {
  email: string;
  name?: string;
  otpType: string; // 'signup_otp' or 'forgotpassword_otp'
}

export const saveOtpParams = async (params: OtpParams): Promise<void> => {
  try {
    await AsyncStorage.setItem(OTP_PARAMS_KEY, JSON.stringify(params));
  } catch (error) {
    console.log('Error saving OTP params:', error);
  }
};

export const getOtpParams = async (): Promise<OtpParams | null> => {
  try {
    const data = await AsyncStorage.getItem(OTP_PARAMS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.log('Error getting OTP params:', error);
    return null;
  }
};

export const clearOtpParams = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(OTP_PARAMS_KEY);
  } catch (error) {
    console.log('Error clearing OTP params:', error);
  }
};