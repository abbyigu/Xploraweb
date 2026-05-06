import { Clock, Users, MapPin, ShoppingCart, Check } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router';
import type { Product } from '../data/products';

export function ExperienceCard({ exp }: { exp: Product }) {
  const { addItem, items } = useCart();
  const navigate = useNavigate();
  const inCart = items.some(i => i.id === exp.id);

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
      <div
        className="relative h-48 cursor-pointer"
        onClick={() => navigate(`/experience/${exp.id}`)}
      >
        <ImageWithFallback src={exp.image} alt={exp.name} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {exp.duration}
        </div>
        {exp.badge && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full">
            {exp.badge}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3
          className="text-lg mb-1 cursor-pointer hover:text-primary transition-colors"
          onClick={() => navigate(`/experience/${exp.id}`)}
        >
          {exp.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">{exp.description}</p>
        <div className="flex items-center justify-between text-sm mb-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {exp.spots} spots
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-4 h-4" />
            {exp.difficulty}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium">{exp.price === 0 ? 'Free' : `$${(exp.price / 100).toFixed(0)}`}</span>
          <button
            onClick={() => { if (!inCart) addItem(exp); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              inCart ? 'bg-green-500 text-white cursor-default' : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {inCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            {inCart ? 'In Cart' : 'Book'}
          </button>
        </div>
      </div>
    </div>
  );
}
