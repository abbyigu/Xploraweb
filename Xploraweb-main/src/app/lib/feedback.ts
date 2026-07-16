import { supabase } from './supabase';

export async function submitFeedback(message: string, email = ''): Promise<{ ok: boolean; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();

  const { error } = await supabase.from('xplora_feedback').insert({
    user_id: session?.user?.id ?? null,
    email: email || session?.user?.email || null,
    message,
    page: typeof window !== 'undefined' ? window.location.pathname : null,
  });

  return error ? { ok: false, error: error.message } : { ok: true };
}
