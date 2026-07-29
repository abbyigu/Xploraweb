import { supabase } from './supabase';

export interface RatingSummary {
  average: number;
  count: number;
}

export async function getNeighbourhoodRatingSummary(neighbourhoodId: string): Promise<RatingSummary> {
  const { data, error } = await supabase
    .from('xplora_neighbourhood_ratings')
    .select('rating')
    .eq('neighbourhood_id', neighbourhoodId);

  if (error || !data || data.length === 0) return { average: 0, count: 0 };
  const sum = data.reduce((total, row) => total + row.rating, 0);
  return { average: sum / data.length, count: data.length };
}

export async function submitNeighbourhoodRating(neighbourhoodId: string, rating: number): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('xplora_neighbourhood_ratings').insert({
    neighbourhood_id: neighbourhoodId,
    rating,
  });

  return error ? { ok: false, error: error.message } : { ok: true };
}
