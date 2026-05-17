import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';

export default function AuthenticatedLayout() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.accessToken);

  if (!hydrated) {
    return null;
  }

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
