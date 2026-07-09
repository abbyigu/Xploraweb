import { MapPin, Clock, ExternalLink, Lightbulb, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Spot } from '../data/products';
import { SPOT_CATEGORY_KEY } from '../data/products';

export function SpotCard({ spot, badge }: { spot: Spot; badge?: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white flex flex-col">
      <div
        className="group relative aspect-[3/2] overflow-hidden bg-muted focus:outline-none"
        tabIndex={spot.xploraTips && spot.xploraTips.length > 0 ? 0 : undefined}
      >
        {spot.image ? (
          <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <MapPin className="w-7 h-7" />
          </div>
        )}
        {badge}
        {spot.category && (
          <span className="absolute top-2 left-2 text-[11px] font-medium px-2 py-1 rounded-full bg-white/90 text-[#12343B]">
            {t(`categories.${SPOT_CATEGORY_KEY[spot.category]}`, spot.category)}
          </span>
        )}
        {spot.isBrunch && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm">
            <Star className="w-3 h-3 fill-white" /> {t('neighbourhoodDetail.brunch', 'Brunch')}
          </span>
        )}

        {spot.xploraTips && spot.xploraTips.length > 0 && (
          <>
            {/* Always-visible hint badge (hides while the overlay is open) */}
            <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-[#12343B]/90 text-white transition-opacity group-hover:opacity-0 group-focus-within:opacity-0">
              <Lightbulb className="w-3 h-3" /> {t('neighbourhoodDetail.tips', 'Tips')}
            </span>
            {/* Overlay revealed on hover / tap / focus */}
            <div className="absolute inset-0 bg-[#12343B]/95 text-white p-4 flex flex-col gap-2 overflow-y-auto opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/80">
                <Lightbulb className="w-3.5 h-3.5" /> {t('neighbourhoodDetail.xploraTips', 'Xplora Tips')}
              </div>
              <ul className="space-y-1.5">
                {spot.xploraTips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-snug">
                    <span aria-hidden className="text-white/50">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-gray-900 leading-tight">{spot.name}</p>
          <span className="flex-shrink-0 inline-flex items-center gap-2 text-xs text-muted-foreground">
            {spot.priceRange && (
              <span className="font-mono font-semibold text-[#12343B]">
                {spot.priceRange === 'Free' ? t('neighbourhoodDetail.free', 'Free') : spot.priceRange}
              </span>
            )}
            {spot.visitTime && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {spot.visitTime}
              </span>
            )}
          </span>
        </div>
        {spot.description && <p className="text-sm text-gray-600 line-clamp-3">{spot.description}</p>}
        {spot.address && <p className="text-xs text-muted-foreground mt-0.5">{spot.address}</p>}
        {spot.website && (
          <a
            href={spot.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="mt-1 inline-flex items-center gap-1 text-sm text-[#12343B] font-medium hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" /> {t('neighbourhoodDetail.website', 'Website')}
          </a>
        )}
      </div>
    </div>
  );
}
