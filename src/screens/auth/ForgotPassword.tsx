import { useNavigation } from '@react-navigation/native';
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
import FormInput from '../../components/auth/FormInput';
import { authService } from '../../services/authService';
import styles from '../../styles/authStyles';
import { APP_CONSTANTS } from '../../utils/constants';
import { AuthValidators } from '../../utils/validators';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    const emailError = AuthValidators.validateEmail(email);

    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.forgotPassword(email.toLowerCase().trim());

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: response.message || 'Check your email for OTP.',
        });

        navigation.navigate('Verification', {
          email: email.toLowerCase().trim(),
          otpType: APP_CONSTANTS.OTP_TYPES.FORGOT_PASSWORD,
        });
      }
    } catch (apiError: any) {
      setError(apiError.message || 'Failed to send OTP. Please try again.');
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
          title="Forgot Password"
          subtitle="Enter your email to reset password"
          showBackButton
          onBackPress={() => navigation.goBack()}
          logo={true}
        />

        <View style={styles.formContainer}>
          {/* Keep label for forgot password since it's a single field */}
          <FormInput
            label="Email Address"
            placeholder="Enter your registered email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            error={error}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.infoText}>
            We'll send a 6-digit OTP to your email to reset your password.
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate('Signin')}
          >
            <Text style={styles.linkText}>
              Remember your password?{' '}
              <Text style={styles.link}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;