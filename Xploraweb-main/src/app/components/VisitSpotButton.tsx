import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isSpotVisited, toggleVisitedSpot, onVisitedSpotsChange } from '../lib/visitedSpots';
import type { Spot } from '../data/products';

/** "I've been here" toggle overlaid on a SpotCard's image — marks the spot as
 * visited in localStorage (`xplora_visited_spots`), which feeds the personal
 * exploration breakdown shown in the neighbourhoods map panel. Separate from
 * SaveSpotButton: saving a place doesn't mean you've actually gone there. */
export function VisitSpotButton({ spot, className }: { spot: Spot; className?: string }) {
  const { t } = useTranslation();
  const [visited, setVisited] = useState(() => isSpotVisited(spot.id));

  useEffect(() => {
    setVisited(isSpotVisited(spot.id));
    return onVisitedSpotsChange(() => setVisited(isSpotVisited(spot.id)));
  }, [spot.id]);

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleVisitedSpot(spot); }}
      aria-label={visited ? t('visited.unmarkVisited', "Remove \"I've been here\"") : t('visited.markVisited', "I've been here")}
      aria-pressed={visited}
      className={className ?? 'absolute top-2 right-11 w-8 h-8 rounded-full bg-black/40 hover:bg-black/55 flex items-center justify-center transition-colors z-10'}
    >
      <CheckCircle2 className={`w-4 h-4 ${visited ? 'fill-[#119FB3] text-white' : 'fill-none text-white'}`} aria-hidden="true" />
    </button>
  );
}
