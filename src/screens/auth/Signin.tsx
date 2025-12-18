import { showError } from '@/src/utils/toast';
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
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearError, loginUser } from '../../redux/slices/authSlice';
import styles from '../../styles/authStyles';
import { APP_CONSTANTS } from '../../utils/constants';
import { AuthValidators } from '../../utils/validators';

const SigninScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    getDeviceId();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

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
    const validation = AuthValidators.validateLogin(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSignin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        channel: APP_CONSTANTS.CHANNELS.MOBILE,
        device_id: deviceId,
      };

      await dispatch(loginUser(payload)).unwrap();
      navigation.navigate('Tabs');
    } catch (error: any) {
      console.log('Login error:', error);
      showError('Error', error);
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
          title="Welcome Back"
          subtitle="Sign in to your account"
          showBackButton={false}
          logo
        />

        <View style={styles.formContainer}>
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

          {/* Password Input - No label */}
          <PasswordInput
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            error={errors.password}
            showLabel={false}
          />

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.linkText}>
              Don't have an account?{' '}
              <Text style={styles.link}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SigninScreen;