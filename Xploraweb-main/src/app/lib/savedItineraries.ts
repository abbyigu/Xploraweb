import { supabase } from './supabase';
import type { GeneratedItinerary, GeneratedItineraryStop } from '../data/itineraryFilters';

export interface ScrapbookPhoto {
  url: string;
  addedAt: string;
}

export interface SavedItinerary {
  id: string;
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

export interface SavedItineraryScrapbookPatch {
  photos?: ScrapbookPhoto[];
  notes?: string;
  extraSpots?: string[];
  stopRatings?: Record<string, number>;
}

function mapRow(row: any): SavedItinerary {
  return {
    id: row.id,
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

export async function saveItinerary(result: GeneratedItinerary): Promise<{ ok: boolean; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { ok: false, error: 'NOT_SIGNED_IN' };

  const { error } = await supabase.from('xplora_saved_itineraries').insert({
    user_id: session.user.id,
    title: result.title,
    summary: result.summary,
    estimated_duration_min: result.estimatedDurationMin,
    estimated_distance_km: result.estimatedDistanceKm,
    stops: result.stops,
  });

  return error ? { ok: false, error: error.message } : { ok: true };
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
