import Constants from 'expo-constants';

export function initSentry(): void {
  const dsn = Constants.expoConfig?.extra?.sentryDsn as string | undefined;
  if (!dsn?.trim()) return;
  try {
    // Lazy require avoids native linkage issues until a dev client/EAS build is used.
     
    type SentryType = typeof import('@sentry/react-native');
     
    const Sentry = require('@sentry/react-native') as SentryType;
     
    if (!Sentry?.init) return;
    Sentry.init({ dsn, enableAutoSessionTracking: true });
     
  } catch {
    /** ignore */
     
  }
}
