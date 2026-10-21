import { canBeGeneratedAsStop, effectiveRole, type Spot } from './products';
import { distanceKm, hasCoordinates } from './routeEstimates';

/** Uses the public, active spot feed only. Never invents names, photos, or
 * coordinates, and never combines distant neighbourhoods into a sample. */
export function sampleOuting(spots: Spot[]): Spot[] {
  const candidates = spots.filter(spot => hasCoordinates(spot) && spot.neighbourhood?.trim()
    && (!spot.status || spot.status === 'active') && canBeGeneratedAsStop(effectiveRole(spot)));
  const ranked = [...candidates].sort((a, b) => Number(!!b.isLoved) - Number(!!a.isLoved)
    || Number(!!b.image) - Number(!!a.image) || a.id.localeCompare(b.id));
  for (const cafe of ranked.filter(spot => spot.category === 'Cafe')) {
    const nearby = ranked.filter(spot => spot.id !== cafe.id
      && spot.neighbourhood!.trim().toLowerCase() === cafe.neighbourhood!.trim().toLowerCase()
      && distanceKm(cafe, spot) <= 1.5);
    const culture = nearby.filter(spot => spot.category === 'Culture' || spot.category === 'History')
      .sort((a, b) => distanceKm(cafe, a) - distanceKm(cafe, b))[0];
    if (!culture) continue;
    const shop = nearby.filter(spot => spot.category === 'Shopping' && spot.id !== culture.id && distanceKm(culture, spot) <= 1.5)
      .sort((a, b) => distanceKm(culture, a) - distanceKm(culture, b))[0];
    if (shop) return [cafe, culture, shop];
  }
  return [];
}
