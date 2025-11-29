import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from 'react-native-toast-message';
import { profileStyles as styles } from '../styles/sharedStyles';

// Mock data - replace with your actual API calls
const mockProfileData = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "08012345678"
};

export default function ProfileInfo({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: ""
  });

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const t = setTimeout(() => {
        setProfile(mockProfileData);
        setLoading(false);
      }, 1000);
      return () => clearTimeout(t);
    }, [])
  );

  const handleUpdateProfile = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully!',
      });
      setLoading(false);
    }, 1500);
  };

  if (loading && !profile.name) {
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>{profile.name}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>{profile.email}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={[styles.inputContainer, styles.editableInput]}>
              <Text style={styles.inputText}>{profile.phone}</Text>
              <TouchableOpacity>
                <Ionicons name="create-outline" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleUpdateProfile} 
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