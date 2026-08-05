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
    .select('slug, title, summary, estimated_duration_min, estimated_distance_km, stops, created_at')
    .eq('slug', slug)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Itinerary not found' });

  return res.status(200).json({
    slug: data.slug,
    title: data.title,
    summary: data.summary || '',
    estimatedDurationMin: data.estimated_duration_min ?? 0,
    estimatedDistanceKm: data.estimated_distance_km ?? 0,
    stops: data.stops || [],
    createdAt: data.created_at,
  });
}
