import { SPOT_CATEGORIES, SPOT_CATEGORY_KEY } from './products';
import type { SpotCategory, Spot } from './products';

export { SPOT_CATEGORIES, SPOT_CATEGORY_KEY };
export type { SpotCategory };

// Stays are accommodations, not places to visit — exclude them from the
// itinerary builder's category picker.
export const ITINERARY_CATEGORIES = SPOT_CATEGORIES.filter(c => c !== 'Stays');

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

// "Time available" chips shown by default in the simplified generator — each
// bucket maps to an existing valid stopCount so the API's stop-count
// validation (REGULAR_STOP_COUNTS/FOOD_HOP_STOP_COUNTS) keeps working
// unchanged; this is purely a friendlier label over the same underlying value.
export interface DurationBucket {
  key: 'short' | 'half' | 'full';
  stopCount: number;
  foodHopStopCount: number;
}

export const DURATION_BUCKETS: DurationBucket[] = [
  { key: 'short', stopCount: 3, foodHopStopCount: 3 },
  { key: 'half', stopCount: 5, foodHopStopCount: 4 },
  { key: 'full', stopCount: 9, foodHopStopCount: 6 },
];

export function stopCountForBucket(bucket: DurationBucket, restaurantHopping: boolean): number {
  return restaurantHopping ? bucket.foodHopStopCount : bucket.stopCount;
}

export function bucketForStopCount(stopCount: number, restaurantHopping: boolean): DurationBucket['key'] | null {
  const match = DURATION_BUCKETS.find(b => stopCountForBucket(b, restaurantHopping) === stopCount);
  return match?.key ?? null;
}

export const PACE_OPTIONS = ['relaxed', 'moderate', 'packed'] as const;
export type Pace = (typeof PACE_OPTIONS)[number];

export interface ItineraryGenerateRequest {
  stopCount: number;
  categories: SpotCategory[];
  priceRanges: PriceRange[];
  neighbourhoods: string[];
  language: 'en' | 'fr';
  restaurantHopping: boolean;
  michelinOnly: boolean;
  pace: Pace;
  // Stops the user pinned on a previous generation — carried into the next
  // regeneration so they survive it instead of being reshuffled away.
  pinnedSpotIds?: string[];
}

export interface GeneratedItineraryStop {
  type?: 'stop'; // absent on itineraries saved before journey steps existed — treat as 'stop'
  order: number;
  note: string;
  spot: Spot;
}

// A connector/transportation spot shown between two stops (e.g. a staircase
// or the funicular) — never numbered, never pinnable, never a generation stop.
export interface JourneyStep {
  type: 'journeyStep';
  description: string;
  spot: Spot;
}

export type ItineraryItem = GeneratedItineraryStop | JourneyStep;

export function isJourneyStep(item: ItineraryItem): item is JourneyStep {
  return item.type === 'journeyStep';
}

// A saved itinerary's published review, as returned to non-owner visitors of
// /i/:slug once an admin has approved it (see api/get-shared-itinerary.ts).
export interface PublicItineraryReview {
  avgRating: number | null;
  notes: string;
  photos: string[];
  adminResponse: string | null;
}

export interface GeneratedItinerary {
  title: string;
  summary: string;
  estimatedDurationMin: number;
  estimatedDistanceKm: number;
  stops: ItineraryItem[];
  alternates?: Spot[];
  /** Present only on the public /i/:slug fetch response — a published review, if any. */
  review?: PublicItineraryReview | null;
}

export interface GenerationUsage {
  count: number;
  limit: number;
  premium: boolean;
}

export interface GeneratedItinerarySet {
  itineraries: GeneratedItinerary[];
  usage: GenerationUsage;
}

export type ItineraryErrorCode = 'INVALID_INPUT' | 'NOT_CONFIGURED' | 'NO_CANDIDATES' | 'LLM_ERROR' | 'METHOD_NOT_ALLOWED' | 'LIMIT_REACHED';
