import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/** Generic "this action needs a signed-in user" gate — opens AuthModal for
 * guests, runs the action immediately for signed-in users. Callers that need
 * to run something right after auth succeeds wire that into AuthModal's own
 * `onAuthenticated` prop directly (see PremiumLimitModal). */
export function useItineraryAuth() {
  const [isGuest, setIsGuest] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsGuest(!session?.user));
  }, []);

  const requireAuth = useCallback((action: () => void) => {
    if (isGuest) {
      setAuthModalOpen(true);
      return;
    }
    action();
  }, [isGuest]);

  return { isGuest, authModalOpen, setAuthModalOpen, requireAuth };
}
