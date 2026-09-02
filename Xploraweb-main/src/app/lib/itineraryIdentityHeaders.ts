import { supabase } from './supabase';

/** Auth header for the save-itinerary endpoint (GET usage check / POST save)
 * — signed-in users only, since saving (the metered free action) already
 * requires an account. */
export async function getItineraryIdentityHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}
