import { supabase } from './supabase';
import type { GeneratedItinerary, GeneratedItineraryStop } from '../data/itineraryFilters';

export interface ScrapbookPhoto {
  url: string;
  addedAt: string;
}

export interface SavedItinerary {
  id: string;
  slug: string | null;
  title: string;
  summary: string;
  estimatedDurationMin: number;
  estimatedDistanceKm: number;
  stops: GeneratedItineraryStop[];
  createdAt: string;
  photos: ScrapbookPhoto[];
  notes: string;
  extraSpots: string[];
  stopRatings: Record<string, number>;
  /** Server-computed (DB trigger) from the average of stopRatings — null until
   * a rating exists, 'approved' once >=4★ avg or an admin has responded,
   * 'pending' otherwise. Never set directly by the client. */
  reviewStatus: 'pending' | 'approved' | null;
  adminResponse: string | null;
  /** Server-computed heuristic flag — the notes text looks like it contradicts
   * the star rating (e.g. glowing text with a low rating). Forces 'pending'
   * even for an otherwise auto-approved >=4★ average. */
  reviewMismatchFlag: boolean;
}

export interface SavedItineraryScrapbookPatch {
  photos?: ScrapbookPhoto[];
  notes?: string;
  extraSpots?: string[];
  stopRatings?: Record<string, number>;
}

function mapRow(row: any): SavedItinerary {
  return {
    id: row.id,
    slug: row.slug ?? null,
    title: row.title,
    summary: row.summary || '',
    estimatedDurationMin: row.estimated_duration_min ?? 0,
    estimatedDistanceKm: row.estimated_distance_km ?? 0,
    stops: row.stops || [],
    createdAt: row.created_at,
    photos: row.photos || [],
    notes: row.notes || '',
    extraSpots: row.extra_spots || [],
    stopRatings: row.stop_ratings || {},
    reviewStatus: row.review_status ?? null,
    adminResponse: row.admin_response ?? null,
    reviewMismatchFlag: row.review_mismatch_flag ?? false,
  };
}

// Saving (not generating) an itinerary is the metered free action, so this
// goes through the API — the free-save-limit check needs the service role to
// read the caller's subscription status and their current saved count.
export async function saveItinerary(result: GeneratedItinerary): Promise<{ ok: boolean; error?: string; slug?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { ok: false, error: 'NOT_SIGNED_IN' };

  const res = await fetch('/api/save-itinerary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({
      title: result.title,
      summary: result.summary,
      estimatedDurationMin: result.estimatedDurationMin,
      estimatedDistanceKm: result.estimatedDistanceKm,
      stops: result.stops,
    }),
  });
  const data = await res.json().catch(() => null);
  if (res.ok && data?.ok) return { ok: true, slug: data.slug };
  if (data?.code === 'LIMIT_REACHED') return { ok: false, error: 'LIMIT_REACHED' };
  return { ok: false, error: data?.error || 'Could not save your itinerary, please try again.' };
}

export async function fetchSavedItineraries(): Promise<SavedItinerary[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return [];

  const { data } = await supabase
    .from('xplora_saved_itineraries')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  return (data || []).map(mapRow);
}

// Authenticated lookup by id — used on /i/:slug when the viewer owns the itinerary,
// since the public get-shared-itinerary API only returns share-safe fields (no
// photos/notes/extraSpots/stopRatings). RLS scopes this to the caller's own rows.
export async function fetchSavedItineraryById(id: string): Promise<SavedItinerary | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data } = await supabase
    .from('xplora_saved_itineraries')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .maybeSingle();

  return data ? mapRow(data) : null;
}

export async function deleteSavedItinerary(id: string): Promise<void> {
  await supabase.from('xplora_saved_itineraries').delete().eq('id', id);
}

export async function updateItineraryScrapbook(
  id: string,
  patch: SavedItineraryScrapbookPatch
): Promise<{ ok: boolean; error?: string; itinerary?: SavedItinerary }> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.photos !== undefined) dbPatch.photos = patch.photos;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes;
  if (patch.extraSpots !== undefined) dbPatch.extra_spots = patch.extraSpots;
  if (patch.stopRatings !== undefined) dbPatch.stop_ratings = patch.stopRatings;

  // select() back so the caller can reconcile with the server-computed
  // review_status/admin_response (set by a DB trigger, not by this patch).
  const { data, error } = await supabase.from('xplora_saved_itineraries').update(dbPatch).eq('id', id).select().maybeSingle();
  return error ? { ok: false, error: error.message } : { ok: true, itinerary: data ? mapRow(data) : undefined };
}
