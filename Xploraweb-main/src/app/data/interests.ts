/** Canonical (English, DB-stored) interest values a user can pick during
 * onboarding / in their profile preferences. */
export const INTEREST_OPTIONS = [
  'Food & Dining', 'Art & Culture', 'Nightlife',
  'Outdoor Activities', 'History', 'Shopping',
  'Music & Events', 'Sports', 'Photography', 'Architecture',
] as const;

/** Maps a canonical interest value to its i18n key under `account.interestOptions.*`. */
export const INTEREST_KEY: Record<string, string> = {
  'Food & Dining': 'foodDining',
  'Art & Culture': 'artCulture',
  'Nightlife': 'nightlife',
  'Outdoor Activities': 'outdoorActivities',
  'History': 'history',
  'Shopping': 'shopping',
  'Music & Events': 'musicEvents',
  'Sports': 'sports',
  'Photography': 'photography',
  'Architecture': 'architecture',
};
