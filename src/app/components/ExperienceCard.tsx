import { Clock, MapPin, Check, Eye, Star, Bookmark } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useNavigate } from 'react-router';
import type { Product } from '../data/products';
import { difficultyMeta, getRating } from '../lib/experienceMeta';

interface ExperienceCardProps {
  exp: Product;
  onQuickView?: () => void;
  compareSelected?: boolean;
  onCompareToggle?: () => void;
}

export function ExperienceCard({ exp, onQuickView, compareSelected, onCompareToggle }: ExperienceCardProps) {
  const navigate = useNavigate();
  const detailPath = `/experience/${exp.id}`;
  const diff = difficultyMeta(exp.difficulty);
  const { rating, reviewCount } = getRating(exp);
  const [saved, setSaved] = useState(false);

  const handleNavigate = (e: React.MouseEvent) => {
    // Allow Cmd/Ctrl+click to open in new tab natively
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    navigate(detailPath);
  };

  return (
    <div className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
      {/* Image */}
      <a href={detailPath} onClick={handleNavigate} className="relative block h-36 sm:h-40 md:h-48 flex-shrink-0">
        <ImageWithFallback src={exp.image} alt={exp.name} className="w-full h-full object-cover" />

        {/* Badge (Free / New / etc.) — top-left */}
        {exp.badge && (
          <span className="absolute top-3 left-3 bg-white/95 text-foreground text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {exp.badge}
          </span>
        )}

        {/* Compare checkbox — top-left below badge when compare is enabled */}
        {onCompareToggle && (
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onCompareToggle(); }}
            aria-label={compareSelected ? 'Remove from compare' : 'Add to compare'}
            className={`absolute ${exp.badge ? 'top-12' : 'top-3'} left-3 w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all shadow-sm ${
              compareSelected
                ? 'bg-primary border-primary'
                : 'bg-white/90 border-white/70 hover:border-primary'
            }`}
          >
            {compareSelected && <Check className="w-3.5 h-3.5 text-white" />}
          </button>
        )}

        {/* Save / bookmark — AllTrails-style, top-right */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); setSaved(s => !s); }}
          aria-label={saved ? 'Remove from saved' : 'Save'}
          aria-pressed={saved}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 shadow-sm flex items-center justify-center hover:bg-white transition-colors"
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-primary text-primary' : 'text-foreground'}`} />
        </button>

        {/* Quick-view overlay — desktop hover */}
        {onQuickView && (
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onQuickView(); }}
            className="absolute inset-x-0 bottom-0 hidden md:flex items-center justify-center gap-1.5 py-2 bg-black/55 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Eye className="w-3.5 h-3.5" /> Quick view
          </button>
        )}
      </a>

      {/* Body */}
      <div className="flex flex-col flex-1 p-3 md:p-4">
        {/* Difficulty · rating row (AllTrails signature) */}
        <div className="flex items-center gap-2 text-xs mb-1.5">
          <span className={`flex items-center gap-1 font-medium ${diff.text}`}>
            <span className={`w-2 h-2 rounded-full ${diff.dot}`} />
            {diff.label}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="flex items-center gap-1 text-foreground">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({reviewCount})</span>
          </span>
        </div>

        {/* Title */}
        <a
          href={detailPath}
          onClick={handleNavigate}
          className="text-sm md:text-base font-semibold mb-0.5 hover:text-primary transition-colors leading-snug block"
        >
          {exp.name}
        </a>

        {/* Location */}
        {exp.neighbourhood && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {exp.neighbourhood}, Québec City
          </div>
        )}

        {/* Stats row — duration */}
        {exp.duration && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Clock className="w-3 h-3 flex-shrink-0" />
            {exp.duration}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-sm md:text-base font-semibold">
            {exp.price === 0 ? 'Free' : `$${(exp.price / 100).toFixed(0)}`}
          </span>
          <div className="flex items-center gap-1.5">
            {/* Mobile quick-view button */}
            {onQuickView && (
              <button
                onClick={e => { e.stopPropagation(); onQuickView(); }}
                className="md:hidden flex items-center gap-1 px-2 py-1 rounded-lg text-xs border border-border text-muted-foreground hover:bg-muted/40 transition-colors"
              >
                <Eye className="w-3 h-3" /> View
              </button>
            )}
            <a
              href={detailPath}
              onClick={handleNavigate}
              className="flex items-center gap-1 px-3 py-1.5 md:px-3.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              {exp.price === 0 ? 'View route' : `Book — $${(exp.price / 100).toFixed(0)}`}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
