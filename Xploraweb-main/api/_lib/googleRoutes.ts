import type { WalkingMatrix } from '../_itineraryLogic.js';

/**
 * Confirms an itinerary's stop order against Google's real street/path
 * network instead of trusting straight-line distance. generate-itinerary.ts
 * orders stops by nearest-neighbour distance so the route never backtracks —
 * but a straight line can cut through a cliff, the river, or a building with
 * no actual footpath (very real in Québec City's Old Town), so a route that
 * looks fine on crow-flies distance can be nonsensical to actually walk.
 * This fetches Google's real walking distance/duration between every pair of
 * stops so ordering (and the reported distance/duration) reflects a route a
 * person could really walk.
 *
 * Never blocks itinerary generation: returns null on any failure (missing
 * key, network error, bad response) and callers fall back to straight-line
 * distance.
 */

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;
const ROUTE_MATRIX_URL = 'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix';

// Google rejects a matrix request over 625 origin*destination elements —
// itineraries top out at 12 stops (144 elements), so this is a generous
// safety cap rather than something normal usage should ever hit.
const MAX_POINTS = 24;

// Keep this well under Vercel's function timeout — a slow/hanging Google
// call should never be why itinerary generation fails.
const FETCH_TIMEOUT_MS = 6000;

export interface WalkingPoint {
  id: string;
  lat: number;
  lng: number;
}

function parseDurationSeconds(duration: unknown): number {
  if (typeof duration !== 'string') return Infinity;
  const match = /^(\d+(?:\.\d+)?)s$/.exec(duration);
  return match ? parseFloat(match[1]) : Infinity;
}

export async function fetchWalkingMatrix(points: WalkingPoint[]): Promise<WalkingMatrix | null> {
  if (!GOOGLE_KEY) return null;
  if (points.length < 2 || points.length > MAX_POINTS) return null;

  const waypoints = points.map(p => ({
    waypoint: { location: { latLng: { latitude: p.lat, longitude: p.lng } } },
  }));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(ROUTE_MATRIX_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_KEY,
        'X-Goog-FieldMask': 'originIndex,destinationIndex,distanceMeters,duration,condition',
      },
      body: JSON.stringify({ origins: waypoints, destinations: waypoints, travelMode: 'WALK' }),
    });
  } catch (err: any) {
    console.error('fetchWalkingMatrix: request failed:', err?.message || err);
    return null;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    console.error(`fetchWalkingMatrix: Routes API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return null;
  }

  let elements: any[];
  try {
    elements = await res.json();
  } catch (err: any) {
    console.error('fetchWalkingMatrix: could not parse response:', err?.message || err);
    return null;
  }
  if (!Array.isArray(elements)) return null;

  const n = points.length;
  const ids = points.map(p => p.id);
  const distanceMeters: number[][] = Array.from({ length: n }, () => Array(n).fill(Infinity));
  const durationSeconds: number[][] = Array.from({ length: n }, () => Array(n).fill(Infinity));
  for (let i = 0; i < n; i++) { distanceMeters[i][i] = 0; durationSeconds[i][i] = 0; }

  for (const el of elements) {
    if (el?.condition !== 'ROUTE_EXISTS') continue;
    const i = el.originIndex ?? 0;
    const j = el.destinationIndex ?? 0;
    if (i < 0 || i >= n || j < 0 || j >= n) continue;
    distanceMeters[i][j] = typeof el.distanceMeters === 'number' ? el.distanceMeters : Infinity;
    durationSeconds[i][j] = parseDurationSeconds(el.duration);
  }

  return { ids, distanceMeters, durationSeconds };
}
