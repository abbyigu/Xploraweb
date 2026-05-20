import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Compass, Users, Moon, Sparkles, SlidersHorizontal, X } from 'lucide-react';
import { SimpleFooter } from './SimpleFooter';
import { EXPERIENCE_CATEGORIES } from '../data/products';
import { ExperienceCard } from './ExperienceCard';
import { EventCard } from './EventCard';
import { useExperiences } from '../hooks/useExperiences';
import type { ExperienceCategory, Product } from '../data/products';
import { useTranslation } from 'react-i18next';
import { PageSEO } from './PageSEO';

type Filter = 'all' | ExperienceCategory;
type DurationBucket = 'self-guided' | 'under2h' | '2to3h' | 'halfday' | 'evening';
type PriceBucket = 'free' | 'under25' | '25to50' | '50plus';
type LangFilter = 'en' | 'fr';
type EventTimeBucket = 'today' | 'weekend' | 'month';

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

const VIBE_OPTIONS = ['cozy', 'adventurous', 'foodie', 'romantic', 'hidden gem', 'lively', 'artsy', 'outdoorsy', 'late night', 'family-friendly'];
const NEIGHBOURHOOD_OPTIONS = ['Vieux-Québec', 'Saint-Roch', 'Maguire', 'Saint-Jean-Baptiste', 'Montcalm', 'Limoilou'];

const VIBE_KEY: Record<string, string> = {
  'cozy': 'cozy', 'adventurous': 'adventurous', 'foodie': 'foodie', 'romantic': 'romantic',
  'hidden gem': 'hiddenGem', 'lively': 'lively', 'artsy': 'artsy', 'outdoorsy': 'outdoorsy',
  'late night': 'lateNight', 'family-friendly': 'familyFriendly',
};

function getDurationBucket(duration?: string): DurationBucket | null {
  if (!duration) return null;
  const d = duration.toLowerCase();
  if (d.includes('own pace') || d.includes('self') || d.includes('autonome')) return 'self-guided';
  if (d.includes('evening') || d.includes('soirée') || d.includes('night')) return 'evening';
  if (d.includes('half') || d.includes('demi')) return 'halfday';
  const hours = parseFloat(d);
  if (!isNaN(hours)) {
    if (hours <= 2) return 'under2h';
    if (hours <= 3) return '2to3h';
    return 'halfday';
  }
  return null;
}

function getPriceBucket(price: number): PriceBucket {
  if (price === 0) return 'free';
  if (price < 2500) return 'under25';
  if (price < 5000) return '25to50';
  return '50plus';
}

const CAT_TAGLINE_KEY: Record<string, string> = {
  xplorators: 'taglineXplorators',
  xploratorsplus: 'taglineXploratorsPlus',
  xploratours: 'taglineXploratours',
  xploranights: 'taglineXploranights',
};

const CAT_TYPE_KEY: Record<string, string> = {
  xplorators: 'typeSelfGuided',
  xploratorsplus: 'typePremium',
  xploratours: 'typeGuided',
  xploranights: 'typeNights',
};

const TIER_META: Record<ExperienceCategory, {
  icon: React.ElementType;
  accent: string;
  pill: string;
}> = {
  xplorators:    { icon: Compass,   accent: 'bg-xplora-icon-bg border-xplora-primary/30',           pill: 'bg-xplora-primary/15 text-xplora-ink'        },
  xploratours:   { icon: Users,     accent: 'bg-xplora-accent-teal/10 border-xplora-accent-teal/30', pill: 'bg-xplora-accent-teal/15 text-xplora-ink'    },
  xploranights:  { icon: Moon,      accent: 'bg-xplora-accent-green/10 border-xplora-accent-green/30', pill: 'bg-xplora-accent-green/15 text-xplora-ink' },
  xploratorsplus:{ icon: Sparkles,  accent: 'bg-xplora-icon-bg border-xplora-primary/30',           pill: 'bg-xplora-primary/15 text-xplora-ink'        },
};

export function ItineraryScreen() {
  const { t } = useTranslation();
  const { experiences } = useExperiences();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<Filter>(() => {
    const cat = searchParams.get('category');
    return (cat as ExperienceCategory) || 'all';
  });
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') ?? '');
  const [selectedVibes, setSelectedVibes] = useState<string[]>(() => {
    const v = searchParams.get('vibe');
    return v ? [v.toLowerCase()] : [];
  });
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState<string | null>(() => {
    return searchParams.get('neighbourhood');
  });
  const [selectedDuration, setSelectedDuration] = useState<DurationBucket | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<PriceBucket | null>(null);
  const [selectedLang, setSelectedLang] = useState<LangFilter | null>(null);
  const [familyOnly, setFamilyOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [eventTimeFilter, setEventTimeFilter] = useState<EventTimeBucket | null>(null);

  useEffect(() => {
    const cat = searchParams.get('category');
    const v = searchParams.get('vibe');
    const n = searchParams.get('neighbourhood');
    const q = searchParams.get('q');
    if (cat) setFilter(cat as ExperienceCategory);
    if (v) { setSelectedVibes([v.toLowerCase()]); setSelectedNeighbourhood(null); }
    if (n) { setSelectedNeighbourhood(n); setSelectedVibes([]); }
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  const activeCat = EXPERIENCE_CATEGORIES.find(c => c.id === filter);

  function toggleVibe(vibe: string) {
    setSelectedVibes(prev =>
      prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
    );
    setSelectedNeighbourhood(null);
    setSearchParams({});
  }

  function toggleNeighbourhood(n: string) {
    setSelectedNeighbourhood(prev => prev === n ? null : n);
    setSelectedVibes([]);
    setSearchParams({});
  }

  function clearAll() {
    setSelectedVibes([]);
    setSelectedNeighbourhood(null);
    setSelectedDuration(null);
    setSelectedPrice(null);
    setSelectedLang(null);
    setFamilyOnly(false);
    setSearchQuery('');
    setSearchParams({});
  }

  const hasFilter =
    searchQuery.trim().length > 0 ||
    selectedVibes.length > 0 ||
    selectedNeighbourhood !== null ||
    selectedDuration !== null ||
    selectedPrice !== null ||
    selectedLang !== null ||
    familyOnly;

  let filteredExperiences = experiences;
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filteredExperiences = filteredExperiences.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.neighbourhood?.toLowerCase().includes(q)
    );
  }
  if (selectedVibes.length > 0) {
    filteredExperiences = filteredExperiences.filter(e =>
      e.vibes?.some(v => selectedVibes.includes(v.toLowerCase()))
    );
  }
  if (selectedNeighbourhood) {
    filteredExperiences = filteredExperiences.filter(e =>
      e.neighbourhood?.toLowerCase() === selectedNeighbourhood.toLowerCase()
    );
  }
  if (selectedDuration) {
    filteredExperiences = filteredExperiences.filter(e =>
      getDurationBucket(e.duration) === selectedDuration
    );
  }
  if (selectedPrice) {
    filteredExperiences = filteredExperiences.filter(e =>
      getPriceBucket(e.price) === selectedPrice
    );
  }
  if (selectedLang) {
    filteredExperiences = filteredExperiences.filter(e => {
      const langs = e.languages?.map(l => l.toLowerCase()) ?? [];
      if (selectedLang === 'en') return langs.some(l => l.includes('english') || l.includes('anglais'));
      if (selectedLang === 'fr') return langs.some(l => l.includes('français') || l.includes('french'));
      return true;
    });
  }
  if (familyOnly) {
    filteredExperiences = filteredExperiences.filter(e =>
      e.vibes?.some(v => v.toLowerCase() === 'family-friendly')
    );
  }

  function renderNightsSection(items: Product[], isFullPage = false) {
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
      <div className="space-y-4">
        {isFullPage && (
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
        )}
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">{t('events.noUpcoming')}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(exp => <EventCard key={exp.id} exp={exp} />)}
          </div>
        )}
      </div>
    );
  }

  function renderContent() {
    if (hasFilter) {
      if (filteredExperiences.length === 0) {
        return <p className="text-muted-foreground text-sm py-8 text-center">{t('itinerary.noResults')}</p>;
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredExperiences.map(exp => <ExperienceCard key={exp.id} exp={exp} />)}
        </div>
      );
    }
    if (filter === 'xploranights') {
      const nightsItems = experiences.filter(e => e.category === 'xploranights');
      return renderNightsSection(nightsItems, true);
    }
    if (filter === 'all') {
      return (
        <>
          {EXPERIENCE_CATEGORIES.map(cat => {
            const items = experiences.filter(e => e.category === cat.id);
            if (!items.length) return null;
            const meta = TIER_META[cat.id as ExperienceCategory];
            const Icon = meta?.icon;
            if (!meta || !Icon) return null;
            const isNights = cat.id === 'xploranights';
            const visible = isNights ? [...items].sort(sortByDate).slice(0, 3) : items.slice(0, 3);
            const remaining = items.length - visible.length;
            return (
              <section key={cat.id}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.pill}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground leading-none mb-0.5">
                        {t(`itinerary.${CAT_TYPE_KEY[cat.id]}`)}
                      </p>
                      <h2 className="text-lg md:text-xl font-medium leading-tight">{cat.name}</h2>
                    </div>
                  </div>
                  {remaining > 0 && (
                    <button
                      onClick={() => setFilter(cat.id)}
                      className="text-sm text-primary font-medium hover:underline flex-shrink-0"
                    >
                      {t('itinerary.seeAll', { count: items.length })}
                    </button>
                  )}
                </div>
                {isNights ? (
                  <div className="flex flex-col gap-3">
                    {visible.map(exp => <EventCard key={exp.id} exp={exp} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {visible.map(exp => <ExperienceCard key={exp.id} exp={exp} />)}
                  </div>
                )}
              </section>
            );
          })}
        </>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {experiences.filter(e => e.category === filter).map(exp => (
          <ExperienceCard key={exp.id} exp={exp} />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <PageSEO
        title="Things to Do in Québec City — Xplora Experiences"
        description="Browse guided tours, self-guided walks, and local activities in Québec City. Filter by neighbourhood, vibe, duration, and more. Book your next Québec City experience."
        canonical="/itinerary"
      />
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-6 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl mb-1">{t('itinerary.title')}</h1>
          <p className="text-sm md:text-base opacity-90 mb-5">
            {selectedNeighbourhood
              ? `${t('itinerary.title')} — ${selectedNeighbourhood}`
              : selectedVibes.length > 0
              ? t('itinerary.vibe')
              : activeCat ? activeCat.tagline : t('itinerary.subtitle')}
          </p>

          {/* Scrollable category filter strip */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => setFilter('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                filter === 'all' ? 'bg-white text-foreground shadow-sm' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {t('itinerary.all')}
            </button>
            {EXPERIENCE_CATEGORIES.map(cat => {
              const meta = TIER_META[cat.id as ExperienceCategory];
              const Icon = meta?.icon;
              if (!meta || !Icon) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    filter === cat.id ? 'bg-white text-foreground shadow-sm' : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter toggle + panel */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-5">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              showFilters || hasFilter
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border hover:bg-muted/50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            {t('itinerary.filters')}
            {hasFilter && !showFilters && (
              <span className="bg-white/30 text-current text-xs px-1.5 py-0.5 rounded-full leading-none">
                {[selectedVibes.length, selectedNeighbourhood ? 1 : 0, selectedDuration ? 1 : 0, selectedPrice ? 1 : 0, selectedLang ? 1 : 0, familyOnly ? 1 : 0].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>
          {hasFilter && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" aria-hidden="true" />
              {t('itinerary.clearAll')}
            </button>
          )}
        </div>
      </div>

      {showFilters && (
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-3">
        <div className="bg-muted/40 border border-border rounded-3xl p-5 md:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-medium">{t('itinerary.filterPrompt')}</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t('itinerary.hideFilters')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Duration */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{t('itinerary.duration')}</p>
            <div className="flex flex-wrap gap-2">
              {([
                ['self-guided', t('itinerary.durationSelfGuided')],
                ['under2h',     t('itinerary.durationUnder2h')],
                ['2to3h',       t('itinerary.duration2to3h')],
                ['halfday',     t('itinerary.durationHalfDay')],
                ['evening',     t('itinerary.durationEvening')],
              ] as [DurationBucket, string][]).map(([bucket, label]) => (
                <button
                  key={bucket}
                  onClick={() => setSelectedDuration(prev => prev === bucket ? null : bucket)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedDuration === bucket
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{t('itinerary.price')}</p>
            <div className="flex flex-wrap gap-2">
              {([
                ['free',    t('itinerary.priceFree')],
                ['under25', t('itinerary.priceUnder25')],
                ['25to50',  t('itinerary.price25to50')],
                ['50plus',  t('itinerary.price50plus')],
              ] as [PriceBucket, string][]).map(([bucket, label]) => (
                <button
                  key={bucket}
                  onClick={() => setSelectedPrice(prev => prev === bucket ? null : bucket)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedPrice === bucket
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Language + Family-friendly */}
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{t('itinerary.language')}</p>
              <div className="flex gap-2">
                {([['en', t('itinerary.langEn')], ['fr', t('itinerary.langFr')]] as [LangFilter, string][]).map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => setSelectedLang(prev => prev === code ? null : code)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedLang === code
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-foreground hover:bg-muted/70'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{t('itinerary.familyFriendly')}</p>
              <button
                onClick={() => setFamilyOnly(prev => !prev)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  familyOnly
                    ? 'bg-xplora-accent-green text-white'
                    : 'bg-xplora-accent-green/10 text-xplora-accent-green hover:bg-xplora-accent-green/20'
                }`}
              >
                👨‍👩‍👧 {t('vibes.familyFriendly')}
              </button>
            </div>
          </div>

          {/* Vibe */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{t('itinerary.vibe')}</p>
            <div className="flex flex-wrap gap-2">
              {VIBE_OPTIONS.map(v => {
                const active = selectedVibes.includes(v);
                return (
                  <button
                    key={v}
                    onClick={() => toggleVibe(v)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      active ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {t(`vibes.${VIBE_KEY[v]}`, v)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Neighbourhood */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{t('itinerary.neighbourhood')}</p>
            <div className="flex flex-wrap gap-2">
              {NEIGHBOURHOOD_OPTIONS.map(n => {
                const active = selectedNeighbourhood === n;
                return (
                  <button
                    key={n}
                    onClick={() => toggleNeighbourhood(n)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      active ? 'bg-secondary text-secondary-foreground' : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      )}

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8 space-y-10 md:space-y-14">
        {renderContent()}
      </div>

      <SimpleFooter />
    </div>
  );
}
