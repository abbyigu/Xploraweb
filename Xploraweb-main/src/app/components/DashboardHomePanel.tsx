import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Bell, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useExperiences } from '../hooks/useExperiences';
import { ExperienceCard } from './ExperienceCard';
import { EXPERIENCE_CATEGORIES } from '../data/products';
import type { DashboardProfile } from './DashboardScreen';

export function DashboardHomePanel({ profile }: { profile: DashboardProfile }) {
  const { t, i18n } = useTranslation();
  const { experiences, loading } = useExperiences();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const firstName = (profile.name || '').trim().split(' ')[0];

  const today = useMemo(
    () =>
      new Date()
        .toLocaleDateString(i18n.language === 'fr' ? 'fr-CA' : 'en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
        .toUpperCase(),
    [i18n.language],
  );

  const filters = useMemo(() => {
    const present = new Set(experiences.map((e) => e.category).filter(Boolean));
    return EXPERIENCE_CATEGORIES.filter((c) => present.has(c.id));
  }, [experiences]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return experiences.filter((e) => {
      if (activeFilter !== 'all' && e.category !== activeFilter) return false;
      if (q && !e.name.toLowerCase().includes(q) && !e.description.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [experiences, activeFilter, query]);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{today}</p>
          <h1 className="text-3xl leading-tight">
            {firstName
              ? t('account.homeGreeting', { name: firstName })
              : t('account.homeGreetingFallback')}
          </h1>
        </div>
        <Link
          to="/notifications"
          aria-label={t('account.notifications')}
          className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 hover:bg-muted/70 transition-colors"
        >
          <Bell className="w-5 h-5 text-foreground" />
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('account.homeSearchPlaceholder')}
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
      </div>

      {/* Filters */}
      {filters.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
              activeFilter === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-foreground hover:bg-muted'
            }`}
          >
            {t('account.homeFilterAll')}
          </button>
          {filters.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveFilter(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                activeFilter === c.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-foreground hover:bg-muted'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Experiences */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl">{t('account.homeSectionTitle')}</h2>
          <Link to="/itinerary" className="text-sm text-primary hover:underline whitespace-nowrap">
            {t('account.homeSeeAll')}
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">{t('account.loading')}</p>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
            <p className="text-sm text-muted-foreground">{t('account.homeNoResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filtered.slice(0, 6).map((exp) => (
              <ExperienceCard key={exp.id} exp={exp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
