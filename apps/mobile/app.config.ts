import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'طير السعد',
  slug: 'tayralsaad',
  scheme: 'tayralsaad',
  version: '0.0.1',
  orientation: 'default',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  platforms: ['ios', 'android'],
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-localization',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Tayr Al-Saad uses your location to set pickup and drop-off pins on the map.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Tayr Al-Saad needs photo access for delivery proof uploads.',
        cameraPermission: 'Tayr Al-Saad uses the camera for pickup and delivery photos.',
      },
    ],
  ],
  extra: {
    apiUrl:
      process.env.EXPO_PUBLIC_API_URL ??
      (__DEV__ ? 'http://127.0.0.1:4001/api/v1' : 'https://api.tayralsaad.iq/api/v1'),
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
    easProjectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? '',
    webPublicUrl:
      process.env.EXPO_PUBLIC_WEB_URL ??
      (__DEV__ ? 'http://localhost:5173' : 'https://tayralsaad.iq'),
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'iq.tayralsaad.mobile',
  },
  android: {
    package: 'iq.tayralsaad.mobile',
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: 'smartgateapp.com',
            pathPrefix: '/open',
          },
          {
            scheme: 'https',
            host: 'www.smartgateapp.com',
            pathPrefix: '/open',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
};

export default config;
