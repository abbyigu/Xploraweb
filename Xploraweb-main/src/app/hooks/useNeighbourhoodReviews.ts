import { useEffect, useState } from 'react';
import {
  AUTO_APPROVE_RATING,
  getApprovedNeighbourhoodReviews,
  submitNeighbourhoodReview,
  type NeighbourhoodReview,
} from '../lib/neighbourhoodReviews';

function storageKey(neighbourhoodId: string): string {
  return `xplora_reviewed_${neighbourhoodId}`;
}

export function useNeighbourhoodReviews(neighbourhoodId: string) {
  const [reviews, setReviews] = useState<NeighbourhoodReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  useEffect(() => {
    setHasReviewed(window.localStorage.getItem(storageKey(neighbourhoodId)) === 'true');

    let cancelled = false;
    setLoading(true);
    getApprovedNeighbourhoodReviews(neighbourhoodId).then((result) => {
      if (!cancelled) {
        setReviews(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [neighbourhoodId]);

  async function submit(rating: number, comment: string, reviewerName: string, reviewerEmail: string) {
    if (submitting) return;
    setSubmitting(true);
    setError(false);
    const result = await submitNeighbourhoodReview(neighbourhoodId, rating, comment, reviewerName, reviewerEmail);
    if (result.ok) {
      window.localStorage.setItem(storageKey(neighbourhoodId), 'true');
      setHasReviewed(true);
      if (rating >= AUTO_APPROVE_RATING) {
        setReviews(await getApprovedNeighbourhoodReviews(neighbourhoodId));
      } else {
        setPendingApproval(true);
      }
    } else {
      setError(true);
    }
    setSubmitting(false);
  }

  return { reviews, loading, submitting, error, hasReviewed, pendingApproval, submit };
}
