import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://qnalvzgqrfjbuoqsffbs.supabase.co';
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_CCDW9tXRVNYA66aqo190bw_hIVgo8Nt';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'xplora-auth-v1',
  },
});

export interface Profile {
  id: string;
  name: string;
  email: string;
  location: string;
  interests: string[];
  avatar_url: string | null;
}

export async function getProfile(): Promise<Profile | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return data;
}

export async function upsertProfile(updates: Partial<Profile>): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  await supabase.from('profiles').upsert({
    id: session.user.id,
    email: session.user.email,
    ...updates,
    updated_at: new Date().toISOString(),
  });
}
