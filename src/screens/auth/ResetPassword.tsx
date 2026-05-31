import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Text, TouchableOpacity, View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import AuthHeader from '../../components/auth/AuthHeader';
import PasswordInput from '../../components/auth/PasswordInput';
import { authService } from '../../services/authService';
import { makeAuthStyles } from '../../styles/authStyles';
import { useTheme } from '../../theme/ThemeContext';
import { AuthValidators } from '../../utils/validators/authValidators';

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, otp, token } = route.params as { email: string; otp: string; token: string };
  const { colors } = useTheme();
  const styles = makeAuthStyles(colors);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const passwordError = AuthValidators.validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    const confirmError = AuthValidators.validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmError) newErrors.confirmPassword = confirmError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await authService.resetPassword({ email: email.toLowerCase().trim(), otp, password: formData.password, confirm_password: formData.confirmPassword, token });
      if (response?.success) {
        Toast.show({ type: 'success', text1: 'Password Reset', text2: response.message || 'Your password has been reset successfully.' });
        navigation.navigate('Signin');
      }
    } catch (apiError: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: apiError.message || 'Failed to reset password.' });
    } finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <AuthHeader title="Reset Password" subtitle="Create a new password for your account" showBackButton onBackPress={() => navigation.goBack()} logo />
          <View style={styles.formContainer}>
            <PasswordInput placeholder="Enter new password" value={formData.password} onChangeText={(t) => handleInputChange('password', t)} error={errors.password} showPasswordHint />
            <PasswordInput placeholder="Confirm new password" value={formData.confirmPassword} onChangeText={(t) => handleInputChange('confirmPassword', t)} error={errors.confirmPassword} isConfirmPassword passwordToMatch={formData.password} />
            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleResetPassword} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.buttonText}>Reset Password</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.navigate('Signin')}>
              <Text style={styles.linkText}>Back to <Text style={styles.link}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ResetPasswordScreen;