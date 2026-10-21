import type { DurationBucket } from './itineraryFilters';

/** Selected interests are visit slots, not permission to add more visits.
 * Duration only supplies a default when no interests have been selected. */
export function requestedStopCount({ categories, extraStops = 0, bucket, restaurantHopping, pinnedCount = 0 }: {
  categories: readonly string[];
  extraStops?: number;
  bucket: DurationBucket;
  restaurantHopping: boolean;
  pinnedCount?: number;
}): number {
  const base = restaurantHopping ? bucket.foodHopStopCount : new Set(categories).size || bucket.stopCount;
  const extras = restaurantHopping ? 0 : Math.max(0, Math.min(3, Math.trunc(extraStops)));
  return Math.max(pinnedCount, Math.min(9, base + extras));
}
