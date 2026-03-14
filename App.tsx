import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';

import toastConfig from './src/components/AppToast';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import RootNavigator from './src/navigation/RootNavigator';
import { store } from './src/redux/store';

// Import the specific Poppins font weights
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

// IMPORTANT: Configure notification handler at the root level
// This controls how notifications behave when app is in FOREGROUND
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,      // Show alert/banner when app is in foreground
    shouldPlaySound: true,      // Play sound when app is in foreground
    shouldSetBadge: false,      // Don't set badge count
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

// Keep the splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

// Create a separate component that uses Redux hooks
const AppContent = () => {
  // Navigation reference for handling navigation from notifications
  const navigationRef = useRef<any>(null);
  
  // State for app ready status
  const [appIsReady, setAppIsReady] = useState(false);
  
  // Load your fonts
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-Bold': Poppins_700Bold,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });

  // Initialize push notifications and handle navigation
  // This hook uses Redux, so it must be inside a component wrapped with Provider
  const { lastNotificationResponse } = usePushNotifications();

  /**
   * Handle navigation when app is opened from a notification (BACKGROUND -> FOREGROUND)
   * This runs when user taps on a notification while app is in background/killed
   */
  useEffect(() => {
    if (lastNotificationResponse && navigationRef.current?.isReady()) {
      const { data } = lastNotificationResponse.notification.request.content;
      console.log('App opened from notification:', data);
      
      // Handle navigation based on notification data
      if (data?.screen) {
        // Small delay to ensure navigation is fully ready
        setTimeout(() => {
          try {
            navigationRef.current.navigate(data.screen, data.params || {});
          } catch (error) {
            console.log('Navigation error:', error);
          }
        }, 100);
      }
    }
  }, [lastNotificationResponse]);

  /**
   * Handle app state changes (background/foreground transitions)
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('App moved to foreground');
      } else if (nextAppState === 'background') {
        console.log('App moved to background');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Handle notification received while app is in FOREGROUND
   * This shows an in-app toast notification
   */
  const handleForegroundNotification = useCallback((notification: Notifications.Notification) => {
    const { title, body } = notification.request.content;
    
    console.log('Foreground notification received');
    
    // Show in-app toast notification
    Toast.show({
      type: 'info',
      text1: title || 'New Notification',
      text2: body,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 50,
    });
  }, []);

  /**
   * Set up foreground notification listener
   */
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(handleForegroundNotification);
    
    return () => {
      subscription.remove();
    };
  }, [handleForegroundNotification]);

  /**
   * Initialize app and prepare for launch
   */
  useEffect(() => {
    async function prepare() {
      try {
        // Log platform info (only in development)
        if (__DEV__) {
          console.log(`Running on ${Platform.OS} ${Platform.Version}`);
        }

        // Small delay to ensure smooth transition
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        console.warn('Error during app preparation:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  /**
   * Hide splash screen once everything is ready
   */
  useEffect(() => {
    if ((fontsLoaded || fontError) && appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, appIsReady]);

  // Show nothing while loading fonts
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          console.log('Navigation container is ready');
        }}
      >
        <RootNavigator />
        
        <Toast
          config={toastConfig}
          position="top"
          topOffset={60}
          visibilityTime={4000}
        />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

// Main App component with Redux Provider
export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}