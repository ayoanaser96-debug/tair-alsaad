import { Redirect } from 'expo-router';

import { authenticatedTabsHref } from '@/lib/loginIntent';
import { useAuthStore } from '@/stores/authStore';

export default function RootIndex() {
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

  const apiRole = String(user.role ?? '').toLowerCase();

  if (apiRole === 'driver') {
    return <Redirect href={authenticatedTabsHref('driver')} />;
  }

  if (apiRole === 'admin') {
    return <Redirect href={authenticatedTabsHref('admin')} />;
  }

  if (appHome === null || appHome === undefined) {
    return <Redirect href="/select-role" />;
  }

  return <Redirect href={authenticatedTabsHref(appHome)} />;
}
