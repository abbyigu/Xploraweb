import { useTranslation } from 'react-i18next';
import { useNeighbourhoodRating } from '../hooks/useNeighbourhoodRating';
import { StaticStars } from './NeighbourhoodRating';

/** Compact, read-only rating glance for the top of the neighbourhood page —
 * stars + total only, no tap-to-rate or write-a-review. Links down to the
 * full interactive rating + review flow at the bottom of the page (see
 * NeighbourhoodRating, mounted under id="reviews"). */
export function NeighbourhoodRatingSummary({ neighbourhoodId }: { neighbourhoodId: string }) {
  const { t } = useTranslation();
  const { summary, loading } = useNeighbourhoodRating(neighbourhoodId);

  if (loading) return null;

  return (
    <a href="#reviews" className="flex items-center justify-center gap-2 group w-fit mx-auto">
      <StaticStars value={summary.average} size={18} />
      <span className="text-sm text-muted-foreground group-hover:text-[#12343B] group-hover:underline transition-colors">
        {summary.count > 0
          ? t('neighbourhoodDetail.ratingSummary', '{{average}} · {{count}} ratings', { average: summary.average.toFixed(1), count: summary.count })
          : t('neighbourhoodDetail.noRatingsYet', 'No ratings yet — be the first')}
      </span>
    </a>
  );
}
