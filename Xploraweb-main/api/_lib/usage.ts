import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface Identity {
  userId: string | null;
  anonId: string | null;
}

export interface UsageResult {
  count: number;
  limit: number;
  premium: boolean;
}

export const FREE_GENERATION_LIMIT = 9;

function currentPeriod(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function getServiceClient(): SupabaseClient {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function resolveIdentity(supabase: SupabaseClient, req: any): Promise<Identity> {
  const authHeader: string | undefined = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length);
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data?.user) return { userId: data.user.id, anonId: null };
  }
  const anonId = (req.headers?.['x-anon-id'] as string) || null;
  return { userId: null, anonId: anonId || null };
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

export async function getUsage(supabase: SupabaseClient, identity: Identity): Promise<UsageResult> {
  const premium = await isPremium(supabase, identity.userId);
  if (!identity.userId && !identity.anonId) {
    return { count: 0, limit: FREE_GENERATION_LIMIT, premium };
  }
  const period = currentPeriod();
  let query = supabase.from('xplora_generation_usage').select('count').eq('period', period);
  query = identity.userId ? query.eq('user_id', identity.userId) : query.eq('anon_id', identity.anonId as string);
  const { data } = await query.maybeSingle();
  return { count: data?.count ?? 0, limit: FREE_GENERATION_LIMIT, premium };
}

export async function incrementUsage(supabase: SupabaseClient, identity: Identity): Promise<void> {
  if (!identity.userId && !identity.anonId) return;
  const period = currentPeriod();
  const match = identity.userId
    ? { user_id: identity.userId, period }
    : { anon_id: identity.anonId as string, period };

  const { data: existing } = await supabase
    .from('xplora_generation_usage')
    .select('id, count')
    .match(match)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('xplora_generation_usage')
      .update({ count: existing.count + 1, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await supabase.from('xplora_generation_usage').insert({ ...match, count: 1 });
  }
}
