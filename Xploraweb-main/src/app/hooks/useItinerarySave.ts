import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { saveItinerary } from '../lib/savedItineraries';
import type { GeneratedItinerary } from '../data/itineraryFilters';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error' | 'limitReached';

/** Guest-save-behind-signup flow, shared by every place a "Save this
 * itinerary" action can be triggered from (result card heart icon, full-view
 * save button): guests are routed through AuthModal, and a successful
 * signup/sign-in immediately saves the itinerary they were looking at — no
 * second click needed. */
export function useItinerarySave(itinerary: GeneratedItinerary) {
  const [isGuest, setIsGuest] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsGuest(!session?.user));
  }, []);

  async function performSave() {
    setSaveState('saving');
    const result = await saveItinerary(itinerary);
    if (result.ok) {
      setSaveState('saved');
      setSavedSlug(result.slug || null);
    } else if (result.error === 'LIMIT_REACHED') {
      setSaveState('limitReached');
    } else {
      setSaveState('error');
    }
  }

  function handleSaveClick() {
    if (saveState === 'saving' || saveState === 'saved') return;
    if (isGuest) {
      setAuthModalOpen(true);
      return;
    }
    performSave();
  }

  async function handleAuthenticated() {
    setIsGuest(false);
    setAuthModalOpen(false);
    await performSave();
  }

  return {
    isGuest,
    saveState,
    savedSlug,
    authModalOpen,
    setAuthModalOpen,
    handleSaveClick,
    handleAuthenticated,
  };
}
