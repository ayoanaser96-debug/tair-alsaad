import { Stack } from 'expo-router';

import { AdminAccessDenied } from '@/components/AdminAccessDenied';
import { useAuthStore } from '@/stores/authStore';

export default function AdminShellLayout() {
  const role = String(useAuthStore((s) => s.user?.role ?? '').toLowerCase());

  if (role !== 'admin') {
    return <AdminAccessDenied />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
