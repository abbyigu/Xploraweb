import { useEffect, useState } from 'react';
import { Star, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getMySpotReview, upsertSpotReview } from '../lib/spotReviews';
import type { SpotReview } from '../lib/spotReviews';
import { containsInappropriateLanguage } from '../lib/contentModeration';

/** "Leave a review" -> rating+notes -> "Save review" for a single saved
 * place, mirroring the itinerary review flow on /i/:slug. Lives on each
 * place's card in the /saved page's Places section. */
export function SpotReviewForm({ spotId }: { spotId: string }) {
  const { t } = useTranslation();
  const [review, setReview] = useState<SpotReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saved, setSaved] = useState(false);
  const [blockedError, setBlockedError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMySpotReview(spotId).then((r) => {
      if (cancelled) return;
      setReview(r);
      if (r) {
        setRating(r.rating);
        setComment(r.comment);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [spotId]);

  async function handleSave() {
    if (rating === 0) return;
    if (containsInappropriateLanguage(comment)) {
      setBlockedError(true);
      return;
    }
    setBlockedError(false);
    const result = await upsertSpotReview(spotId, rating, comment);
    if (result.review) {
      setReview(result.review);
      setSaved(true);
    }
  }

  if (loading) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="mt-1.5 flex items-center gap-1 text-xs font-medium hover:underline"
      >
        {review ? (
          <span className={review.reviewStatus === 'pending' ? 'text-amber-700' : 'text-amber-600'}>
            <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline mr-1" aria-hidden="true" />
            {review.rating}.0 · {review.reviewStatus === 'pending' ? t('saved.reviewPending') : t('saved.reviewed')}
          </span>
        ) : (
          <span className="text-primary">
            <Star className="w-3 h-3 inline mr-1" aria-hidden="true" /> {t('saved.ratePlaceButton')}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="mt-2 pt-2 border-t border-border space-y-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => { setRating(n); setSaved(false); }}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className="p-0.5"
          >
            <Star className={`w-4 h-4 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        value={comment}
        onChange={(e) => { setComment(e.target.value); setSaved(false); setBlockedError(false); }}
        placeholder={t('saved.placeNotesPlaceholder')}
        className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      />
      {blockedError && (
        <p className="text-xs text-red-600">{t('common.reviewBlockedLanguage')}</p>
      )}
      {review?.reviewStatus === 'pending' && (
        <p className="text-xs text-amber-700">{t('saved.reviewPendingLong')}</p>
      )}
      <button
        type="button"
        onClick={handleSave}
        disabled={rating === 0}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12343B] text-white text-xs font-medium hover:opacity-90 transition disabled:opacity-40"
      >
        {saved ? <><Check className="w-3.5 h-3.5" aria-hidden="true" /> {t('account.saved')}</> : t('sharedItinerary.saveReview')}
      </button>
    </div>
  );
}
