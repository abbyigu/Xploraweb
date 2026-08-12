import { supabase } from './supabase';
import type { GeneratedItineraryStop } from '../data/itineraryFilters';
import type { ScrapbookPhoto } from './savedItineraries';

export interface PendingItineraryReview {
  id: string;
  title: string;
  slug: string | null;
  avgRating: number;
  stopRatings: Record<string, number>;
  stops: GeneratedItineraryStop[];
  notes: string;
  photos: ScrapbookPhoto[];
  extraSpots: string[];
  createdAt: string;
  reviewerName: string | null;
  reviewerEmail: string | null;
  /** Notes text looks like it contradicts the rating (keyword heuristic) — see
   * supabase_itinerary_review_mismatch_flag.sql. Worth a human double-check. */
  mismatchFlag: boolean;
}

/** review_status is server-computed (see supabase_itinerary_reviews.sql's trigger) —
 * 'pending' means the stop-rating average is below 4 (or a text/rating mismatch was
 * flagged) and no admin has responded yet. */
export async function getPendingItineraryReviews(): Promise<PendingItineraryReview[]> {
  const { data: rows } = await supabase
    .from('xplora_saved_itineraries')
    .select('id, title, slug, stops, stop_ratings, notes, photos, extra_spots, user_id, created_at, review_mismatch_flag')
    .eq('review_status', 'pending')
    .order('created_at', { ascending: true });

  if (!rows || rows.length === 0) return [];

  const userIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('id', userIds);
  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

  return rows.map(r => {
    const ratings = Object.values(r.stop_ratings || {}) as number[];
    const avgRating = ratings.length > 0 ? ratings.reduce((sum, n) => sum + n, 0) / ratings.length : 0;
    const profile = profileMap[r.user_id];
    return {
      id: r.id,
      title: r.title,
      slug: r.slug,
      avgRating,
      stopRatings: r.stop_ratings || {},
      stops: r.stops || [],
      notes: r.notes || '',
      photos: r.photos || [],
      extraSpots: r.extra_spots || [],
      createdAt: r.created_at,
      reviewerName: profile?.name || null,
      reviewerEmail: profile?.email || null,
      mismatchFlag: r.review_mismatch_flag ?? false,
    };
  });
}

/** Posting a response is what publishes the review — the DB trigger sets
 * review_status to 'approved' as soon as admin_response is non-null. */
export async function respondToItineraryReview(id: string, response: string): Promise<void> {
  await supabase.from('xplora_saved_itineraries').update({ admin_response: response }).eq('id', id);
}
