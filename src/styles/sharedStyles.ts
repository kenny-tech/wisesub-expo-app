/**
 * sharedStyles.ts  — theme-aware version
 *
 * Usage in any screen:
 *
 *   import { makeSharedStyles, makeChangePasswordStyles } from '../../styles/sharedStyles';
 *   import { useTheme } from '../../theme/ThemeContext';
 *
 *   const { colors } = useTheme();
 *   const styles = makeChangePasswordStyles(colors);
 *
 * The default export is kept for screens that haven't been migrated yet —
 * it falls back to light-mode colours so nothing breaks.
 */

import { StyleSheet } from 'react-native';
import { AppColors, LightColors } from '../theme/ThemeContext';

// Base shared styles factory
export const makeSharedStyles = (colors: AppColors) =>
  StyleSheet.create({
    // Layout
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      backgroundColor: colors.background,
    },
    backButton: {
      padding: 4,
    },
    title: {
      fontSize: 18,
      fontFamily: "Poppins-SemiBold",
      color: colors.textPrimary,
    },
    placeholder: {
      width: 32,
    },
    hintText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: 'Poppins-Regular',
      marginTop: 4,
      marginLeft: 4,
      fontStyle: 'italic',
      lineHeight: 16,
    },
    eyeButton: {
      padding: 4,
      marginLeft: 8,
    },

    // Content
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    card: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.divider,
    },

    // Typography
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Poppins-SemiBold",
      color: colors.textPrimary,
      marginBottom: 16,
    },
    description: {
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.textSecondary,
      lineHeight: 20,
    },

    // Forms
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      fontFamily: "Poppins-Regular",
      color: colors.textPrimary,
      marginLeft: 12,
      padding: 0,
    },
    inputText: {
      flex: 1,
      fontSize: 16,
      fontFamily: "Poppins-Regular",
      color: colors.textPrimary,
      marginLeft: 12,
    },

    // Buttons
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontFamily: "Poppins-SemiBold",
    },

    // Menu Items
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
    },
    menuLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    menuText: {
      fontSize: 16,
      fontFamily: "Poppins-Medium",
      color: colors.textPrimary,
    },

    // Footer
    footer: {
      height: 20,
    },
  });

// Profile screen specific styles
export const makeProfileStyles = (colors: AppColors) =>
  StyleSheet.create({
    ...makeSharedStyles(colors),
    dangerCard: {
      backgroundColor: "#FEF2F2",
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "#FECACA",
    },
    dangerTitle: {
      fontSize: 16,
      fontFamily: "Poppins-SemiBold",
      color: "#DC2626",
      marginBottom: 16,
    },
    dangerText: {
      fontSize: 16,
      fontFamily: "Poppins-Medium",
      color: "#DC2626",
    },
    dangerItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
    },
    editableInput: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  });

// Change Password screen specific styles
export const makeChangePasswordStyles = (colors: AppColors) =>
  StyleSheet.create({
    ...makeSharedStyles(colors),
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      fontSize: 12,
      fontFamily: "Poppins-Regular",
      color: colors.error,
      marginTop: 4,
    },
    passwordHint: {
      fontSize: 12,
      fontFamily: 'Poppins-Regular',
      color: colors.primary,
      marginTop: 4,
      marginLeft: 4,
    },
  });

// Support screen specific styles
export const makeSupportStyles = (colors: AppColors) =>
  StyleSheet.create({
    ...makeSharedStyles(colors),
    supportHeader: {
      alignItems: "center",
      paddingVertical: 32,
      paddingHorizontal: 20,
    },
    supportTitle: {
      fontSize: 20,
      fontFamily: "Poppins-Bold",
      color: colors.textPrimary,
      marginTop: 16,
      marginBottom: 8,
      textAlign: "center",
    },
    supportDescription: {
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    contactMethods: {
      marginBottom: 20,
    },
    contactCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    contactLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    contactIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    contactText: {
      flex: 1,
    },
    contactTitle: {
      fontSize: 16,
      fontFamily: "Poppins-SemiBold",
      color: colors.textPrimary,
      marginBottom: 4,
    },
    contactDescription: {
      fontSize: 12,
      fontFamily: "Poppins-Regular",
      color: colors.textSecondary,
      lineHeight: 16,
    },
    infoCard: {
      backgroundColor: colors.primaryLight,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: `${colors.primary}20`,
    },
    infoTitle: {
      fontSize: 16,
      fontFamily: "Poppins-SemiBold",
      color: colors.textPrimary,
      marginBottom: 12,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.textSecondary,
      marginLeft: 8,
    },
  });

// ─── Legacy default exports (light mode only) ─────────────────────────────────
// Screens that still import directly from this file will continue to work.
// Migrate them one by one using the make*Styles(colors) functions.

const sharedStyles = makeSharedStyles(LightColors);
const profileStyles = makeProfileStyles(LightColors);
const changePasswordStyles = makeChangePasswordStyles(LightColors);
const supportStyles = makeSupportStyles(LightColors);

export {
  changePasswordStyles, profileStyles, sharedStyles, supportStyles
};

export default sharedStyles;