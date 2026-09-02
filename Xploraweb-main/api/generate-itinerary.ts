import { generateObject } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { getServiceClient } from './_lib/usage.js';
import {
  resolveRole, canBeGeneratedAsStop, canAppearAsJourneyStep, isCompleteCandidate,
  selectBalancedStops, mergePinnedAndFilled, orderByNearestNeighbor, orderByCategorySequence, applyBarTimeOfDayRule,
  preservePinnedOrder, assembleItineraryItems, hasStrongCulturalPreference, isCafeFocused, dedupeStops,
} from './_itineraryLogic.js';
import type { CandidateSpot, StopCandidate, ItineraryItem } from './_itineraryLogic.js';

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SPOT_CATEGORIES = ['Food', 'Cafe', 'Bar', 'Culture', 'Nature', 'Shopping', 'Family', 'History', 'Stays', 'Sweets'] as const;
const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'] as const;
const PACES = ['relaxed', 'moderate', 'packed'] as const;
const REGULAR_STOP_COUNTS = [3, 5, 7, 9];
const FOOD_HOP_STOP_COUNTS = [3, 4, 5, 6];
const CANDIDATE_CAP = 24;
const ITINERARY_SET_SIZE = 1;

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
  // Stops the user pinned on a previous generation — kept in every regenerated
  // option (not subject to the balanced-mix caps below) while the rest varies.
  // Order matters: it's the sequence the traveller last saw them in, and
  // preservePinnedOrder keeps them in that relative order across the regeneration.
  pinnedSpotIds: z.array(z.string()).optional().default([]),
  // Non-pinned spots already suggested in an earlier generation this session —
  // left out of the fill pool where possible so a regeneration surfaces fresh
  // picks instead of repeating what the traveller already saw.
  excludeSpotIds: z.array(z.string()).optional().default([]),
}).refine(
  body => (body.restaurantHopping ? FOOD_HOP_STOP_COUNTS : REGULAR_STOP_COUNTS).includes(body.stopCount),
  { message: 'Invalid stop count for the selected mode.', path: ['stopCount'] },
);

const StopSchema = z.object({
  spotId: z.string(),
  order: z.number().int().min(1),
  note: z.string().max(280),
});
const ItinerarySchema = z.object({
  title: z.string().max(80),
  summary: z.string().max(400),
  estimatedDurationMin: z.number().int().positive(),
  estimatedDistanceKm: z.number().positive(),
  stops: z.array(StopSchema).min(1).max(12),
});
const ItinerarySetSchema = z.object({
  itineraries: z.array(ItinerarySchema).length(ITINERARY_SET_SIZE),
});

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

function isRestaurantHopping(body: z.infer<typeof RequestSchema>): boolean {
  return body.restaurantHopping === true;
}

// Orders a route geographically (no backtracking), then — if the traveller
// picked an activity order (2+ categories, in the order they chose them) —
// re-groups it by that category sequence while keeping the geographic order
// within each group.
function orderRoute<T extends { spot: CandidateSpot }>(stops: T[], body: z.infer<typeof RequestSchema>): T[] {
  const byDistance = orderByNearestNeighbor(stops);
  if (isRestaurantHopping(body) || body.categories.length < 2) return byDistance;
  return orderByCategorySequence(byDistance, body.categories);
}

function isMichelinOnly(body: z.infer<typeof RequestSchema>): boolean {
  return isRestaurantHopping(body) && body.michelinOnly === true;
}

const PACE_INSTRUCTION: Record<(typeof PACES)[number], string> = {
  relaxed: 'The traveller wants a relaxed pace — favour fewer, longer stops with generous dwell time and a leisurely total duration estimate.',
  moderate: 'The traveller wants a moderate, comfortable pace — balance sightseeing time with walking, nothing rushed.',
  packed: 'The traveller wants a packed, efficient pace — keep dwell times tighter so more ground gets covered without feeling rushed.',
};

function buildPrompt(candidates: CandidateSpot[], stopsToGenerate: number, body: z.infer<typeof RequestSchema>): string {
  const candidateList = candidates.map(c => ({
    id: c.id, name: c.name, category: c.category, priceRange: c.priceRange,
    neighbourhood: c.neighbourhood, visitTime: c.visitTime, lat: c.lat, lng: c.lng,
    ...(c.vibes.length > 0 ? { tags: c.vibes } : {}),
  }));
  const restaurantHopping = isRestaurantHopping(body);
  const multiple = ITINERARY_SET_SIZE > 1;
  return `You are assembling ${multiple ? `${ITINERARY_SET_SIZE} distinct self-guided walking itinerary OPTIONS` : 'a self-guided walking itinerary'} in Québec City from a fixed list of real places${multiple ? ', so a traveller can compare and pick one.' : '.'}

Candidate spots (JSON, only use these — never invent an id):
${JSON.stringify(candidateList)}

Requirements:
- Return exactly ${ITINERARY_SET_SIZE} itinerar${multiple ? 'ies' : 'y'} in "itineraries".${multiple ? " Each one must be a genuinely different route — vary the sub-area, focus, or mix of stops between them (don't just reorder the same stops). A spot may reappear across itineraries only if there isn't enough variety among the candidates to avoid it." : ''}
- Every candidate here is a genuine destination worth stopping at — none of them are transit, stairs, or walking connectors, so you never need to filter those out yourself.
- Each itinerary must include exactly ${stopsToGenerate} stops.
- Estimate a realistic total walking + visiting duration and distance for each route, and report them in "estimatedDurationMin"/"estimatedDistanceKm".
- Order each itinerary's stops into a sensible walking route (avoid backtracking where possible, based on lat/lng).
- ${PACE_INSTRUCTION[body.pace]}
${body.neighbourhoods.length ? `- Stay within these neighbourhoods: ${body.neighbourhoods.join(', ')}.` : ''}
${!restaurantHopping && body.categories.length ? `- Prefer categories: ${body.categories.join(', ')}.` : ''}
${!restaurantHopping && body.categories.length >= 2 ? `- The traveller wants to move through these categories roughly in this order: ${body.categories.join(' → ')}. Order each itinerary's stops to follow that sequence as closely as the geography allows (e.g. a ${body.categories[0]} stop earlier in the route, a ${body.categories[body.categories.length - 1]} stop later).` : ''}
${body.priceRanges.length ? `- Prefer spots in this price range: ${body.priceRanges.join(', ')}.` : ''}
${restaurantHopping ? '- This is a restaurant-hopping route: every stop must be a Food-category spot.' : '- Include at most 1 Food-category stop total per itinerary; prioritize variety across other categories.'}
${isMichelinOnly(body) ? '- Every stop must be a Michelin Guide-listed restaurant, drawn only from the Michelin-listed candidates provided.' : ''}
- Avoid picking two near-identical spots (same name, or virtually the same place) within one itinerary.
- Each candidate's "tags" (when present) describe what's actually notable there (e.g. specific dishes, drinks, or features) — use them to pick a varied, well-fitting set of stops and to ground each note in something concrete.
- Write ${multiple ? 'each title and summary' : 'the title and summary'} in ${body.language === 'fr' ? 'French' : 'English'}.${multiple ? ` Give each of the ${ITINERARY_SET_SIZE} itineraries a distinct, descriptive title reflecting what makes it different from the others.` : ' Give it a distinct, descriptive title.'}
- For each stop, write a short one-to-two sentence "note" explaining why it fits this route.
- Every "spotId" you return MUST be one of the candidate ids above, verbatim.`;
}

interface ProcessedItinerary {
  title: string;
  summary: string;
  estimatedDurationMin: number;
  estimatedDistanceKm: number;
  stops: ItineraryItem[];
  alternates: CandidateSpot[];
}

function processItinerary(
  raw: z.infer<typeof ItinerarySchema>,
  fillCandidates: CandidateSpot[],
  pinnedStops: StopCandidate[],
  connectorPool: CandidateSpot[],
  destinationPool: CandidateSpot[],
  body: z.infer<typeof RequestSchema>,
  stopsToGenerate: number,
): ProcessedItinerary | null {
  const fillById = new Map(fillCandidates.map(c => [c.id, c]));
  const picked: StopCandidate[] = raw.stops
    .filter(s => fillById.has(s.spotId))
    .sort((a, b) => a.order - b.order)
    .map(s => ({ note: s.note, spot: fillById.get(s.spotId)! }));

  // Rules 3-5: dedupe near-identical picks and cap museums/galleries, cafés,
  // and viewpoints, backfilling from the remaining pool up to what's needed.
  const remainingFillPool = fillCandidates
    .filter(c => !picked.some(p => p.spot.id === c.id))
    .map(spot => ({ spot, note: '' }));
  const balanced = selectBalancedStops(picked, remainingFillPool, {
    foodCap: isRestaurantHopping(body) ? body.stopCount : 1,
    strongCulturalPreference: hasStrongCulturalPreference(body.categories),
    cafeFocused: isCafeFocused(body.categories),
    targetCount: stopsToGenerate,
  });

  const merged = mergePinnedAndFilled(pinnedStops, balanced);
  if (merged.length < 2) return null;

  const ordered = applyBarTimeOfDayRule(preservePinnedOrder(orderRoute(merged, body), body.pinnedSpotIds));
  const items = assembleItineraryItems(ordered, connectorPool, body.language);

  const chosenIds = new Set(ordered.map(s => s.spot.id));
  const alternates = dedupeStops(destinationPool.filter(c => !chosenIds.has(c.id)).map(spot => ({ spot, note: '' })))
    .map(s => s.spot)
    .slice(0, CANDIDATE_CAP);

  return {
    title: raw.title,
    summary: raw.summary,
    estimatedDurationMin: raw.estimatedDurationMin,
    estimatedDistanceKm: raw.estimatedDistanceKm,
    stops: items,
    alternates,
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });

  const parsed = RequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid filters.', code: 'INVALID_INPUT' });
  }
  const body = parsed.data;

  const supabase = getServiceClient();

  let rows: any[];
  try {
    rows = await getActiveSpots(supabase);
  } catch (dbError: any) {
    return res.status(500).json({ error: dbError.message, code: 'LLM_ERROR' });
  }

  // Closed/draft listings are already excluded by the status filter above;
  // isCompleteCandidate additionally drops rows missing a name or coordinates.
  const allCandidates = (rows || [])
    .map(r => mapSpotRow(r, body.language))
    .filter(isCompleteCandidate)
    .filter(c => c.category !== 'Stays');

  // Rule 1/2: connectors and transportation are never eligible as primary
  // stops, and are never sent to the LLM as choosable candidates — they can
  // only surface afterward as a journey step we insert between two real stops.
  let destinationPool = allCandidates.filter(c => canBeGeneratedAsStop(c.role));
  const connectorPool = allCandidates.filter(c => canAppearAsJourneyStep(c.role));

  if (body.neighbourhoods.length > 0) {
    destinationPool = destinationPool.filter(c => c.neighbourhood && body.neighbourhoods.includes(c.neighbourhood));
  }
  if (isRestaurantHopping(body)) {
    destinationPool = destinationPool.filter(c => c.category === 'Food');
    if (isMichelinOnly(body)) {
      destinationPool = destinationPool.filter(c => c.michelinUrl != null);
    }
  } else if (body.categories.length > 0) {
    destinationPool = destinationPool.filter(c => c.category && body.categories.includes(c.category as any));
  }
  if (body.priceRanges.length > 0) {
    destinationPool = destinationPool.filter(c => c.priceRange && body.priceRanges.includes(c.priceRange as any));
  }

  // Pinned stops must survive regeneration regardless of the filters above
  // (the user already chose them) — pull them from the unfiltered pool.
  const allById = new Map<string, CandidateSpot>(allCandidates.map(c => [c.id, c]));
  const pinnedStops: StopCandidate[] = body.pinnedSpotIds
    .map(id => allById.get(id))
    .filter((c): c is CandidateSpot => c !== undefined && canBeGeneratedAsStop(c.role))
    .map(spot => ({ spot, note: '' }));
  const pinnedIds = new Set(pinnedStops.map(p => p.spot.id));

  const stopsToGenerate = Math.max(0, body.stopCount - pinnedStops.length);
  const unpinnedDestinations = destinationPool.filter(c => !pinnedIds.has(c.id));
  const excludeIds = new Set(body.excludeSpotIds.filter(id => !pinnedIds.has(id)));
  const freshDestinations = unpinnedDestinations.filter(c => !excludeIds.has(c.id));
  // Prefer spots the traveller hasn't already seen, but fall back to the
  // full (unexcluded) pool rather than fail to fill the route when the
  // filters don't leave enough fresh candidates.
  const fillCandidates = (freshDestinations.length >= Math.max(stopsToGenerate, 2) ? freshDestinations : unpinnedDestinations)
    .slice(0, CANDIDATE_CAP);

  if (fillCandidates.length < 2 && pinnedStops.length < 2) {
    return res.status(422).json({ error: 'No spots match your filters yet — try fewer filters.', code: 'NO_CANDIDATES' });
  }

  let itineraries: ProcessedItinerary[] = [];

  if (stopsToGenerate > 0 && fillCandidates.length > 0) {
    const prompt = buildPrompt(fillCandidates, Math.max(stopsToGenerate, 2), body);
    let object: z.infer<typeof ItinerarySetSchema> | undefined;
    try {
      const result = await generateObject({
        model: anthropic('claude-haiku-4-5-20251001'),
        schema: ItinerarySetSchema,
        prompt,
      });
      object = result.object;
    } catch (err: any) {
      console.error('generate-itinerary LLM call failed:', err?.message || err, err?.cause || '');
    }
    if (!object) {
      return res.status(502).json({ error: 'Something went wrong generating your route. Please try again.', code: 'LLM_ERROR' });
    }

    itineraries = object.itineraries
      .map(raw => processItinerary(raw, fillCandidates, pinnedStops, connectorPool, destinationPool, body, stopsToGenerate))
      .filter((it): it is ProcessedItinerary => it !== null);
  } else if (pinnedStops.length >= 2) {
    // Nothing left to fill (or none requested) — the pinned stops alone still make a valid route.
    const ordered = applyBarTimeOfDayRule(preservePinnedOrder(orderRoute(pinnedStops, body), body.pinnedSpotIds));
    itineraries = [{
      title: body.language === 'fr' ? 'Votre itinéraire' : 'Your itinerary',
      summary: '',
      estimatedDurationMin: 0,
      estimatedDistanceKm: 0,
      stops: assembleItineraryItems(ordered, connectorPool, body.language),
      alternates: dedupeStops(destinationPool.filter(c => !pinnedIds.has(c.id)).map(spot => ({ spot, note: '' })))
        .map(s => s.spot).slice(0, CANDIDATE_CAP),
    }];
  }

  if (itineraries.length === 0) {
    return res.status(502).json({ error: 'The AI returned an invalid itinerary. Please try again.', code: 'LLM_ERROR' });
  }

  res.status(200).json({ itineraries });
}
