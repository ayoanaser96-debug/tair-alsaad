import { Redirect } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';

export default function LegacyRoleRedirectScreen() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.accessToken);

  if (!hydrated) return null;

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/select-role" />;
}
