import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from 'react-native-toast-message';
import { useProfile } from "../redux/hooks/useProfile";
import { useTheme } from "../theme/ThemeContext";
import { showError, showSuccess } from "../utils/toast";

export default function ProfileInfo({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const { user, loading, errors, clearFieldError, handleUpdateProfile } = useProfile();
  const [phone, setPhone] = useState<string>(user?.phone || "");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      if (user?.phone) setPhone(user.phone);
    }, [user?.phone])
  );

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    if (errors.phone) clearFieldError('phone');
  };

  const handleUpdate = async () => {
    if (phone.trim() === '') { showError('Error', 'Phone number is required'); return; }
    if (!/^\d{11}$/.test(phone.trim())) { showError('Error', 'Please enter a valid 11-digit phone number'); return; }
    if (phone === user?.phone) { Toast.show({ type: 'info', text1: 'Info', text2: 'No changes made to profile' }); return; }
    const result = await handleUpdateProfile(phone);
    if (result.success) showSuccess('Success', result.message || 'Profile updated successfully');
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (!user && loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.separator }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Profile Information</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.divider }]}>
              <Text style={[styles.inputText, { color: colors.textPrimary }]}>{user?.name}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.divider }]}>
              <Text style={[styles.inputText, { color: colors.textPrimary }]}>{user?.email}</Text>
              {user?.email_verified_at && (
                <View style={[styles.verifiedBadge, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={[styles.verifiedText, { color: '#065F46' }]}>Verified</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.divider }]}>
              <TextInput
                style={[styles.inputText, { color: colors.textPrimary }]}
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            {errors.phone && <Text style={[styles.errorText, { color: colors.error }]}>{errors.phone}</Text>}
          </View>

          <TouchableOpacity
            onPress={handleUpdate}
            style={[styles.primaryButton, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
            disabled={loading}
          >
            {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Update Profile</Text>}
          </TouchableOpacity>
        </View>

        <View style={[styles.card, styles.dangerCard, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}>
          <Text style={[styles.sectionTitle, { color: '#DC2626' }]}>Danger Zone</Text>
          <TouchableOpacity style={styles.dangerItem} onPress={() => navigation.navigate('DeleteAccount')}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#FECACA' }]}>
                <Ionicons name="trash" size={20} color="#DC2626" />
              </View>
              <Text style={[styles.dangerText, { color: '#DC2626' }]}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer} />
        <View style={{ height: 150 }} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1 },
  backButton: { padding: 8 },
  title: { fontSize: 18, fontFamily: 'Poppins-SemiBold', textAlign: 'center' },
  placeholder: { width: 40 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  card: { borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontFamily: 'Poppins-Medium', marginBottom: 8 },
  inputContainer: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputText: { fontSize: 16, fontFamily: 'Poppins-Regular', flex: 1 },
  errorText: { fontSize: 12, fontFamily: 'Poppins-Regular', marginTop: 4, marginLeft: 4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  verifiedText: { fontSize: 12, fontFamily: 'Poppins-Medium', marginLeft: 4 },
  primaryButton: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  buttonDisabled: { opacity: 0.6 },
  dangerCard: { borderWidth: 1 },
  dangerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  dangerText: { fontSize: 16, fontFamily: 'Poppins-Medium' },
  footer: { height: 40 },
});