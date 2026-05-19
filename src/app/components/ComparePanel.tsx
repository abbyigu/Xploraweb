import { X, Clock, MapPin, Users, Check, ShoppingCart, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import type { Product } from '../data/products';

function categoryLabel(cat: string) {
  return cat === 'xplorators' ? 'Solo' : cat === 'xploratorsplus' ? 'Solo+' : cat === 'xploratours' ? 'Tours' : 'Nights';
}

export function CompareBar({ selected, onToggle, onOpenPanel }: {
  selected: Product[];
  onToggle: (exp: Product) => void;
  onOpenPanel: () => void;
}) {
  if (selected.length === 0) return null;
  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {selected.map(exp => (
            <div key={exp.id} className="flex items-center gap-1.5 bg-muted/60 rounded-xl px-3 py-1.5">
              <span className="text-sm font-medium truncate max-w-[110px]">{exp.name}</span>
              <button onClick={() => onToggle(exp)} className="text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {selected.length < 3 && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Add {3 - selected.length} more to compare
            </span>
          )}
        </div>
        <button
          onClick={onOpenPanel}
          disabled={selected.length < 2}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
        >
          Compare {selected.length}
        </button>
      </div>
    </div>
  );
}

export function ComparePanel({ selected, onClose, onRemove }: {
  selected: Product[];
  onClose: () => void;
  onRemove: (exp: Product) => void;
}) {
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [savedRoutes, setSavedRoutes] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('xplora_saved_routes') || '[]'); } catch { return []; }
  });

  const saveRoute = (id: string) => {
    if (savedRoutes.includes(id)) return;
    const next = [...savedRoutes, id];
    setSavedRoutes(next);
    try { localStorage.setItem('xplora_saved_routes', JSON.stringify(next)); } catch { /* ignore */ }
  };

  const cols = selected.length;

  const Row = ({ label, render }: { label: string; render: (exp: Product) => React.ReactNode }) => (
    <div
      className="grid border-b border-border last:border-0"
      style={{ gridTemplateColumns: `100px repeat(${cols}, 1fr)` }}
    >
      <div className="py-3 pr-3 text-xs uppercase tracking-widest text-muted-foreground flex items-start pt-3.5">
        {label}
      </div>
      {selected.map(exp => (
        <div key={exp.id} className="py-3 px-2 text-sm border-l border-border">
          {render(exp)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-border flex items-center justify-between z-10 rounded-t-3xl">
          <h2 className="text-lg font-medium">Compare experiences</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted/40 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-x-auto">
          {/* Images + title row */}
          <div
            className="grid mb-5"
            style={{ gridTemplateColumns: `100px repeat(${cols}, 1fr)` }}
          >
            <div />
            {selected.map(exp => (
              <div key={exp.id} className="px-2">
                <div className="relative">
                  <img src={exp.image} alt={exp.name} className="w-full h-28 object-cover rounded-2xl" />
                  <button
                    onClick={() => onRemove(exp)}
                    className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {exp.category && (
                  <p className="text-xs uppercase tracking-widest text-secondary mt-2 px-0.5">
                    {categoryLabel(exp.category)}
                  </p>
                )}
                <p className="text-sm font-medium mt-0.5 leading-snug">{exp.name}</p>
              </div>
            ))}
          </div>

          <Row label="Price" render={exp => (
            <span className="font-semibold text-base">
              {exp.price === 0 ? 'Free' : `$${(exp.price / 100).toFixed(0)}`}
              {exp.price > 0 && <span className="text-xs font-normal text-muted-foreground"> / person</span>}
            </span>
          )} />
          <Row label="Duration" render={exp => (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />{exp.duration || '—'}
            </span>
          )} />
          <Row label="Difficulty" render={exp => exp.difficulty || '—'} />
          <Row label="Group size" render={exp => (
            exp.spots
              ? <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Max {exp.spots}</span>
              : <span className="text-muted-foreground">Self-guided</span>
          )} />
          <Row label="Area" render={exp => (
            exp.neighbourhood
              ? <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{exp.neighbourhood}</span>
              : <span className="text-muted-foreground">—</span>
          )} />
          <Row label="Languages" render={exp => exp.languages?.join(' · ') || '—'} />
          <Row label="Highlights" render={exp => (
            exp.highlights?.length
              ? <ul className="space-y-1">
                  {exp.highlights.slice(0, 3).map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />{h}
                    </li>
                  ))}
                </ul>
              : <span className="text-muted-foreground text-xs">—</span>
          )} />

          {/* CTA row */}
          <div
            className="grid mt-5 pt-4 border-t border-border"
            style={{ gridTemplateColumns: `100px repeat(${cols}, 1fr)` }}
          >
            <div />
            {selected.map(exp => {
              const inCart = items.some(i => i.id === exp.id);
              const saved = savedRoutes.includes(exp.id);
              return (
                <div key={exp.id} className="px-2 space-y-2">
                  <button
                    onClick={() => {
                      if (exp.price === 0) { saveRoute(exp.id); }
                      else if (!inCart) { addItem(exp); }
                    }}
                    className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                      (exp.price === 0 && saved) || (exp.price > 0 && inCart)
                        ? 'bg-green-500 text-white'
                        : 'bg-primary text-primary-foreground hover:opacity-90'
                    }`}
                  >
                    {exp.price === 0
                      ? saved
                        ? <><Check className="w-3.5 h-3.5" /> Saved</>
                        : <><Bookmark className="w-3.5 h-3.5" /> Save route</>
                      : inCart
                        ? <><Check className="w-3.5 h-3.5" /> In cart</>
                        : <><ShoppingCart className="w-3.5 h-3.5" /> Book</>
                    }
                  </button>
                  <button
                    onClick={() => { onClose(); navigate(`/experience/${exp.id}`); }}
                    className="w-full py-2 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted/40 transition-colors"
                  >
                    Full details →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
