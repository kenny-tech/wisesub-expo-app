import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../redux/hooks';
import { pushNotificationService } from '../services/pushNotificationService';

// Types
export interface NotificationData {
  screen?: string;
  id?: string | number;
  [key: string]: any;
}

export interface UsePushNotificationsReturn {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  lastNotificationResponse: Notifications.NotificationResponse | null;
  permissionStatus: Notifications.PermissionResponse | null;
  refreshPushToken: () => Promise<string | null>;
  sendTokenToBackend: (token: string) => Promise<boolean>;
  deleteTokenOnLogout: () => Promise<void>;
  scheduleLocalNotification: (
    title: string,
    body: string,
    data?: NotificationData,
    seconds?: number
  ) => Promise<string>;
  scheduleNotificationForDate: (
    title: string,
    body: string,
    date: Date,
    data?: NotificationData
  ) => Promise<string>;
  scheduleDailyNotification: (
    title: string,
    body: string,
    hour: number,
    minute: number,
    data?: NotificationData
  ) => Promise<string>;
  getAllScheduledNotifications: () => Promise<Notifications.NotificationRequest[]>;
  cancelScheduledNotification: (notificationId: string) => Promise<void>;
  cancelAllScheduledNotifications: () => Promise<void>;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [lastNotificationResponse, setLastNotificationResponse] = useState<Notifications.NotificationResponse | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionResponse | null>(null);
  
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const initialized = useRef<boolean>(false);

  /**
   * Initialize push notifications
   */
  const initializePushNotifications = useCallback(async (): Promise<void> => {
    if (initialized.current || !isAuthenticated) return;

    try {
      // Check permission status
      const status = await pushNotificationService.getPermissionsStatus();
      setPermissionStatus(status);

      // Set Android notification channel
      await pushNotificationService.setAndroidNotificationChannel();

      // Register for push notifications
      const token = await pushNotificationService.registerForPushNotifications();
      
      if (token) {
        setExpoPushToken(token);
        
        // Send token to backend after login
        await pushNotificationService.sendTokenToBackend(token);
      }

      // Get last notification response (if app was opened from notification)
      const lastResponse = await pushNotificationService.getLastNotificationResponse();
      setLastNotificationResponse(lastResponse);

      initialized.current = true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }, [isAuthenticated]);

  /**
   * Handle notification received
   */
  const handleNotification = useCallback((notification: Notifications.Notification): void => {
    setNotification(notification);
    console.log('Notification received in foreground:', notification);
  }, []);

  /**
   * Handle notification response (when user taps)
   */
  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse): void => {
    setLastNotificationResponse(response);
    const data = response.notification.request.content.data as NotificationData;
    
    console.log('User tapped notification:', data);
    
    // You can emit an event or handle navigation here
    // The navigation will be handled in your app's root component
  }, []);

  /**
   * Refresh push token
   */
  const refreshPushToken = useCallback(async (): Promise<string | null> => {
    const token = await pushNotificationService.getTokenFromBackend();
    if (token) {
      setExpoPushToken(token);
    }
    return token;
  }, []);

  /**
   * Send token to backend manually
   */
  const sendTokenToBackend = useCallback(async (token: string): Promise<boolean> => {
    return await pushNotificationService.sendTokenToBackend(token);
  }, []);

  /**
   * Delete token on logout
   */
  const deleteTokenOnLogout = useCallback(async (): Promise<void> => {
    await pushNotificationService.deleteTokenFromBackend();
    setExpoPushToken(null);
    initialized.current = false;
  }, []);

  /**
   * Schedule local notification
   */
  const scheduleLocalNotification = useCallback(async (
    title: string,
    body: string,
    data: NotificationData = {},
    seconds: number = 5
  ): Promise<string> => {
    return await pushNotificationService.scheduleLocalNotification(title, body, data, seconds);
  }, []);

  /**
   * Schedule notification for specific date
   */
  const scheduleNotificationForDate = useCallback(async (
    title: string,
    body: string,
    date: Date,
    data: NotificationData = {}
  ): Promise<string> => {
    return await pushNotificationService.scheduleNotificationForDate(title, body, date, data);
  }, []);

  /**
   * Schedule daily notification
   */
  const scheduleDailyNotification = useCallback(async (
    title: string,
    body: string,
    hour: number,
    minute: number,
    data: NotificationData = {}
  ): Promise<string> => {
    return await pushNotificationService.scheduleDailyNotification(title, body, hour, minute, data);
  }, []);

  /**
   * Get all scheduled notifications
   */
  const getAllScheduledNotifications = useCallback(async (): Promise<Notifications.NotificationRequest[]> => {
    return await pushNotificationService.getAllScheduledNotifications();
  }, []);

  /**
   * Cancel scheduled notification
   */
  const cancelScheduledNotification = useCallback(async (notificationId: string): Promise<void> => {
    await pushNotificationService.cancelScheduledNotification(notificationId);
  }, []);

  /**
   * Cancel all scheduled notifications
   */
  const cancelAllScheduledNotifications = useCallback(async (): Promise<void> => {
    await pushNotificationService.cancelAllScheduledNotifications();
  }, []);

  // Initialize on auth change
  useEffect(() => {
    if (isAuthenticated) {
      initializePushNotifications();
    } else {
      deleteTokenOnLogout();
    }
  }, [isAuthenticated, initializePushNotifications, deleteTokenOnLogout]);

  // Set up listeners
  useEffect(() => {
    pushNotificationService.setupNotificationListeners(
      handleNotification,
      handleNotificationResponse
    );

    return () => {
      pushNotificationService.cleanupNotificationListeners();
    };
  }, [handleNotification, handleNotificationResponse]);

  return {
    expoPushToken,
    notification,
    lastNotificationResponse,
    permissionStatus,
    refreshPushToken,
    sendTokenToBackend,
    deleteTokenOnLogout,
    scheduleLocalNotification,
    scheduleNotificationForDate,
    scheduleDailyNotification,
    getAllScheduledNotifications,
    cancelScheduledNotification,
    cancelAllScheduledNotifications,
  };
};