import { X, Clock, MapPin, Users, Check, ShoppingCart, Bookmark, ExternalLink, Flame } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import type { Product } from '../data/products';

function categoryLabel(cat: string) {
  return cat === 'xplorators' ? 'Solo' : cat === 'xploratorsplus' ? 'Solo+' : cat === 'xploratours' ? 'Tours' : 'Nights';
}

export function QuickViewModal({ exp, onClose }: { exp: Product; onClose: () => void }) {
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const inCart = items.some(i => i.id === exp.id);
  const [isSaved, setIsSaved] = useState(() => {
    if (exp.price !== 0) return false;
    try {
      const saved = JSON.parse(localStorage.getItem('xplora_saved_routes') || '[]');
      return saved.includes(exp.id);
    } catch { return false; }
  });

  const handlePrimary = () => {
    if (exp.price === 0) {
      if (!isSaved) {
        try {
          const saved = JSON.parse(localStorage.getItem('xplora_saved_routes') || '[]');
          localStorage.setItem('xplora_saved_routes', JSON.stringify([...saved, exp.id]));
        } catch { /* ignore */ }
        setIsSaved(true);
      }
    } else {
      if (!inCart) addItem(exp);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Image */}
        <div className="relative h-52 md:h-60 flex-shrink-0">
          <img src={exp.image} alt={exp.name} className="w-full h-full object-cover rounded-t-3xl" />
          <button onClick={onClose} className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow">
            <X className="w-4 h-4" />
          </button>
          {exp.badge && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">{exp.badge}</span>
          )}
        </div>

        <div className="p-5 md:p-6">
          {exp.category && (
            <p className="text-xs uppercase tracking-widest text-secondary mb-1">{categoryLabel(exp.category)}</p>
          )}
          <h2 className="text-xl font-medium mb-3">{exp.name}</h2>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground mb-3">
            {exp.duration && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{exp.duration}</span>}
            {exp.neighbourhood && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{exp.neighbourhood}</span>}
            {exp.spots && (
              <span className={`flex items-center gap-1.5 ${exp.spots <= 5 ? 'text-red-600 font-medium' : ''}`}>
                <Users className="w-3.5 h-3.5" />
                {exp.spots <= 5 ? `⚡ Only ${exp.spots} spots left` : `${exp.spots} spots`}
              </span>
            )}
          </div>

          {exp.weeklyBookings && (
            <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium mb-3">
              <Flame className="w-3.5 h-3.5" />
              {exp.weeklyBookings} people booked this week
            </div>
          )}

          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{exp.description}</p>

          {/* Highlights */}
          {exp.highlights && exp.highlights.length > 0 && (
            <ul className="space-y-1.5 mb-5">
              {exp.highlights.slice(0, 3).map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  {h}
                </li>
              ))}
            </ul>
          )}

          {/* Price + CTAs */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-2xl font-medium">
              {exp.price === 0 ? 'Free' : `$${(exp.price / 100).toFixed(0)}`}
              <span className="text-sm font-normal text-muted-foreground">{exp.price > 0 ? ' / person' : ''}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { onClose(); navigate(`/experience/${exp.id}`); }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/40 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Full details
              </button>
              <button
                onClick={handlePrimary}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  (exp.price === 0 && isSaved) || (exp.price > 0 && inCart)
                    ? 'bg-green-500 text-white'
                    : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                {exp.price === 0
                  ? isSaved
                    ? <><Check className="w-3.5 h-3.5" /> Saved</>
                    : <><Bookmark className="w-3.5 h-3.5" /> Save route</>
                  : inCart
                    ? <><Check className="w-3.5 h-3.5" /> In cart</>
                    : <><ShoppingCart className="w-3.5 h-3.5" /> Book</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
