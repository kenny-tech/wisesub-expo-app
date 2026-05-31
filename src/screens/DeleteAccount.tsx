import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useProfile } from '../redux/hooks/useProfile';
import { profileService } from '../services/profileService';
import { useTheme } from '../theme/ThemeContext';
import { showError, showSuccess } from '../utils/toast';

interface DeleteFormData { email: string; password: string; }
interface DeleteFormErrors { email?: string; password?: string; }

export default function DeleteAccount({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { user } = useProfile();
  const userEmail = user?.email || '';

  const [formData, setFormData] = useState<DeleteFormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<DeleteFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: DeleteFormErrors = {};
    if (!formData.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDeleteAccount = async () => {
    if (!validateForm()) return;
    formData.email = userEmail;
    Alert.alert(
      "Permanently Delete Account",
      "This action cannot be undone. All your data including wallet balance and transaction history will be permanently deleted. Are you sure you want to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await profileService.deleteAccount(formData);
              if (response.success) {
                showSuccess('Account Deleted', response.message || 'Your account has been successfully deleted.');
                await AsyncStorage.clear();
                setTimeout(() => { navigation.reset({ index: 0, routes: [{ name: 'Signin' }] }); }, 1500);
              } else { showError('Error', response.message || 'Failed to delete account'); }
            } catch (error: any) {
              if (error.errors) {
                const apiErrors: DeleteFormErrors = {};
                Object.keys(error.errors).forEach(key => { apiErrors[key as keyof DeleteFormErrors] = error.errors[key][0]; });
                setErrors(apiErrors);
                const firstError = Object.values(apiErrors)[0];
                if (firstError) showError('Error', firstError);
              } else showError('Error', error.message || 'Failed to delete account');
            } finally { setLoading(false); }
          }
        }
      ]
    );
  };

  const clearFieldError = (field: keyof DeleteFormErrors) => setErrors(prev => ({ ...prev, [field]: undefined }));
  const toggleShowPassword = () => setShowPassword(prev => !prev);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Delete Account</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Warning Section */}
          <View style={[styles.card, styles.warningCard, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}>
            <View style={styles.warningHeader}>
              <View style={[styles.warningIcon, { backgroundColor: '#FECACA' }]}>
                <Ionicons name="warning" size={32} color="#DC2626" />
              </View>
              <Text style={[styles.warningTitle, { color: '#DC2626' }]}>We're sad to see you go!</Text>
            </View>
            <Text style={[styles.warningText, { color: '#101010' }]}>
              Are you sure you want to delete your account? This action is permanent and cannot be undone.
            </Text>
            <View style={[styles.consequences, { backgroundColor: colors.card, borderColor: '#FECACA' }]}>
              <Text style={[styles.consequencesTitle, { color: colors.textPrimary }]}>You will lose:</Text>
              {['All your personal data', 'Transaction history', 'Wallet balance and rewards', 'All purchased services'].map((text, i) => (
                <View key={i} style={styles.consequenceItem}>
                  <Ionicons name="close-circle" size={16} color="#DC2626" />
                  <Text style={[styles.consequenceText, { color: colors.textSecondary }]}>{text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Confirmation Section */}
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Confirm Deletion</Text>
            <Text style={[styles.confirmationText, { color: colors.textSecondary }]}>
              To confirm account deletion, please enter your account email and password below.
            </Text>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Password</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: errors.password ? '#DC2626' : colors.divider }]}>
                <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="Enter your password"
                  value={formData.password}
                  placeholderTextColor={colors.textMuted}
                  onChangeText={(text) => { setFormData({ ...formData, password: text }); clearFieldError('password'); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text>}
              <Text style={[styles.helperText, { color: colors.textMuted }]}>Enter your password to confirm account deletion</Text>
            </View>

            {/* Delete Button */}
            <TouchableOpacity onPress={handleDeleteAccount} style={[styles.deleteButton, loading && styles.buttonDisabled]} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.deleteButtonText}>Delete Account</Text>}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.cancelButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }]} disabled={loading}>
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontFamily: 'Poppins-SemiBold' },
  placeholder: { width: 32 },
  keyboardAvoidingView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  bottomPadding: { height: 40 },
  card: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 20 },
  warningCard: { marginTop: 10 },
  warningHeader: { alignItems: 'center', marginBottom: 16 },
  warningIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  warningTitle: { fontSize: 20, fontFamily: 'Poppins-Bold', textAlign: 'center' },
  warningText: { fontSize: 14, fontFamily: 'Poppins-Regular', lineHeight: 20, marginBottom: 16, textAlign: 'center' },
  consequences: { borderRadius: 12, padding: 16, borderWidth: 1 },
  consequencesTitle: { fontSize: 14, fontFamily: 'Poppins-SemiBold', marginBottom: 12 },
  consequenceItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  consequenceText: { fontSize: 12, fontFamily: 'Poppins-Regular', marginLeft: 8 },
  sectionTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', marginBottom: 12 },
  confirmationText: { fontSize: 14, fontFamily: 'Poppins-Regular', lineHeight: 20, marginBottom: 16 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontFamily: 'Poppins-Medium', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, height: 56, borderWidth: 1 },
  textInput: { flex: 1, fontSize: 16, fontFamily: 'Poppins-Regular' },
  eyeButton: { padding: 4 },
  errorText: { fontSize: 12, fontFamily: 'Poppins-Regular', marginTop: 4 },
  helperText: { fontSize: 12, fontFamily: 'Poppins-Regular', marginTop: 4, fontStyle: 'italic' },
  deleteButton: { backgroundColor: '#DC2626', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  buttonDisabled: { opacity: 0.6 },
  deleteButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  cancelButton: { padding: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1 },
  cancelButtonText: { fontSize: 16, fontFamily: 'Poppins-Medium' },
});