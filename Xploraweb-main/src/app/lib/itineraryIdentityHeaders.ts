import { supabase } from './supabase';
import { getOrCreateAnonId } from './anonId';

/** Identity headers the itinerary generation/usage endpoints use to attribute
 * a request to a logged-in user (Bearer token) or a guest device (x-anon-id). */
export async function getItineraryIdentityHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return { 'x-anon-id': getOrCreateAnonId() };
}
