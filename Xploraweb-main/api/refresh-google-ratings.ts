import { createClient } from '@supabase/supabase-js';

/**
 * Weekly Vercel Cron job: refreshes the cached Google rating/review count for
 * spots that already have a place_id (resolved separately via
 * scripts/fetch-google-place-ids.mjs). Never called from the client — keeps
 * GOOGLE_MAPS_API_KEY server-only and keeps Places billing to one call per
 * spot per week instead of one per pageview.
 */

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Stay well under Vercel's function time limit and the Places free-tier pace.
const BATCH_SIZE = 100;

async function fetchRating(placeId: string): Promise<{ rating: number | null; reviewCount: number | null }> {
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_KEY!,
      'X-Goog-FieldMask': 'rating,userRatingCount',
    },
  });
  if (!res.ok) throw new Error(`Places API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return {
    rating: typeof data.rating === 'number' ? data.rating : null,
    reviewCount: typeof data.userRatingCount === 'number' ? data.userRatingCount : null,
  };
}

export default async function handler(req: any, res: any) {
  // Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically
  // when CRON_SECRET is set as an env var — reject anything else so this
  // can't be triggered (and billed) by an outside caller.
  const authHeader = req.headers.authorization || '';
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!GOOGLE_KEY) return res.status(500).json({ error: 'GOOGLE_MAPS_API_KEY not configured' });

  const { data: spots, error } = await supabase
    .from('xplora_spots')
    .select('id, place_id')
    .not('place_id', 'is', null)
    .order('google_rating_fetched_at', { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE);

  if (error) return res.status(500).json({ error: error.message });
  if (!spots || spots.length === 0) return res.status(200).json({ refreshed: 0 });

  const now = new Date().toISOString();
  let refreshed = 0;
  const failures: string[] = [];

  for (const spot of spots) {
    try {
      const { rating, reviewCount } = await fetchRating(spot.place_id as string);
      await supabase
        .from('xplora_spots')
        .update({ google_rating: rating, google_review_count: reviewCount, google_rating_fetched_at: now })
        .eq('id', spot.id);
      refreshed++;
    } catch (err: any) {
      failures.push(`${spot.id}: ${err?.message || err}`);
    }
  }

  if (failures.length) console.error('refresh-google-ratings failures:', failures);
  return res.status(200).json({ refreshed, failed: failures.length });
}
