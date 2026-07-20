import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Lock, Wand2, Loader2 } from 'lucide-react';
import { Footer } from './Footer';
import { EventCard } from './EventCard';
import { NotifyMeForm } from './NotifyMeForm';
import { Switch } from './ui/switch';
import { ItineraryResult } from './ItineraryResult';
import { useExperiences } from '../hooks/useExperiences';
import { useSiteContent } from '../hooks/useSiteContent';
import { useNeighbourhoods } from '../hooks/useNeighbourhoods';
import {
  PRICE_RANGES, SPOT_CATEGORIES, SPOT_CATEGORY_KEY, STOP_COUNT_BUCKETS, getEffectiveStopRange,
} from '../data/itineraryFilters';
import type {
  StopCountBucket, PriceRange, ItineraryGenerateRequest, GeneratedItinerary, ItineraryErrorCode,
} from '../data/itineraryFilters';
import type { SpotCategory, Product } from '../data/products';
import { useTranslation } from 'react-i18next';
import { PageSEO } from './PageSEO';
import { analytics } from '../lib/analytics';

type EventTimeBucket = 'today' | 'weekend' | 'month';
type GenState = 'idle' | 'loading' | 'success' | 'error';

const ERROR_KEY: Record<ItineraryErrorCode, string> = {
  INVALID_INPUT: 'itineraryBuilder.errorLlm',
  NOT_CONFIGURED: 'itineraryBuilder.errorNotConfigured',
  NO_CANDIDATES: 'itineraryBuilder.errorNoCandidates',
  LLM_ERROR: 'itineraryBuilder.errorLlm',
  METHOD_NOT_ALLOWED: 'itineraryBuilder.errorLlm',
};

function getEventTimeBucket(dateStr?: string): EventTimeBucket | 'future' | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const event = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.round((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null;
  if (diffDays === 0) return 'today';
  const dow = event.getDay();
  if (diffDays <= 7 && (dow === 0 || dow === 6)) return 'weekend';
  if (event.getFullYear() === today.getFullYear() && event.getMonth() === today.getMonth()) return 'month';
  return 'future';
}

function sortByDate(a: Product, b: Product): number {
  if (!a.eventDate && !b.eventDate) return 0;
  if (!a.eventDate) return 1;
  if (!b.eventDate) return -1;
  return a.eventDate.localeCompare(b.eventDate);
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'
      }`}
    >
      {children}
    </button>
  );
}

export function ItineraryScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { experiences } = useExperiences();
  const { content: siteContent } = useSiteContent();
  const { neighbourhoods: neighbourhoodOptions } = useNeighbourhoods();
  const [searchParams] = useSearchParams();
  const isNightsView = searchParams.get('category') === 'xploranights';
  const [eventTimeFilter, setEventTimeFilter] = useState<EventTimeBucket | null>(null);

  const [stopCount, setStopCount] = useState<StopCountBucket>('standard');
  const [categories, setCategories] = useState<SpotCategory[]>([]);
  const [restaurantHopping, setRestaurantHopping] = useState(false);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [neighbourhoods, setNeighbourhoods] = useState<string[]>([]);

  const [genState, setGenState] = useState<GenState>('idle');
  const [errorCode, setErrorCode] = useState<ItineraryErrorCode | null>(null);
  const [result, setResult] = useState<GeneratedItinerary | null>(null);
  const [genKey, setGenKey] = useState(0);

  function togglePriceRange(p: PriceRange) {
    setPriceRanges(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }
  function toggleCategory(c: SpotCategory) {
    setCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }
  function handleRestaurantHoppingChange(next: boolean) {
    setRestaurantHopping(next);
    if (next) setCategories([]);
  }
  function toggleNeighbourhood(n: string) {
    setNeighbourhoods(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  }

  async function handleGenerate() {
    setGenState('loading');
    setErrorCode(null);
    const body: ItineraryGenerateRequest = {
      stopCount,
      categories: restaurantHopping ? [] : categories,
      priceRanges,
      neighbourhoods,
      language: i18n.language === 'fr' ? 'fr' : 'en',
      restaurantHopping,
    };
    try {
      const res = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorCode((data?.code as ItineraryErrorCode) || 'LLM_ERROR');
        setGenState('error');
        return;
      }
      setResult(data as GeneratedItinerary);
      setGenKey(k => k + 1);
      setGenState('success');
      analytics.generateItinerary({ stopCount, categories, neighbourhoods });
    } catch {
      setErrorCode('LLM_ERROR');
      setGenState('error');
    }
  }

  function renderNightsSection() {
    const items = experiences.filter(e => e.category === 'xploranights');
    const sorted = [...items].sort(sortByDate);
    const filtered = eventTimeFilter
      ? sorted.filter(e => {
          const bucket = getEventTimeBucket(e.eventDate);
          if (eventTimeFilter === 'today') return bucket === 'today';
          if (eventTimeFilter === 'weekend') return bucket === 'weekend' || bucket === 'today';
          if (eventTimeFilter === 'month') return bucket !== null && bucket !== 'future';
          return true;
        })
      : sorted;

    const timeBuckets: { key: EventTimeBucket; label: string }[] = [
      { key: 'today',   label: t('events.today') },
      { key: 'weekend', label: t('events.thisWeekend') },
      { key: 'month',   label: t('events.thisMonth') },
    ];

    return (
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          {timeBuckets.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setEventTimeFilter(prev => prev === key ? null : key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                eventTimeFilter === key
                  ? 'bg-[#12343B] text-white border-[#12343B]'
                  : 'bg-card border-border text-foreground hover:bg-muted/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center space-y-3 max-w-md mx-auto">
            <p className="font-medium">{t('events.comingSoonTitle')}</p>
            <p className="text-sm text-muted-foreground">{t('events.comingSoonBody')}</p>
            <NotifyMeForm className="pt-1" source="itinerary" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(exp => <EventCard key={exp.id} exp={exp} />)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <PageSEO
        title={t('itinerary.seoTitle')}
        description={t('itinerary.seoDesc')}
        canonical="/itinerary"
      />
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-6 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl mb-1">{t('itinerary.title')}</h1>
          <p className="text-sm md:text-base opacity-90">{t('itinerary.subtitle')}</p>
        </div>
      </div>

      {isNightsView ? (
        renderNightsSection()
      ) : siteContent.itineraryPaywalled ? (
        <div className="max-w-3xl mx-auto px-6 md:px-8 pt-8 pb-16">
          <div className="rounded-3xl border border-border bg-muted/40 flex flex-col items-center justify-center text-center px-6 py-16 gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <h2 className="text-lg md:text-xl font-medium">{t('itinerary.paywallTitle')}</h2>
            <p className="text-sm text-muted-foreground max-w-sm">{t('itinerary.paywallSubtitle')}</p>
            <button
              onClick={() => navigate('/signup')}
              className="mt-1 px-5 py-2.5 rounded-xl bg-[#12343B] text-white text-sm font-medium hover:opacity-90 transition"
            >
              {t('itinerary.paywallCta')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-3xl mx-auto px-6 md:px-8 pt-6 pb-10 space-y-6">
            <div className="bg-muted/40 border border-border rounded-3xl p-5 md:p-6 space-y-5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Wand2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                {t('itineraryBuilder.subtitle')}
              </div>

              {/* Neighbourhood */}
              {neighbourhoodOptions.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{t('itinerary.neighbourhood')}</p>
                  <div className="flex flex-wrap gap-2">
                    {neighbourhoodOptions.map(n => (
                      <Chip
                        key={n.id}
                        active={neighbourhoods.includes(n.name)}
                        onClick={() => toggleNeighbourhood(n.name)}
                      >
                        {n.name}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{t('itinerary.price')}</p>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map(p => (
                    <Chip key={p} active={priceRanges.includes(p)} onClick={() => togglePriceRange(p)}>
                      {p}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Stop count */}
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{t('itineraryBuilder.stopCount')}</p>
                <div className="flex flex-wrap gap-2">
                  {STOP_COUNT_BUCKETS.map(b => {
                    const { minStops, maxStops } = getEffectiveStopRange(b, restaurantHopping);
                    return (
                      <Chip key={b.key} active={stopCount === b.key} onClick={() => setStopCount(b.key)}>
                        {minStops === maxStops
                          ? t('itineraryBuilder.stopCountSingle', { count: minStops })
                          : t('itineraryBuilder.stopCountRange', { min: minStops, max: maxStops })}
                      </Chip>
                    );
                  })}
                </div>
              </div>

              {/* Restaurant hopping */}
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{t('itineraryBuilder.restaurantHopping')}</p>
                    <p className="text-xs text-muted-foreground">{t('itineraryBuilder.restaurantHoppingDescription')}</p>
                  </div>
                  <Switch checked={restaurantHopping} onCheckedChange={handleRestaurantHoppingChange} />
                </div>
                {restaurantHopping && (
                  <p className="text-xs text-muted-foreground mt-2 bg-primary/5 rounded-xl px-3 py-2">
                    {t('itineraryBuilder.restaurantHoppingExplainer')}
                  </p>
                )}
              </div>

              {/* Categories */}
              {!restaurantHopping && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{t('itineraryBuilder.categories')}</p>
                  <div className="flex flex-wrap gap-2">
                    {SPOT_CATEGORIES.map(c => (
                      <Chip key={c} active={categories.includes(c)} onClick={() => toggleCategory(c)}>{t(`categories.${SPOT_CATEGORY_KEY[c]}`, c)}</Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={genState === 'loading'}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#12343B] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {genState === 'loading' ? (
                <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> {t('itineraryBuilder.generating')}</>
              ) : (
                <><Wand2 className="w-4 h-4" aria-hidden="true" /> {genState === 'success' ? t('itineraryBuilder.regenerate') : t('itineraryBuilder.generate')}</>
              )}
            </button>
            <p className="text-xs text-muted-foreground text-center -mt-3">{t('itineraryBuilder.generateDescription')}</p>

            {genState === 'error' && errorCode && (
              <p className="text-sm text-red-600 text-center">{t(ERROR_KEY[errorCode])}</p>
            )}
          </div>

          {genState === 'success' && result && (
            <ItineraryResult key={genKey} result={result} />
          )}
        </>
      )}

      <Footer />
    </div>
  );
}
