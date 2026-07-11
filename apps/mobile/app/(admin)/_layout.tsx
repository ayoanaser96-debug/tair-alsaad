import { Redirect, Stack } from 'expo-router';

import { AdminAccessDenied } from '@/components/AdminAccessDenied';
import { useAuthStore } from '@/stores/authStore';

export default function AdminShellLayout() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const role = String(user?.role ?? '').toLowerCase();

  if (!hydrated) {
    return null;
  }

  if (!token || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role !== 'admin') {
    return <AdminAccessDenied />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="shipment/[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
