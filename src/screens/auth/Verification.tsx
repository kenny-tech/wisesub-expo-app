import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Text, TouchableOpacity, View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import AuthHeader from '../../components/auth/AuthHeader';
import OtpInput from '../../components/auth/OtpInput';
import { authService } from '../../services/authService';
import { makeAuthStyles } from '../../styles/authStyles';
import { useTheme } from '../../theme/ThemeContext';
import { APP_CONSTANTS } from '../../utils/constants';
import { AuthValidators } from '../../utils/validators/authValidators';

const Verification: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, otpType, name } = route.params as {
    email: string;
    otpType: string;
    name?: string;
  };

  const { colors } = useTheme();
  const styles = makeAuthStyles(colors);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(APP_CONSTANTS.OTP_TIMER_DURATION);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function to clear timer
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    clearTimer(); // clear any existing timer before starting a new one
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start timer on component mount
  useEffect(() => {
    startTimer();
    return () => clearTimer();
  }, []);

  const handleOtpComplete = async (completeOtp: string) => {
    setOtp(completeOtp);
    await verifyOtp(completeOtp);
  };

  const verifyOtp = async (otpCode?: string) => {
    const otpToVerify = otpCode || otp;
    const otpError = AuthValidators.validateOtp(otpToVerify);
    if (otpError) {
      setError(otpError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        email: email.toLowerCase().trim(),
        otp: otpToVerify,
        otp_type: otpType,
      };

      let response;

      if (otpType === APP_CONSTANTS.OTP_TYPES.SIGNUP) {
        response = await authService.verifySignupOtp(payload);
      } else if (otpType === APP_CONSTANTS.OTP_TYPES.FORGOT_PASSWORD) {
        response = await authService.verifyForgotPasswordOtp(payload);
      } else {
        response = await authService.verifyOtp(payload);
      }

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response.message || 'OTP verified successfully.',
        });

        if (otpType === APP_CONSTANTS.OTP_TYPES.FORGOT_PASSWORD) {
          navigation.navigate('ResetPassword', {
            email,
            otp: otpToVerify,
            token: response.data.token,
          });
        } else if (otpType === APP_CONSTANTS.OTP_TYPES.SIGNUP) {
          await activateAccount(otpToVerify);
        } else {
          navigation.navigate('Signin');
        }
      }
    } catch (apiError: any) {
      setError(apiError.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activateAccount = async (otpCode: string) => {
    try {
      const response = await authService.activateAccount(email, otpCode);
      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Account Activated',
          text2: 'Your account has been activated successfully.',
        });
        navigation.navigate('Signin');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to activate account.',
      });
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0 || resendLoading) return; // prevent if timer still active or already sending

    setResendLoading(true);
    setError('');

    try {
      const response = await authService.resendOtp(name, email, otpType);
      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP Resent',
          text2: response.message || 'New OTP sent to your email.',
        });
        setTimer(APP_CONSTANTS.OTP_TIMER_DURATION);
        startTimer(); // restart timer after resend
        setOtp('');
      }
    } catch (apiError: any) {
      setError(apiError.message || 'Failed to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  const getScreenTitle = () => {
    switch (otpType) {
      case APP_CONSTANTS.OTP_TYPES.SIGNUP: return 'Verify Your Account';
      case APP_CONSTANTS.OTP_TYPES.FORGOT_PASSWORD: return 'Reset Password';
      default: return 'Verify OTP';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader
            title={getScreenTitle()}
            subtitle={`We've sent a 6-digit OTP to\n${email}`}
            showBackButton
            onBackPress={() => navigation.goBack()}
            logo
          />
          <View style={styles.formContainer}>
            <OtpInput
              length={6}
              onOtpComplete={handleOtpComplete}
              autoFocus
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={() => verifyOtp()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>

              {timer > 0 ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.resendText, { color: colors.textSecondary }]}>
                    Resend in{' '}
                    <Text style={{ fontWeight: '600', color: colors.primary }}>{timer}s</Text>
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={resendLoading}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.resendLink, resendLoading && styles.resendLinkDisabled]}>
                    {resendLoading ? 'Sending...' : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Verification;