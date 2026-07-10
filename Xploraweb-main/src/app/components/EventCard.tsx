import { Clock, MapPin, ShoppingCart, Check } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router';
import type { Product } from '../data/products';
import { useTranslation } from 'react-i18next';

function formatEventDate(dateStr: string, lang: string): { day: string; month: string; weekday: string } {
  const locale = lang === 'fr' ? 'fr-CA' : 'en-CA';
  const d = new Date(dateStr + 'T00:00:00');
  return {
    day: d.toLocaleDateString(locale, { day: 'numeric' }),
    month: d.toLocaleDateString(locale, { month: 'short' }).toUpperCase(),
    weekday: d.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase(),
  };
}

const EVENT_TYPE_STYLE: Record<string, { label: string; className: string }> = {
  recurring:  { label: 'Recurring',  className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  seasonal:   { label: 'Seasonal',   className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  'one-time': { label: 'One time',   className: 'bg-purple-50 text-purple-700 border border-purple-200' },
};

export function EventCard({ exp }: { exp: Product }) {
  const { addItem, items } = useCart();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const inCart = items.some(i => i.id === exp.id);
  const typeStyle = exp.eventType ? EVENT_TYPE_STYLE[exp.eventType] : null;
  const locationShort = exp.meetingPoint
    ? exp.meetingPoint.split('—')[0].split(',')[0].trim()
    : null;
  const dateInfo = exp.eventDate ? formatEventDate(exp.eventDate, i18n.language) : null;
  const fewSpots = exp.spots !== undefined && exp.spots <= 5;

  return (
    <div
      className="flex bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/experience/${exp.id}`)}
      role="article"
    >
      {/* Date block */}
      {dateInfo && (
        <div className="flex-shrink-0 w-14 flex flex-col items-center justify-center bg-primary/8 border-r border-border px-1 py-4 gap-0.5">
          <span className="text-[10px] font-semibold tracking-widest text-muted-foreground">{dateInfo.weekday}</span>
          <span className="text-2xl font-bold leading-none text-foreground">{dateInfo.day}</span>
          <span className="text-[10px] font-semibold tracking-widest text-muted-foreground">{dateInfo.month}</span>
        </div>
      )}

      {/* Image */}
      <div className="relative w-24 sm:w-32 flex-shrink-0">
        <ImageWithFallback src={exp.image} alt={exp.name} className="w-full h-full object-cover" />
        {exp.badge && (
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-tight">
            {exp.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 gap-1.5 min-w-0">
        {/* Type badge + time */}
        <div className="flex items-center gap-2 flex-wrap">
          {typeStyle && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold leading-tight ${typeStyle.className}`}>
              {t(`events.${exp.eventType}`, typeStyle.label)}
            </span>
          )}
          {exp.eventTime && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
              {exp.eventTime}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold leading-snug line-clamp-2">{exp.name}</h3>

        {/* Location */}
        {locationShort && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{locationShort}</span>
          </span>
        )}

        {/* Spots warning */}
        {fewSpots && (
          <span className="text-xs font-medium text-amber-600">
            {t('events.fewSpots', { count: exp.spots })}
          </span>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-1">
          {exp.price === 0 ? (
            <>
              <span className="text-sm font-semibold text-primary">{t('experienceCard.free')}</span>
              <button
                onClick={(e) => { e.stopPropagation(); if (!inCart) addItem(exp); }}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                  inCart
                    ? 'bg-green-500 text-white cursor-default'
                    : 'bg-[#12343B] text-white hover:bg-[#12343B]/90'
                }`}
                aria-label={inCart ? t('experienceCard.added') : `${t('experienceCard.bookPaid')} ${exp.name}`}
              >
                {inCart ? (
                  <><Check className="w-3 h-3" aria-hidden="true" />{t('experienceCard.added')}</>
                ) : (
                  <><ShoppingCart className="w-3 h-3" aria-hidden="true" />{t('experienceCard.bookPaid')}</>
                )}
              </button>
            </>
          ) : (
            <span className="ml-auto text-xs font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
              {t('experienceCard.comingSoon')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
