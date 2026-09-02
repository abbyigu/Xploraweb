// Pure, unit-testable itinerary-assembly logic used by generate-itinerary.ts.
// Kept dependency-free (no supabase/ai imports) so it can be exercised
// directly by Vitest without mocking the network or the LLM.
//
// Prefixed with `_` so Vercel's filesystem router does not expose it as an
// API route (same convention as any other api/_*.ts helper).

/**
 * A spot's structural role in an itinerary — distinct from `category`
 * (the topical label like Food/Culture/Nature). Duplicated here rather than
 * imported from src/app/data/products.ts to keep this Vercel function
 * self-contained, matching how SPOT_CATEGORIES is already duplicated in
 * generate-itinerary.ts.
 */
export const SPOT_ROLES = [
  'destination', 'restaurant', 'cafe', 'bar', 'shop', 'museum', 'gallery',
  'park', 'viewpoint', 'landmark', 'experience', 'transportation', 'connector',
] as const;
export type SpotRole = (typeof SPOT_ROLES)[number];

const NON_STOP_ROLES: readonly SpotRole[] = ['transportation', 'connector'];

export function canBeGeneratedAsStop(role: SpotRole): boolean {
  return !NON_STOP_ROLES.includes(role);
}

export function canAppearAsJourneyStep(role: SpotRole): boolean {
  return NON_STOP_ROLES.includes(role);
}

export function inferDefaultRole(category?: string | null): SpotRole {
  switch (category) {
    case 'Food':
    case 'Sweets': return 'restaurant';
    case 'Cafe': return 'cafe';
    case 'Bar': return 'bar';
    case 'Shopping': return 'shop';
    case 'Nature': return 'park';
    case 'Culture':
    case 'History': return 'landmark';
    case 'Family': return 'experience';
    default: return 'destination';
  }
}

export function resolveRole(role: string | null | undefined, category: string | null | undefined): SpotRole {
  return (SPOT_ROLES as readonly string[]).includes(role || '') ? (role as SpotRole) : inferDefaultRole(category);
}

export interface CandidateSpot {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  website: string | null;
  image: string | null;
  neighbourhood: string | null;
  vibes: string[];
  category: string | null;
  role: SpotRole;
  visitTime: string | null;
  priceRange: string | null;
  xploraTips: string[];
  michelinUrl: string | null;
}

export interface StopCandidate {
  note: string;
  spot: CandidateSpot;
}

export interface DestinationStopItem {
  type: 'stop';
  order: number;
  note: string;
  spot: CandidateSpot;
}
export interface JourneyStepItem {
  type: 'journeyStep';
  description: string;
  spot: CandidateSpot;
}
export type ItineraryItem = DestinationStopItem | JourneyStepItem;

/** A listing missing a name or coordinates can't be shown or routed to — drop it. */
export function isCompleteCandidate(c: CandidateSpot): boolean {
  return !!(c.name && c.name.trim().length > 0 && c.lat != null && c.lng != null);
}

const COMBINING_DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');

export function normalizeName(name: string): string {
  return name
    .normalize('NFD').replace(COMBINING_DIACRITICS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const NEAR_DUPLICATE_METERS = 40;

/** Same spot, or close enough in name/location that showing both would be redundant. */
export function isNearDuplicate(a: CandidateSpot, b: CandidateSpot): boolean {
  if (a.id === b.id) return true;
  if (normalizeName(a.name) === normalizeName(b.name)) return true;
  if (a.lat != null && a.lng != null && b.lat != null && b.lng != null) {
    return haversineMeters({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng }) <= NEAR_DUPLICATE_METERS;
  }
  return false;
}

function isNearDuplicateOfAny<T extends { spot: CandidateSpot }>(item: T, list: T[]): boolean {
  return list.some(k => isNearDuplicate(item.spot, k.spot));
}

export function dedupeStops<T extends { spot: CandidateSpot }>(items: T[]): T[] {
  const kept: T[] = [];
  for (const item of items) {
    if (!isNearDuplicateOfAny(item, kept)) kept.push(item);
  }
  return kept;
}

export const MUSEUM_GALLERY_CAP = 2;
export const CAFE_ROLE_CAP = 2;
export const VIEWPOINT_CAP = 1;

export function hasStrongCulturalPreference(categories: string[]): boolean {
  return categories.length > 0 && categories.every(c => c === 'Culture');
}

export function isCafeFocused(categories: string[]): boolean {
  return categories.length > 0 && categories.every(c => c === 'Cafe');
}

function capCombinedRoles<T extends { spot: CandidateSpot }>(
  items: T[], roles: readonly SpotRole[], cap: number, unlimited: boolean,
): { kept: T[]; cut: T[] } {
  if (unlimited) return { kept: items, cut: [] };
  const kept: T[] = [];
  const cut: T[] = [];
  let count = 0;
  for (const item of items) {
    if (roles.includes(item.spot.role)) {
      count += 1;
      if (count > cap) { cut.push(item); continue; }
    }
    kept.push(item);
  }
  return { kept, cut };
}

export interface BalanceOptions {
  /** Existing pre-role-model rule: cap category==='Food' stops (1, or stopCount if restaurant-hopping). */
  foodCap: number;
  strongCulturalPreference: boolean;
  cafeFocused: boolean;
  targetCount: number;
}

/**
 * Applies dedup + the balanced-mix caps (rules 3-5 from the itinerary spec)
 * to the LLM's chosen destination stops, then backfills from `fillPool` up
 * to `targetCount`. A second viewpoint is only let back in during backfill
 * if there's nothing else left to reach the requested stop count — i.e. the
 * route "naturally" needs it.
 */
export function selectBalancedStops(
  picked: StopCandidate[],
  fillPool: StopCandidate[],
  opts: BalanceOptions,
): StopCandidate[] {
  let working = picked.filter(p => canBeGeneratedAsStop(p.spot.role));
  working = dedupeStops(working);

  // Pre-existing rule (predates the role model): at most `foodCap` Food-category stops.
  {
    let count = 0;
    working = working.filter(s => {
      if (s.spot.category !== 'Food') return true;
      count += 1;
      return count <= opts.foodCap;
    });
  }

  const museumResult = capCombinedRoles(working, ['museum', 'gallery'], MUSEUM_GALLERY_CAP, opts.strongCulturalPreference);
  working = museumResult.kept;

  const cafeResult = capCombinedRoles(working, ['cafe'], CAFE_ROLE_CAP, opts.cafeFocused);
  working = cafeResult.kept;

  const viewpointResult = capCombinedRoles(working, ['viewpoint'], VIEWPOINT_CAP, false);
  working = viewpointResult.kept;
  const cutViewpoints = viewpointResult.cut;

  const usedIds = new Set(working.map(s => s.spot.id));
  const withinRoleCap = (candidate: StopCandidate): boolean => {
    if (candidate.spot.category === 'Food') return false; // don't reopen the food cap during backfill
    if (['museum', 'gallery'].includes(candidate.spot.role) && !opts.strongCulturalPreference) {
      if (working.filter(s => ['museum', 'gallery'].includes(s.spot.role)).length >= MUSEUM_GALLERY_CAP) return false;
    }
    if (candidate.spot.role === 'cafe' && !opts.cafeFocused) {
      if (working.filter(s => s.spot.role === 'cafe').length >= CAFE_ROLE_CAP) return false;
    }
    if (candidate.spot.role === 'viewpoint') {
      if (working.filter(s => s.spot.role === 'viewpoint').length >= VIEWPOINT_CAP) return false;
    }
    return true;
  };

  for (const candidate of fillPool) {
    if (working.length >= opts.targetCount) break;
    if (usedIds.has(candidate.spot.id)) continue;
    if (!canBeGeneratedAsStop(candidate.spot.role)) continue;
    if (!withinRoleCap(candidate)) continue;
    if (isNearDuplicateOfAny(candidate, working)) continue;
    working.push(candidate);
    usedIds.add(candidate.spot.id);
  }

  // Nothing else available to complete the route — this is the "route
  // naturally includes more than one viewpoint" case, so let one back in.
  for (const candidate of cutViewpoints) {
    if (working.length >= opts.targetCount) break;
    if (usedIds.has(candidate.spot.id)) continue;
    if (isNearDuplicateOfAny(candidate, working)) continue;
    working.push(candidate);
    usedIds.add(candidate.spot.id);
  }

  // The LLM/schema may hand back more picks than actually needed (e.g. a
  // schema minimum higher than the pinned-adjusted target) — never exceed
  // what was asked for.
  return working.slice(0, opts.targetCount);
}

/** Pinned stops are always present (never subject to the caps above), then filled stops merge in around them. */
export function mergePinnedAndFilled(pinned: StopCandidate[], filled: StopCandidate[]): StopCandidate[] {
  const merged = [...pinned];
  const usedIds = new Set(pinned.map(p => p.spot.id));
  for (const f of filled) {
    if (usedIds.has(f.spot.id) || isNearDuplicateOfAny(f, merged)) continue;
    merged.push(f);
    usedIds.add(f.spot.id);
  }
  return merged;
}

// The LLM is asked to avoid backtracking, but its spatial reasoning over raw
// lat/lng isn't reliable — it can pick a sensible spot selection while still
// ordering them in a way that zigzags across the map. Keep its chosen
// starting stop (reflects the intended narrative opener) but re-sequence
// everything after it by nearest-neighbour distance, computed from the
// spots' real coordinates, so the route on the map never backtracks.
export function orderByNearestNeighbor<T extends { spot: CandidateSpot }>(stops: T[]): T[] {
  if (stops.length <= 2) return stops;
  const remaining = [...stops];
  const ordered: T[] = [remaining.shift()!];
  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1].spot;
    let nearestIndex = 0;
    let nearestDist = Infinity;
    remaining.forEach((s, i) => {
      const d = haversineMeters({ lat: last.lat!, lng: last.lng! }, { lat: s.spot.lat!, lng: s.spot.lng! });
      if (d < nearestDist) { nearestDist = d; nearestIndex = i; }
    });
    ordered.push(remaining.splice(nearestIndex, 1)[0]);
  }
  return ordered;
}

/**
 * The traveller can pick not just which categories to include but the order
 * they want to visit them in (e.g. Food, then Culture, then Shopping).
 * Re-groups an already geography-ordered route by that category rank —
 * `Array#sort` is stable, so stops within the same rank (or a category the
 * traveller didn't rank) keep the nearest-neighbour order they arrived in.
 */
export function orderByCategorySequence<T extends { spot: CandidateSpot }>(stops: T[], sequence: string[]): T[] {
  if (sequence.length < 2) return stops;
  const rank = new Map(sequence.map((c, i) => [c, i]));
  const rankOf = (s: T) => rank.get(s.spot.category || '') ?? sequence.length;
  return [...stops].sort((a, b) => rankOf(a) - rankOf(b));
}

/**
 * Restaurants/cafés/bars should suit the time of day they land at in the
 * route. There's no explicit time-of-day filter in this builder yet, so the
 * one concrete, testable rule we can apply from stop order alone: a bar
 * shouldn't open the itinerary (that's a morning slot). If the ordering put
 * one first, move it to the end instead of re-running the whole route.
 */
export function applyBarTimeOfDayRule<T extends { spot: CandidateSpot }>(ordered: T[]): T[] {
  if (ordered.length < 2) return ordered;
  const isBar = (s: T) => s.spot.role === 'bar' || s.spot.category === 'Bar';
  if (!isBar(ordered[0]) || ordered.every(isBar)) return ordered;
  const [first, ...rest] = ordered;
  return [...rest, first];
}

/**
 * Pinned stops are meant to "stay put" across a regeneration, but the
 * geography/category ordering above re-sequences the whole route (pinned and
 * filled together) from scratch, so two pinned stops could still swap places
 * relative to each other if the fill around them changed. `pinnedOrder` is
 * the order the traveller last saw them in (see mergePinnedAndFilled callers) —
 * re-sort just the pinned stops, in their existing slots, to match it; every
 * unpinned stop keeps exactly the slot the ordering above gave it.
 */
export function preservePinnedOrder<T extends { spot: CandidateSpot }>(
  ordered: T[], pinnedOrder: string[],
): T[] {
  if (pinnedOrder.length < 2) return ordered;
  const rank = new Map(pinnedOrder.map((id, i) => [id, i]));
  const slots: number[] = [];
  const pinnedItems: T[] = [];
  ordered.forEach((item, i) => {
    if (rank.has(item.spot.id)) {
      slots.push(i);
      pinnedItems.push(item);
    }
  });
  if (pinnedItems.length < 2) return ordered;
  const sortedPinned = [...pinnedItems].sort((a, b) => rank.get(a.spot.id)! - rank.get(b.spot.id)!);
  const result = [...ordered];
  slots.forEach((slot, i) => { result[slot] = sortedPinned[i]; });
  return result;
}

function toXY(p: { lat: number; lng: number }, originLat: number) {
  const R = 6371000;
  return {
    x: (p.lng * Math.PI) / 180 * R * Math.cos((originLat * Math.PI) / 180),
    y: (p.lat * Math.PI) / 180 * R,
  };
}

/** Approximate distance from a point to a line segment, in meters (planar projection — fine at city scale). */
export function pointToSegmentDistanceMeters(
  point: { lat: number; lng: number }, a: { lat: number; lng: number }, b: { lat: number; lng: number },
): number {
  const originLat = a.lat;
  const p = toXY(point, originLat), pa = toXY(a, originLat), pb = toXY(b, originLat);
  const dx = pb.x - pa.x, dy = pb.y - pa.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) return Math.hypot(p.x - pa.x, p.y - pa.y);
  let t = ((p.x - pa.x) * dx + (p.y - pa.y) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (pa.x + t * dx), p.y - (pa.y + t * dy));
}

export const JOURNEY_STEP_MAX_DISTANCE_METERS = 250;

/** Finds the nearest not-yet-used connector/transportation spot lying on the walk between two stops. */
export function findConnectorForGap(
  from: CandidateSpot, to: CandidateSpot, connectors: CandidateSpot[], usedIds: Set<string>,
): CandidateSpot | null {
  if (from.lat == null || from.lng == null || to.lat == null || to.lng == null) return null;
  let best: CandidateSpot | null = null;
  let bestDist = Infinity;
  for (const c of connectors) {
    if (usedIds.has(c.id) || c.lat == null || c.lng == null) continue;
    const d = pointToSegmentDistanceMeters(
      { lat: c.lat, lng: c.lng },
      { lat: from.lat, lng: from.lng },
      { lat: to.lat, lng: to.lng },
    );
    if (d <= JOURNEY_STEP_MAX_DISTANCE_METERS && d < bestDist) { best = c; bestDist = d; }
  }
  return best;
}

export function buildJourneyStepText(connector: CandidateSpot, from: CandidateSpot, to: CandidateSpot, lang: 'en' | 'fr'): string {
  const toPlace = to.neighbourhood || to.name;
  if (connector.role === 'transportation') {
    const fromPlace = from.neighbourhood || from.name;
    return lang === 'fr'
      ? `Prenez ${connector.name} entre ${fromPlace} et ${toPlace}.`
      : `Take the ${connector.name} between ${fromPlace} and ${toPlace}.`;
  }
  return lang === 'fr'
    ? `Marchez le long de ${connector.name} vers ${toPlace}.`
    : `Walk down ${connector.name} toward ${toPlace}.`;
}

/** Interleaves numbered destination stops with journey steps for any connector found between consecutive stops. */
export function assembleItineraryItems(
  orderedStops: StopCandidate[], connectors: CandidateSpot[], lang: 'en' | 'fr',
): ItineraryItem[] {
  const items: ItineraryItem[] = [];
  const usedConnectorIds = new Set<string>();
  orderedStops.forEach((stop, i) => {
    items.push({ type: 'stop', order: i + 1, note: stop.note, spot: stop.spot });
    const next = orderedStops[i + 1];
    if (!next) return;
    const connector = findConnectorForGap(stop.spot, next.spot, connectors, usedConnectorIds);
    if (connector) {
      usedConnectorIds.add(connector.id);
      items.push({ type: 'journeyStep', description: buildJourneyStepText(connector, stop.spot, next.spot, lang), spot: connector });
    }
  });
  return items;
}
