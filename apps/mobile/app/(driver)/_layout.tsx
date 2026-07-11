import { useEffect } from 'react';

import { Redirect, Stack, useSegments } from 'expo-router';

import { connectDriverIo, disconnectDriverIo } from '@/lib/driverIo';
import { useAuthStore } from '@/stores/authStore';

export default function DriverShellLayout() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const segments = useSegments();
  const onApplyScreen = segments.includes('apply');

  useEffect(() => {
    if (!token || !user) return;
    const apiRole = String(user.role ?? '').toLowerCase();
    if (apiRole !== 'driver') return;
    connectDriverIo();
    return () => disconnectDriverIo();
  }, [token, user]);

  if (!hydrated) {
    return null;
  }

  if (!token || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  const apiRole = String(user.role ?? '').toLowerCase();
  if (apiRole !== 'driver' && !onApplyScreen) {
    return <Redirect href="/select-role" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="accept/[id]" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="apply" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
