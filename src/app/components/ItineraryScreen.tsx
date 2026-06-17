import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Compass, Users, Moon, Sparkles, X, Search, SlidersHorizontal, ChevronDown, Map as MapIcon, List as ListIcon } from 'lucide-react';
import { SimpleFooter } from './SimpleFooter';
import { EXPERIENCE_CATEGORIES } from '../data/products';
import { ExperienceCard } from './ExperienceCard';
import { ExperienceMap } from './ExperienceMap';
import { QuickViewModal } from './QuickViewModal';
import { CompareBar, ComparePanel } from './ComparePanel';
import { useExperiences } from '../hooks/useExperiences';
import type { ExperienceCategory } from '../data/products';
import type { Product } from '../data/products';

type Filter = 'all' | ExperienceCategory;
type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'duration';
type PriceFilter = 'any' | 'free' | 'under-25' | '25-50' | '50-plus';
type DurationFilter = 'any' | 'self-guided' | 'under-2h' | 'half-day' | 'full-day';
type DifficultyFilter = 'any' | 'easy' | 'moderate' | 'challenging';

const TIER_META: Record<ExperienceCategory, { icon: React.ElementType; pill: string }> = {
  xplorators:    { icon: Compass,  pill: 'bg-xplora-primary/15 text-xplora-ink'     },
  xploratorsplus:{ icon: Sparkles, pill: 'bg-purple-500/15 text-xplora-ink'          },
  xploratours:   { icon: Users,    pill: 'bg-xplora-accent-teal/15 text-xplora-ink' },
  xploranights:  { icon: Moon,     pill: 'bg-xplora-accent-green/15 text-xplora-ink'},
};

function matchesPrice(exp: Product, f: PriceFilter): boolean {
  if (f === 'any') return true;
  const cents = exp.price ?? 0;
  if (f === 'free') return cents === 0;
  if (f === 'under-25') return cents > 0 && cents < 2500;
  if (f === '25-50') return cents >= 2500 && cents < 5000;
  if (f === '50-plus') return cents >= 5000;
  return true;
}

function matchesDuration(exp: Product, f: DurationFilter): boolean {
  if (f === 'any') return true;
  const d = (exp.duration ?? '').toLowerCase();
  if (f === 'self-guided') return d.includes('own pace') || d.includes('self');
  if (f === 'under-2h') return /^[01](\.\d+)?\s*h|^[0-9]+\s*min|^1\.?\s*hour/.test(d) || d === '1 hour' || d === '1.5 hours';
  if (f === 'half-day') return d.includes('half') || d.includes('2') || d.includes('3');
  if (f === 'full-day') return d.includes('full') || d.includes('day') || d.includes('4') || d.includes('5') || d.includes('6');
  return true;
}

function matchesDifficulty(exp: Product, f: DifficultyFilter): boolean {
  if (f === 'any') return true;
  return (exp.difficulty ?? '').toLowerCase() === f;
}

function sortExperiences(list: Product[], sort: SortKey): Product[] {
  if (sort === 'price-asc') return [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  if (sort === 'price-desc') return [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  if (sort === 'duration') {
    const order = (d = '') => d.includes('own pace') ? 0 : d.includes('1') ? 1 : d.includes('2') ? 2 : d.includes('half') ? 3 : 4;
    return [...list].sort((a, b) => order(a.duration) - order(b.duration));
  }
  return list;
}

interface FilterState {
  price: PriceFilter;
  duration: DurationFilter;
  difficulty: DifficultyFilter;
  tags: string[];
  sort: SortKey;
}

const DEFAULT_FILTERS: FilterState = {
  price: 'any',
  duration: 'any',
  difficulty: 'any',
  tags: [],
  sort: 'recommended',
};

const ATTRIBUTE_TAGS = ['family-friendly', 'outdoorsy', 'indoor', 'romantic', 'solo-friendly'];

function FilterDrawer({
  open,
  filters,
  onChange,
  onClose,
  onClear,
}: {
  open: boolean;
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
  onClear: () => void;
}) {
  if (!open) return null;

  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  const toggleTag = (tag: string) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    set({ tags });
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{title}</p>
      {children}
    </div>
  );

  const Pills = <T extends string>({ options, value, onSelect }: {
    options: { value: T; label: string }[];
    value: T;
    onSelect: (v: T) => void;
  }) => (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onSelect(o.value)}
          className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
            value === o.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border hover:bg-muted/40'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Backdrop — mobile only */}
      <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={onClose} />

      {/* Drawer */}
      <div
        className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto md:static md:rounded-none md:shadow-none md:max-h-none md:border-b md:border-border"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 md:p-6 max-w-7xl mx-auto">
          {/* Handle / header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-1 bg-border rounded-full md:hidden" />
              <h2 className="text-base font-semibold hidden md:block">Filters & Sort</h2>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={onClear} className="text-sm text-muted-foreground hover:text-foreground">
                Clear all
              </button>
              <button onClick={onClose} className="p-1 hover:bg-muted/40 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <Section title="Sort by">
            <Pills
              options={[
                { value: 'recommended', label: 'Recommended' },
                { value: 'price-asc',   label: 'Price: Low → High' },
                { value: 'price-desc',  label: 'Price: High → Low' },
                { value: 'duration',    label: 'Shortest first' },
              ]}
              value={filters.sort}
              onSelect={v => set({ sort: v })}
            />
          </Section>

          <Section title="Price">
            <Pills
              options={[
                { value: 'any',       label: 'Any' },
                { value: 'free',      label: 'Free' },
                { value: 'under-25',  label: 'Under $25' },
                { value: '25-50',     label: '$25–$50' },
                { value: '50-plus',   label: '$50+' },
              ]}
              value={filters.price}
              onSelect={v => set({ price: v })}
            />
          </Section>

          <Section title="Duration">
            <Pills
              options={[
                { value: 'any',         label: 'Any' },
                { value: 'self-guided', label: 'Self-guided' },
                { value: 'under-2h',    label: 'Under 2 hrs' },
                { value: 'half-day',    label: 'Half day' },
                { value: 'full-day',    label: 'Full day' },
              ]}
              value={filters.duration}
              onSelect={v => set({ duration: v })}
            />
          </Section>

          <Section title="Difficulty">
            <Pills
              options={[
                { value: 'any',         label: 'Any' },
                { value: 'easy',        label: 'Easy' },
                { value: 'moderate',    label: 'Moderate' },
                { value: 'challenging', label: 'Challenging' },
              ]}
              value={filters.difficulty}
              onSelect={v => set({ difficulty: v })}
            />
          </Section>

          <Section title="Type">
            <div className="flex flex-wrap gap-2">
              {ATTRIBUTE_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm border capitalize transition-all ${
                    filters.tags.includes(tag)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-muted/40'
                  }`}
                >
                  {tag.replace('-', ' ')}
                </button>
              ))}
            </div>
          </Section>

          <button
            onClick={onClose}
            className="w-full py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-medium hover:opacity-90 transition-opacity mt-2"
          >
            Show results
          </button>
        </div>
      </div>
    </>
  );
}

export function ItineraryScreen() {
  const { experiences } = useExperiences();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<Filter>(() => (searchParams.get('category') as ExperienceCategory) || 'all');
  const [selectedVibes, setSelectedVibes] = useState<string[]>(() => {
    const v = searchParams.get('vibe');
    return v ? [v.toLowerCase()] : [];
  });
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState<string | null>(() => searchParams.get('neighbourhood'));
  const [textQuery, setTextQuery] = useState<string>(() => searchParams.get('q') ?? '');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [quickViewExp, setQuickViewExp] = useState<Product | null>(null);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [showComparePanel, setShowComparePanel] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'map'>(
    () => (searchParams.get('view') === 'map' ? 'map' : 'list'),
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const toggleCompare = (exp: Product) => {
    setCompareList(prev =>
      prev.some(e => e.id === exp.id)
        ? prev.filter(e => e.id !== exp.id)
        : prev.length < 3 ? [...prev, exp] : prev
    );
  };

  useEffect(() => {
    const cat = searchParams.get('category');
    const vibe = searchParams.get('vibe');
    const neighbourhood = searchParams.get('neighbourhood');
    const q = searchParams.get('q') ?? '';
    setTextQuery(q);
    if (cat && !vibe && !neighbourhood) { setFilter(cat as ExperienceCategory); setSelectedVibes([]); setSelectedNeighbourhood(null); }
    if (vibe) { setSelectedVibes([vibe.toLowerCase()]); setSelectedNeighbourhood(null); }
    if (neighbourhood) { setSelectedNeighbourhood(neighbourhood); setSelectedVibes([]); }
    if (!cat && !vibe && !neighbourhood && !q) { setFilter('all'); setSelectedVibes([]); setSelectedNeighbourhood(null); }
  }, [searchParams]);

  const activeFilterCount = [
    filters.price !== 'any',
    filters.duration !== 'any',
    filters.difficulty !== 'any',
    filters.tags.length > 0,
    filters.sort !== 'recommended',
    freeOnly,
  ].filter(Boolean).length;

  const clearAll = () => {
    setSelectedVibes([]);
    setSelectedNeighbourhood(null);
    setTextQuery('');
    setFilters(DEFAULT_FILTERS);
    setFreeOnly(false);
    navigate('/itinerary', { replace: true });
  };

  const isHeaderFiltered = selectedVibes.length > 0 || selectedNeighbourhood !== null || textQuery.length > 0;

  const filteredExperiences = (() => {
    let base = filter === 'all' ? experiences : experiences.filter(e => e.category === filter);
    if (selectedVibes.length > 0) base = base.filter(e => selectedVibes.some(v => e.vibes?.some(ev => ev.toLowerCase() === v)));
    if (selectedNeighbourhood) base = base.filter(e => e.neighbourhood?.toLowerCase() === selectedNeighbourhood.toLowerCase());
    if (textQuery) {
      const q = textQuery.toLowerCase();
      base = base.filter(e =>
        e.title?.toLowerCase().includes(q) || e.name?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.neighbourhood?.toLowerCase().includes(q) ||
        e.vibes?.some(v => v.toLowerCase().includes(q))
      );
    }
    base = base.filter(e => matchesPrice(e, filters.price));
    base = base.filter(e => matchesDuration(e, filters.duration));
    base = base.filter(e => matchesDifficulty(e, filters.difficulty));
    if (filters.tags.length > 0) base = base.filter(e => filters.tags.some(t => e.vibes?.map(v => v.toLowerCase()).includes(t)));
    if (freeOnly) base = base.filter(e => !e.price || e.price === 0);
    return sortExperiences(base, filters.sort);
  })();

  const activeCat = EXPERIENCE_CATEGORIES.find(c => c.id === filter);
  const hasAnyFilter = isHeaderFiltered || activeFilterCount > 0;

  // AllTrails-style: a single flat result list that drives both the cards and the map.
  const displayList: Product[] = hasAnyFilter
    ? filteredExperiences
    : filter === 'all'
      ? sortExperiences([...experiences], filters.sort)
      : sortExperiences(experiences.filter(e => e.category === filter), filters.sort);
  const filterLabel = textQuery || (selectedVibes.length > 0
    ? selectedVibes.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ')
    : selectedNeighbourhood);

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      {/* Teal header */}
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-6 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl mb-3">Experiences</h1>

          {/* Search + Filters row */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                value={textQuery}
                onChange={e => {
                  setTextQuery(e.target.value);
                  navigate(e.target.value.trim() ? `/itinerary?q=${encodeURIComponent(e.target.value.trim())}` : '/itinerary', { replace: true });
                }}
                placeholder="Search Québec City experiences…"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border-0 bg-white/90 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
              {textQuery && (
                <button onClick={clearAll} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
                activeFilterCount > 0 || showFilters
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white/90 text-foreground hover:bg-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-primary text-xs flex items-center justify-center font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Status / active filter chips */}
          <p className="text-sm opacity-90 mb-4">
            {hasAnyFilter
              ? filterLabel ? `Showing results for "${filterLabel}"` : `${filteredExperiences.length} experience${filteredExperiences.length !== 1 ? 's' : ''} found`
              : activeCat ? activeCat.tagline : 'Find your next adventure in Québec City'}
          </p>

          {isHeaderFiltered && (
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="text-xs opacity-70 uppercase tracking-widest">Filtered by</span>
              {selectedVibes.map(v => (
                <button key={v} onClick={clearAll}
                  className="flex items-center gap-1 px-3 py-1 bg-white text-primary rounded-full text-sm font-medium">
                  {v} <X className="w-3 h-3 ml-1" />
                </button>
              ))}
              {selectedNeighbourhood && (
                <button onClick={clearAll}
                  className="flex items-center gap-1 px-3 py-1 bg-white text-secondary rounded-full text-sm font-medium">
                  {selectedNeighbourhood} <X className="w-3 h-3 ml-1" />
                </button>
              )}
            </div>
          )}

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => { setFilter('all'); navigate('/itinerary', { replace: true }); }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                filter === 'all' ? 'bg-white text-foreground shadow-sm' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              All
            </button>
            {EXPERIENCE_CATEGORIES.map(cat => {
              const meta = TIER_META[cat.id as ExperienceCategory];
              const Icon = meta?.icon;
              if (!meta || !Icon) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setFilter(cat.id); setFreeOnly(false); navigate(`/itinerary?category=${cat.id}`, { replace: true }); }}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    filter === cat.id ? 'bg-white text-foreground shadow-sm' : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.name}
                  <span className="text-xs opacity-60 hidden md:inline">— {cat.tagline}</span>
                </button>
              );
            })}
            {/* Free quick filter */}
            <button
              onClick={() => { setFreeOnly(v => !v); setFilter('all'); navigate('/itinerary', { replace: true }); }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                freeOnly ? 'bg-green-500 text-white shadow-sm' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Free ✓
            </button>
          </div>
        </div>
      </div>

      {/* Filter drawer (desktop: inline below header; mobile: slide-up) */}
      <FilterDrawer
        open={showFilters}
        filters={filters}
        onChange={setFilters}
        onClose={() => setShowFilters(false)}
        onClear={() => { setFilters(DEFAULT_FILTERS); }}
      />

      {/* Results — AllTrails-style split: scrollable card list + sticky map */}
      <div className="md:flex md:items-start">
        {/* Left: result list */}
        <div className={`${mobileView === 'map' ? 'hidden' : 'block'} md:block w-full md:w-3/5 lg:w-[62%]`}>
          <div className="px-6 md:px-8 py-5 md:py-6">
            <p className="text-sm text-muted-foreground mb-4">
              {displayList.length} experience{displayList.length !== 1 ? 's' : ''}
              {activeCat && !hasAnyFilter ? ` · ${activeCat.name}` : ''} in Québec City
            </p>

            {displayList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                {displayList.map(exp => (
                  <div
                    key={exp.id}
                    onMouseEnter={() => setActiveId(exp.id)}
                    onMouseLeave={() => setActiveId(null)}
                  >
                    <ExperienceCard
                      exp={exp}
                      onQuickView={() => setQuickViewExp(exp)}
                      compareSelected={compareList.some(e => e.id === exp.id)}
                      onCompareToggle={() => toggleCompare(exp)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg mb-2">No experiences found</p>
                <p className="text-sm mb-1">Xplora is currently Québec City only.</p>
                <p className="text-sm mb-6 opacity-70">Try adjusting your filters or searching for a different term.</p>
                <button onClick={clearAll} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm">
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          <SimpleFooter />
        </div>

        {/* Right: sticky map (desktop) */}
        <div className="hidden md:block md:w-2/5 lg:w-[38%] md:sticky md:top-0 md:self-start md:h-screen">
          <ExperienceMap experiences={displayList} activeId={activeId} onMarkerClick={setActiveId} />
        </div>

        {/* Mobile: full-screen map when toggled */}
        {mobileView === 'map' && (
          <div className="md:hidden h-[calc(100vh-13rem)] w-full">
            <ExperienceMap experiences={displayList} activeId={activeId} onMarkerClick={setActiveId} />
          </div>
        )}
      </div>

      {/* Mobile map/list toggle */}
      <button
        onClick={() => setMobileView(v => (v === 'map' ? 'list' : 'map'))}
        className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#12343B] text-white text-sm font-medium shadow-lg"
      >
        {mobileView === 'map'
          ? <><ListIcon className="w-4 h-4" /> List</>
          : <><MapIcon className="w-4 h-4" /> Map</>}
      </button>

      {/* Quick-view modal */}
      {quickViewExp && (
        <QuickViewModal exp={quickViewExp} onClose={() => setQuickViewExp(null)} />
      )}

      {/* Compare bar + panel */}
      <CompareBar
        selected={compareList}
        onToggle={toggleCompare}
        onOpenPanel={() => setShowComparePanel(true)}
      />
      {showComparePanel && compareList.length >= 2 && (
        <ComparePanel
          selected={compareList}
          onClose={() => setShowComparePanel(false)}
          onRemove={toggleCompare}
        />
      )}
    </div>
  );
}
