const API_BASE = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3333").replace(/\/$/, "");

export { API_BASE };

export function authHeader(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}
