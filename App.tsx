import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import RootNavigator from './src/navigation/RootNavigator';
import { store } from './src/redux/store';

// Keep the splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

// Import the specific Poppins font weights you need
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

export default function App() {
  // Load your fonts
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-Bold': Poppins_700Bold,
    'Poppins-SemiBold': Poppins_600SemiBold,
    // Add more weights as needed
  });

  useEffect(() => {
    // Hide the splash screen once fonts are loaded or if there's an error
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null or a custom loading screen while waiting for fonts
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Provider store={store}>
      <NavigationContainer>
        <RootNavigator />
        <Toast />
      </NavigationContainer>
    </Provider>
  );
}