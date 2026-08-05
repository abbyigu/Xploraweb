import { supabase } from './supabase';
import { subscribeToNewsletter } from './newsletter';
import { analytics } from './analytics';

export interface SignUpParams {
  name: string;
  email: string;
  password: string;
  newsletter: boolean;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

/** Shared by SignupScreen (full page) and AuthModal (in-flow) so both create
 * accounts the exact same way — signUp + profile upsert + optional newsletter. */
export async function emailSignUp({ name, email, password, newsletter }: SignUpParams): Promise<AuthResult> {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, account_type: 'member' },
    },
  });

  if (signUpError) return { ok: false, error: signUpError.message };

  analytics.signUp('email');

  const userId = signUpData?.user?.id;
  if (userId) {
    await supabase.from('profiles').upsert({
      id: userId,
      name,
      email,
      location: 'Quebec City, QC',
      interests: [],
      avatar_url: null,
    });
  }

  if (newsletter) {
    await subscribeToNewsletter(email, name);
  }

  return { ok: true };
}

/** Shared by LoginScreen (full page) and AuthModal (in-flow). */
export async function emailSignIn(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  analytics.login('email');
  return { ok: true };
}
