/**
 * useBiometrics
 *
 * HOW IT WORKS
 * ─────────────
 * 1. User logs in with email + password → server returns access_token.
 * 2. authSlice stores the token in SecureStore (see authSlice.ts).
 * 3. User can then enable biometric login — this only sets a boolean flag
 *    in SecureStore. No password is ever stored.
 * 4. On biometric login: prompt → success → read token from SecureStore
 *    → inject into Redux state → navigate to Tabs.
 * 5. On logout: token is revoked server-side, deleted from SecureStore,
 *    biometric flag is also cleared.
 * 6. If the token has been revoked (e.g. logout from another device):
 *    the API returns 401 → the app catches it, clears the flag, and shows
 *    a message asking the user to sign in with password to re-enable biometric.
 *
 * SecureStore keys
 * ─────────────────
 *  auth_token          → access token (written by authSlice, read here)
 *  biometric_enabled   → 'true' | absent
 *
 * Install: npx expo install expo-local-authentication expo-secure-store
 *
 * app.json (iOS):
 *   "infoPlist": {
 *     "NSFaceIDUsageDescription": "Sign in securely with Face ID."
 *   }
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';

export const SECURE_TOKEN_KEY      = 'auth_token';       // written by authSlice
export const SECURE_BIOMETRIC_KEY  = 'biometric_enabled';

export function useBiometrics() {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled,   setIsBiometricEnabled]   = useState(false);
  const [biometricType,        setBiometricType]         = useState('Biometric');

  useEffect(() => {
    checkHardware();
    loadFlag();
  }, []);

  // ── 1. Detect hardware ─────────────────────────────────────────────────────
  const checkHardware = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled  = await LocalAuthentication.isEnrolledAsync();
      const available   = hasHardware && isEnrolled;
      setIsBiometricAvailable(available);

      if (available) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Fingerprint');
        }
      }
    } catch (_) {
      setIsBiometricAvailable(false);
    }
  };

  // ── 2. Read / refresh the enabled flag ────────────────────────────────────
  const loadFlag = async () => {
    try {
      const val = await SecureStore.getItemAsync(SECURE_BIOMETRIC_KEY);
      setIsBiometricEnabled(val === 'true');
    } catch (_) {
      setIsBiometricEnabled(false);
    }
  };

  // ── 3. Show the biometric prompt ─────────────────────────────────────────
  const promptBiometric = useCallback(async (message?: string): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage:         message ?? 'Authenticate to continue',
        fallbackLabel:         'Use Password',
        cancelLabel:           'Cancel',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (_) {
      return false;
    }
  }, []);

  /**
   * getStoredToken
   * ──────────────
   * Called after a successful biometric prompt.
   * Returns the stored access_token, or null if it has been cleared
   * (e.g. after a server-side logout).
   */
  const getStoredToken = async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
    } catch (_) {
      return null;
    }
  };

  // ── 4. Enable biometric (called from Profile toggle) ─────────────────────
  /**
   * Asks the user to authenticate once to confirm intent, then sets the flag.
   * A stored token MUST already exist (i.e. user must be logged in).
   * Returns false if hardware auth fails or no token is present.
   */
  const enableBiometric = async (): Promise<boolean> => {
    // Guard: token must exist before we allow enabling biometric
    const token = await getStoredToken();
    if (!token) return false;

    const confirmed = await promptBiometric('Confirm identity to enable biometric login');
    if (!confirmed) return false;

    await SecureStore.setItemAsync(SECURE_BIOMETRIC_KEY, 'true');
    setIsBiometricEnabled(true);
    return true;
  };

  // ── 5. Disable biometric ─────────────────────────────────────────────────
  const disableBiometric = async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(SECURE_BIOMETRIC_KEY);
      setIsBiometricEnabled(false);
    } catch (_) {}
  };

  /**
   * clearBiometricOnTokenRevoke
   * ────────────────────────────
   * Call this whenever a 401 is received on a biometric-initiated session.
   * It disables the flag so the next launch shows the password form.
   */
  const clearBiometricOnTokenRevoke = async (): Promise<void> => {
    await disableBiometric();
  };

  return {
    isBiometricAvailable,
    isBiometricEnabled,
    biometricType,
    promptBiometric,
    getStoredToken,
    enableBiometric,
    disableBiometric,
    clearBiometricOnTokenRevoke,
    refreshState: loadFlag,
  };
}