import { useCallback, useEffect, useState } from 'react';
import { getItineraryIdentityHeaders } from '../lib/itineraryIdentityHeaders';
import type { SaveUsage } from '../data/itineraryFilters';

const DEFAULT_USAGE: SaveUsage = { count: 0, limit: 5, premium: false };

/** Tracks the signed-in user's free-save usage (itineraries saved vs. the
 * free-plan limit) — the metered action is saving, not generating. */
export function useSaveUsage() {
  const [usage, setUsage] = useState<SaveUsage>(DEFAULT_USAGE);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const headers = await getItineraryIdentityHeaders();
      const res = await fetch('/api/itinerary-usage', { headers });
      if (res.ok) setUsage(await res.json());
    } catch {
      // Keep the last known usage on a transient network error.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { usage, setUsage, loading, refresh };
}
