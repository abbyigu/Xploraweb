import { canBeGeneratedAsStop, effectiveRole, type Spot, type SpotCategory } from './products';
import { ITINERARY_CATEGORIES } from './itineraryFilters';

/** Match the generator's active, routable destination pool. Multiple areas use a union. */
export function availableItineraryCategories(spots: Spot[], neighbourhoods: string[]): SpotCategory[] {
  const available = new Set(spots.filter(spot =>
    spot.status === 'active'
    && !!spot.name?.trim()
    && Number.isFinite(spot.lat) && Number.isFinite(spot.lng)
    && Math.abs(spot.lat!) <= 90 && Math.abs(spot.lng!) <= 180
    && canBeGeneratedAsStop(effectiveRole(spot))
    && (!neighbourhoods.length || !!spot.neighbourhood && neighbourhoods.includes(spot.neighbourhood))
  ).map(spot => spot.category));
  return ITINERARY_CATEGORIES.filter(category => available.has(category));
}
