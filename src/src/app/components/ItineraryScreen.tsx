import { useState } from 'react';
import { Compass, BookOpen, Users, Moon } from 'lucide-react';
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
  xplorators:    { icon: Compass,  accent: 'bg-emerald-50 border-emerald-200', pill: 'bg-emerald-100 text-emerald-800' },
  xplorastories: { icon: BookOpen, accent: 'bg-amber-50 border-amber-200',     pill: 'bg-amber-100 text-amber-800'     },
  xploratours:   { icon: Users,    accent: 'bg-sky-50 border-sky-200',          pill: 'bg-sky-100 text-sky-800'         },
  xploranights:  { icon: Moon,     accent: 'bg-violet-50 border-violet-200',    pill: 'bg-violet-100 text-violet-800'   },
};

export function ItineraryScreen() {
  const { experiences } = useExperiences();
  const [filter, setFilter] = useState<Filter>('all');

  const activeCat = EXPERIENCE_CATEGORIES.find(c => c.id === filter);

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-6 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl mb-1">Experiences</h1>
          <p className="text-sm md:text-base opacity-90 mb-5">
            {activeCat ? activeCat.tagline : 'Find your next adventure in Québec City'}
          </p>

          {/* Scrollable filter strip */}
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

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8 space-y-10 md:space-y-14">
        {filter === 'all' ? (
          EXPERIENCE_CATEGORIES.map(cat => {
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
