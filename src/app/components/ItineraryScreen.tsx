import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Compass, Users, Moon, Sparkles, X, Search } from 'lucide-react';
import { SimpleFooter } from './SimpleFooter';
import { EXPERIENCE_CATEGORIES } from '../data/products';
import { ExperienceCard } from './ExperienceCard';
import { useExperiences } from '../hooks/useExperiences';
import type { ExperienceCategory } from '../data/products';

type Filter = 'all' | ExperienceCategory;

const TIER_META: Record<ExperienceCategory, {
  icon: React.ElementType;
  accent: string;
  pill: string;
}> = {
  xplorators:    { icon: Compass,  accent: 'bg-xplora-icon-bg border-xplora-primary/30',              pill: 'bg-xplora-primary/15 text-xplora-ink'      },
  xploratorsplus:{ icon: Sparkles, accent: 'bg-purple-500/10 border-purple-500/30',                   pill: 'bg-purple-500/15 text-xplora-ink'           },
  xploratours:   { icon: Users,    accent: 'bg-xplora-accent-teal/10 border-xplora-accent-teal/30',   pill: 'bg-xplora-accent-teal/15 text-xplora-ink'  },
  xploranights:  { icon: Moon,     accent: 'bg-xplora-accent-green/10 border-xplora-accent-green/30', pill: 'bg-xplora-accent-green/15 text-xplora-ink' },
};

export function ItineraryScreen() {
  const { experiences } = useExperiences();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<Filter>(() => {
    const cat = searchParams.get('category');
    return (cat as ExperienceCategory) || 'all';
  });
  const [selectedVibes, setSelectedVibes] = useState<string[]>(() => {
    const vibe = searchParams.get('vibe');
    return vibe ? [vibe.toLowerCase()] : [];
  });
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState<string | null>(() => {
    return searchParams.get('neighbourhood');
  });
  const [textQuery, setTextQuery] = useState<string>(() => searchParams.get('q') ?? '');

  useEffect(() => {
    const cat = searchParams.get('category');
    const vibe = searchParams.get('vibe');
    const neighbourhood = searchParams.get('neighbourhood');
    const q = searchParams.get('q') ?? '';

    setTextQuery(q);

    if (cat && !vibe && !neighbourhood) {
      setFilter(cat as ExperienceCategory);
      setSelectedVibes([]);
      setSelectedNeighbourhood(null);
    }
    if (vibe) {
      setSelectedVibes([vibe.toLowerCase()]);
      setSelectedNeighbourhood(null);
    }
    if (neighbourhood) {
      setSelectedNeighbourhood(neighbourhood);
      setSelectedVibes([]);
    }
    if (!cat && !vibe && !neighbourhood && !q) {
      setFilter('all');
      setSelectedVibes([]);
      setSelectedNeighbourhood(null);
    }
  }, [searchParams]);

  const isFiltered = selectedVibes.length > 0 || selectedNeighbourhood !== null || textQuery.length > 0;

  const clearFilters = () => {
    setSelectedVibes([]);
    setSelectedNeighbourhood(null);
    setTextQuery('');
    navigate('/itinerary', { replace: true });
  };

  const filteredExperiences = (() => {
    let base = filter === 'all' ? experiences : experiences.filter(e => e.category === filter);
    if (selectedVibes.length > 0) {
      base = base.filter(e => selectedVibes.some(v => e.vibes?.some(ev => ev.toLowerCase() === v)));
    }
    if (selectedNeighbourhood) {
      base = base.filter(e => e.neighbourhood?.toLowerCase() === selectedNeighbourhood.toLowerCase());
    }
    if (textQuery) {
      const q = textQuery.toLowerCase();
      base = base.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.neighbourhood?.toLowerCase().includes(q) ||
        e.vibes?.some(v => v.toLowerCase().includes(q))
      );
    }
    return base;
  })();

  const activeCat = EXPERIENCE_CATEGORIES.find(c => c.id === filter);

  const filterLabel = textQuery || (selectedVibes.length > 0
    ? selectedVibes.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ')
    : selectedNeighbourhood);

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-6 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl mb-1">Experiences</h1>

          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={textQuery}
              onChange={e => {
                setTextQuery(e.target.value);
                navigate(e.target.value.trim() ? `/itinerary?q=${encodeURIComponent(e.target.value.trim())}` : '/itinerary', { replace: true });
              }}
              placeholder="Search experiences, neighbourhoods…"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border-0 bg-white/90 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
            />
            {textQuery && (
              <button onClick={clearFilters} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-sm md:text-base opacity-90 mb-5">
            {isFiltered
              ? `Showing results for "${filterLabel}"`
              : activeCat ? activeCat.tagline : 'Find your next adventure in Québec City'}
          </p>

          {isFiltered ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs opacity-70 uppercase tracking-widest">Filtered by</span>
              {selectedVibes.map(v => (
                <button key={v} onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-1 bg-white text-primary rounded-full text-sm font-medium">
                  {v} <X className="w-3 h-3 ml-1" />
                </button>
              ))}
              {selectedNeighbourhood && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-1 bg-white text-secondary rounded-full text-sm font-medium">
                  {selectedNeighbourhood} <X className="w-3 h-3 ml-1" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <button
                onClick={() => setFilter('all')}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  filter === 'all' ? 'bg-white text-foreground shadow-sm' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                All
              </button>
              {EXPERIENCE_CATEGORIES.map(cat => {
                const meta = TIER_META[cat.id];
                if (!meta) return null;
                const Icon = meta.icon;
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
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8 space-y-10 md:space-y-14">
        {isFiltered ? (
          filteredExperiences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredExperiences.map(exp => <ExperienceCard key={exp.id} exp={exp} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg mb-2">No experiences found</p>
              <p className="text-sm mb-6">Try a different vibe or neighbourhood</p>
              <button onClick={clearFilters}
                className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm">
                See all experiences
              </button>
            </div>
          )
        ) : filter === 'all' ? (
          EXPERIENCE_CATEGORIES.map(cat => {
            const items = experiences.filter(e => e.category === cat.id);
            if (!items.length) return null;
            const meta = TIER_META[cat.id];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <section key={cat.id}>
                <div className="flex items-start gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.pill}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-medium leading-tight">{cat.name}</h2>
                    <p className="text-sm text-muted-foreground">{cat.tagline}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {items.map(exp => <ExperienceCard key={exp.id} exp={exp} />)}
                </div>
              </section>
            );
          })
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {experiences.filter(e => e.category === filter).map(exp => (
              <ExperienceCard key={exp.id} exp={exp} />
            ))}
          </div>
        )}
      </div>

      <SimpleFooter />
    </div>
  );
}
