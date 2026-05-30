import { showError, showSuccess } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Device from 'expo-device';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Linking,
  Platform, ScrollView, Text, TouchableOpacity, View,
} from 'react-native';
import AuthHeader from '../../components/auth/AuthHeader';
import FormInput from '../../components/auth/FormInput';
import PasswordInput from '../../components/auth/PasswordInput';
import { authService } from '../../services/authService';
import { makeAuthStyles } from '../../styles/authStyles';
import { useTheme } from '../../theme/ThemeContext';
import { APP_CONSTANTS } from '../../utils/constants';
import { AuthValidators } from '../../utils/validators/authValidators';

const SignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = makeAuthStyles(colors);

  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [showReferral, setShowReferral] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', referralCode: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { getDeviceId(); }, []);

  const getDeviceId = async () => {
    try { setDeviceId(Device.osBuildId || Device.modelId || 'mobile-device'); }
    catch (error) { console.log('Error getting device ID:', error); }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const validation = AuthValidators.validateRegistration(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(), email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(), password: formData.password,
        confirm_password: formData.confirmPassword,
        referral_code: formData.referralCode.trim() || undefined,
        channel: APP_CONSTANTS.CHANNELS.MOBILE, device_id: deviceId,
      };
      const response = await authService.register(payload);
      if (response?.success) {
        showSuccess('Registration Successful', response.message || 'Please check your email for verification.');
        navigation.navigate('Verification', { email: formData.email.toLowerCase().trim(), name: formData.name.trim(), otpType: APP_CONSTANTS.OTP_TYPES.SIGNUP });
      }
    } catch (error: any) {
      if (error.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) apiErrors[field] = messages[0];
        });
        setErrors(apiErrors);
      } else if (error.message) { showError('Error', error.message); }
    } finally { setLoading(false); }
  };

  const openLink = (url: string) => Linking.openURL(url).catch(() => showError('Error', 'Unable to open link'));

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AuthHeader title="Create an Account" showBackButton onBackPress={() => navigation.goBack()} logo />
        <View style={styles.formContainer}>
          <FormInput placeholder="Enter your full name" value={formData.name} onChangeText={(t) => handleInputChange('name', t)} error={errors.name} autoCapitalize="words" showLabel={false} />
          <FormInput placeholder="Enter your email" value={formData.email} onChangeText={(t) => handleInputChange('email', t)} error={errors.email} keyboardType="email-address" autoCapitalize="none" showLabel={false} />
          <FormInput placeholder="Enter your phone number" value={formData.phone} onChangeText={(t) => handleInputChange('phone', t)} error={errors.phone} keyboardType="phone-pad" showLabel={false} />
          <PasswordInput placeholder="Enter your password" value={formData.password} onChangeText={(t) => handleInputChange('password', t)} error={errors.password} showLabel={false} showPasswordHint />
          <PasswordInput placeholder="Confirm your password" value={formData.confirmPassword} onChangeText={(t) => handleInputChange('confirmPassword', t)} error={errors.confirmPassword} showLabel={false} isConfirmPassword passwordToMatch={formData.password} />

          <View style={styles.referralContainer}>
            <TouchableOpacity style={styles.referralToggle} onPress={() => { setShowReferral(v => !v); if (showReferral) handleInputChange('referralCode', ''); }} activeOpacity={0.7}>
              <Ionicons name="gift-outline" size={16} color={colors.primary} style={styles.referralIcon} />
              <Text style={styles.referralToggleText}>{showReferral ? 'Remove referral code' : 'I have a referral code'}</Text>
              <Ionicons name={showReferral ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
            </TouchableOpacity>
            {showReferral && (
              <FormInput placeholder="Enter referral code (Optional)" value={formData.referralCode} onChangeText={(t) => handleInputChange('referralCode', t)} error={errors.referralCode} showLabel={false} autoCapitalize="none" />
            )}
          </View>

          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.link} onPress={() => openLink('https://www.wisesub.com.ng/terms-and-conditions')}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.link} onPress={() => openLink('https://www.wisesub.com.ng/privacy-policy')}>Privacy Policy</Text>
          </Text>

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignup} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.buttonText}>Sign Up</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.navigate('Signin')}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.link}>Sign In</Text></Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 150 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;