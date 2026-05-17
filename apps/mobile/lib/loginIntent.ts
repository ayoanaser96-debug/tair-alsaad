import type { Href } from 'expo-router';

import type { AppHomeSegment } from '@/lib/secure';

/** Primary workspace tabs — route groups omitted from URLs (Expo Router). */
export function authenticatedTabsHref(shell: AppHomeSegment): Href {
  switch (shell) {
    case 'receiver':
      return '/(receiver)/(tabs)';
    case 'driver':
      return '/(driver)/(tabs)';
    case 'admin':
      return '/(admin)/(tabs)';
    default:
      return '/(sender)/(tabs)';
  }
}
