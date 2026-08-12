import { supabase } from './supabase';

export interface NeighbourhoodReview {
  id: string;
  rating: number;
  comment: string | null;
  reviewer_name: string | null;
  admin_reply: string | null;
  created_at: string;
}

export interface PendingNeighbourhoodReview {
  id: string;
  neighbourhood_id: string;
  rating: number;
  comment: string | null;
  reviewer_name: string | null;
  reviewer_email: string | null;
  admin_reply: string | null;
  created_at: string;
  neighbourhood_name?: string;
  /** Server-computed (keyword heuristic) — rating and comment text seem to
   * contradict each other. Forces 'pending' even for a >=4-star rating. */
  mismatch_flag: boolean;
}

export interface NeighbourhoodReviewMessage {
  id: string;
  message: string;
  created_at: string;
}

/** Reviews at or above this rating publish immediately; anything below goes to
 * moderation (also enforced server-side by a DB trigger, which additionally
 * holds back a >=4-star review whose comment text looks mismatched). */
export const AUTO_APPROVE_RATING = 4;

export async function getApprovedNeighbourhoodReviews(neighbourhoodId: string): Promise<NeighbourhoodReview[]> {
  const { data, error } = await supabase
    .from('xplora_neighbourhood_reviews')
    .select('id, rating, comment, reviewer_name, admin_reply, created_at')
    .eq('neighbourhood_id', neighbourhoodId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  return error || !data ? [] : data;
}

export async function submitNeighbourhoodReview(
  neighbourhoodId: string,
  rating: number,
  comment: string,
  reviewerName: string,
  reviewerEmail: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('xplora_neighbourhood_reviews').insert({
    neighbourhood_id: neighbourhoodId,
    rating,
    comment: comment.trim() || null,
    reviewer_name: reviewerName.trim() || null,
    reviewer_email: reviewerEmail.trim() || null,
  });

  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function getPendingNeighbourhoodReviews(): Promise<PendingNeighbourhoodReview[]> {
  const { data: reviews } = await supabase
    .from('xplora_neighbourhood_reviews')
    .select('id, neighbourhood_id, rating, comment, reviewer_name, reviewer_email, admin_reply, created_at, mismatch_flag')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (!reviews || reviews.length === 0) return [];

  const ids = [...new Set(reviews.map(r => r.neighbourhood_id))];
  const { data: neighbourhoods } = await supabase
    .from('neighbourhoods')
    .select('id, name')
    .in('id', ids);

  const nameMap = Object.fromEntries((neighbourhoods || []).map(n => [n.id, n.name]));
  return reviews.map(r => ({ ...r, neighbourhood_name: nameMap[r.neighbourhood_id] || r.neighbourhood_id }));
}

export async function approveNeighbourhoodReview(id: string): Promise<void> {
  await supabase.from('xplora_neighbourhood_reviews').update({ status: 'approved' }).eq('id', id);
}

export async function rejectNeighbourhoodReview(id: string): Promise<void> {
  await supabase.from('xplora_neighbourhood_reviews').update({ status: 'rejected' }).eq('id', id);
}

/** Sets the single public reply for a review. Only meant to be called once per review — subsequent admin follow-ups are private (see logNeighbourhoodReviewMessage). */
export async function postNeighbourhoodReviewPublicReply(id: string, reply: string): Promise<void> {
  await supabase.from('xplora_neighbourhood_reviews').update({ admin_reply: reply, admin_reply_at: new Date().toISOString() }).eq('id', id);
}

export async function getNeighbourhoodReviewMessages(reviewId: string): Promise<NeighbourhoodReviewMessage[]> {
  const { data } = await supabase
    .from('xplora_neighbourhood_review_messages')
    .select('id, message, created_at')
    .eq('review_id', reviewId)
    .order('created_at', { ascending: true });
  return data || [];
}

/** Logs a private admin follow-up (the actual delivery to the reviewer happens over email, not in-app). */
export async function logNeighbourhoodReviewMessage(reviewId: string, message: string): Promise<void> {
  await supabase.from('xplora_neighbourhood_review_messages').insert({ review_id: reviewId, message });
}
