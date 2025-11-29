import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from 'react-native-toast-message';
import { changePasswordStyles as styles } from '../styles/sharedStyles';

export default function ChangePassword({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    };

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
      valid = false;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
      valid = false;
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
      valid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Password changed successfully!',
      });
      setLoading(false);
      navigation.goBack();
    }, 1500);
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.description}>
            Create a strong password with at least 8 characters including letters, numbers and special character.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, {paddingTop: 20}]}>Current Password</Text>
            <View style={[styles.inputContainer, errors.currentPassword && styles.inputError]}>
              <Ionicons name="lock-closed" size={20} color="#64748B" />
              <TextInput
                style={styles.textInput}
                placeholder="Enter current password"
                secureTextEntry
                value={formData.currentPassword}
                onChangeText={(text) => setFormData({...formData, currentPassword: text})}
                placeholderTextColor="#94A3B8"
              />
            </View>
            {errors.currentPassword ? (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={[styles.inputContainer, errors.newPassword && styles.inputError]}>
              <Ionicons name="lock-closed" size={20} color="#64748B" />
              <TextInput
                style={styles.textInput}
                placeholder="Enter new password"
                secureTextEntry
                value={formData.newPassword}
                onChangeText={(text) => setFormData({...formData, newPassword: text})}
                placeholderTextColor="#94A3B8"
              />
            </View>
            {errors.newPassword ? (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
              <Ionicons name="lock-closed" size={20} color="#64748B" />
              <TextInput
                style={styles.textInput}
                placeholder="Confirm new password"
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
                placeholderTextColor="#94A3B8"
              />
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

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

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}