import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';
import { resolveAuthenticatedRedirect } from '@/lib/resolveDashboard';

export default function SenderRootLayout() {
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

  if (appHome !== 'sender') {
    return <Redirect href={resolveAuthenticatedRedirect({ token, user, appHome })} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="new" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="shipments/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="saved-addresses" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
