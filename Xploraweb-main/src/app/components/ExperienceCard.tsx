import { Clock, MapPin, ShoppingCart, Check, ArrowRight, Star, Bookmark } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router';
import type { Product } from '../data/products';
import { useTranslation } from 'react-i18next';
import { normalizeDifficulty, DIFFICULTY_META, getRating } from '../lib/experienceMeta';

export function ExperienceCard({ exp }: { exp: Product }) {
  const { addItem, items } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [saved, setSaved] = useState(false);
  const inCart = items.some(i => i.id === exp.id);
  const isFree = exp.price === 0;
  const isSelfGuided = exp.category === 'xplorators';

  const level = normalizeDifficulty(exp.difficulty);
  const diff = DIFFICULTY_META[level];
  const { rating, reviewCount } = getRating(exp);

  function handleCTA() {
    if (inCart) return;
    if (isFree && isSelfGuided) {
      navigate(`/experience/${exp.id}`);
    } else {
      addItem(exp);
    }
  }

  return (
    <div className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
      {/* Image */}
      <div
        className="relative h-40 sm:h-44 cursor-pointer flex-shrink-0"
        onClick={() => navigate(`/experience/${exp.id}`)}
      >
        <ImageWithFallback src={exp.image} alt={exp.name} className="w-full h-full object-cover" />
        {exp.badge && (
          <span className="absolute top-3 left-3 bg-white/95 text-foreground text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm">
            {exp.badge}
          </span>
        )}

        {/* Save / bookmark — AllTrails-style */}
        <button
          onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
          aria-label={saved ? 'Remove from saved' : 'Save'}
          aria-pressed={saved}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 shadow-sm flex items-center justify-center hover:bg-white transition-colors"
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-primary text-primary' : 'text-foreground'}`} aria-hidden="true" />
        </button>

        {exp.duration && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white backdrop-blur-sm px-2.5 py-1 rounded-full text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {exp.duration}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Difficulty · rating row (AllTrails signature) */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`flex items-center gap-1 font-medium ${diff.text}`}>
            <span className={`w-2 h-2 rounded-full ${diff.dot}`} />
            {t(`experienceCard.${level}`)}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="flex items-center gap-1 text-foreground">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({reviewCount})</span>
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-base font-semibold leading-snug cursor-pointer hover:text-primary transition-colors"
          onClick={() => navigate(`/experience/${exp.id}`)}
        >
          {exp.name}
        </h3>

        {/* Location */}
        {exp.neighbourhood && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            {exp.neighbourhood}, Québec City
          </div>
        )}

        {/* Hook — why should I care */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {exp.description}
        </p>

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
