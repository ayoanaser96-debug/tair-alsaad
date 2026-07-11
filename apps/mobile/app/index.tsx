import { useState } from 'react';

import { Redirect } from 'expo-router';

import { BootSplash } from '@/screens/BootSplash';
import { resolveAuthenticatedRedirect } from '@/lib/resolveDashboard';
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

  const target = resolveAuthenticatedRedirect({ token, user, appHome });
  return <Redirect href={target} />;
}
