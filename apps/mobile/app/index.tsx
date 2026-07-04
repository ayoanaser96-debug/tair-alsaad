import { useState } from 'react';

import { Redirect } from 'expo-router';

import { authenticatedTabsHref } from '@/lib/loginIntent';
import { BootSplash } from '@/screens/BootSplash';
import { useAuthStore } from '@/stores/authStore';

export default function RootIndex() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const appHome = useAuthStore((s) => s.appHomeSegment);
  const [bootComplete, setBootComplete] = useState(false);

  if (!hydrated) {
    return null;
  }

  if (!bootComplete) {
    return <BootSplash sessionReady={hydrated} onComplete={() => setBootComplete(true)} />;
  }

  if (!token || !user) {
    return <Redirect href="/welcome" />;
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
