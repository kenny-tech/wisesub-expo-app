import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { SECURE_BIOMETRIC_KEY, SECURE_TOKEN_KEY } from '../../hooks/useBiometrics';
import { authService, LoginData, RegisterData } from '../../services/authService';
import { profileService } from '../../services/profileService';
import { APP_CONSTANTS } from '../../utils/constants';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfileData {
  phone: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Write the auth token to SecureStore (encrypted, hardware-backed). */
const persistToken = (token: string) =>
  SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);

/** Remove token + biometric flag from SecureStore on logout. */
const clearSecureStorage = async () => {
  await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
  await SecureStore.deleteItemAsync(SECURE_BIOMETRIC_KEY);
};

// Async Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: LoginData, { rejectWithValue }) => {
    try {
      const response = await authService.login(data);

      // Check if response has the expected structure
      if (!response || !response.success) {
        throw new Error(response?.message || 'Login failed');
      }

      if (!response.data) {
        throw new Error('Invalid response structure from server');
      }

      const userData = response.data;
      const token = userData.token;

      if (!token) {
        throw new Error('Authentication token missing');
      }

      // Remove token from user object before storing
      const { token: _, ...user } = userData;

      // ── Store token securely; user profile in plain AsyncStorage ──
      await persistToken(token);

      // Store in AsyncStorage
      await AsyncStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(
        APP_CONSTANTS.STORAGE_KEYS.USER_DATA,
        JSON.stringify(user)
      );

      return {
        token,
        user
      };
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data
      });
      return rejectWithValue(error.message || 'Login failed. Please check your credentials.');
    }
  }
);

/**
 * loginWithBiometric
 * ───────────────────
 * Called from Signin when the user authenticates with Face ID / Fingerprint.
 * The token is already in SecureStore — we just read it and restore the session.
 * If the token is absent or revoked (401), we return an error so the UI can
 * prompt the user to sign in with their password.
 */
export const loginWithBiometric = createAsyncThunk(
  'auth/loginBiometric',
  async (token: string, { rejectWithValue }) => {
    try {
      // Restore user profile from AsyncStorage (written during last password login)
      const userData = await AsyncStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USER_DATA);
      if (!userData) throw new Error('NO_PROFILE');

      return { token, user: JSON.parse(userData) as User };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Biometric login failed');
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // First call the logout API endpoint
      await profileService.logout();
      return true;
    } catch (error: any) {
      return true;
    } finally {
      await clearSecureStorage();
      // Even if API fails, still clear local storage
      await AsyncStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER_DATA);
      await AsyncStorage.removeItem('userEmail');
    }

  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USER_DATA);

      if (token && userData) {
        return {
          token,
          user: JSON.parse(userData)
        };
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Auth check failed');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: UpdateProfileData, { rejectWithValue, getState }) => {
    try {
      const response = await profileService.updateProfile(data);

      if (!response.success) {
        throw new Error(response.message || 'Profile update failed');
      }

      // Get current state to update user
      const state = getState() as { auth: AuthState };
      const currentUser = state.auth.user;

      if (!currentUser) {
        throw new Error('User not found in state');
      }

      // Update user data in AsyncStorage
      const updatedUser = {
        ...currentUser,
        phone: data.phone,
      };

      await AsyncStorage.setItem(
        APP_CONSTANTS.STORAGE_KEYS.USER_DATA,
        JSON.stringify(updatedUser)
      );

      return {
        user: updatedUser,
        message: response.message
      };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Biometric login
    builder
      .addCase(loginWithBiometric.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginWithBiometric.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = payload.token;
        state.user = payload.user;
      })
      .addCase(loginWithBiometric.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload as string;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    });

    // Check Auth Status
    builder.addCase(checkAuthStatus.fulfilled, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      }
    });

    // Update Profile
    builder.addCase(updateUserProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;