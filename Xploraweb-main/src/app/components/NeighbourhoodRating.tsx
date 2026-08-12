import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNeighbourhoodRating } from '../hooks/useNeighbourhoodRating';
import { useNeighbourhoodReviews } from '../hooks/useNeighbourhoodReviews';
import { containsInappropriateLanguage } from '../lib/contentModeration';

export function StaticStars({ value, size = 20 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

function InteractiveStars({ disabled, onRate }: { disabled?: boolean; onRate: (value: number) => void }) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHover(i)}
          onClick={() => onRate(i)}
          aria-label={`${i} / 5`}
          className="p-0.5 disabled:cursor-default"
        >
          <Star
            width={24}
            height={24}
            className={i <= (hover ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-amber-300 transition-colors'}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ submitting, onSubmit }: { submitting: boolean; onSubmit: (rating: number, comment: string, reviewerName: string, reviewerEmail: string) => void }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [blockedError, setBlockedError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0 || submitting) return;
    if (containsInappropriateLanguage(comment)) {
      setBlockedError(true);
      return;
    }
    setBlockedError(false);
    onSubmit(rating, comment, reviewerName, reviewerEmail);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2 w-full">
      <InteractiveStars disabled={submitting} onRate={setRating} />
      <input
        type="text"
        value={reviewerName}
        onChange={e => setReviewerName(e.target.value)}
        placeholder={t('neighbourhoodDetail.reviewNamePlaceholder', 'Your name (optional)')}
        maxLength={60}
        className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <input
        type="email"
        value={reviewerEmail}
        onChange={e => setReviewerEmail(e.target.value)}
        placeholder={t('neighbourhoodDetail.reviewEmailPlaceholder', 'Your email (optional, in case we follow up)')}
        maxLength={200}
        className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <textarea
        value={comment}
        onChange={e => { setComment(e.target.value); setBlockedError(false); }}
        placeholder={t('neighbourhoodDetail.reviewCommentPlaceholder', 'Share what you thought (optional)')}
        maxLength={1000}
        rows={3}
        className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
      />
      {blockedError && (
        <p className="text-xs text-red-600">{t('common.reviewBlockedLanguage')}</p>
      )}
      <button
        type="submit"
        disabled={rating === 0 || submitting}
        className="w-full px-4 py-2 rounded-xl bg-[#12343B] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
      >
        {submitting ? t('neighbourhoodDetail.reviewSubmitting', 'Submitting…') : t('neighbourhoodDetail.reviewSubmit', 'Submit review')}
      </button>
    </form>
  );
}

export function NeighbourhoodRating({ neighbourhoodId }: { neighbourhoodId: string }) {
  const { t } = useTranslation();
  const { summary, loading, myRating, submitting, error, rate } = useNeighbourhoodRating(neighbourhoodId);
  const {
    reviews,
    loading: reviewsLoading,
    submitting: reviewSubmitting,
    error: reviewError,
    hasReviewed,
    pendingApproval,
    submit: submitReview,
  } = useNeighbourhoodReviews(neighbourhoodId);

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 text-center flex flex-col items-center gap-2">
          <h2 className="font-serif text-lg text-gray-900">{t('neighbourhoodDetail.ratingTitle', 'Rate this neighbourhood')}</h2>
          <StaticStars value={summary.average} />
          <p className="text-sm text-muted-foreground">
            {summary.count > 0
              ? t('neighbourhoodDetail.ratingSummary', '{{average}} · {{count}} ratings', { average: summary.average.toFixed(1), count: summary.count })
              : t('neighbourhoodDetail.noRatingsYet', 'No ratings yet — be the first')}
          </p>

          {myRating != null ? (
            <p className="text-sm text-[#12343B] font-medium mt-1">
              {t('neighbourhoodDetail.thanksForRating', 'Thanks — you rated this {{value}} / 5', { value: myRating })}
            </p>
          ) : (
            <div className="flex flex-col items-center gap-1.5 mt-1">
              <InteractiveStars disabled={submitting || loading} onRate={rate} />
              <p className="text-xs text-muted-foreground">{t('neighbourhoodDetail.tapToRate', 'Tap a star to rate')}</p>
              {error && (
                <p className="text-xs text-red-600">{t('neighbourhoodDetail.ratingError', "Couldn't save your rating — please try again.")}</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 text-center flex flex-col items-center gap-2">
          <h2 className="font-serif text-lg text-gray-900">{t('neighbourhoodDetail.writeReviewTitle', 'Write a review')}</h2>
          {hasReviewed ? (
            <p className="text-sm text-[#12343B] font-medium mt-1">
              {pendingApproval
                ? t('neighbourhoodDetail.reviewThanksPending', "Thanks! Your review will appear once it's approved.")
                : t('neighbourhoodDetail.reviewThanksLive', 'Thanks — your review is live!')}
            </p>
          ) : (
            <>
              <ReviewForm submitting={reviewSubmitting} onSubmit={submitReview} />
              {reviewError && (
                <p className="text-xs text-red-600">{t('neighbourhoodDetail.reviewError', "Couldn't save your review — please try again.")}</p>
              )}
            </>
          )}
        </div>
      </div>

      {!reviewsLoading && reviews.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif text-lg text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#12343B]" aria-hidden="true" />
            {t('neighbourhoodDetail.reviewsTitle', 'What explorers are saying')}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-card border border-border rounded-2xl p-5 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <StaticStars value={review.rating} size={16} />
                  {review.reviewer_name && <span className="text-sm font-medium text-gray-900">{review.reviewer_name}</span>}
                </div>
                {review.comment && <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>}
                {review.admin_reply && (
                  <div className="mt-3 pl-3 border-l-2 border-[#12343B]/20">
                    <p className="text-xs font-medium text-[#12343B] mb-0.5">{t('neighbourhoodDetail.adminReplyLabel', 'Xplora replied')}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.admin_reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
