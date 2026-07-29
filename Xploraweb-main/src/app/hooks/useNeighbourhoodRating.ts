import { useEffect, useState } from 'react';
import { getNeighbourhoodRatingSummary, submitNeighbourhoodRating, type RatingSummary } from '../lib/neighbourhoodRatings';

function storageKey(neighbourhoodId: string): string {
  return `xplora_rated_${neighbourhoodId}`;
}

/**
 * Ratings are open to anyone (no sign-in), so "one rating per visitor" is only
 * enforced client-side via localStorage — a soft guard, not real dedup.
 */
export function useNeighbourhoodRating(neighbourhoodId: string) {
  const [summary, setSummary] = useState<RatingSummary>({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey(neighbourhoodId));
    setMyRating(stored ? Number(stored) : null);

    let cancelled = false;
    setLoading(true);
    getNeighbourhoodRatingSummary(neighbourhoodId).then((result) => {
      if (!cancelled) {
        setSummary(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [neighbourhoodId]);

  async function rate(value: number) {
    if (submitting || myRating != null) return;
    setSubmitting(true);
    const result = await submitNeighbourhoodRating(neighbourhoodId, value);
    if (result.ok) {
      window.localStorage.setItem(storageKey(neighbourhoodId), String(value));
      setMyRating(value);
      setSummary(await getNeighbourhoodRatingSummary(neighbourhoodId));
    }
    setSubmitting(false);
  }

  return { summary, loading, myRating, submitting, rate };
}
