import { createClient } from '@supabase/supabase-js';
import { generateObject } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const SPOT_CATEGORIES = ['Food', 'Cafe', 'Bar', 'Culture', 'Nature', 'Shopping', 'Family', 'History', 'Stays', 'Sweets'] as const;
const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'] as const;
const REGULAR_STOP_COUNTS = [3, 5, 7, 9];
const FOOD_HOP_STOP_COUNTS = [3, 4, 5, 6];
const CANDIDATE_CAP = 40;

const RequestSchema = z.object({
  stopCount: z.number().int(),
  categories: z.array(z.enum(SPOT_CATEGORIES)),
  priceRanges: z.array(z.enum(PRICE_RANGES)),
  neighbourhoods: z.array(z.string()),
  language: z.enum(['en', 'fr']),
  restaurantHopping: z.boolean().optional().default(false),
  michelinOnly: z.boolean().optional().default(false),
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
  stops: z.array(StopSchema).min(2).max(12),
});

interface CandidateSpot {
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
  visitTime: string | null;
  priceRange: string | null;
  xploraTips: string[];
  michelinUrl: string | null;
}

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
    visitTime: row.visit_time ?? null,
    priceRange: row.price_range ?? null,
    xploraTips: pickArr(row.xplora_tips_fr, row.xplora_tips),
    michelinUrl: row.michelin_url ?? null,
  };
}

function isRestaurantHopping(body: z.infer<typeof RequestSchema>): boolean {
  return body.restaurantHopping === true;
}

function isMichelinOnly(body: z.infer<typeof RequestSchema>): boolean {
  return isRestaurantHopping(body) && body.michelinOnly === true;
}

function haversineMeters(a: CandidateSpot, b: CandidateSpot): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat! - a.lat!);
  const dLng = toRad(b.lng! - a.lng!);
  const la1 = toRad(a.lat!);
  const la2 = toRad(b.lat!);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// The LLM is asked to avoid backtracking, but its spatial reasoning over raw
// lat/lng isn't reliable — it can pick a sensible spot selection while still
// ordering them in a way that zigzags across the map. Keep its chosen
// starting stop (reflects the intended narrative opener) but re-sequence
// everything after it by nearest-neighbour distance, computed from the
// spots' real coordinates, so the route on the map never backtracks.
function orderByNearestNeighbor<T extends { spot: CandidateSpot }>(stops: T[]): T[] {
  if (stops.length <= 2) return stops;
  const remaining = [...stops];
  const ordered: T[] = [remaining.shift()!];
  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1].spot;
    let nearestIndex = 0;
    let nearestDist = Infinity;
    remaining.forEach((s, i) => {
      const d = haversineMeters(last, s.spot);
      if (d < nearestDist) { nearestDist = d; nearestIndex = i; }
    });
    ordered.push(remaining.splice(nearestIndex, 1)[0]);
  }
  return ordered;
}

function buildPrompt(candidates: CandidateSpot[], body: z.infer<typeof RequestSchema>): string {
  const candidateList = candidates.map(c => ({
    id: c.id, name: c.name, category: c.category, priceRange: c.priceRange,
    neighbourhood: c.neighbourhood, visitTime: c.visitTime, lat: c.lat, lng: c.lng,
    ...(c.vibes.length > 0 ? { tags: c.vibes } : {}),
  }));
  const restaurantHopping = isRestaurantHopping(body);
  return `You are assembling a self-guided walking itinerary in Québec City from a fixed list of real places.

Candidate spots (JSON, only use these — never invent an id):
${JSON.stringify(candidateList)}

Requirements:
- Include exactly ${body.stopCount} stops.
- Estimate a realistic total walking + visiting duration and distance for the route you assemble, and report them in "estimatedDurationMin"/"estimatedDistanceKm".
- Order the stops into a sensible walking route (avoid backtracking where possible, based on lat/lng).
${body.neighbourhoods.length ? `- Stay within these neighbourhoods: ${body.neighbourhoods.join(', ')}.` : ''}
${!restaurantHopping && body.categories.length ? `- Prefer categories: ${body.categories.join(', ')}.` : ''}
${body.priceRanges.length ? `- Prefer spots in this price range: ${body.priceRanges.join(', ')}.` : ''}
${restaurantHopping ? '- This is a restaurant-hopping route: every stop must be a Food-category spot.' : '- Include at most 1 Food-category stop total; prioritize variety across other categories.'}
${isMichelinOnly(body) ? '- Every stop must be a Michelin Guide-listed restaurant, drawn only from the Michelin-listed candidates provided.' : ''}
- Each candidate's "tags" (when present) describe what's actually notable there (e.g. specific dishes, drinks, or features) — use them to pick a varied, well-fitting set of stops and to ground each note in something concrete.
- Write the title and summary in ${body.language === 'fr' ? 'French' : 'English'}.
- For each stop, write a short one-to-two sentence "note" explaining why it fits this route.
- Every "spotId" you return MUST be one of the candidate ids above, verbatim.`;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });

  const parsed = RequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid filters.', code: 'INVALID_INPUT' });
  }
  const body = parsed.data;

  const supabase = createClient(
    'https://qnalvzgqrfjbuoqsffbs.supabase.co',
    process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_CCDW9tXRVNYA66aqo190bw_hIVgo8Nt',
  );

  const { data: rows, error: dbError } = await supabase
    .from('xplora_spots')
    .select('*')
    .eq('status', 'active');
  if (dbError) return res.status(500).json({ error: dbError.message, code: 'LLM_ERROR' });

  let candidates = (rows || [])
    .map(r => mapSpotRow(r, body.language))
    .filter(c => c.lat != null && c.lng != null);

  if (body.neighbourhoods.length > 0) {
    candidates = candidates.filter(c => c.neighbourhood && body.neighbourhoods.includes(c.neighbourhood));
  }
  if (isRestaurantHopping(body)) {
    candidates = candidates.filter(c => c.category === 'Food');
    if (isMichelinOnly(body)) {
      candidates = candidates.filter(c => c.michelinUrl != null);
    }
  } else if (body.categories.length > 0) {
    candidates = candidates.filter(c => c.category && body.categories.includes(c.category as any));
  }
  if (body.priceRanges.length > 0) {
    candidates = candidates.filter(c => c.priceRange && body.priceRanges.includes(c.priceRange as any));
  }
  candidates = candidates.slice(0, CANDIDATE_CAP);

  if (candidates.length < 2) {
    return res.status(422).json({ error: 'No spots match your filters yet — try fewer filters.', code: 'NO_CANDIDATES' });
  }

  let object: z.infer<typeof ItinerarySchema>;
  try {
    const result = await generateObject({
      model: groq('openai/gpt-oss-120b'),
      schema: ItinerarySchema,
      prompt: buildPrompt(candidates, body),
    });
    object = result.object;
  } catch (err: any) {
    console.error('generate-itinerary LLM call failed:', err?.message || err, err?.cause || '');
    return res.status(502).json({ error: 'Something went wrong generating your route. Please try again.', code: 'LLM_ERROR' });
  }

  const candidateIds = new Set(candidates.map(c => c.id));
  const byId = new Map(candidates.map(c => [c.id, c]));
  const foodCap = isRestaurantHopping(body) ? body.stopCount : 1;
  let foodCount = 0;
  const filteredStops = object.stops
    .filter(s => candidateIds.has(s.spotId))
    .sort((a, b) => a.order - b.order)
    .filter(s => {
      if (byId.get(s.spotId)!.category !== 'Food') return true;
      foodCount += 1;
      return foodCount <= foodCap;
    })
    .map(s => ({ note: s.note, spot: byId.get(s.spotId)! }));

  if (filteredStops.length < 2) {
    return res.status(502).json({ error: 'The AI returned an invalid itinerary. Please try again.', code: 'LLM_ERROR' });
  }

  const validStops = orderByNearestNeighbor(filteredStops).map((s, i) => ({ order: i + 1, note: s.note, spot: s.spot }));

  return res.status(200).json({
    title: object.title,
    summary: object.summary,
    estimatedDurationMin: object.estimatedDurationMin,
    estimatedDistanceKm: object.estimatedDistanceKm,
    stops: validStops,
  });
}
