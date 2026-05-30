import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { useOTAUpdate } from './src/hooks/useOTAUpdate';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

import toastConfig from './src/components/AppToast';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import RootNavigator from './src/navigation/RootNavigator';
import { store } from './src/redux/store';

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

SplashScreen.preventAutoHideAsync();

const AppContent = () => {
  const navigationRef = useRef<any>(null);
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-Bold': Poppins_700Bold,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });

  const { lastNotificationResponse } = usePushNotifications();

  useEffect(() => {
    if (lastNotificationResponse && navigationRef.current?.isReady()) {
      const { data } = lastNotificationResponse.notification.request.content;
      console.log('App opened from notification:', data);
      if (data?.screen) {
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

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('App moved to foreground');
      } else if (nextAppState === 'background') {
        console.log('App moved to background');
      }
    });
    return () => subscription.remove();
  }, []);

  const handleForegroundNotification = useCallback((notification: Notifications.Notification) => {
    const { title, body } = notification.request.content;
    console.log('Foreground notification received');
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

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(handleForegroundNotification);
    return () => subscription.remove();
  }, [handleForegroundNotification]);

  useEffect(() => {
    async function prepare() {
      try {
        if (__DEV__) {
          console.log(`Running on ${Platform.OS} ${Platform.Version}`);
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        console.warn('Error during app preparation:', e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, appIsReady]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => console.log('Navigation container is ready')}
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

// Sits inside ThemeProvider so useTheme() reads real state
const AppWithTheme = () => {
  useOTAUpdate({ silent: true });
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <Provider store={store}>
        <AppContent />
      </Provider>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}