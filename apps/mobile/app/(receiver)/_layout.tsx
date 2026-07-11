import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';
import { resolveAuthenticatedRedirect } from '@/lib/resolveDashboard';

export default function ReceiverRootLayout() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const appHome = useAuthStore((s) => s.appHomeSegment);

  if (!hydrated) {
    return null;
  }

  if (!token || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (appHome !== 'receiver') {
    return <Redirect href={resolveAuthenticatedRedirect({ token, user, appHome })} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="tracking/[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
