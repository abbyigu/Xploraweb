import { supabase } from './supabase';

export interface PendingSpotReview {
  id: string;
  spotId: string;
  spotName: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerName: string | null;
  reviewerEmail: string | null;
  mismatchFlag: boolean;
}

/** review_status is server-computed — see supabase_spot_reviews.sql's trigger. */
export async function getPendingSpotReviews(): Promise<PendingSpotReview[]> {
  const { data: rows } = await supabase
    .from('xplora_spot_reviews')
    .select('id, spot_id, rating, comment, user_id, created_at, review_mismatch_flag')
    .eq('review_status', 'pending')
    .order('created_at', { ascending: true });

  if (!rows || rows.length === 0) return [];

  const spotIds = [...new Set(rows.map(r => r.spot_id))];
  const userIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))];
  const [{ data: spots }, { data: profiles }] = await Promise.all([
    supabase.from('xplora_spots').select('id, name').in('id', spotIds),
    supabase.from('profiles').select('id, name, email').in('id', userIds),
  ]);
  const spotMap = Object.fromEntries((spots || []).map(s => [s.id, s.name]));
  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

  return rows.map(r => {
    const profile = profileMap[r.user_id];
    return {
      id: r.id,
      spotId: r.spot_id,
      spotName: spotMap[r.spot_id] || r.spot_id,
      rating: r.rating,
      comment: r.comment || '',
      createdAt: r.created_at,
      reviewerName: profile?.name || null,
      reviewerEmail: profile?.email || null,
      mismatchFlag: r.review_mismatch_flag ?? false,
    };
  });
}

/** Posting a response is what publishes the review — the DB trigger sets
 * review_status to 'approved' as soon as admin_response is non-null. */
export async function respondToSpotReview(id: string, response: string): Promise<void> {
  await supabase.from('xplora_spot_reviews').update({ admin_response: response }).eq('id', id);
}
