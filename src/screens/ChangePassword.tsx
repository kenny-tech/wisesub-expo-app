import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { ChangePasswordData, profileService } from "../services/profileService";
import { changePasswordStyles as styles } from '../styles/sharedStyles';
import { showError, showSuccess } from "../utils/toast";

interface PasswordErrors {
  current_password?: string;
  password?: string;
  confirm_password?: string;
}

export default function ChangePassword({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<ChangePasswordData>({
    current_password: "",
    password: "",
    confirm_password: ""
  });
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const validateForm = (): boolean => {
    const newErrors: PasswordErrors = {};
    let isValid = true;

    if (!formData.current_password.trim()) {
      newErrors.current_password = "Current password is required";
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "New password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    } else if (!/(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = "Must include uppercase, lowercase, number, and special character";
      isValid = false;
    }

    if (!formData.confirm_password.trim()) {
      newErrors.confirm_password = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await profileService.changePassword(formData);

      if (response.success) {
        showSuccess('Success', response.message || 'Password changed successfully!');

        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Signin' }],
          });
        }, 1500);
      } else {
        // Handle API validation errors
        if (response.errors) {
          const apiErrors: PasswordErrors = {};
          Object.keys(response.errors).forEach(key => {
            apiErrors[key as keyof PasswordErrors] = response.errors![key][0];
          });
          setErrors(apiErrors);

          // Show first error as toast
          const firstError = Object.values(apiErrors)[0];
          if (firstError) {
            showError('Error', firstError);
          }
        } else {
          showError('Error', response.message || 'Failed to change password');
        }
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      showError('Error', error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const clearFieldError = (field: keyof PasswordErrors) => {
    setErrors(prev => ({
      ...prev,
      [field]: undefined
    }));
  };

  const toggleShowPassword = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
        <View style={styles.placeholder} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.description}>
              Create a strong password with at least 8 characters including uppercase letters, numbers and special character.
            </Text>

            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { paddingTop: 20 }]}>Current Password</Text>
              <View style={[styles.inputContainer, errors.current_password && styles.inputError]}>
                <Ionicons name="lock-closed" size={20} color="#64748B" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter current password"
                  secureTextEntry={!showPasswords.current}
                  value={formData.current_password}
                  onChangeText={(text) => {
                    setFormData({ ...formData, current_password: text });
                    clearFieldError('current_password');
                  }}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => toggleShowPassword('current')}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPasswords.current ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
              {errors.current_password && (
                <Text style={styles.errorText}>{errors.current_password}</Text>
              )}
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed" size={20} color="#64748B" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter new password"
                  secureTextEntry={!showPasswords.new}
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData({ ...formData, password: text });
                    clearFieldError('password');
                  }}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => toggleShowPassword('new')}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPasswords.new ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
              <Text style={styles.hintText}>
                Must be at least 8 characters with uppercase, number, and special character
              </Text>
            </View>

            {/* Confirm New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={[styles.inputContainer, errors.confirm_password && styles.inputError]}>
                <Ionicons name="lock-closed" size={20} color="#64748B" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirm new password"
                  secureTextEntry={!showPasswords.confirm}
                  value={formData.confirm_password}
                  onChangeText={(text) => {
                    setFormData({ ...formData, confirm_password: text });
                    clearFieldError('confirm_password');
                  }}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => toggleShowPassword('confirm')}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPasswords.confirm ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirm_password && (
                <Text style={styles.errorText}>{errors.confirm_password}</Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleChangePassword}
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}