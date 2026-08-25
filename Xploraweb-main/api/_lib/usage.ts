import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface Identity {
  userId: string | null;
  anonId: string | null;
  ip: string | null;
}

export interface UsageResult {
  count: number;
  limit: number;
  premium: boolean;
}

export const FREE_GENERATION_LIMIT = 5;

function currentPeriod(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function getServiceClient(): SupabaseClient {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function getClientIp(req: any): string | null {
  const forwarded = req.headers?.['x-forwarded-for'] as string | undefined;
  const fromForwarded = forwarded?.split(',')[0]?.trim();
  if (fromForwarded) return fromForwarded;
  const realIp = req.headers?.['x-real-ip'] as string | undefined;
  if (realIp) return realIp;
  return req.socket?.remoteAddress || req.connection?.remoteAddress || null;
}

export async function resolveIdentity(supabase: SupabaseClient, req: any): Promise<Identity> {
  const ip = getClientIp(req);
  const authHeader: string | undefined = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length);
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data?.user) return { userId: data.user.id, anonId: null, ip };
  }
  const anonId = (req.headers?.['x-anon-id'] as string) || null;
  return { userId: null, anonId: anonId || null, ip };
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

async function countFor(supabase: SupabaseClient, match: Record<string, string>, period: string): Promise<number> {
  const { data } = await supabase
    .from('xplora_generation_usage')
    .select('count')
    .match({ ...match, period })
    .maybeSingle();
  return data?.count ?? 0;
}

export async function getUsage(supabase: SupabaseClient, identity: Identity): Promise<UsageResult> {
  if (!identity.userId && !identity.anonId) {
    const premium = await isPremium(supabase, identity.userId);
    return { count: 0, limit: FREE_GENERATION_LIMIT, premium };
  }
  const period = currentPeriod();
  if (identity.userId) {
    const [premium, count] = await Promise.all([
      isPremium(supabase, identity.userId),
      countFor(supabase, { user_id: identity.userId }, period),
    ]);
    return { count, limit: FREE_GENERATION_LIMIT, premium };
  }
  // Anonymous: take the higher of the device-local counter and the IP counter, so
  // clearing localStorage / an incognito window doesn't reset the free quota.
  const [premium, anonCount, ipCount] = await Promise.all([
    isPremium(supabase, identity.userId),
    countFor(supabase, { anon_id: identity.anonId as string }, period),
    identity.ip ? countFor(supabase, { ip_address: identity.ip }, period) : Promise.resolve(0),
  ]);
  return { count: Math.max(anonCount, ipCount), limit: FREE_GENERATION_LIMIT, premium };
}

async function bumpRow(supabase: SupabaseClient, match: Record<string, string>): Promise<void> {
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

export async function incrementUsage(supabase: SupabaseClient, identity: Identity): Promise<void> {
  if (!identity.userId && !identity.anonId) return;
  const period = currentPeriod();
  if (identity.userId) {
    await bumpRow(supabase, { user_id: identity.userId, period });
    return;
  }
  const bumps = [bumpRow(supabase, { anon_id: identity.anonId as string, period })];
  if (identity.ip) bumps.push(bumpRow(supabase, { ip_address: identity.ip, period }));
  await Promise.all(bumps);
}
