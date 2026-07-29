import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSpots } from '../hooks/useSpots';
import { useNeighbourhoods } from '../hooks/useNeighbourhoods';

const MAX_RESULTS = 6;

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

interface Result {
  key: string;
  label: string;
  sublabel: string;
  to: string;
}

/**
 * Free-text search over already-loaded spots/neighbourhoods (no backend
 * endpoint) — clicking a result routes to the neighbourhood page since spots
 * don't have their own detail route.
 */
export function SiteSearch({ variant = 'header', className }: { variant?: 'header' | 'hero'; className?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spots } = useSpots();
  const { neighbourhoods } = useNeighbourhoods();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(variant === 'hero');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (variant === 'header') setExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [variant]);

  const slugByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const n of neighbourhoods) m.set(norm(n.name), n.slug || n.id);
    return m;
  }, [neighbourhoods]);

  const results = useMemo<Result[]>(() => {
    const q = norm(query.trim());
    if (!q) return [];

    const nbhdMatches: Result[] = neighbourhoods
      .filter(n => norm(n.name).includes(q) || norm(n.tagline || '').includes(q))
      .map(n => ({
        key: `n-${n.id}`,
        label: n.name,
        sublabel: n.tagline || t('search.neighbourhoodLabel', 'Neighbourhood'),
        to: `/neighbourhoods/${encodeURIComponent(n.slug || n.id)}`,
      }));

    const spotMatches: Result[] = spots
      .filter(s => norm(s.name).includes(q) || norm(s.neighbourhood || '').includes(q) || norm(s.category || '').includes(q))
      .map(s => {
        const slug = s.neighbourhood ? slugByName.get(norm(s.neighbourhood)) : undefined;
        return {
          key: `s-${s.id}`,
          label: s.name,
          sublabel: s.neighbourhood || '',
          to: slug ? `/neighbourhoods/${encodeURIComponent(slug)}` : '/neighbourhoods',
        };
      });

    return [...nbhdMatches, ...spotMatches].slice(0, MAX_RESULTS);
  }, [query, spots, neighbourhoods, slugByName, t]);

  function handleSelect(r: Result) {
    navigate(r.to);
    setQuery('');
    setOpen(false);
    if (variant === 'header') setExpanded(false);
  }

  function handleCollapse() {
    setQuery('');
    setOpen(false);
    if (variant === 'header') setExpanded(false);
  }

  const showInput = variant === 'hero' || expanded;

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      {!showInput ? (
        <button
          type="button"
          onClick={() => {
            setExpanded(true);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          aria-label={t('a11y.siteSearch', 'Search spots and neighbourhoods')}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
      ) : (
        <div
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all ${
            variant === 'hero'
              ? 'w-full bg-white border-transparent shadow-sm'
              : 'w-56 lg:w-64 bg-white border-gray-200'
          }`}
        >
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => { if (e.key === 'Escape') handleCollapse(); }}
            placeholder={t('search.placeholder', 'Search spots & neighbourhoods')}
            aria-label={t('a11y.siteSearch', 'Search spots and neighbourhoods')}
            className="flex-1 min-w-0 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
          />
          {(query || variant === 'header') && (
            <button
              type="button"
              onClick={() => {
                if (query) {
                  setQuery('');
                  inputRef.current?.focus();
                } else {
                  handleCollapse();
                }
              }}
              aria-label={t('common.clear', 'Clear')}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {open && query.trim() && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden z-50 max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">{t('search.noResults', 'No matches yet — try another search.')}</p>
          ) : (
            <ul>
              {results.map((r) => (
                <li key={r.key}>
                  <button
                    type="button"
                    onClick={() => handleSelect(r)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-[#12343B] flex-shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-900 truncate">{r.label}</span>
                      {r.sublabel && <span className="block text-xs text-gray-400 truncate">{r.sublabel}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
