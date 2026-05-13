import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Compass, Users, Moon, Sparkles } from 'lucide-react';
import { SimpleFooter } from './SimpleFooter';
import { EXPERIENCE_CATEGORIES } from '../data/products';
import { ExperienceCard } from './ExperienceCard';
import { useExperiences } from '../hooks/useExperiences';
import type { ExperienceCategory } from '../data/products';
import { useTranslation } from 'react-i18next';
import { PageSEO } from './PageSEO';

type Filter = 'all' | ExperienceCategory;

const VIBE_OPTIONS = ['cozy', 'adventurous', 'foodie', 'romantic', 'hidden gem', 'lively', 'artsy', 'outdoorsy', 'late night', 'family-friendly'];
const NEIGHBOURHOOD_OPTIONS = ['Vieux-Québec', 'Saint-Roch', 'Maguire', 'Saint-Jean-Baptiste', 'Montcalm', 'Limoilou'];

const VIBE_KEY: Record<string, string> = {
  'cozy': 'cozy', 'adventurous': 'adventurous', 'foodie': 'foodie', 'romantic': 'romantic',
  'hidden gem': 'hiddenGem', 'lively': 'lively', 'artsy': 'artsy', 'outdoorsy': 'outdoorsy',
  'late night': 'lateNight', 'family-friendly': 'familyFriendly',
};

const CAT_TAGLINE_KEY: Record<string, string> = {
  xplorators: 'taglineXplorators',
  xploratorsplus: 'taglineXploratorsPlus',
  xploratours: 'taglineXploratours',
  xploranights: 'taglineXploranights',
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
  const [selectedVibes, setSelectedVibes] = useState<string[]>(() => {
    const v = searchParams.get('vibe');
    return v ? [v.toLowerCase()] : [];
  });
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState<string | null>(() => {
    return searchParams.get('neighbourhood');
  });

  useEffect(() => {
    const cat = searchParams.get('category');
    const v = searchParams.get('vibe');
    const n = searchParams.get('neighbourhood');
    if (cat) setFilter(cat as ExperienceCategory);
    if (v) { setSelectedVibes([v.toLowerCase()]); setSelectedNeighbourhood(null); }
    if (n) { setSelectedNeighbourhood(n); setSelectedVibes([]); }
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
    setSearchParams({});
  }

  const hasFilter = selectedVibes.length > 0 || selectedNeighbourhood !== null;

  let filteredExperiences = experiences;
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
    if (filter === 'all') {
      return (
        <>
          {EXPERIENCE_CATEGORIES.map(cat => {
            const items = experiences.filter(e => e.category === cat.id);
            if (!items.length) return null;
            const meta = TIER_META[cat.id];
            const Icon = meta.icon;
            return (
              <section key={cat.id}>
                <div className="flex items-start gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.pill}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-medium leading-tight">{cat.name}</h2>
                    <p className="text-sm text-muted-foreground">{t(`itinerary.${CAT_TAGLINE_KEY[cat.id]}`, cat.tagline)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {items.map(exp => <ExperienceCard key={exp.id} exp={exp} />)}
                </div>
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
              const meta = TIER_META[cat.id];
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
        </div>
      </div>

      {/* Vibe + neighbourhood filter section */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6">
        <div className="bg-muted/40 border border-border rounded-3xl p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg">{t('itinerary.filterPrompt')}</h2>
            {hasFilter && (
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                {t('itinerary.clearAll')}
              </button>
            )}
          </div>

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

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8 space-y-10 md:space-y-14">
        {renderContent()}
      </div>

      <SimpleFooter />
    </div>
  );
}
