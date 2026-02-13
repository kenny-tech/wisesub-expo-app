import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import AuthHeader from '../../components/auth/AuthHeader';
import OtpInput from '../../components/auth/OtpInput';
import { authService } from '../../services/authService';
import styles from '../../styles/authStyles';
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

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(APP_CONSTANTS.OTP_TIMER_DURATION);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

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

      // Call appropriate API based on OTP type
      if (otpType === APP_CONSTANTS.OTP_TYPES.SIGNUP) {
        // For signup OTP verification
        response = await authService.verifySignupOtp(payload);
      } else if (otpType === APP_CONSTANTS.OTP_TYPES.FORGOT_PASSWORD) {
        // For forgot password OTP verification
        response = await authService.verifyForgotPasswordOtp(payload);
      } else {
        // For other OTP types (like general verification)
        response = await authService.verifyOtp(payload);
      }

      // console.log('response: ',response.data.data)

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response.message || 'OTP verified successfully.',
        });

        // Handle navigation based on OTP type
        if (otpType === APP_CONSTANTS.OTP_TYPES.FORGOT_PASSWORD) {
          navigation.navigate('ResetPassword', {
            email,
            otp: otpToVerify,
            token: response.data.token,
          });
        } else if (otpType === APP_CONSTANTS.OTP_TYPES.SIGNUP) {
          // Activate account after signup OTP verification
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
    if (timer > 0) return;

    setResendLoading(true);
    setError('');

    try {
      const response = await authService.resendOtp(email, otpType);

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP Resent',
          text2: response.message || 'New OTP sent to your email.',
        });

        setTimer(APP_CONSTANTS.OTP_TIMER_DURATION);
        startTimer();
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
      case APP_CONSTANTS.OTP_TYPES.SIGNUP:
        return 'Verify Your Account';
      case APP_CONSTANTS.OTP_TYPES.FORGOT_PASSWORD:
        return 'Reset Password';
      default:
        return 'Verify OTP';
    }
  };

  const getSubtitle = () => {
    const baseText = `We've sent a 6-digit OTP to\n`;

    switch (otpType) {
      case APP_CONSTANTS.OTP_TYPES.SIGNUP:
        return `${baseText}${email}`;
      case APP_CONSTANTS.OTP_TYPES.FORGOT_PASSWORD:
        return `${baseText}${email}`;
      default:
        return `${baseText}${email}`;
    }
  };

  return (
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
          subtitle={getSubtitle()}
          showBackButton
          onBackPress={() => navigation.goBack()}
          logo={true}
        />

        <View style={styles.formContainer}>
          {/* OTP Input */}
          <OtpInput
            length={6}
            onOtpComplete={handleOtpComplete}
            autoFocus
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Verify Button */}
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

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={timer > 0 || resendLoading}
            >
              <Text
                style={[
                  styles.resendLink,
                  (timer > 0 || resendLoading) && styles.resendLinkDisabled,
                ]}
              >
                {resendLoading
                  ? 'Sending...'
                  : timer > 0
                    ? `Resend in ${timer}s`
                    : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Verification;