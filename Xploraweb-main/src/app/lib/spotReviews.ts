import { supabase } from './supabase';

export interface SpotReview {
  id: string;
  spotId: string;
  rating: number;
  comment: string;
  reviewStatus: 'pending' | 'approved' | null;
  adminResponse: string | null;
  reviewMismatchFlag: boolean;
  createdAt: string;
}

function mapRow(row: any): SpotReview {
  return {
    id: row.id,
    spotId: row.spot_id,
    rating: row.rating,
    comment: row.comment || '',
    reviewStatus: row.review_status ?? null,
    adminResponse: row.admin_response ?? null,
    reviewMismatchFlag: row.review_mismatch_flag ?? false,
    createdAt: row.created_at,
  };
}

/** The signed-in user's own review of this spot, if any (owner-only read via RLS). */
export async function getMySpotReview(spotId: string): Promise<SpotReview | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data } = await supabase
    .from('xplora_spot_reviews')
    .select('*')
    .eq('spot_id', spotId)
    .eq('user_id', session.user.id)
    .maybeSingle();

  return data ? mapRow(data) : null;
}

/** One review per person per place — resubmitting updates the existing row
 * (see the unique (spot_id, user_id) constraint) rather than creating a new one. */
export async function upsertSpotReview(spotId: string, rating: number, comment: string): Promise<{ ok: boolean; error?: string; review?: SpotReview }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { ok: false, error: 'NOT_SIGNED_IN' };

  const { data, error } = await supabase
    .from('xplora_spot_reviews')
    .upsert({ spot_id: spotId, user_id: session.user.id, rating, comment }, { onConflict: 'spot_id,user_id' })
    .select()
    .maybeSingle();

  return error ? { ok: false, error: error.message } : { ok: true, review: data ? mapRow(data) : undefined };
}

/** Approved-review average + count for a batch of spots, for a public "Xplora rating" display. */
export async function getApprovedSpotReviewSummaries(spotIds: string[]): Promise<Record<string, { avgRating: number; count: number }>> {
  if (spotIds.length === 0) return {};

  const { data } = await supabase
    .from('xplora_spot_reviews')
    .select('spot_id, rating')
    .eq('review_status', 'approved')
    .in('spot_id', spotIds);

  const bySpot: Record<string, number[]> = {};
  for (const row of data || []) {
    (bySpot[row.spot_id] ||= []).push(row.rating);
  }
  return Object.fromEntries(
    Object.entries(bySpot).map(([spotId, ratings]) => [
      spotId,
      { avgRating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length, count: ratings.length },
    ])
  );
}
