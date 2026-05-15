import { Clock, MapPin, Globe, ShoppingCart, Check, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router';
import type { Product } from '../data/products';
import { useTranslation } from 'react-i18next';

function formatLanguages(languages?: string[]): string {
  if (!languages || languages.length === 0) return '';
  return languages.map(l => {
    const lower = l.toLowerCase();
    if (lower.includes('english') || lower.includes('anglais')) return 'EN';
    if (lower.includes('français') || lower.includes('french')) return 'FR';
    return l.slice(0, 2).toUpperCase();
  }).join(' · ');
}

export function ExperienceCard({ exp }: { exp: Product }) {
  const { addItem, items } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const inCart = items.some(i => i.id === exp.id);
  const isFree = exp.price === 0;
  const isSelfGuided = exp.category === 'xplorators';
  const langLabel = formatLanguages(exp.languages);
  const meetingShort = exp.meetingPoint
    ? exp.meetingPoint.split('—')[0].split(',')[0].trim()
    : null;

  function handleCTA() {
    if (inCart) return;
    if (isFree && isSelfGuided) {
      navigate(`/experience/${exp.id}`);
    } else {
      addItem(exp);
    }
  }

  return (
    <div className="flex flex-col bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
      {/* Image */}
      <div
        className="relative h-40 sm:h-44 cursor-pointer flex-shrink-0"
        onClick={() => navigate(`/experience/${exp.id}`)}
      >
        <ImageWithFallback src={exp.image} alt={exp.name} className="w-full h-full object-cover" />
        {exp.badge && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full font-medium">
            {exp.badge}
          </span>
        )}
        {exp.duration && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white backdrop-blur-sm px-2.5 py-1 rounded-full text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {exp.duration}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        {/* Title — what is it */}
        <h3
          className="text-base font-semibold leading-snug cursor-pointer hover:text-primary transition-colors"
          onClick={() => navigate(`/experience/${exp.id}`)}
        >
          {exp.name}
        </h3>

        {/* Hook — why should I care */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {exp.description}
        </p>

        {/* Language + meeting point */}
        {(langLabel || meetingShort) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {langLabel && (
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" aria-hidden="true" />
                {langLabel}
              </span>
            )}
            {meetingShort && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                {meetingShort}
              </span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-lg font-semibold">
            {isFree
              ? <span className="text-primary text-base font-semibold">{t('experienceCard.free')}</span>
              : `$${(exp.price / 100).toFixed(0)}`}
          </span>
          <button
            onClick={handleCTA}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              inCart
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-[#12343B] text-white hover:bg-[#12343B]/90'
            }`}
          >
            {inCart ? (
              <><Check className="w-4 h-4" aria-hidden="true" />{t('experienceCard.added')}</>
            ) : isFree && isSelfGuided ? (
              <>{t('experienceCard.startExploring')}<ArrowRight className="w-4 h-4" aria-hidden="true" /></>
            ) : (
              <><ShoppingCart className="w-4 h-4" aria-hidden="true" />{t('experienceCard.bookPaid')} — ${(exp.price / 100).toFixed(0)}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
