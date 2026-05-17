/** REST base URLs look like …/api/v1 — Socket.IO is mounted on the HTTP origin above that path. */
export function socketOriginFromApiBase(apiUrl: string): string {
  return apiUrl.replace(/\/?api\/v1\/?$/i, '').replace(/\/$/, '');
}
