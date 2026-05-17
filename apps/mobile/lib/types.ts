import type { Address, PreferredLanguage, Role } from '@tayralsaad/types';

/** Saved address from `/me`; always includes Mongo subdocument id for DELETE. */
export type SavedAddressRow = Address & { serverId: string };

/** API user after Mongoose JSON transform (`id`). */
export type ApiUser = {
  id: string;
  phone: string;
  name: string;
  role: Role;
  preferredLanguage: PreferredLanguage;
  avatarUrl?: string;
  defaultAddresses?: SavedAddressRow[];
};

function normalizeSavedAddresses(raw: unknown): SavedAddressRow[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: SavedAddressRow[] = [];
  for (const item of raw) {
    const a = item as Record<string, unknown>;
    const loc = a.location as Record<string, unknown> | undefined;
    const lat = typeof loc?.lat === 'number' ? loc.lat : Number(loc?.lat);
    const lng = typeof loc?.lng === 'number' ? loc.lng : Number(loc?.lng);
    const serverId = String(a._id ?? a.id ?? '');
    const city = String(a.city ?? '').trim();
    const area = String(a.area ?? '').trim();
    if (!serverId || !city || !area || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const row: SavedAddressRow = {
      serverId,
      city,
      area,
      location: { lat, lng },
    };
    if (typeof a.label === 'string') row.label = a.label;
    if (typeof a.street === 'string') row.street = a.street;
    if (typeof a.building === 'string') row.building = a.building;
    if (typeof a.notes === 'string') row.notes = a.notes;
    out.push(row);
  }
  return out.length ? out : [];
}

export function normalizeUser(raw: Record<string, unknown>): ApiUser {
  const id = String(raw.id ?? raw._id ?? '');
  const roleRaw = String(raw.role ?? '').toLowerCase();
  const role: Role =
    roleRaw === 'driver'
      ? 'driver'
      : roleRaw === 'admin'
        ? 'admin'
        : roleRaw === 'receiver'
          ? 'receiver'
          : 'sender';

  const langRaw = raw.preferredLanguage;
  const preferredLanguage: PreferredLanguage = langRaw === 'en' ? 'en' : 'ar';

  const addrs = normalizeSavedAddresses(raw.defaultAddresses);

  return {
    id,
    phone: String(raw.phone ?? ''),
    name: String(raw.name ?? ''),
    role,
    preferredLanguage,
    ...(typeof raw.avatarUrl === 'string' ? { avatarUrl: raw.avatarUrl } : {}),
    ...(addrs !== undefined ? { defaultAddresses: addrs } : {}),
  };
}
