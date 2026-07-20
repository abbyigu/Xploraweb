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

export type WalkLengthBucket = 'quick' | 'standard' | 'long';

export interface WalkLengthOption {
  key: WalkLengthBucket;
  minMin: number;
  maxMin: number;
  targetStops: number;
}

export const WALK_LENGTH_BUCKETS: WalkLengthOption[] = [
  { key: 'quick', minMin: 20, maxMin: 45, targetStops: 3 },
  { key: 'standard', minMin: 45, maxMin: 90, targetStops: 5 },
  { key: 'long', minMin: 90, maxMin: 180, targetStops: 8 },
];

export interface ItineraryGenerateRequest {
  walkLength: WalkLengthBucket;
  origin: { lat: number; lng: number } | null;
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
