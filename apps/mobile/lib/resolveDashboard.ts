import type { Href } from 'expo-router';

import type { AppHomeSegment } from '@/lib/secure';
import type { ApiUser } from '@/lib/types';

import { authenticatedTabsHref } from '@/lib/loginIntent';

export type DashboardRedirect = Href | '/select-role' | '/welcome';

/** Drop persisted shells that the current API role cannot access. */
export function sanitizeAppHomeSegment(
  apiRole: string,
  appHome: AppHomeSegment | null | undefined,
): AppHomeSegment | null {
  const role = apiRole.toLowerCase();

  if (appHome === null || appHome === undefined) return null;

  if (appHome === 'admin' && role !== 'admin') return null;
  if (appHome === 'driver' && role !== 'driver') return null;

  if (role === 'driver' && (appHome === 'sender' || appHome === 'receiver')) return null;
  if (role === 'admin' && appHome === 'driver') return null;

  return appHome;
}

export function resolveAuthenticatedRedirect(params: {
  token: string | null;
  user: ApiUser | null;
  appHome: AppHomeSegment | null | undefined;
}): DashboardRedirect {
  const { token, user, appHome } = params;

  if (!token || !user) {
    return '/welcome';
  }

  const role = String(user.role ?? '').toLowerCase();
  const shell = sanitizeAppHomeSegment(role, appHome);

  if (role === 'admin') {
    if (shell === 'sender' || shell === 'receiver') {
      return authenticatedTabsHref(shell);
    }
    return authenticatedTabsHref('admin');
  }

  if (role === 'driver') {
    return authenticatedTabsHref('driver');
  }

  if (shell === null) {
    return '/select-role';
  }

  return authenticatedTabsHref(shell);
}
