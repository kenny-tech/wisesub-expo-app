import { showError, showSuccess } from '@/src/utils/toast';
import { useNavigation } from '@react-navigation/native';
import * as Device from 'expo-device';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AuthHeader from '../../components/auth/AuthHeader';
import FormInput from '../../components/auth/FormInput';
import PasswordInput from '../../components/auth/PasswordInput';
import { authService } from '../../services/authService';
import styles from '../../styles/authStyles';
import { APP_CONSTANTS } from '../../utils/constants';
import { AuthValidators } from '../../utils/validators/authValidators';

const SignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getDeviceId();
  }, []);

  const getDeviceId = async () => {
    try {
      const deviceId = Device.osBuildId || Device.modelId || 'mobile-device';
      setDeviceId(deviceId);
    } catch (error) {
      console.log('Error getting device ID:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const validation = AuthValidators.validateRegistration(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirm_password: formData.confirmPassword,
        referral_code: formData.referralCode.trim() || undefined,
        channel: APP_CONSTANTS.CHANNELS.MOBILE,
        device_id: deviceId,
      };

      const response = await authService.register(payload);

      console.log('response: ', response);

      if (response?.success) {
        showSuccess(
          'Registration Successful',
          response.message || 'Please check your email for verification.'
        );

        navigation.navigate('Verification', {
          email: formData.email.toLowerCase().trim(),
          name: formData.name.trim(),
          otpType: APP_CONSTANTS.OTP_TYPES.SIGNUP,
        });
      }
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error: any) => {
    let errorMessage = 'Registration failed. Please try again.';

    if (error.errors) {
      const apiErrors: Record<string, string> = {};
      Object.entries(error.errors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          apiErrors[field] = messages[0];
        }
      });
      setErrors(apiErrors);
    } else if (error.message) {
      showError('Error', error.message);
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
          title="Create an Account"
          showBackButton
          onBackPress={() => navigation.goBack()}
          logo
        />

        <View style={styles.formContainer}>
          {/* Name Input - No label */}
          <FormInput
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            error={errors.name}
            autoCapitalize="words"
            showLabel={false}
          />

          {/* Email Input - No label */}
          <FormInput
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            showLabel={false}
          />

          {/* Phone Input - No label */}
          <FormInput
            placeholder="Enter your phone number"
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            error={errors.phone}
            keyboardType="phone-pad"
            showLabel={false}
          />

          {/* Password Input - No label */}
          <PasswordInput
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            error={errors.password}
            showLabel={false}
          />

          {/* Confirm Password Input - No label */}
          <PasswordInput
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChangeText={(text) => handleInputChange('confirmPassword', text)}
            error={errors.confirmPassword}
            showLabel={false}
          />

          {/* Referral Code Input - No label */}
          <FormInput
            placeholder="Enter referral code if any (Optional)"
            value={formData.referralCode}
            onChangeText={(text) => handleInputChange('referralCode', text)}
            error={errors.referralCode}
            showLabel={false}
          />

          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('Terms')}
            >
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('Privacy')}
            >
              Privacy Policy
            </Text>
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate('Signin')}
          >
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.link}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;