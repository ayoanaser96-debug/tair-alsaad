import { api } from '@/lib/api';

/** Revoke refresh token on the server before clearing local session. */
export async function revokeServerSession(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // Local session is cleared regardless — network errors must not block logout.
  }
}
