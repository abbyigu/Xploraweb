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

// Regular routes offer a wider spread of stop counts; restaurant-hopping
// routes cap lower since eating at 6+ places back-to-back is already a lot.
export const REGULAR_STOP_COUNTS = [3, 5, 7, 9] as const;
export const FOOD_HOP_STOP_COUNTS = [3, 4, 5, 6] as const;

export function getStopCountOptions(restaurantHopping: boolean): readonly number[] {
  return restaurantHopping ? FOOD_HOP_STOP_COUNTS : REGULAR_STOP_COUNTS;
}

export interface ItineraryGenerateRequest {
  stopCount: number;
  categories: SpotCategory[];
  priceRanges: PriceRange[];
  neighbourhoods: string[];
  language: 'en' | 'fr';
  restaurantHopping: boolean;
  michelinOnly: boolean;
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
