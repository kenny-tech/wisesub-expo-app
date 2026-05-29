/**
 * Signin.tsx — production-ready
 *
 * Biometric flow:
 *  1. Check token exists in SecureStore → show fingerprint/Face ID button
 *  2. On tap → prompt biometric → on success → read token → dispatch loginWithBiometric
 *  3. If token missing/revoked → clear biometric flag → show message to sign in with password
 */

import { showError } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Device from 'expo-device';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import AuthHeader from '../../components/auth/AuthHeader';
import FormInput from '../../components/auth/FormInput';
import PasswordInput from '../../components/auth/PasswordInput';
import { useBiometrics } from '../../hooks/useBiometrics';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  clearError,
  loginUser,
  loginWithBiometric,
} from '../../redux/slices/authSlice';
import { useTheme } from '../../theme/ThemeContext';
import { APP_CONSTANTS } from '../../utils/constants';
import { AuthValidators } from '../../utils/validators/authValidators';

const SigninScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch   = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const { colors }           = useTheme();

  const {
    isBiometricAvailable,
    isBiometricEnabled,
    biometricType,
    promptBiometric,
    getStoredToken,
    clearBiometricOnTokenRevoke,
  } = useBiometrics();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [deviceId, setDeviceId] = useState('');

  const styles = makeStyles(colors);

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setDeviceId(Device.osBuildId ?? Device.modelId ?? 'mobile-device');
      } catch (_) {}
      try {
        const saved = await AsyncStorage.getItem('userEmail');
        if (saved) setFormData((p) => ({ ...p, email: saved }));
      } catch (_) {}
    })();
  }, []);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => dispatch(clearError()), 10_000);
    return () => clearTimeout(t);
  }, [error, dispatch]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleInputChange = (field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  // ── Password login ─────────────────────────────────────────────────────────
  const handleSignin = async () => {
    const validation = AuthValidators.validateLogin(formData);
    setErrors(validation.errors);
    if (!validation.isValid) return;

    try {
      await dispatch(loginUser({
        email:     formData.email.toLowerCase().trim(),
        password:  formData.password,
        channel:   APP_CONSTANTS.CHANNELS.MOBILE,
        device_id: deviceId,
      })).unwrap();

      // Persist email for pre-fill on next launch (non-sensitive)
      await AsyncStorage.setItem('userEmail', formData.email.toLowerCase().trim());

      navigation.navigate('Tabs');
    } catch (err: any) {
      showError('Sign In Failed', err?.message ?? 'Please check your credentials.');
    }
  };

  // ── Biometric login ────────────────────────────────────────────────────────
  const handleBiometricLogin = async () => {
    try {
      // Step 1: ensure a token exists before bothering the user
      const token = await getStoredToken();
      if (!token) {
        // Token was wiped (e.g. logout on another device)
        await clearBiometricOnTokenRevoke();
        Alert.alert(
          'Sign In Required',
          'Your session has expired. Please sign in with your password to re-enable biometric login.',
        );
        return;
      }

      // Step 2: show biometric prompt
      const authenticated = await promptBiometric(`Sign in with ${biometricType}`);
      if (!authenticated) return; // user cancelled or failed — do nothing

      // Step 3: restore session using the stored token
      await dispatch(loginWithBiometric(token)).unwrap();

      navigation.navigate('Tabs');
    } catch (err: any) {
      // If the error is NO_PROFILE the local data was wiped; ask them to
      // sign in with password.
      if (err?.message === 'NO_PROFILE') {
        await clearBiometricOnTokenRevoke();
        Alert.alert(
          'Sign In Required',
          'Your session data was cleared. Please sign in with your password.',
        );
        return;
      }
      showError('Biometric Login Failed', err?.message ?? 'Please try again.');
    }
  };

  // Show biometric button only when hardware is available AND user opted in
  const showBiometricButton = isBiometricAvailable && isBiometricEnabled;

  // ── Render ─────────────────────────────────────────────────────────────────
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
          <FormInput
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(t) => handleInputChange('email', t)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            showLabel={false}
          />

          <PasswordInput
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(t) => handleInputChange('password', t)}
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

          {/* Primary: Sign In with password */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignin}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={styles.buttonText}>Sign In</Text>}
          </TouchableOpacity>

          {/* Secondary: Biometric sign-in */}
          {showBiometricButton && (
            <TouchableOpacity
              style={[styles.biometricButton, isLoading && styles.buttonDisabled]}
              onPress={handleBiometricLogin}
              disabled={isLoading}
            >
              <Ionicons
                name={biometricType === 'Face ID' ? 'scan-outline' : 'finger-print-outline'}
                size={22}
                color={colors.primary}
              />
              <Text style={styles.biometricText}>
                Sign in with {biometricType}
              </Text>
            </TouchableOpacity>
          )}

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

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container:     { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1 },
    formContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 20 },

    button: {
      width: '100%', maxWidth: 320, height: 48,
      backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
      borderRadius: 6, marginTop: 20,
    },
    buttonDisabled:           { opacity: 0.6 },
    buttonText:               { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-SemiBold' },

    biometricButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      width: '100%', maxWidth: 320, height: 48,
      borderRadius: 6, borderWidth: 1.5, borderColor: colors.primary,
      marginTop: 12, gap: 8, backgroundColor: colors.primaryLight,
    },
    biometricText: { color: colors.primary, fontSize: 15, fontFamily: 'Poppins-SemiBold' },

    forgotPasswordContainer: {
      width: '100%', maxWidth: 320,
      alignItems: 'flex-end', marginTop: 8, marginBottom: 20,
    },
    forgotPasswordText: { color: colors.primary, fontSize: 14, fontFamily: 'Poppins-Regular' },

    errorText: {
      color: colors.error, fontSize: 14, fontFamily: 'Poppins-Regular',
      textAlign: 'center', marginBottom: 16,
    },
    linkContainer: { marginTop: 15 },
    linkText:      { fontSize: 14, color: colors.textSecondary, fontFamily: 'Poppins-Regular' },
    link:          { color: colors.primary, fontFamily: 'Poppins-SemiBold' },
  });

export default SigninScreen;