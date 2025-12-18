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
import { showError, showSuccess } from "../utils/toast";

export default function ProfileInfo({ navigation }: { navigation: any }) {
  const { user, loading, errors, clearFieldError, handleUpdateProfile } = useProfile();

  const [phone, setPhone] = useState<string>(user?.phone || "");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      if (user?.phone) {
        setPhone(user.phone);
      }
    }, [user?.phone])
  );

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    if (errors.phone) {
      clearFieldError('phone');
    }
  };

  const handleUpdate = async () => {
    // Validate phone number
    if (phone.trim() === '') {
      showError('Error', 'Phone number is required');
      return;
    }

    if (!/^\d{11}$/.test(phone.trim())) {
      showError('Error', 'Please enter a valid 11-digit phone number');
      return;
    }

    if (phone === user?.phone) {
      Toast.show({
        type: 'info',
        text1: 'Info',
        text2: 'No changes made to profile',
      });
      return;
    }

    const result = await handleUpdateProfile(phone);

    if (result.success) {
      showSuccess(
        'Success',
        result.message || 'Profile updated successfully'
      );
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  if (!user && loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1F54DD" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile Information</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1F54DD"]}
            tintColor="#1F54DD"
          />
        }
      >
        {/* Profile Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>{user?.name}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>{user?.email}</Text>
              {user?.email_verified_at && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputText}
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleUpdate}
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Update Profile</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={[styles.card, styles.dangerCard]}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>

          <TouchableOpacity
            style={styles.dangerItem}
            onPress={() => navigation.navigate('DeleteAccount')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#FECACA' }]}>
                <Ionicons name="trash" size={20} color="#DC2626" />
              </View>
              <Text style={styles.dangerText}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#0F172A',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
    marginLeft: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    position: 'absolute',
    right: 16,
    top: 14,
  },
  verifiedText: {
    color: '#065F46',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: '#1F54DD',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  dangerCard: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerTitle: {
    color: '#DC2626',
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dangerText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#DC2626',
  },
  footer: {
    height: 40,
  },
});