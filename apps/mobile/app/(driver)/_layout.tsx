import { useEffect } from 'react';

import { Stack } from 'expo-router';

import { connectDriverIo, disconnectDriverIo } from '@/lib/driverIo';

export default function DriverShellLayout() {
  useEffect(() => {
    connectDriverIo();
    return () => disconnectDriverIo();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="accept/[id]" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="apply" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
