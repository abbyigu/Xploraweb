import { memo } from 'react';
import { MapPin, Clock, ExternalLink, Star, Award, CalendarCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Spot } from '../data/products';
import { SPOT_CATEGORY_KEY } from '../data/products';
import { SaveSpotButton } from './SaveSpotButton';

export const SpotCard = memo(function SpotCard({ spot, badge, pinAction }: { spot: Spot; badge?: React.ReactNode; pinAction?: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white flex flex-col">
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        {spot.image ? (
          <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <MapPin className="w-7 h-7" />
          </div>
        )}
        <SaveSpotButton spot={spot} />
        {pinAction}
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
        {spot.michelinUrl && (
          <a
            href={spot.michelinUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700 transition-colors"
          >
            <Award className="w-3 h-3 fill-white" /> {t('neighbourhoodDetail.michelinGuide', 'Michelin Guide')}
          </a>
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
        {typeof spot.googleRating === 'number' && (
          <span className="flex items-center gap-1 text-xs text-foreground">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="font-medium">{spot.googleRating.toFixed(1)}</span>
            {typeof spot.googleReviewCount === 'number' && (
              <span className="text-muted-foreground">({spot.googleReviewCount})</span>
            )}
            <span className="text-muted-foreground">· Google</span>
          </span>
        )}
        {spot.description && <p className="text-sm text-gray-600 line-clamp-3">{spot.description}</p>}
        {spot.address && <p className="text-xs text-muted-foreground mt-0.5">{spot.address}</p>}
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
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
          {spot.michelinUrl && (
            <a
              href={spot.michelinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="mt-1 inline-flex items-center gap-1 text-sm text-[#12343B] font-medium hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" /> {t('neighbourhoodDetail.michelinGuide', 'Michelin Guide')}
            </a>
          )}
          {spot.reservationUrl && (
            <a
              href={spot.reservationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-white bg-[#12343B] px-3 py-1.5 rounded-full hover:bg-[#12343B]/90 transition-colors"
            >
              <CalendarCheck className="w-3.5 h-3.5" /> {t('neighbourhoodDetail.reservation', 'Reserve a table')}
            </a>
          )}
        </span>
      </div>
    </div>
  );
});
