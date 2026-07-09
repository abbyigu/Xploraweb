import { SPOT_CATEGORIES } from './products';
import type { SpotCategory, Spot } from './products';

export { SPOT_CATEGORIES };
export type { SpotCategory };

// Shared between the browse page (ItineraryScreen) and the AI builder
// (ItineraryBuilderScreen) so both filter on the same vibe vocabulary.
export const VIBE_OPTIONS = ['cozy', 'adventurous', 'foodie', 'romantic', 'hidden gem', 'lively', 'artsy', 'outdoorsy', 'late night', 'family-friendly', 'brunch'];

export const VIBE_KEY: Record<string, string> = {
  'cozy': 'cozy', 'adventurous': 'adventurous', 'foodie': 'foodie', 'romantic': 'romantic',
  'hidden gem': 'hiddenGem', 'lively': 'lively', 'artsy': 'artsy', 'outdoorsy': 'outdoorsy',
  'late night': 'lateNight', 'family-friendly': 'familyFriendly', 'brunch': 'brunch',
};

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

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export const TIME_OF_DAY_OPTIONS: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night'];

export const RADIUS_KM_MIN = 0.5;
export const RADIUS_KM_MAX = 10;
export const RADIUS_KM_DEFAULT = 3;

export interface ItineraryGenerateRequest {
  walkLength: WalkLengthBucket;
  radiusKm: number | null;
  origin: { lat: number; lng: number } | null;
  categories: SpotCategory[];
  vibes: string[];
  timeOfDay: TimeOfDay | null;
  neighbourhoods: string[];
  language: 'en' | 'fr';
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
