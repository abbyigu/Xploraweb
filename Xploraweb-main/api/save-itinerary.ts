import { z } from 'zod';
import { getServiceClient, getUsage, resolveIdentity } from './_lib/usage.js';

// Short, permanent, shareable id — e.g. "8F4K2" — used in the /i/:slug route.
// Uppercase alphanumeric only (no lookalike-prone punctuation), 5 characters.
const SLUG_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function generateSlug(length = 5): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += SLUG_ALPHABET[Math.floor(Math.random() * SLUG_ALPHABET.length)];
  }
  return out;
}

// Loosely validated — matches the shape of ItineraryItem (GeneratedItineraryStop
// | JourneyStep) closely enough to reject garbage without re-encoding every field.
const StopSchema = z.object({
  type: z.enum(['stop', 'journeyStep']).optional(),
  order: z.number().optional(),
  note: z.string().optional(),
  description: z.string().optional(),
  spot: z.record(z.any()),
});

const SaveRequestSchema = z.object({
  title: z.string().max(80),
  summary: z.string().max(400).optional().default(''),
  estimatedDurationMin: z.number(),
  estimatedDistanceKm: z.number(),
  stops: z.array(StopSchema).min(1),
});

// Also serves GET (the free-save usage check) — folded in here rather than
// its own file to stay under Vercel's per-deployment serverless function cap;
// the two share every dependency (identity + usage lookup) anyway.
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const supabase = getServiceClient();
    const identity = await resolveIdentity(supabase, req);
    const usage = await getUsage(supabase, identity);
    return res.status(200).json(usage);
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });

  const parsed = SaveRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid itinerary.', code: 'INVALID_INPUT' });
  }
  const body = parsed.data;

  const supabase = getServiceClient();
  const identity = await resolveIdentity(supabase, req);
  if (!identity.userId) {
    return res.status(401).json({ error: 'Sign in to save this itinerary.', code: 'NOT_SIGNED_IN' });
  }

  const usage = await getUsage(supabase, identity);
  if (!usage.premium && usage.count >= usage.limit) {
    return res.status(403).json({ error: 'Free save limit reached.', code: 'LIMIT_REACHED', usage });
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug();
    const { error } = await supabase.from('xplora_saved_itineraries').insert({
      user_id: identity.userId,
      title: body.title,
      summary: body.summary,
      estimated_duration_min: body.estimatedDurationMin,
      estimated_distance_km: body.estimatedDistanceKm,
      stops: body.stops,
      slug,
    });
    if (!error) {
      return res.status(200).json({ ok: true, slug, usage: { ...usage, count: usage.count + 1 } });
    }
    if (error.code !== '23505') {
      return res.status(500).json({ error: error.message, code: 'SAVE_ERROR' });
    }
    // Unique violation on slug — extremely unlikely at 36^5 combinations, retry with a fresh one.
  }
  return res.status(500).json({ error: 'Could not generate a unique link, please try again.', code: 'SAVE_ERROR' });
}
