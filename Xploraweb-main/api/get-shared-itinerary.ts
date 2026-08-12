import { getServiceClient } from './_lib/usage.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const slug = typeof req.query?.slug === 'string' ? req.query.slug : Array.isArray(req.query?.slug) ? req.query.slug[0] : null;
  if (!slug) return res.status(400).json({ error: 'Missing slug' });

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('xplora_saved_itineraries')
    .select('slug, title, summary, estimated_duration_min, estimated_distance_km, stops, created_at, notes, photos, stop_ratings, review_status, admin_response')
    .eq('slug', slug)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Itinerary not found' });

  // Privacy/moderation boundary: a review (rating, notes, photos) is only ever
  // exposed to non-owner visitors once review_status is 'approved' — either the
  // stop-rating average was >=4, or an admin has responded to a lower one. This
  // is enforced here (server-side, service-role read), not left to the client.
  const ratings: number[] = Object.values(data.stop_ratings || {});
  const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : null;
  const review = data.review_status === 'approved'
    ? {
        avgRating,
        notes: data.notes || '',
        photos: (data.photos || []).map((p: any) => p.url),
        adminResponse: data.admin_response || null,
      }
    : null;

  return res.status(200).json({
    slug: data.slug,
    title: data.title,
    summary: data.summary || '',
    estimatedDurationMin: data.estimated_duration_min ?? 0,
    estimatedDistanceKm: data.estimated_distance_km ?? 0,
    stops: data.stops || [],
    createdAt: data.created_at,
    review,
  });
}
