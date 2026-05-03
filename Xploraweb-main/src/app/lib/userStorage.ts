/**
 * Xplora user profile — stored in localStorage so data persists across sessions.
 */

export interface UserProfile {
  name: string;
  email: string;
  location: string;
  interests: string[];
  avatar: string | null; // base64 data URL
}

const KEY = 'xplora_user';

const defaults: UserProfile = {
  name: '',
  email: '',
  location: 'Quebec City, QC',
  interests: [],
  avatar: null,
};

export function getUser(): UserProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

export function saveUser(data: Partial<UserProfile>): UserProfile {
  const current = getUser();
  const updated = { ...current, ...data };
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function clearUser(): void {
  localStorage.removeItem(KEY);
}

/** Returns initials from a name, e.g. "Ariel Blouin" → "AB" */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}
