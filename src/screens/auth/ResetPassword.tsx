import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
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
import PasswordInput from '../../components/auth/PasswordInput';
import { authService } from '../../services/authService';
import styles from '../../styles/authStyles';
import { AuthValidators } from '../../utils/validators';

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, otp, token } = route.params as { email: string; otp: string };

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const passwordError = AuthValidators.validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmError = AuthValidators.validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );
    if (confirmError) newErrors.confirmPassword = confirmError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: email.toLowerCase().trim(),
        otp,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        token,
      };

      const response = await authService.resetPassword(payload);

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Password Reset',
          text2: response.message || 'Your password has been reset successfully.',
        });

        navigation.navigate('Signin');
      }
    } catch (apiError: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: apiError.message || 'Failed to reset password.',
      });
    } finally {
      setLoading(false);
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
          title="Reset Password"
          subtitle="Create a new password for your account"
          showBackButton
          onBackPress={() => navigation.goBack()}
          logo={true}
        />

        <View style={styles.formContainer}>
          {/* New Password */}
          <PasswordInput
            label="New Password"
            placeholder="Enter new password"
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            error={errors.password}
          />

          {/* Confirm Password */}
          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChangeText={(text) => handleInputChange('confirmPassword', text)}
            error={errors.confirmPassword}
          />

          {/* Password Requirements */}
          <Text style={styles.passwordHint}>
            Password must be at least 8 characters with uppercase, lowercase, number, and special character.
          </Text>

          {/* Reset Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate('Signin')}
          >
            <Text style={styles.linkText}>
              Back to <Text style={styles.link}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;