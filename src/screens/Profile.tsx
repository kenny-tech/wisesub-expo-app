import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Linking, Modal,
  ScrollView, StyleSheet, Switch, Text,
  TouchableOpacity, View,
} from 'react-native';
import { useBiometrics } from '../hooks/useBiometrics';
import { useAppDispatch } from '../redux/hooks';
import { useProfile } from '../redux/hooks/useProfile';
import { logoutUser } from '../redux/slices/authSlice';
import { useTheme } from '../theme/ThemeContext';

export default function Profile({ navigation }: { navigation: any }) {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [logoutLoading,      setLogoutLoading]      = useState(false);
  const [biometricToggling,  setBiometricToggling]  = useState(false);

  const dispatch       = useAppDispatch();
  const { user }       = useProfile();
  const { colors, isDark, toggleDark } = useTheme();

  const {
    isBiometricAvailable,
    isBiometricEnabled,
    biometricType,
    enableBiometric,
    disableBiometric,
  } = useBiometrics();

  const styles = makeStyles(colors);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await dispatch(logoutUser()).unwrap();
      // logoutUser clears SecureStore token + biometric flag automatically
      navigation.reset({ index: 0, routes: [{ name: 'Signin' }] });
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Something went wrong');
    } finally {
      setLogoutLoading(false);
      setLogoutModalVisible(false);
    }
  };

  // ── Biometric toggle ───────────────────────────────────────────────────────
  const handleBiometricToggle = async (value: boolean) => {
    if (biometricToggling) return;
    setBiometricToggling(true);
    try {
      if (value) {
        /**
         * Enable: the token is already in SecureStore from the last login.
         * enableBiometric() verifies the token exists, then prompts the
         * user once with biometric to confirm intent, then sets the flag.
         * No password is involved.
         */
        const success = await enableBiometric();
        if (!success) {
          Alert.alert(
            'Could Not Enable',
            'Biometric authentication was not confirmed, or your session has expired. Please sign in with your password first.',
          );
        }
      } else {
        await disableBiometric();
      }
    } finally {
      setBiometricToggling(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const openLink = (url: string) =>
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open link'));

  const getInitial = (name?: string) => (name ? name.charAt(0).toUpperCase() : 'U');

  // ── Sub-components ─────────────────────────────────────────────────────────
  const ProfileItem = ({
    icon, title, onPress, isDestructive = false, rightElement,
  }: {
    icon: React.ReactNode;
    title: string;
    onPress?: () => void;
    isDestructive?: boolean;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.profileItem}
      activeOpacity={rightElement ? 1 : 0.7}
    >
      <View style={styles.profileItemLeft}>
        <View style={[styles.iconContainer, isDestructive && styles.destructiveIcon]}>
          {icon}
        </View>
        <Text style={[styles.profileItemText, isDestructive && styles.destructiveText]}>
          {title}
        </Text>
      </View>
      {rightElement ?? (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDestructive ? colors.error : colors.textMuted}
        />
      )}
    </TouchableOpacity>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitial(user?.name)}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* ── Account ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <ProfileItem
              icon={<Ionicons name="person-outline" size={20} color={colors.primary} />}
              title="Profile Information"
              onPress={() => navigation.navigate('ProfileInfo')}
            />
            <ProfileItem
              icon={<Ionicons name="people-outline" size={20} color={colors.primary} />}
              title="Refer & Earn"
              onPress={() => navigation.navigate('Referral')}
            />
          </View>
        </View>

        {/* ── Appearance ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.sectionContent}>
            <ProfileItem
              icon={<Ionicons name={isDark ? 'moon' : 'sunny-outline'} size={20} color={colors.primary} />}
              title={isDark ? 'Dark Mode' : 'Light Mode'}
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={toggleDark}
                  trackColor={{ false: colors.divider, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              }
            />
          </View>
        </View>

        {/* ── Security ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.sectionContent}>
            <ProfileItem
              icon={<Ionicons name="lock-closed-outline" size={20} color={colors.primary} />}
              title="Change Password"
              onPress={() => navigation.navigate('ChangePassword')}
            />
            {isBiometricAvailable && (
              <ProfileItem
                icon={
                  <Ionicons
                    name={biometricType === 'Face ID' ? 'scan-outline' : 'finger-print-outline'}
                    size={20}
                    color={colors.primary}
                  />
                }
                title={`${biometricType} Login`}
                rightElement={
                  <Switch
                    value={isBiometricEnabled}
                    onValueChange={handleBiometricToggle}
                    trackColor={{ false: colors.divider, true: colors.primary }}
                    thumbColor="#FFFFFF"
                    disabled={biometricToggling}
                  />
                }
              />
            )}
          </View>
        </View>

        {/* ── Support ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContent}>
            <ProfileItem
              icon={<Ionicons name="help-circle-outline" size={20} color={colors.primary} />}
              title="Help & Support"
              onPress={() => navigation.navigate('Support')}
            />
            <ProfileItem
              icon={<Ionicons name="document-text-outline" size={20} color={colors.primary} />}
              title="Terms & Conditions"
              onPress={() => openLink('https://www.wisesub.com.ng/terms-and-conditions')}
            />
            <ProfileItem
              icon={<Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />}
              title="Privacy Policy"
              onPress={() => openLink('https://www.wisesub.com.ng/privacy-policy')}
            />
          </View>
        </View>

        {/* ── Log out ── */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <ProfileItem
              icon={<Ionicons name="log-out-outline" size={20} color={colors.error} />}
              title="Log Out"
              onPress={() => setLogoutModalVisible(true)}
              isDestructive
            />
          </View>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            Version {Application.nativeApplicationVersion ?? '1.0.0'}
          </Text>
        </View>
      </ScrollView>

      {/* ── Logout confirmation modal ── */}
      <Modal
        animationType="fade"
        transparent
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => !logoutLoading && setLogoutModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalIcon}>
              <Ionicons name="log-out-outline" size={32} color={colors.error} />
            </View>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setLogoutModalVisible(false)}
                disabled={logoutLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.logoutButton]}
                onPress={handleLogout}
                disabled={logoutLoading}
              >
                {logoutLoading
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : <Text style={styles.logoutButtonText}>Log Out</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    screen:        { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.background,
      paddingHorizontal: 20, paddingTop: 60, paddingBottom: 30,
      borderBottomWidth: 1, borderBottomColor: colors.separator,
    },
    profileHeader: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: colors.primary,
      justifyContent: 'center', alignItems: 'center',
      marginRight: 16,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
    },
    avatarText:    { color: '#FFFFFF', fontSize: 32, fontFamily: 'Poppins-Bold' },
    userInfo:      { flex: 1 },
    userName:      { fontSize: 24, fontFamily: 'Poppins-Bold',    color: colors.textPrimary, marginBottom: 4 },
    userEmail:     { fontSize: 16, fontFamily: 'Poppins-Regular', color: colors.textSecondary },
    section:       { marginTop: 8, paddingHorizontal: 20 },
    sectionTitle: {
      fontSize: 14, fontFamily: 'Poppins-SemiBold', color: colors.textSecondary,
      marginBottom: 12, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5,
    },
    sectionContent: {
      backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    },
    profileItem: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingVertical: 16, paddingHorizontal: 16,
      borderBottomWidth: 1, borderBottomColor: colors.separator,
    },
    profileItemLeft:   { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconContainer: {
      width: 40, height: 40, borderRadius: 12,
      backgroundColor: colors.iconContainerBlue,
      justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    destructiveIcon:   { backgroundColor: colors.iconContainerRed },
    profileItemText:   { fontSize: 16, fontFamily: 'Poppins-Medium', color: colors.textPrimary, flex: 1 },
    destructiveText:   { color: colors.error },
    versionContainer:  { alignItems: 'center', paddingVertical: 32 },
    versionText:       { fontSize: 14, fontFamily: 'Poppins-Regular', color: colors.textMuted },

    // Modal
    modalOverlay: {
      flex: 1, backgroundColor: colors.overlay,
      justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
    },
    modalContainer: {
      backgroundColor: colors.card, borderRadius: 24, padding: 24,
      alignItems: 'center', width: '100%', maxWidth: 400,
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1, shadowRadius: 16, elevation: 8,
    },
    modalIcon: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: colors.iconContainerRed,
      justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    modalTitle:       { fontSize: 20, fontFamily: 'Poppins-Bold',    color: colors.textPrimary, marginBottom: 8, textAlign: 'center' },
    modalDescription: { fontSize: 16, fontFamily: 'Poppins-Regular', color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    modalButtons:     { flexDirection: 'row', gap: 12, width: '100%' },
    modalButton:      { flex: 1, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    cancelButton:     { backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderColor: colors.divider },
    logoutButton:     { backgroundColor: colors.error },
    cancelButtonText: { fontSize: 16, fontFamily: 'Poppins-Medium', color: colors.textSecondary },
    logoutButtonText: { fontSize: 16, fontFamily: 'Poppins-Medium', color: '#FFFFFF' },
  });