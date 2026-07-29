import { useState } from 'react';
import { Star, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNeighbourhoodRating } from '../hooks/useNeighbourhoodRating';
import { NotifyMeForm } from './NotifyMeForm';

function StaticStars({ value, size = 20 }: { value: number; size?: number }) {
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

export function NeighbourhoodRating({ neighbourhoodId }: { neighbourhoodId: string }) {
  const { t } = useTranslation();
  const { summary, loading, myRating, submitting, rate } = useNeighbourhoodRating(neighbourhoodId);

  return (
    <section className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
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
          </div>
        )}
      </div>

      <div className="bg-card border border-dashed border-border rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2">
        <Mail className="w-5 h-5 text-[#12343B]" aria-hidden="true" />
        <h2 className="font-serif text-lg text-gray-900">{t('neighbourhoodDetail.reviewsComingSoonTitle', 'Written reviews are coming soon')}</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          {t('neighbourhoodDetail.reviewsComingSoonBody', "We're building a real review system so future explorers can read what others thought. Want to know when it launches?")}
        </p>
        <NotifyMeForm source="neighbourhood_reviews" className="mt-1 w-full max-w-xs" />
      </div>
    </section>
  );
}
