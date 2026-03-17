import { showError } from '@/src/utils/toast';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api, API_ENDPOINTS } from './api';

// Types
export interface PushNotificationData {
  screen?: string;
  id?: string | number;
  [key: string]: any;
}

export interface PushNotificationResponse {
  success: boolean;
  data?: {
    token: string;
  };
  message: string;
}

export interface ExpoTokenResponse {
  success: boolean;
  data?: {
    id: number;
    user_id: number;
    token: string;
    platform: string | null;
    created_at: string;
    updated_at: string;
  };
  message: string;
}

// Correct trigger type for local notifications
type NotificationTrigger = {
  seconds: number;
} | {
  date: Date;
} | null;

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      // Check if running on physical device
      if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
      }

      // Check for existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token permissions');
        return null;
      }

      // Get Expo push token
      const token = await this.getExpoPushToken();
      
      if (token) {
        this.expoPushToken = token;
        console.log('Expo push token:', token);
        return token;
      }

      return null;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Get Expo push token
   */
  private async getExpoPushToken(): Promise<string | null> {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      if (!projectId) {
        console.log('EAS project ID not found in app config');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      return token.data;
    } catch (error) {
      console.error('Error getting Expo push token:', error);
      return null;
    }
  }

  /**
   * Send token to backend
   */
  async sendTokenToBackend(token: string, platform: string | null = null): Promise<boolean> {
    try {
      const response = await api.post<ExpoTokenResponse>(API_ENDPOINTS.CREATE_EXPO_TOKEN, {
        token: token,
        platform: platform || this.getPlatform()
      });

      if (response.data.success) {
        console.log('Push token sent to backend successfully');
        return true;
      } else {
        console.log('Failed to send push token to backend:', response.data.message);
        return false;
      }
    } catch (error: any) {
      console.error('Error sending push token to backend:', error);
      if (error.response?.data?.message) {
        showError('Error', error.response.data.message);
      } else {
        showError('Error', 'Failed to save push notification token');
      }
      return false;
    }
  }

  /**
   * Get current Expo token from backend
   */
  async getTokenFromBackend(): Promise<string | null> {
    try {
      const response = await api.get<PushNotificationResponse>(API_ENDPOINTS.GET_EXPO_TOKEN);
      
      if (response.data.success && response.data.data) {
        return response.data.data.token;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting push token from backend:', error);
      return null;
    }
  }

  /**
   * Delete token from backend (e.g., on logout)
   */
  async deleteTokenFromBackend(): Promise<boolean> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(API_ENDPOINTS.DELETE_EXPO_TOKEN);
      
      if (response.data.success) {
        console.log('Push token deleted from backend');
        this.expoPushToken = null;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting push token from backend:', error);
      return false;
    }
  }

  /**
   * Set up notification listeners
   */
  setupNotificationListeners(
    onNotification?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ): void {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        if (onNotification) {
          onNotification(notification);
        }
      }
    );

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
        if (onNotificationResponse) {
          onNotificationResponse(response);
        }
      }
    );
  }

  /**
   * Clean up notification listeners
   * Fixed: Use remove() method instead of removeNotificationSubscription
   */
  cleanupNotificationListeners(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  /**
   * Set Android notification channel
   */
  async setAndroidNotificationChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  /**
   * Get platform
   */
  getPlatform(): string {
    return Platform.OS;
  }

  /**
   * Get current Expo push token
   */
  getCurrentToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Schedule a local notification (for testing)
   * Fixed: Use proper trigger type
   */
  async scheduleLocalNotification(
    title: string, 
    body: string, 
    data: PushNotificationData = {}, 
    seconds: number = 5
  ): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
      },
      trigger: { 
        type: 'timeInterval',
        seconds: seconds
      } as Notifications.TimeIntervalTriggerInput,
    });
    
    return notificationId;
  }

  /**
   * Schedule a local notification for a specific date
   */
  async scheduleNotificationForDate(
    title: string,
    body: string,
    date: Date,
    data: PushNotificationData = {}
  ): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
      },
      trigger: {
        type: 'date',
        date: date,
      } as Notifications.DateTriggerInput,
    });
    
    return notificationId;
  }

  /**
   * Schedule a daily notification
   */
  async scheduleDailyNotification(
    title: string,
    body: string,
    hour: number,
    minute: number,
    data: PushNotificationData = {}
  ): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
      },
      trigger: {
        type: 'daily',
        hour: hour,
        minute: minute,
      } as Notifications.DailyTriggerInput,
    });
    
    return notificationId;
  }

  /**
   * Schedule a weekly notification
   */
  async scheduleWeeklyNotification(
    title: string,
    body: string,
    weekday: number,
    hour: number,
    minute: number,
    data: PushNotificationData = {}
  ): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
      },
      trigger: {
        type: 'weekly',
        weekday: weekday,
        hour: hour,
        minute: minute,
      } as Notifications.WeeklyTriggerInput,
    });
    
    return notificationId;
  }

  /**
   * Get all scheduled notifications
   */
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get device push token status
   */
  async getPermissionsStatus(): Promise<Notifications.PermissionResponse> {
    return await Notifications.getPermissionsAsync();
  }

  /**
   * Get last notification response
   */
  async getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
    return await Notifications.getLastNotificationResponseAsync();
  }

  /**
   * Dismiss all notifications
   */
  async dismissAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Dismiss a specific notification
   */
  async dismissNotification(notificationId: string): Promise<void> {
    await Notifications.dismissNotificationAsync(notificationId);
  }
}

export const pushNotificationService = new PushNotificationService();