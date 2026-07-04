import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';

export default function SenderRootLayout() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  // Route-level guard (first line of defense; the 401 interceptor is the second).
  // Wait for hydration before deciding so logged-out users never see sender UI.
  if (!hydrated) {
    return null;
  }

  if (!token || !user) {
    return <Redirect href="/(auth)/login" />;
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
