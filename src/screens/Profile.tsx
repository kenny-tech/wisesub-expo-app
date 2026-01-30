import { Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useAppDispatch } from "../redux/hooks";
import { useProfile } from "../redux/hooks/useProfile";
import { logoutUser } from "../redux/slices/authSlice";

export default function Profile({ navigation }: { navigation: any }) {
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  const dispatch = useAppDispatch();
  const { user } = useProfile();

  const handleLogoutModal = () => setIsLogoutModalVisible(() => !isLogoutModalVisible);

  const handleLogout = async () => {
    try {
      setLoading(true);
      
      // Call Redux logout thunk which clears AsyncStorage
      await dispatch(logoutUser()).unwrap();
      
      setLoading(false);
      handleLogoutModal();
      
      // Navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Signin' }],
      });
    } catch (error: any) {
      setLoading(false);
      console.error('Logout error:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  const getFirstCharacter = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const ProfileItem = ({
    icon,
    title,
    onPress,
    isDestructive = false
  }: {
    icon: React.ReactNode;
    title: string;
    onPress: () => void;
    isDestructive?: boolean;
  }) => (
    <TouchableOpacity onPress={onPress} style={styles.profileItem}>
      <View style={styles.profileItemLeft}>
        <View style={[styles.iconContainer, isDestructive && styles.destructiveIcon]}>
          {icon}
        </View>
        <Text style={[styles.profileItemText, isDestructive && styles.destructiveText]}>
          {title}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={isDestructive ? "#EF4444" : "#94A3B8"}
      />
    </TouchableOpacity>
  );

  // Logout Confirmation Modal
  const LogoutConfirmationModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isLogoutModalVisible}
      onRequestClose={handleLogoutModal}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={handleLogoutModal}
      >
        <View style={styles.modalContainer}>
          {/* Warning Icon */}
          <View style={styles.modalIcon}>
            <Ionicons name="log-out-outline" size={32} color="#EF4444" />
          </View>

          {/* Title */}
          <Text style={styles.modalTitle}>Log Out</Text>

          {/* Description */}
          <Text style={styles.modalDescription}>
            Are you sure you want to log out? You'll need to sign in again to access your account.
          </Text>

          {/* Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleLogoutModal}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.logoutButton]}
              onPress={handleLogout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.logoutButtonText}>Log Out</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getFirstCharacter(user?.name)}
                </Text>
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Profile Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <ProfileItem
              icon={<Ionicons name="person-outline" size={20} color="#1F54DD" />}
              title="Profile Information"
              onPress={() => navigation.navigate("ProfileInfo")}
            />
            <ProfileItem
              icon={<Ionicons name="people-outline" size={20} color="#1F54DD" />}
              title="Refer & Earn"
              onPress={() => navigation.navigate("Referral")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.sectionContent}>
            <ProfileItem
              icon={<Ionicons name="lock-closed-outline" size={20} color="#1F54DD" />}
              title="Change Password"
              onPress={() => navigation.navigate("ChangePassword")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContent}>
            <ProfileItem
              icon={<Ionicons name="help-circle-outline" size={20} color="#1F54DD" />}
              title="Help & Support"
              onPress={() => navigation.navigate("Support")}
            />
            <ProfileItem
              icon={<Ionicons name="document-text-outline" size={20} color="#1F54DD" />}
              title="Terms & Conditions"
              onPress={() => navigation.navigate("Terms")}
            />
            <ProfileItem
              icon={<Ionicons name="shield-checkmark-outline" size={20} color="#1F54DD" />}
              title="Privacy Policy"
              onPress={() => navigation.navigate("Privacy")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <ProfileItem
              icon={<Ionicons name="log-out-outline" size={20} color="#EF4444" />}
              title="Log Out"
              onPress={handleLogoutModal}
              isDestructive={true}
            />
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            Version {Application.nativeApplicationVersion || "1.0.0"}
          </Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1F54DD",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1F54DD",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontFamily: "Poppins-Bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#0F172A",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#64748B",
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#64748B",
    marginBottom: 12,
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  profileItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  destructiveIcon: {
    backgroundColor: "#FEF2F2",
  },
  profileItemText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#0F172A",
    flex: 1,
  },
  destructiveText: {
    color: "#EF4444",
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  versionText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#94A3B8",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  logoutButton: {
    backgroundColor: "#EF4444",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#64748B",
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#FFFFFF",
  },
});