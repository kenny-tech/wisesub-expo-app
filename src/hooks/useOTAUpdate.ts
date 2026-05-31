/**
 * useOTAUpdate
 * 
 * Call this once near the top of your app (e.g. in App.tsx or RootNavigator).
 * On each app launch it silently checks for an update; if one is available
 * it fetches it and reloads automatically.
 * 
 * Install: npx expo install expo-updates
 * 
 * In your app.json / app.config.js make sure you have:
 *   "updates": {
 *     "enabled": true,
 *     "fallbackToCacheTimeout": 0,
 *     "url": "https://u.expo.dev/<your-project-id>"
 *   },
 *   "runtimeVersion": { "policy": "appVersion" }
 */

import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { Alert } from 'react-native';

export function useOTAUpdate(options?: { silent?: boolean }) {
  const { silent = true } = options || {};

  useEffect(() => {
    checkForUpdate();
  }, []);

  const checkForUpdate = async () => {
    // Skip in dev — updates only work in production builds
    if (__DEV__) return;

    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();

        if (silent) {
          // Reload immediately without prompting
          await Updates.reloadAsync();
        } else {
          Alert.alert(
            'Update Available',
            'A new version of the app is ready. Restart now to apply it.',
            [
              { text: 'Later', style: 'cancel' },
              {
                text: 'Restart Now',
                onPress: async () => {
                  await Updates.reloadAsync();
                },
              },
            ]
          );
        }
      }
    } catch (e) {
      // Silently fail — never crash the app because of an update check
      console.log('OTA update check failed:', e);
    }
  };

  return { checkForUpdate };
}