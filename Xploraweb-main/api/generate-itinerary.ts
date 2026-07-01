import { createClient } from '@supabase/supabase-js';
import { generateObject } from 'ai';
import { z } from 'zod';

const SPOT_CATEGORIES = ['Food', 'Bar', 'Culture', 'Nature', 'Shopping', 'Family', 'History'] as const;
const VIBE_OPTIONS = ['cozy', 'adventurous', 'foodie', 'romantic', 'hidden gem', 'lively', 'artsy', 'outdoorsy', 'late night', 'family-friendly'] as const;
const WALK_LENGTH_BUCKETS: Record<string, { minMin: number; maxMin: number; targetStops: number }> = {
  quick: { minMin: 20, maxMin: 45, targetStops: 3 },
  standard: { minMin: 45, maxMin: 90, targetStops: 5 },
  long: { minMin: 90, maxMin: 180, targetStops: 8 },
};
const CANDIDATE_CAP = 40;

const RequestSchema = z.object({
  walkLength: z.enum(['quick', 'standard', 'long']),
  radiusKm: z.number().min(0.5).max(10).nullable(),
  origin: z.object({ lat: z.number(), lng: z.number() }).nullable(),
  categories: z.array(z.enum(SPOT_CATEGORIES)),
  vibes: z.array(z.enum(VIBE_OPTIONS)),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).nullable(),
  language: z.enum(['en', 'fr']),
});

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
}

function mapSpotRow(row: any, lang: 'en' | 'fr'): CandidateSpot {
  const pick = (fr: string | null, en: string | null) => (lang === 'fr' && fr) ? fr : (en || null);
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
    xploraTips: row.xplora_tips || [],
  };
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function buildPrompt(candidates: CandidateSpot[], body: z.infer<typeof RequestSchema>): string {
  const bucket = WALK_LENGTH_BUCKETS[body.walkLength];
  const candidateList = candidates.map(c => ({
    id: c.id, name: c.name, category: c.category, vibes: c.vibes,
    neighbourhood: c.neighbourhood, visitTime: c.visitTime, lat: c.lat, lng: c.lng,
  }));
  return `You are assembling a self-guided walking itinerary in Québec City from a fixed list of real places.

Candidate spots (JSON, only use these — never invent an id):
${JSON.stringify(candidateList)}

Requirements:
- Target about ${bucket.targetStops} stops for a walk lasting roughly ${bucket.minMin}-${bucket.maxMin} minutes total.
- Order the stops into a sensible walking route (avoid backtracking where possible, based on lat/lng).
${body.timeOfDay ? `- This route is for the ${body.timeOfDay}; prefer spots that fit that time of day.` : ''}
${body.categories.length ? `- Prefer categories: ${body.categories.join(', ')}.` : ''}
${body.vibes.length ? `- Prefer vibes: ${body.vibes.join(', ')}.` : ''}
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

  let candidates = (rows || []).map(r => mapSpotRow(r, body.language));

  if (body.origin && body.radiusKm) {
    const origin = body.origin;
    candidates = candidates
      .filter(c => c.lat != null && c.lng != null)
      .filter(c => haversineKm(origin, { lat: c.lat!, lng: c.lng! }) <= body.radiusKm!)
      .sort((a, b) => haversineKm(origin, { lat: a.lat!, lng: a.lng! }) - haversineKm(origin, { lat: b.lat!, lng: b.lng! }));
  }
  if (body.categories.length > 0) {
    candidates = candidates.filter(c => c.category && body.categories.includes(c.category as any));
  }
  if (body.vibes.length > 0) {
    candidates = candidates.filter(c => c.vibes.some(v => body.vibes.includes(v as any)));
  }
  candidates = candidates.slice(0, CANDIDATE_CAP);

  const targetStops = WALK_LENGTH_BUCKETS[body.walkLength].targetStops;
  if (candidates.length < Math.min(2, targetStops)) {
    return res.status(422).json({ error: 'No spots match your filters yet — try a bigger radius or fewer filters.', code: 'NO_CANDIDATES' });
  }

  let object: z.infer<typeof ItinerarySchema>;
  try {
    const result = await generateObject({
      model: 'anthropic/claude-haiku-4.5',
      schema: ItinerarySchema,
      prompt: buildPrompt(candidates, body),
    });
    object = result.object;
  } catch (err: any) {
    return res.status(502).json({ error: 'Something went wrong generating your route. Please try again.', code: 'LLM_ERROR' });
  }

  const candidateIds = new Set(candidates.map(c => c.id));
  const byId = new Map(candidates.map(c => [c.id, c]));
  const validStops = object.stops
    .filter(s => candidateIds.has(s.spotId))
    .sort((a, b) => a.order - b.order)
    .map((s, i) => ({ order: i + 1, note: s.note, spot: byId.get(s.spotId)! }));

  if (validStops.length < 2) {
    return res.status(502).json({ error: 'The AI returned an invalid itinerary. Please try again.', code: 'LLM_ERROR' });
  }

  return res.status(200).json({
    title: object.title,
    summary: object.summary,
    estimatedDurationMin: object.estimatedDurationMin,
    estimatedDistanceKm: object.estimatedDistanceKm,
    stops: validStops,
  });
}
