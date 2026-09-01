import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface Identity {
  userId: string | null;
}

export interface UsageResult {
  count: number;
  limit: number;
  premium: boolean;
}

// Saving (not generating) an itinerary is the metered free action — everyone
// can generate as many routes as they like, but keeping one around past this
// count requires Premium.
export const FREE_SAVE_LIMIT = 5;

export function getServiceClient(): SupabaseClient {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function resolveIdentity(supabase: SupabaseClient, req: any): Promise<Identity> {
  const authHeader: string | undefined = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length);
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data?.user) return { userId: data.user.id };
  }
  return { userId: null };
}

async function isPremium(supabase: SupabaseClient, userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const { data } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .limit(1)
    .maybeSingle();
  return !!data;
}

async function countSavedItineraries(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count } = await supabase
    .from('xplora_saved_itineraries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  return count ?? 0;
}

// The count reflects itineraries currently saved (not a monthly counter) —
// deleting a saved itinerary frees up a slot for a free-plan user.
export async function getUsage(supabase: SupabaseClient, identity: Identity): Promise<UsageResult> {
  if (!identity.userId) {
    return { count: 0, limit: FREE_SAVE_LIMIT, premium: false };
  }
  const [premium, count] = await Promise.all([
    isPremium(supabase, identity.userId),
    countSavedItineraries(supabase, identity.userId),
  ]);
  return { count, limit: FREE_SAVE_LIMIT, premium };
}
