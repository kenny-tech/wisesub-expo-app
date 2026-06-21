import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { profileService } from '../services/profileService';
import { useTheme } from '../theme/ThemeContext';
import { showError, showSuccess } from '../utils/toast';

interface PinErrors {
  password?: string;
  pin?: string;
  confirm_pin?: string;
}

export default function ChangePin({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    pin: '',
    confirm_pin: '',
  });
  const [errors, setErrors] = useState<PinErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: PinErrors = {};
    if (!formData.password.trim()) {
      newErrors.password = 'Current password is required';
    }
    if (!formData.pin || formData.pin.length !== 4) {
      newErrors.pin = 'PIN must be exactly 4 digits';
    } else if (!/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = 'PIN must contain only numbers';
    }
    if (formData.pin !== formData.confirm_pin) {
      newErrors.confirm_pin = 'PINs do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: keyof PinErrors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleChangePin = async () => {
    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (firstError) showError('Validation Error', firstError);
      return;
    }

    setLoading(true);
    try {
      const response = await profileService.changePin({
        password: formData.password,
        pin: formData.pin,
        confirm_pin: formData.confirm_pin,
      });

      if (response.success) {
        showSuccess('Success', response.message || 'PIN changed successfully!');
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        if (response.errors) {
          const apiErrors: PinErrors = {};
          Object.keys(response.errors).forEach(key => {
            apiErrors[key as keyof PinErrors] = response.errors![key][0];
          });
          setErrors(apiErrors);
          const firstError = Object.values(apiErrors)[0];
          if (firstError) showError('Error', firstError);
        } else {
          showError('Error', response.message || 'Failed to change PIN');
        }
      }
    } catch (error: any) {
      console.error('Change PIN error:', error);
      showError('Error', error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Change PIN</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { paddingTop: 20 }]}>Current Password</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter current password"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData({ ...formData, password: text });
                    clearError('password');
                  }}
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* New PIN */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New PIN</Text>
              <View style={[styles.inputContainer, errors.pin && styles.inputError]}>
                <Ionicons name="key-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter 4-digit PIN"
                  secureTextEntry={!showPin}
                  maxLength={4}
                  keyboardType="number-pad"
                  value={formData.pin}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '').slice(0, 4);
                    setFormData({ ...formData, pin: cleaned });
                    clearError('pin');
                  }}
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity
                  onPress={() => setShowPin(!showPin)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPin ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.pin && <Text style={styles.errorText}>{errors.pin}</Text>}
            </View>

            {/* Confirm PIN */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm PIN</Text>
              <View style={[styles.inputContainer, errors.confirm_pin && styles.inputError]}>
                <Ionicons name="key-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirm 4-digit PIN"
                  secureTextEntry={!showConfirmPin}
                  maxLength={4}
                  keyboardType="number-pad"
                  value={formData.confirm_pin}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '').slice(0, 4);
                    setFormData({ ...formData, confirm_pin: cleaned });
                    clearError('confirm_pin');
                  }}
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPin(!showConfirmPin)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showConfirmPin ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirm_pin && <Text style={styles.errorText}>{errors.confirm_pin}</Text>}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleChangePin}
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Change PIN</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (colors: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
    },
    backButton: { padding: 4 },
    title: { fontSize: 20, fontFamily: 'Poppins-SemiBold', color: colors.textPrimary },
    placeholder: { width: 32 },
    content: { flex: 1, paddingHorizontal: 20 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingBottom: 24,
      marginTop: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    inputGroup: { marginBottom: 16 },
    label: {
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.divider,
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.backgroundSecondary,
    },
    inputError: { borderColor: colors.error },
    textInput: {
      flex: 1,
      height: 48,
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
      color: colors.textPrimary,
      paddingHorizontal: 8,
    },
    eyeButton: { padding: 8 },
    errorText: {
      fontSize: 12,
      fontFamily: 'Poppins-Regular',
      color: colors.error,
      marginTop: 4,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: { opacity: 0.6 },
    primaryButtonText: {
      fontSize: 16,
      fontFamily: 'Poppins-SemiBold',
      color: '#FFFFFF',
    },
  });