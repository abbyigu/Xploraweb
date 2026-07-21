import { SPOT_CATEGORIES, SPOT_CATEGORY_KEY } from './products';
import type { SpotCategory, Spot } from './products';

export { SPOT_CATEGORIES, SPOT_CATEGORY_KEY };
export type { SpotCategory };

// Shared between the browse page (ItineraryScreen) and the AI builder
// (ItineraryBuilderScreen) so both filter on the same vibe vocabulary.
export const VIBE_OPTIONS = ['cozy', 'adventurous', 'foodie', 'romantic', 'hidden gem', 'lively', 'artsy', 'outdoorsy', 'late night', 'family-friendly', 'brunch'];

export const VIBE_KEY: Record<string, string> = {
  'cozy': 'cozy', 'adventurous': 'adventurous', 'foodie': 'foodie', 'romantic': 'romantic',
  'hidden gem': 'hiddenGem', 'lively': 'lively', 'artsy': 'artsy', 'outdoorsy': 'outdoorsy',
  'late night': 'lateNight', 'family-friendly': 'familyFriendly', 'brunch': 'brunch',
};

// Relative cost tier, matches Spot.priceRange values.
export const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'] as const;
export type PriceRange = (typeof PRICE_RANGES)[number];

export type StopCountBucket = 'quick' | 'standard' | 'long' | 'extended';

export interface StopCountOption {
  key: StopCountBucket;
  minStops: number;
  maxStops: number;
}

export const STOP_COUNT_BUCKETS: StopCountOption[] = [
  { key: 'quick', minStops: 2, maxStops: 3 },
  { key: 'standard', minStops: 4, maxStops: 5 },
  { key: 'long', minStops: 6, maxStops: 8 },
  { key: 'extended', minStops: 10, maxStops: 14 },
];

// Restaurant hopping caps how many stops a route can have, regardless of the
// selected bucket, since eating at 10+ places back-to-back isn't realistic.
export const RESTAURANT_HOPPING_MAX_STOPS = 7;

export function getEffectiveStopRange(bucket: StopCountOption, restaurantHopping: boolean): { minStops: number; maxStops: number } {
  const maxStops = restaurantHopping ? Math.min(bucket.maxStops, RESTAURANT_HOPPING_MAX_STOPS) : bucket.maxStops;
  const minStops = Math.min(bucket.minStops, maxStops);
  return { minStops, maxStops };
}

export interface ItineraryGenerateRequest {
  stopCount: StopCountBucket;
  categories: SpotCategory[];
  priceRanges: PriceRange[];
  neighbourhoods: string[];
  language: 'en' | 'fr';
  restaurantHopping: boolean;
}

export interface GeneratedItineraryStop {
  order: number;
  note: string;
  spot: Spot;
}

export interface GeneratedItinerary {
  title: string;
  summary: string;
  estimatedDurationMin: number;
  estimatedDistanceKm: number;
  stops: GeneratedItineraryStop[];
}

export type ItineraryErrorCode = 'INVALID_INPUT' | 'NOT_CONFIGURED' | 'NO_CANDIDATES' | 'LLM_ERROR' | 'METHOD_NOT_ALLOWED';
