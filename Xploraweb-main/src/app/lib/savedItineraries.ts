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
}

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
  };
}

export async function saveItinerary(result: GeneratedItinerary): Promise<{ ok: boolean; error?: string; slug?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { ok: false, error: 'NOT_SIGNED_IN' };

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug();
    const { error } = await supabase.from('xplora_saved_itineraries').insert({
      user_id: session.user.id,
      title: result.title,
      summary: result.summary,
      estimated_duration_min: result.estimatedDurationMin,
      estimated_distance_km: result.estimatedDistanceKm,
      stops: result.stops,
      slug,
    });
    if (!error) return { ok: true, slug };
    if (error.code !== '23505') return { ok: false, error: error.message };
    // Unique violation on slug — extremely unlikely at 36^5 combinations, retry with a fresh one.
  }
  return { ok: false, error: 'Could not generate a unique link, please try again.' };
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

export async function deleteSavedItinerary(id: string): Promise<void> {
  await supabase.from('xplora_saved_itineraries').delete().eq('id', id);
}

export async function updateItineraryScrapbook(
  id: string,
  patch: SavedItineraryScrapbookPatch
): Promise<{ ok: boolean; error?: string }> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.photos !== undefined) dbPatch.photos = patch.photos;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes;
  if (patch.extraSpots !== undefined) dbPatch.extra_spots = patch.extraSpots;
  if (patch.stopRatings !== undefined) dbPatch.stop_ratings = patch.stopRatings;

  const { error } = await supabase.from('xplora_saved_itineraries').update(dbPatch).eq('id', id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
