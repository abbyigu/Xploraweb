import { generateObject } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { getServiceClient } from './_lib/usage.js';
import { resolveRole, canBeGeneratedAsStop, isCompleteCandidate } from './_itineraryLogic.js';
import type { CandidateSpot, WalkingMatrix } from './_itineraryLogic.js';
import { fetchWalkingMatrix } from './_lib/googleRoutes.js';
import { compactShortlists, solveCompactRoute, solveReplacement, walkingLeg, visitMinutes, ROUTING_CANDIDATE_LIMIT } from './_compactRouting.js';
import type { RouteOptions } from './_compactRouting.js';

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SPOT_CATEGORIES = ['Food', 'Cafe', 'Bar', 'Culture', 'Nature', 'Shopping', 'Family', 'History', 'Stays', 'Sweets', 'Terraces'] as const;
const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'] as const;
const PACES = ['relaxed', 'moderate', 'packed'] as const;
const WHO_OPTIONS = ['solo', 'couple', 'friends', 'family', 'visitors'] as const;
const REGULAR_STOP_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const FOOD_HOP_STOP_COUNTS = [3, 4, 5, 6];

// Columns mapSpotRow actually reads — narrower than `select('*')` so the
// (infrequently-changing) spots table transfers and parses faster on every request.
const SPOT_COLUMNS = [
  'id', 'name', 'name_fr', 'description', 'description_fr', 'address', 'lat', 'lng',
  'website', 'image_url', 'neighbourhood', 'vibes', 'category', 'role', 'visit_time',
  'price_range', 'xplora_tips', 'xplora_tips_fr', 'michelin_url',
].join(',');

// Warm-lambda cache for the active spots list: this data changes rarely, so reusing
// it across requests on the same warm instance avoids a full-table round trip.
const SPOTS_CACHE_TTL_MS = 60_000;
let spotsCache: { rows: any[]; expiresAt: number } | null = null;

async function getActiveSpots(supabase: ReturnType<typeof getServiceClient>): Promise<any[]> {
  const now = Date.now();
  if (spotsCache && spotsCache.expiresAt > now) return spotsCache.rows;
  const { data, error } = await supabase
    .from('xplora_spots')
    .select(SPOT_COLUMNS)
    .eq('status', 'active');
  if (error) throw error;
  spotsCache = { rows: data || [], expiresAt: now + SPOTS_CACHE_TTL_MS };
  return spotsCache.rows;
}

const RequestSchema = z.object({
  stopCount: z.number().int(),
  categories: z.array(z.enum(SPOT_CATEGORIES)),
  priceRanges: z.array(z.enum(PRICE_RANGES)),
  neighbourhoods: z.array(z.string()),
  language: z.enum(['en', 'fr']),
  restaurantHopping: z.boolean().optional().default(false),
  michelinOnly: z.boolean().optional().default(false),
  pace: z.enum(PACES).optional().default('moderate'),
  who: z.enum(WHO_OPTIONS).optional(),
  maxWalkMinutes: z.number().int().min(5).max(30).optional().default(10),
  replacement: z.object({ stopIds: z.array(z.string()).min(1).max(9), spotId: z.string() }).optional(),
  // Stops the user pinned on a previous generation — kept in every regenerated
  // option (not subject to the balanced-mix caps below) while the rest varies.
  // Order matters: it's the sequence the traveller last saw them in, and
  // preservePinnedOrder keeps them in that relative order across the regeneration.
  pinnedSpotIds: z.array(z.string()).max(9).optional().default([]),
  // Non-pinned spots already suggested in an earlier generation this session —
  // left out of the fill pool where possible so a regeneration surfaces fresh
  // picks instead of repeating what the traveller already saw.
  excludeSpotIds: z.array(z.string()).optional().default([]),
}).refine(
  body => (body.restaurantHopping ? FOOD_HOP_STOP_COUNTS : REGULAR_STOP_COUNTS).includes(body.stopCount),
  { message: 'Invalid stop count for the selected mode.', path: ['stopCount'] },
);

function mapSpotRow(row: any, lang: 'en' | 'fr'): CandidateSpot {
  const pick = (fr: string | null, en: string | null) => (lang === 'fr' && fr) ? fr : (en || null);
  const pickArr = (fr: string[] | null, en: string[] | null) => (lang === 'fr' && fr && fr.length > 0) ? fr : (en || []);
  return {
    id: row.id,
    name: pick(row.name_fr, row.name) || row.name,
    description: pick(row.description_fr, row.description),
    address: row.address ?? null,
    lat: row.lat ?? null,
    lng: row.lng ?? null,
    website: row.website ?? null,
    image: row.image_url ?? null,
    neighbourhood: row.neighbourhood ?? null,
    vibes: row.vibes || [],
    category: row.category ?? null,
    role: resolveRole(row.role, row.category),
    visitTime: row.visit_time ?? null,
    priceRange: row.price_range ?? null,
    xploraTips: pickArr(row.xplora_tips_fr, row.xplora_tips),
    michelinUrl: row.michelin_url ?? null,
  };
}

const CopySchema = z.object({
  title: z.string().max(80), summary: z.string().max(400),
  stops: z.array(z.object({ spotId: z.string(), note: z.string().max(280) })).max(9),
});

async function describeRoute(stops: CandidateSpot[], language: 'en' | 'fr') {
  const fallback = {
    title: language === 'fr' ? 'Votre sortie locale à pied' : 'Your local walking outing',
    summary: language === 'fr' ? 'Un parcours de proximité, dans l’ordre de visite indiqué.' : 'A nearby outing, arranged in walking order.',
    stops: stops.map(spot => ({ spotId: spot.id, note: spot.xploraTips[0] || '' })),
  };
  if (!process.env.ANTHROPIC_API_KEY) return fallback;
  try {
    const result = await generateObject({
      model: anthropic('claude-haiku-4-5-20251001'), schema: CopySchema, temperature: 0.4, maxRetries: 0, abortSignal: AbortSignal.timeout(8000),
      prompt: `Write a title, short summary and a note for each stop in ${language === 'fr' ? 'French' : 'English'} for this Québec City outing. The route has already been selected and verified by a walking router. Keep these exact stop ids and order. Do not select, add or reorder places. Notes should describe the place itself, not the sequence: never say begin, start, end or finish the outing in a stop note. Do not invent opening hours, walking times, stairs, transportation or accessibility claims. Ground notes in the supplied facts. Stops: ${JSON.stringify(stops.map(spot => ({ id: spot.id, name: spot.name, description: spot.description, tips: spot.xploraTips })))}`,
    });
    return result.object;
  } catch (error) {
    console.error('Route copy unavailable; using factual fallback.');
    return fallback;
  }
}

async function finishRoute(ordered: CandidateSpot[], matrix: WalkingMatrix, pool: CandidateSpot[], body: z.infer<typeof RequestSchema>) {
  const copy = await describeRoute(ordered, body.language);
  const notes = new Map(copy.stops.map(stop => [stop.spotId, stop.note]));
  let distanceMeters = 0, durationSeconds = 0;
  const stops = ordered.map((spot, i) => {
    const next = ordered[i + 1];
    const walkToNext = next ? walkingLeg(matrix, spot.id, next.id)! : undefined;
    if (walkToNext) { distanceMeters += walkToNext.distanceMeters; durationSeconds += walkToNext.durationSeconds; }
    return { type: 'stop' as const, order: i + 1, note: /\b(begin|start|end|finish|commencez|terminez|finissez)\b/i.test(notes.get(spot.id) || '') ? spot.xploraTips[0] || '' : notes.get(spot.id) || '', spot, ...(walkToNext ? { walkToNext } : {}) };
  });
  const chosen = new Set(ordered.map(spot => spot.id));
  return {
    title: copy.title, summary: copy.summary,
    estimatedDistanceKm: Math.round(distanceMeters / 10) / 100,
    estimatedDurationMin: Math.ceil(durationSeconds / 60) + ordered.reduce((sum, spot) => sum + visitMinutes(spot, body.pace), 0),
    stops,
    alternates: pool.filter(spot => !chosen.has(spot.id)).slice(0, ROUTING_CANDIDATE_LIMIT),
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
  const parsed = RequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid filters.', code: 'INVALID_INPUT' });
  const body = parsed.data;
  if (new Set(body.pinnedSpotIds).size > body.stopCount) return res.status(400).json({ error: 'Too many pinned stops.', code: 'INVALID_INPUT' });
  let rows: any[];
  try { rows = await getActiveSpots(getServiceClient()); }
  catch { return res.status(500).json({ error: 'Places could not be loaded.', code: 'LLM_ERROR' }); }
  const all = rows.map(row => mapSpotRow(row, body.language)).filter(isCompleteCandidate)
    .filter(spot => spot.category !== 'Stays' && canBeGeneratedAsStop(spot.role));
  const byId = new Map(all.map(spot => [spot.id, spot]));
  let pool = all.filter(spot => !body.neighbourhoods.length || !!spot.neighbourhood && body.neighbourhoods.includes(spot.neighbourhood));
  if (body.restaurantHopping) pool = pool.filter(spot => spot.category === 'Food' && (!body.michelinOnly || !!spot.michelinUrl));
  else if (body.categories.length) pool = pool.filter(spot => !!spot.category && body.categories.includes(spot.category as any));
  if (body.priceRanges.length) pool = pool.filter(spot => !!spot.priceRange && (/^(free|gratuit|gratuite|0\s*\$|\$0)$/i.test(spot.priceRange.trim()) || body.priceRanges.includes(spot.priceRange as any)));
  const opts: RouteOptions = { count: body.stopCount, categories: body.categories, pinnedIds: [...new Set(body.pinnedSpotIds)], maxLegMinutes: body.maxWalkMinutes, restaurantHopping: body.restaurantHopping };

  if (body.replacement) {
    const ids = body.replacement.stopIds;
    const current = ids.map(id => byId.get(id));
    if (new Set(ids).size !== ids.length || current.some(spot => !spot) || !ids.includes(body.replacement.spotId)
      || ids.length !== body.stopCount || body.pinnedSpotIds.includes(body.replacement.spotId)) {
      return res.status(400).json({ error: 'Invalid replacement.', code: 'INVALID_INPUT' });
    }
    const existing = current as CandidateSpot[];
    const old = byId.get(body.replacement.spotId)!;
    const candidates = pool.filter(spot => !ids.includes(spot.id) && spot.category === old.category);
    // Rank geography before paying for routing; keep the entire existing route
    // in the matrix so both connections and the unchanged legs are verified.
    const shortlist = compactShortlists(candidates, existing, [old.category || ''], existing.length)[0] || existing;
    if (existing.length === 1) {
      const replacement = candidates[0];
      if (!replacement) return res.status(422).json({ code: 'NO_COMPACT_ROUTE', error: 'No matching replacement is available.' });
      const matrix = { ids: [replacement.id], distanceMeters: [[0]], durationSeconds: [[0]] };
      return res.status(200).json({ itineraries: [await finishRoute([replacement], matrix, candidates, body)] });
    }
    const matrix = await fetchWalkingMatrix(shortlist.map(spot => ({ id: spot.id, lat: spot.lat!, lng: spot.lng! })));
    if (!matrix) return res.status(503).json({ code: 'ROUTING_UNAVAILABLE', error: 'Walking routes are temporarily unavailable.' });
    const ordered = solveReplacement(existing, old.id, shortlist.filter(spot => !ids.includes(spot.id)), matrix, opts);
    if (!ordered) return res.status(422).json({ code: 'NO_COMPACT_ROUTE', error: 'No nearby replacement fits the walking limit.' });
    return res.status(200).json({ itineraries: [await finishRoute(ordered, matrix, shortlist, body)] });
  }

  const pins = opts.pinnedIds.map(id => byId.get(id)).filter((spot): spot is CandidateSpot => !!spot);
  if (pins.length !== opts.pinnedIds.length) return res.status(400).json({ code: 'INVALID_INPUT', error: 'A pinned place is unavailable.' });
  const fresh = pool.filter(spot => !body.excludeSpotIds.includes(spot.id) || opts.pinnedIds.includes(spot.id));
  const candidates = fresh.length + pins.filter(pin => !fresh.some(spot => spot.id === pin.id)).length >= body.stopCount ? fresh : pool;
  if (new Set([...candidates, ...pins].map(spot => spot.id)).size < body.stopCount) {
    return res.status(422).json({ code: 'NO_CANDIDATES', error: 'Not enough places match your filters.' });
  }
  if (body.stopCount === 1) {
    const single = pins[0] || compactShortlists(candidates, [], body.categories, 1)[0]?.find(spot => !body.categories.length || body.categories.includes(spot.category as any));
    if (!single) return res.status(422).json({ code: 'NO_CANDIDATES', error: 'No place matches this interest.' });
    const matrix = { ids: [single.id], distanceMeters: [[0]], durationSeconds: [[0]] };
    return res.status(200).json({ itineraries: [await finishRoute([single], matrix, candidates, body)] });
  }
  let routed = false;
  for (const shortlist of compactShortlists(candidates, pins, body.categories, body.stopCount)) {
    const matrix = await fetchWalkingMatrix(shortlist.map(spot => ({ id: spot.id, lat: spot.lat!, lng: spot.lng! })));
    if (!matrix) continue;
    routed = true;
    const ordered = solveCompactRoute(shortlist, matrix, opts);
    if (ordered) return res.status(200).json({ itineraries: [await finishRoute(ordered, matrix, shortlist, body)] });
  }
  return res.status(routed ? 422 : 503).json({
    code: routed ? 'NO_COMPACT_ROUTE' : 'ROUTING_UNAVAILABLE',
    error: routed ? 'No compact route fits these filters and walking limit.' : 'Walking routes could not be verified.',
  });
}
