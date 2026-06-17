import type { Product } from '../data/products';

/**
 * AllTrails-style presentation helpers for experiences:
 * colour-coded difficulty, star ratings, and map coordinates.
 */

// Deterministic pseudo-random in [0,1) seeded by a string id, so derived
// ratings/coords stay stable across renders without storing them.
function seededUnit(id: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  }
  // map to [0,1)
  return ((h >>> 0) % 100000) / 100000;
}

export type DifficultyLevel = 'easy' | 'moderate' | 'challenging';

export function normalizeDifficulty(difficulty?: string): DifficultyLevel {
  const d = (difficulty ?? '').toLowerCase();
  if (d.includes('chall') || d.includes('hard') || d.includes('diffic')) return 'challenging';
  if (d.includes('mod')) return 'moderate';
  return 'easy';
}

// AllTrails uses green / orange / red for Easy / Moderate / Hard.
export const DIFFICULTY_META: Record<DifficultyLevel, { label: string; dot: string; text: string }> = {
  easy:        { label: 'Easy',        dot: 'bg-emerald-500', text: 'text-emerald-700' },
  moderate:    { label: 'Moderate',    dot: 'bg-amber-500',   text: 'text-amber-700' },
  challenging: { label: 'Challenging', dot: 'bg-rose-500',    text: 'text-rose-700' },
};

export function difficultyMeta(difficulty?: string) {
  return DIFFICULTY_META[normalizeDifficulty(difficulty)];
}

export interface ExperienceRating {
  rating: number;      // e.g. 4.7
  reviewCount: number; // e.g. 128
}

// Use real rating fields when present, otherwise derive a stable, believable
// rating so cards read like AllTrails search results.
export function getRating(exp: Product): ExperienceRating {
  const anyExp = exp as Product & { rating?: number; reviewCount?: number };
  const rating = typeof anyExp.rating === 'number'
    ? anyExp.rating
    : +(4.3 + seededUnit(exp.id, 7) * 0.6).toFixed(1); // 4.3 – 4.9
  const reviewCount = typeof anyExp.reviewCount === 'number'
    ? anyExp.reviewCount
    : Math.round(24 + seededUnit(exp.id, 13) * 460); // 24 – 484
  return { rating, reviewCount };
}

// Approximate Québec City neighbourhood centres for map markers.
export const NEIGHBOURHOOD_COORDS: Record<string, [number, number]> = {
  'old port':        [46.8155, -71.2010],
  'vieux-port':      [46.8155, -71.2010],
  'saint-roch':      [46.8125, -71.2210],
  'st-roch':         [46.8125, -71.2210],
  'petit-champlain': [46.8120, -71.2030],
  'montcalm':        [46.8000, -71.2280],
  'limoilou':        [46.8290, -71.2230],
  'maguire':         [46.7770, -71.2640],
  'sillery':         [46.7770, -71.2640],
  'cartier':         [46.8020, -71.2250],
};

const QC_CENTRE: [number, number] = [46.8139, -71.2080];

// Resolve a marker position: neighbourhood centre + small deterministic jitter
// so multiple experiences in the same area don't stack on one pixel.
export function getExperienceCoords(exp: Product): [number, number] {
  const key = (exp.neighbourhood ?? '').toLowerCase().trim();
  const base = NEIGHBOURHOOD_COORDS[key] ?? QC_CENTRE;
  const jitterLat = (seededUnit(exp.id, 3) - 0.5) * 0.006;
  const jitterLng = (seededUnit(exp.id, 5) - 0.5) * 0.008;
  return [base[0] + jitterLat, base[1] + jitterLng];
}
