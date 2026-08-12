import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isSpotSaved, toggleSavedSpot, onSavedSpotsChange } from '../lib/savedSpots';
import type { Spot } from '../data/products';

/** Heart toggle overlaid on a SpotCard's image — saves the spot to
 * localStorage (`xplora_saved_spots`), surfaced on the /saved page's
 * "Places" section. Mirrors the itinerary-save heart used elsewhere. */
export function SaveSpotButton({ spot, className }: { spot: Spot; className?: string }) {
  const { t } = useTranslation();
  const [saved, setSaved] = useState(() => isSpotSaved(spot.id));

  useEffect(() => {
    setSaved(isSpotSaved(spot.id));
    return onSavedSpotsChange(() => setSaved(isSpotSaved(spot.id)));
  }, [spot.id]);

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSavedSpot(spot); }}
      aria-label={saved ? t('saved.removePlace') : t('saved.savePlace')}
      aria-pressed={saved}
      className={className ?? 'absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/55 flex items-center justify-center transition-colors z-10'}
    >
      <Heart className={`w-4 h-4 ${saved ? 'fill-secondary text-secondary' : 'fill-none text-white'}`} aria-hidden="true" />
    </button>
  );
}
