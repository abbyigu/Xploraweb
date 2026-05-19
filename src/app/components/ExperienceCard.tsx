import { Clock, MapPin, Users, Check, Eye, Flame, Crown } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useNavigate } from 'react-router';
import type { Product } from '../data/products';

interface ExperienceCardProps {
  exp: Product;
  onQuickView?: () => void;
  compareSelected?: boolean;
  onCompareToggle?: () => void;
}

export function ExperienceCard({ exp, onQuickView, compareSelected, onCompareToggle }: ExperienceCardProps) {
  const navigate = useNavigate();
  const detailPath = `/experience/${exp.id}`;

  const handleNavigate = (e: React.MouseEvent) => {
    // Allow Cmd/Ctrl+click to open in new tab natively
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    navigate(detailPath);
  };

  return (
    <div className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
      {/* Image */}
      <a href={detailPath} onClick={handleNavigate} className="relative block h-28 sm:h-32 md:h-44 lg:h-48 flex-shrink-0">
        <ImageWithFallback src={exp.image} alt={exp.name} className="w-full h-full object-cover" />

        {/* Duration badge top-right */}
        {exp.duration && (
          <div className="hidden md:flex absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs items-center gap-1 shadow-sm">
            <Clock className="w-3 h-3" />
            {exp.duration}
          </div>
        )}

        {/* Badge (Free / New / etc.) — mobile only since desktop shows duration */}
        {exp.badge && (
          <span className="md:hidden absolute top-3 right-3 bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full">
            {exp.badge}
          </span>
        )}

        {/* Compare checkbox — top-left, always visible when compare is enabled */}
        {onCompareToggle && (
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onCompareToggle(); }}
            aria-label={compareSelected ? 'Remove from compare' : 'Add to compare'}
            className={`absolute top-3 left-3 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shadow-sm ${
              compareSelected
                ? 'bg-primary border-primary'
                : 'bg-white/85 border-white/60 hover:border-primary'
            }`}
          >
            {compareSelected && <Check className="w-3.5 h-3.5 text-white" />}
          </button>
        )}

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
      <div className="flex flex-col flex-1 p-2.5 md:p-4">
        {/* Title */}
        <a
          href={detailPath}
          onClick={handleNavigate}
          className="text-xs sm:text-sm md:text-base font-medium mb-0.5 md:mb-1 hover:text-primary transition-colors leading-snug block"
        >
          {exp.name}
        </a>

        {/* Mobile: duration inline */}
        <div className="flex md:hidden items-center gap-1 text-xs text-muted-foreground mb-1">
          <Clock className="w-3 h-3" />
          {exp.duration}
        </div>

        {/* Description */}
        <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-2 leading-snug">
          {exp.description}
        </p>

        {/* Consistent meta row: location · difficulty · scarcity */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2 md:mb-3">
          {exp.neighbourhood && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />{exp.neighbourhood}
            </span>
          )}
          {exp.difficulty && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 flex-shrink-0" />{exp.difficulty}
            </span>
          )}
          {exp.spots != null && exp.spots <= 5 && (
            <span className="text-red-500 font-medium">⚡ {exp.spots} spots left</span>
          )}
        </div>

        {/* Urgency */}
        {exp.weeklyBookings && (
          <div className="hidden md:flex items-center gap-1 text-xs text-orange-600 font-medium mb-1">
            <Flame className="w-3 h-3" />
            {exp.weeklyBookings} booked this week
          </div>
        )}

        {/* Member pricing */}
        {exp.price > 0 && (
          <div className="hidden md:flex items-center gap-1 text-xs text-secondary font-medium mb-2">
            <Crown className="w-3 h-3" />
            Members ${Math.floor(exp.price * 0.75 / 100)}
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
              className="flex items-center gap-1 px-2 py-1 md:px-3.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              {exp.price === 0 ? 'View route' : `Book — $${(exp.price / 100).toFixed(0)}`}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
