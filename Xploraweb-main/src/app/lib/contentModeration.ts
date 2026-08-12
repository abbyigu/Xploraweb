/** Client-side pre-check run before a review is ever saved, so obviously
 * inappropriate text never reaches the admin queue at all — unlike the
 * rating/text mismatch flag (see supabase_itinerary_review_mismatch_flag.sql),
 * which lets a review through as `pending` for a human to look at. A
 * deliberately simple keyword list, same spirit as the mismatch heuristic:
 * false negatives are fine, this just catches the obvious cases. */
const INAPPROPRIATE_LANGUAGE_PATTERN = new RegExp(
  '\\b(' + [
    'fuck\\w*', 'shit\\w*', 'bitch\\w*', 'bastard\\w*', 'asshole\\w*', 'cunt\\w*',
    'dick\\w*', 'pussy', 'whore\\w*', 'slut\\w*', 'faggot\\w*', 'fag',
    'nigger\\w*', 'nigga\\w*', 'retard\\w*', 'motherfucker\\w*',
  ].join('|') + ')\\b',
  'i'
);

export function containsInappropriateLanguage(text: string): boolean {
  return INAPPROPRIATE_LANGUAGE_PATTERN.test(text);
}
