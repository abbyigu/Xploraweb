import { Clock, Users, MapPin, ShoppingCart, Check } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router';
import type { Product } from '../data/products';
import { useTranslation } from 'react-i18next';

export function ExperienceCard({ exp }: { exp: Product }) {
  const { addItem, items } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const inCart = items.some(i => i.id === exp.id);

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
      <div
        className="relative h-28 sm:h-32 md:h-44 lg:h-48 cursor-pointer"
        onClick={() => navigate(`/experience/${exp.id}`)}
      >
        <ImageWithFallback src={exp.image} alt={exp.name} className="w-full h-full object-cover" />
        <div className="hidden md:flex absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {exp.duration}
        </div>
        {exp.badge && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full">
            {exp.badge}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-2.5 md:p-5">
        <h3
          className="text-xs sm:text-sm md:text-xl font-medium mb-0.5 md:mb-1 cursor-pointer hover:text-primary transition-colors leading-tight"
          onClick={() => navigate(`/experience/${exp.id}`)}
        >
          {exp.name}
        </h3>
        <div className="flex md:hidden items-center gap-1 text-xs text-muted-foreground mb-1">
          <Clock className="w-3 h-3" />
          {exp.duration}
        </div>
        <p className="text-xs md:text-base text-muted-foreground mb-2 md:mb-3 line-clamp-2 md:line-clamp-none">{exp.description}</p>
        <div className="flex items-center justify-between text-xs md:text-sm mb-2 md:mb-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {exp.spots} {t('experienceCard.spots')}
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-4 h-4" />
            {exp.difficulty}
          </div>
        </div>
        <div className="flex items-center justify-between mt-auto pt-1.5 md:pt-0">
          <span className="text-xs md:text-lg font-medium">{exp.price === 0 ? t('experienceCard.free', 'Free') : `$${(exp.price / 100).toFixed(0)}`}</span>
          <button
            onClick={() => { if (!inCart) addItem(exp); }}
            className={`flex items-center gap-1 md:gap-2 px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all ${
              inCart ? 'bg-green-500 text-white cursor-default' : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {inCart ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />}
            {inCart ? t('experienceCard.added') : t('experienceCard.book')}
          </button>
        </div>
      </div>
    </div>
  );
}
