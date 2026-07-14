import { useEffect, useMemo, useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSpots } from '../hooks/useSpots';
import { useNeighbourhoods } from '../hooks/useNeighbourhoods';
import { SPOT_CATEGORIES, SPOT_CATEGORY_KEY } from '../data/products';
import { VIBE_OPTIONS, VIBE_KEY } from '../data/itineraryFilters';
import { SpotCard } from './SpotCard';
import type { Spot } from '../data/products';

const PRICE_OPTIONS = ['Free', '$', '$$', '$$$', '$$$$'];

// Featured spots (brunch highlight, more xplora tips, more vibes tagged) are
// more curated, so they should come up more often than a bare-bones listing.
function weightOf(spot: Spot): number {
  return 1
    + (spot.isBrunch ? 3 : 0)
    + (spot.xploraTips?.length || 0) * 0.5
    + (spot.vibes?.length || 0) * 0.2;
}

function weightedPick(candidates: Spot[]): Spot {
  const total = candidates.reduce((sum, s) => sum + weightOf(s), 0);
  let r = Math.random() * total;
  for (const spot of candidates) {
    r -= weightOf(spot);
    if (r <= 0) return spot;
  }
  return candidates[candidates.length - 1];
}

const selectClass =
  'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12343B]/30';

export function SpotFinder() {
  const { t } = useTranslation();
  const { spots } = useSpots();
  const { neighbourhoods } = useNeighbourhoods();
  const [neighbourhood, setNeighbourhood] = useState('');
  const [category, setCategory] = useState('');
  const [vibe, setVibe] = useState('');
  const [price, setPrice] = useState('');
  const [result, setResult] = useState<Spot | null>(null);
  const [searched, setSearched] = useState(false);

  // Spots matching Where/What/$ only — used both to pick the final result (once
  // a vibe is also chosen) and to figure out which vibes are worth offering.
  const baseMatches = useMemo(() => spots.filter(s =>
    (!neighbourhood || s.neighbourhood === neighbourhood)
    && (!category || s.category === category)
    && (!price || s.priceRange === price),
  ), [spots, neighbourhood, category, price]);

  const availableVibes = useMemo(
    () => VIBE_OPTIONS.filter(v => baseMatches.some(s => s.vibes?.includes(v))),
    [baseMatches],
  );

  // Where/What/$ changed enough to drop the vibe currently selected — clear it
  // rather than silently filtering on a vibe that no longer applies here.
  useEffect(() => {
    if (vibe && !availableVibes.includes(vibe)) setVibe('');
  }, [vibe, availableVibes]);

  const matches = useMemo(() => baseMatches.filter(s =>
    !vibe || s.vibes?.includes(vibe),
  ), [baseMatches, vibe]);

  const handleFind = () => {
    setSearched(true);
    setResult(matches.length > 0 ? weightedPick(matches) : null);
  };

  return (
    <section className="py-10 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-serif text-xl md:text-2xl text-gray-900 mb-1 text-center">
          {t('spotFinder.title', 'Not sure what to do?')}
        </h2>
        <p className="text-sm text-muted-foreground mb-5 text-center">
          {t('spotFinder.subtitle', "Tell us where, what, and your budget — we'll pick a spot for you.")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <select
            value={neighbourhood}
            onChange={e => { setNeighbourhood(e.target.value); setSearched(false); }}
            className={selectClass}
            aria-label={t('spotFinder.where', 'Where')}
          >
            <option value="">{t('spotFinder.anywhere', 'Where — anywhere')}</option>
            {neighbourhoods.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
          </select>
          <select
            value={category}
            onChange={e => { setCategory(e.target.value); setSearched(false); }}
            className={selectClass}
            aria-label={t('spotFinder.what', 'What')}
          >
            <option value="">{t('spotFinder.anything', 'What — anything')}</option>
            {SPOT_CATEGORIES.map(c => <option key={c} value={c}>{t(`categories.${SPOT_CATEGORY_KEY[c]}`, c)}</option>)}
          </select>
          <select
            value={price}
            onChange={e => { setPrice(e.target.value); setSearched(false); }}
            className={selectClass}
            aria-label={t('spotFinder.budget', 'Budget')}
          >
            <option value="">{t('spotFinder.anyBudget', '$ — any budget')}</option>
            {PRICE_OPTIONS.map(p => <option key={p} value={p}>{p === 'Free' ? t('spotFinder.freeOption') : p}</option>)}
          </select>
        </div>

        {availableVibes.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-5">
            {availableVibes.map(v => {
              const active = vibe === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => { setVibe(active ? '' : v); setSearched(false); }}
                  className={`px-3 py-1.5 rounded-full text-sm capitalize transition-colors ${
                    active ? 'bg-[#12343B] text-white' : 'bg-[#12343B]/10 text-[#12343B] hover:bg-[#12343B]/20'
                  }`}
                >
                  {t(`vibes.${VIBE_KEY[v]}`, v)}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleFind}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#12343B] text-white text-sm font-medium hover:opacity-90 transition"
          >
            <Sparkles className="w-4 h-4" />
            {t('spotFinder.cta', 'Find me something')}
          </button>
        </div>

        {searched && !result && (
          <p className="text-sm text-muted-foreground text-center mt-6">
            {t('spotFinder.noMatch', 'Nothing matches yet — try loosening a filter.')}
          </p>
        )}

        {result && (
          <div className="mt-6 max-w-sm mx-auto">
            <SpotCard spot={result} />
            <button
              onClick={handleFind}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[#12343B] hover:bg-[#12343B]/5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t('spotFinder.again', 'Try another')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
