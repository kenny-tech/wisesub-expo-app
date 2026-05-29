/**
 * authStyles.ts  — theme-aware version
 *
 * Usage in any auth screen:
 *
 *   import { makeAuthStyles } from '../../styles/authStyles';
 *   import { useTheme } from '../../theme/ThemeContext';
 *
 *   const { colors } = useTheme();
 *   const styles = makeAuthStyles(colors);
 *
 * The default export is kept for screens that haven't been migrated yet —
 * it falls back to light-mode colours so nothing breaks.
 */

import { StyleSheet } from 'react-native';
import { AppColors, LightColors } from '../theme/ThemeContext';

export const makeAuthStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
    formContainer: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    button: {
      width: '100%',
      maxWidth: 320,
      height: 48,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 6,
      marginTop: 20,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontFamily: 'Poppins-SemiBold',
    },
    linkContainer: {
      marginTop: 15,
    },
    linkText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Poppins-Regular',
    },
    link: {
      color: colors.primary,
      fontFamily: 'Poppins-SemiBold',
    },
    termsText: {
      width: '100%',
      maxWidth: 320,
      textAlign: 'center',
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Poppins-Regular',
      marginTop: 2,
      lineHeight: 18,
    },
    forgotPasswordContainer: {
      width: '100%',
      maxWidth: 320,
      alignItems: 'flex-end',
      marginTop: 8,
      marginBottom: 20,
    },
    forgotPasswordText: {
      color: colors.primary,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
    },
    infoText: {
      width: '100%',
      maxWidth: 320,
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Poppins-Regular',
      textAlign: 'center',
      marginBottom: 30,
      lineHeight: 20,
    },
    passwordHint: {
      width: '100%',
      maxWidth: 320,
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Poppins-Regular',
      marginTop: 8,
      marginBottom: 20,
    },
    resendContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
    },
    resendText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Poppins-Regular',
    },
    resendLink: {
      color: colors.primary,
      fontFamily: 'Poppins-SemiBold',
    },
    resendLinkDisabled: {
      color: colors.textMuted,
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      textAlign: 'center',
      marginBottom: 16,
    },
    referralContainer: {
      width: '100%',
      marginBottom: 16,
    },
    referralToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
      backgroundColor: colors.primaryLight,
      marginBottom: 8,
      gap: 6,
    },
    referralIcon: {
      marginRight: 2,
    },
    referralToggleText: {
      fontSize: 13,
      fontFamily: 'Poppins-Medium',
      color: colors.primary,
    },
  });

// ─── Legacy default export (light mode only) ─────────────────────────────────
// Screens that import this directly still work without changes.
// Migrate them one by one using makeAuthStyles(colors).
const styles = makeAuthStyles(LightColors);
export default styles;