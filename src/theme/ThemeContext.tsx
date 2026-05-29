import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

// ─── Color Palette ───────────────────────────────────────────────────────────

export const LightColors = {
  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC',
  backgroundTertiary: '#F1F5F9',

  // Cards / Surfaces
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  cardShadow: '#000000',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Brand
  primary: '#1F54DD',
  primaryLight: '#F1F6FF',
  primaryBorder: '#C3D4F8',

  // Status
  success: '#10B981',
  successLight: '#ECFDF5',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  // Input
  inputBackground: '#FFFFFF',
  inputBorder: '#D9D9D9',
  inputBorderFocus: '#1F54DD',
  inputText: '#000000',
  inputPlaceholder: '#94A3B8',

  // Separator / Divider
  separator: '#F1F5F9',
  divider: '#E2E8F0',

  // Tab bar
  tabBar: '#FFFFFF',
  tabBarBorder: '#F1F5F9',
  tabActive: '#1F54DD',
  tabInactive: '#94A3B8',

  // Wallet card (always branded, not themed)
  walletCard: '#1F54DD',
  walletText: '#FFFFFF',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Icon containers
  iconContainerBlue: '#F1F6FF',
  iconContainerRed: '#FEF2F2',
  iconContainerGreen: '#ECFDF5',
};

export const DarkColors: typeof LightColors = {
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  backgroundTertiary: '#334155',

  card: '#1E293B',
  cardBorder: '#334155',
  cardShadow: '#000000',

  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  primary: '#4B79E4',
  primaryLight: '#1E293B',
  primaryBorder: '#334155',

  success: '#10B981',
  successLight: '#064E3B',
  error: '#EF4444',
  errorLight: '#450A0A',
  warning: '#F59E0B',
  warningLight: '#451A03',

  inputBackground: '#1E293B',
  inputBorder: '#334155',
  inputBorderFocus: '#4B79E4',
  inputText: '#F8FAFC',
  inputPlaceholder: '#64748B',

  separator: '#1E293B',
  divider: '#334155',

  tabBar: '#1E293B',
  tabBarBorder: '#334155',
  tabActive: '#4B79E4',
  tabInactive: '#64748B',

  walletCard: '#1F54DD',
  walletText: '#FFFFFF',

  overlay: 'rgba(0, 0, 0, 0.7)',

  iconContainerBlue: '#1E3A5F',
  iconContainerRed: '#450A0A',
  iconContainerGreen: '#064E3B',
};

export type AppColors = typeof LightColors;
export type ThemeMode = 'light' | 'dark' | 'system';

// ─── Context ─────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: AppColors;
  setMode: (mode: ThemeMode) => void;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  isDark: false,
  colors: LightColors,
  setMode: () => {},
  toggleDark: () => {},
});

const THEME_STORAGE_KEY = 'app_theme_mode';

// ─── Provider ────────────────────────────────────────────────────────────────

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setModeState] = useState<ThemeMode>('light');

  // Load saved preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved);
      }
    });
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  const toggleDark = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  // Resolve actual dark/light
  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const colors = isDark ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ mode, isDark, colors, setMode, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useTheme = () => useContext(ThemeContext);