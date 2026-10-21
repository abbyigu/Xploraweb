import { isNearDuplicate, hasStrongCulturalPreference, isCafeFocused } from './_itineraryLogic.js';
import type { CandidateSpot, WalkingMatrix } from './_itineraryLogic.js';

export const ROUTING_CANDIDATE_LIMIT = 12;
const BEAM_WIDTH = 128;

export interface RouteOptions {
  count: number;
  categories: string[];
  pinnedIds: string[];
  maxLegMinutes: number;
  restaurantHopping: boolean;
}

function geoMeters(a: CandidateSpot, b: CandidateSpot) {
  const rad = Math.PI / 180;
  const h = Math.sin((b.lat! - a.lat!) * rad / 2) ** 2
    + Math.cos(a.lat! * rad) * Math.cos(b.lat! * rad) * Math.sin((b.lng! - a.lng!) * rad / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(Math.min(1, h)));
}

/** Geography only narrows the routing request; it never supplies walking times.
 * Try a second distinct cluster if the first is disconnected on the street network. */
export function compactShortlists(pool: CandidateSpot[], pins: CandidateSpot[], categories: string[], count: number): CandidateSpot[][] {
  const unique = [...new Map([...pins, ...pool].map(spot => [spot.id, spot])).values()];
  const requested = [...new Set(categories)].filter(category => unique.some(spot => spot.category === category)).slice(0, count);
  const clusters = unique.map(anchor => {
    const near = [...unique].sort((a, b) => geoMeters(anchor, a) - geoMeters(anchor, b) || a.id.localeCompare(b.id));
    const selected = [...pins];
    const add = (spot: CandidateSpot) => { if (!selected.some(item => item.id === spot.id) && selected.length < ROUTING_CANDIDATE_LIMIT) selected.push(spot); };
    for (const category of requested) {
      if (selected.some(spot => spot.category === category)) continue;
      const closest = near.find(spot => spot.category === category);
      if (closest) add(closest);
    }
    for (const spot of near) add(spot);
    // Cover requested categories before scoring density. A distant café must
    // not win over a cluster containing a closer café and the same attractions.
    const required = selected.filter(spot => pins.some(pin => pin.id === spot.id));
    for (const category of requested) {
      if (!required.some(spot => spot.category === category)) {
        const closest = selected.find(spot => spot.category === category);
        if (closest) required.push(closest);
      }
    }
    for (const spot of near) {
      if (required.length >= count) break;
      if (!required.some(item => item.id === spot.id)) required.push(spot);
    }
    const score = required.reduce((sum, spot) => sum + geoMeters(anchor, spot), 0);
    return { selected, score, key: selected.map(spot => spot.id).sort().join('|') };
  }).sort((a, b) => a.score - b.score || a.key.localeCompare(b.key));
  const result: CandidateSpot[][] = [];
  const keys = new Set<string>();
  for (const cluster of clusters) {
    if (keys.has(cluster.key)) continue;
    keys.add(cluster.key); result.push(cluster.selected);
    if (result.length === 2) break;
  }
  return result;
}

function eligible(path: CandidateSpot[], spot: CandidateSpot, opts: RouteOptions): boolean {
  if (path.some(previous => isNearDuplicate(previous, spot))) return false;
  if (opts.pinnedIds.includes(spot.id)) return true;
  if (!opts.restaurantHopping && spot.category === 'Food' && path.some(item => item.category === 'Food')) return false;
  if (!isCafeFocused(opts.categories) && spot.role === 'cafe' && path.filter(item => item.role === 'cafe').length >= 2) return false;
  if (!hasStrongCulturalPreference(opts.categories) && ['museum', 'gallery'].includes(spot.role)
    && path.filter(item => ['museum', 'gallery'].includes(item.role)).length >= 2) return false;
  if (spot.role === 'viewpoint' && path.some(item => item.role === 'viewpoint')) return false;
  return true;
}

export function walkingLeg(matrix: WalkingMatrix, fromId: string, toId: string) {
  const i = matrix.ids.indexOf(fromId), j = matrix.ids.indexOf(toId);
  if (i < 0 || j < 0) return null;
  const distanceMeters = matrix.distanceMeters[i]?.[j];
  const durationSeconds = matrix.durationSeconds[i]?.[j];
  if (!Number.isFinite(distanceMeters) || !Number.isFinite(durationSeconds) || distanceMeters < 0 || durationSeconds < 0) return null;
  return { fromSpotId: fromId, toSpotId: toId, distanceMeters, durationSeconds, source: 'walking' as const };
}

/** Selects places AND order using real, directed walking routes. Category
 * coverage is required; category sequence is only a small tie preference. */
export function solveCompactRoute(pool: CandidateSpot[], matrix: WalkingMatrix, opts: RouteOptions): CandidateSpot[] | null {
  const requested = [...new Set(opts.categories)].filter(category => pool.some(spot => spot.category === category)).slice(0, opts.count);
  const score = (path: CandidateSpot[], seconds: number) => {
    const missing = requested.filter(category => !path.some(spot => spot.category === category)).length;
    let inversions = 0;
    for (let i = 1; i < path.length; i++) {
      const a = requested.indexOf(path[i - 1].category || ''), b = requested.indexOf(path[i].category || '');
      if (a >= 0 && b >= 0 && b < a) inversions++;
    }
    return missing * 100000 + seconds + inversions * 30;
  };
  let beam: { path: CandidateSpot[]; seconds: number }[] = [{ path: [], seconds: 0 }];
  for (let depth = 0; depth < opts.count; depth++) {
    const next: typeof beam = [];
    for (const state of beam) {
      for (const spot of pool) {
        if (!eligible(state.path, spot, opts)) continue;
        const pendingPin = opts.pinnedIds.find(id => !state.path.some(item => item.id === id));
        if (opts.pinnedIds.includes(spot.id) && spot.id !== pendingPin) continue;
        const path = [...state.path, spot];
        const missingPins = opts.pinnedIds.filter(id => !path.some(item => item.id === id)).length;
        const missingCategories = requested.filter(category => !path.some(item => item.category === category)).length;
        if (Math.max(missingPins, missingCategories) > opts.count - path.length) continue;
        const last = state.path[state.path.length - 1];
        const leg = last ? walkingLeg(matrix, last.id, spot.id) : null;
        if (last && (!leg || leg.durationSeconds > opts.maxLegMinutes * 60)) continue;
        next.push({ path, seconds: state.seconds + (leg?.durationSeconds || 0) });
      }
    }
    next.sort((a, b) => score(a.path, a.seconds) - score(b.path, b.seconds)
      || a.path.map(spot => spot.id).join('|').localeCompare(b.path.map(spot => spot.id).join('|')));
    beam = next.slice(0, BEAM_WIDTH);
    if (!beam.length) return null;
  }
  return beam.find(state => requested.every(category => state.path.some(spot => spot.category === category))
    && opts.pinnedIds.every(id => state.path.some(spot => spot.id === id)))?.path || null;
}

/** Replacement preserves every other stop and checks BOTH affected legs. */
export function solveReplacement(current: CandidateSpot[], spotId: string, alternatives: CandidateSpot[], matrix: WalkingMatrix, opts: RouteOptions): CandidateSpot[] | null {
  const index = current.findIndex(spot => spot.id === spotId);
  if (index < 0) return null;
  const old = current[index];
  const other = current.filter(spot => spot.id !== spotId);
  const valid = alternatives.filter(spot => spot.id !== spotId && spot.category === old.category && eligible(other, spot, opts));
  const routes = valid.map(spot => current.map((item, i) => i === index ? spot : item)).map(path => {
    let seconds = 0;
    for (let i = 1; i < path.length; i++) {
      const leg = walkingLeg(matrix, path[i - 1].id, path[i].id);
      if (!leg || leg.durationSeconds > opts.maxLegMinutes * 60) return null;
      seconds += leg.durationSeconds;
    }
    return { path, seconds };
  }).filter((route): route is { path: CandidateSpot[]; seconds: number } => route !== null);
  routes.sort((a, b) => a.seconds - b.seconds);
  return routes[0]?.path || null;
}

export function visitMinutes(spot: CandidateSpot, pace: string): number {
  const time = spot.visitTime || '';
  const minutes = /^(\d+)\s*(?:min|minutes?)\b/i.exec(time);
  const hours = /^(\d+(?:\.\d+)?)\s*(?:h|hours?|heures?)\b/i.exec(time);
  const defaults: Record<string, number> = { restaurant: 60, cafe: 25, museum: 60, gallery: 35, shop: 20, viewpoint: 15 };
  const base = minutes ? Number(minutes[1]) : hours ? Number(hours[1]) * 60 : defaults[spot.role] || 25;
  return Math.round(Math.max(5, Math.min(240, base)) * (pace === 'relaxed' ? 1.15 : pace === 'packed' ? 0.8 : 1));
}
