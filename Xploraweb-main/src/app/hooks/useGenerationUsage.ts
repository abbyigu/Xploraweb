import { useCallback, useEffect, useState } from 'react';
import { getItineraryIdentityHeaders } from '../lib/itineraryIdentityHeaders';
import type { GenerationUsage } from '../data/itineraryFilters';

const DEFAULT_USAGE: GenerationUsage = { count: 0, limit: 9, premium: false };

export function useGenerationUsage() {
  const [usage, setUsage] = useState<GenerationUsage>(DEFAULT_USAGE);
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
