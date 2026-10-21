import type { Spot } from './products';
import type { GeneratedItinerary, ItineraryItem } from './itineraryFilters';

export function hasCoordinates(spot: Spot): boolean {
  return Number.isFinite(spot.lat) && Number.isFinite(spot.lng)
    && Math.abs(spot.lat!) <= 90 && Math.abs(spot.lng!) <= 180;
}

export function distanceKm(a: Spot, b: Spot): number {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = radians(b.lat! - a.lat!);
  const dLng = radians(b.lng! - a.lng!);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat!)) * Math.cos(radians(b.lat!)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}

// Browser-side estimates are straight-line approximations, never routed
// walking directions. Keep visit time separate so repeated swaps don't drift.
export function replacementEstimates(itinerary: GeneratedItinerary, stops: ItineraryItem[]) {
  if (!stops.every(item => hasCoordinates(item.spot))) return null;
  const km = stops.slice(1).reduce((sum, item, i) => sum + distanceKm(stops[i].spot, item.spot), 0);
  const visitMinutes = Math.max(0, itinerary.estimatedDurationMin - itinerary.estimatedDistanceKm * 1000 / 75);
  return {
    estimatedDistanceKm: Math.round(km * 100) / 100,
    estimatedDurationMin: Math.max(1, Math.round(visitMinutes + km * 1000 / 75)),
  };
}
