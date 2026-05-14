import { useNavigate } from 'react-router';
import { MapPin, Star, Users, Clock } from 'lucide-react';
import { XploraLogo } from './XploraLogo';
import { SearchHeader } from './SearchHeader';
import { Footer } from './Footer';
import { PageSEO } from './PageSEO';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useFeaturedExperiences } from '../hooks/useFeaturedExperiences';
import { DealCard } from './DealCard';
import { perks } from '../data/mockData';
import { useState, useEffect } from 'react';
import { supabase, getProfile } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'TouristInformationCenter',
  name: 'Xplora',
  description: 'Curated tours, local experiences, perks, and events in Québec City for visitors and residents.',
  url: 'https://goxplora.ca',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Québec City',
    addressRegion: 'QC',
    addressCountry: 'CA',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 46.8139,
    longitude: -71.2082,
  },
  areaServed: 'Québec City, Quebec, Canada',
  priceRange: '$$',
  knowsAbout: ['Québec City tours', 'Vieux-Québec experiences', 'self-guided tours Québec City', 'local activities Québec'],
};

const AVATAR_SEEDS = ['Alex', 'Béa', 'Cam', 'Dana'];

function useVibeKey(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'search.vibeMorning';
  if (hour >= 12 && hour < 18) return 'search.vibeAfternoon';
  return 'search.vibeEvening';
}

function ExplorerBanner() {
  const { t } = useTranslation();
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .then(({ count }) => { if (count !== null) setCount(count); });
  }, []);
  return (
    <div className="bg-[#12343B] text-white py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <div className="flex -space-x-2">
          {AVATAR_SEEDS.map((seed) => (
            <div
              key={seed}
              className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold border-2 border-[#12343B]"
            >
              {seed[0]}
            </div>
          ))}
        </div>
        <p className="text-sm text-white/90">
          Join{' '}
          <span className="font-semibold text-white">
            {count !== null ? `${count.toLocaleString()}+` : '...'}
          </span>{' '}
          {t('home.explorers')}
        </p>
      </div>
    </div>
  );
}

function VibeSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const vibeKey = useVibeKey();

  const vibes: [string, string][] = [
    ['cozy', 'vibes.cozy'],
    ['adventurous', 'vibes.adventurous'],
    ['foodie', 'vibes.foodie'],
    ['romantic', 'vibes.romantic'],
    ['hidden gem', 'vibes.hiddenGem'],
    ['lively', 'vibes.lively'],
    ['artsy', 'vibes.artsy'],
    ['outdoorsy', 'vibes.outdoorsy'],
    ['late night', 'vibes.lateNight'],
    ['family-friendly', 'vibes.familyFriendly'],
  ];

  const neighbourhoods = ['Vieux-Québec', 'Saint-Roch', 'Maguire', 'Saint-Jean-Baptiste', 'Montcalm', 'Limoilou'];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-12">
      <h2 className="text-xl md:text-2xl mb-6">{t(vibeKey)}</h2>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {vibes.map(([value, labelKey]) => (
            <button
              key={value}
              onClick={() => navigate(`/itinerary?vibe=${encodeURIComponent(value)}`)}
              className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {neighbourhoods.map(n => (
            <button
              key={n}
              onClick={() => navigate(`/itinerary?neighbourhood=${encodeURIComponent(n)}`)}
              className="px-3 py-1.5 bg-secondary/10 text-secondary rounded-full text-sm hover:bg-secondary/20 transition-colors"
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({ exp }: { exp: { id: string; name: string; description: string; price: number; image: string; duration?: string; badge?: string; neighbourhood?: string } }) {
  const navigate = useNavigate();
  return (
    <div
      className="flex items-center gap-4 bg-card rounded-2xl overflow-hidden border border-border hover:shadow-md transition-shadow cursor-pointer p-3"
      onClick={() => navigate(`/experience/${exp.id}`)}
    >
      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
        <ImageWithFallback src={exp.image} alt={exp.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium leading-snug truncate">{exp.name}</h3>
        {exp.duration && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" /> {exp.duration}
          </p>
        )}
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{exp.description}</p>
        <p className="text-sm font-semibold mt-1">
          {exp.price === 0 ? 'Free' : `$${(exp.price / 100).toFixed(0)}`}
        </p>
      </div>
      {exp.badge && (
        <span className="flex-shrink-0 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
          {exp.badge}
        </span>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: { rating: number; comment: string | null; reviewer_name: string | null; experience_name: string } }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3 w-[280px] md:w-auto flex-shrink-0 md:flex-shrink">
      <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className={`w-4 h-4 ${review.rating >= s ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} />
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-1">{review.experience_name}</span>
      </div>
      {review.comment && (
        <p className="text-sm text-muted-foreground leading-relaxed">"{review.comment}"</p>
      )}
      <p className="text-sm font-medium">{review.reviewer_name ?? 'Anonymous'}</p>
    </div>
  );
}

function MembershipBanner() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div
      className="bg-primary text-primary-foreground rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 cursor-pointer hover:opacity-95 transition-opacity"
      onClick={() => navigate('/membership')}
    >
      <div>
        <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Xplora</p>
        <h2 className="text-xl md:text-2xl mb-2">{t('home.becomeMember')}</h2>
        <ul className="space-y-1 text-sm opacity-90">
          <li>🎟️ {t('home.earlyAccess')}</li>
          <li>👫 {t('home.guestPass')}</li>
          <li>🍸 {t('home.fiveASept')}</li>
        </ul>
      </div>
      <div className="text-center md:text-right flex-shrink-0">
        <p className="text-3xl font-serif">$10</p>
        <p className="text-sm opacity-80">{t('home.perMonth')}</p>
        <button className="mt-3 bg-white text-primary px-5 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors">
          {t('home.learnMore')}
        </button>
      </div>
    </div>
  );
}

function SharedContent({ showMembership }: { showMembership: boolean }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { experiences, reviews, loading } = useFeaturedExperiences();

  return (
    <>
      <VibeSection />

      {/* Featured experiences */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pb-8 md:pb-10 space-y-10">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl">{t('home.featuredExperiences')}</h2>
            <button
              onClick={() => navigate('/itinerary')}
              className="text-sm text-primary font-medium hover:underline"
            >
              {t('home.exploreMore')}
            </button>
          </div>

          {loading ? (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-[260px] md:w-auto flex-shrink-0 md:flex-shrink h-64 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : experiences.length === 0 ? (
            <p className="text-muted-foreground text-sm">No featured experiences yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {experiences.map(exp => (
                <FeaturedCard key={exp.id} exp={exp} />
              ))}
            </div>
          )}
        </section>

        {reviews.length > 0 && (
          <section>
            <div className="flex flex-col gap-3">
              {reviews.map(r => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          </section>
        )}

        {/* Membership banner */}
        {showMembership && (
          <section>
            <MembershipBanner />
          </section>
        )}

        {/* Perks */}
        <section>
          <h2 className="text-xl md:text-2xl mb-4 md:mb-6">{t('home.perks')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            {perks.map((perk) => (
              <DealCard key={perk.id} {...perk} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [authState, setAuthState] = useState<{
    loading: boolean;
    loggedIn: boolean;
    name: string;
    accountType: string;
  }>({ loading: true, loggedIn: false, name: '', accountType: '' });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setAuthState({ loading: false, loggedIn: false, name: '', accountType: '' });
        return;
      }
      const profile = await getProfile();
      setAuthState({
        loading: false,
        loggedIn: true,
        name: profile?.name || '',
        accountType: (profile as any)?.account_type || '',
      });
    });
  }, []);

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Logged-in
  if (authState.loggedIn) {
    const isBusiness = authState.accountType === 'business';
    const firstName = authState.name.split(' ')[0] || 'there';

    return (
      <div className="min-h-screen pb-24 md:pb-8">
        {isBusiness ? (
          <div className="bg-gradient-to-b from-primary/40 to-primary/20 text-foreground">
            <div className="max-w-7xl mx-auto px-6 md:px-8 py-14 md:py-24">
              <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
                <XploraLogo variant="full" className="h-28 md:h-40" />
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest opacity-60">{t('home.welcomeBack')}</p>
                  <h1 className="text-3xl md:text-5xl leading-tight">{t('home.hey')} {firstName} 👋</h1>
                  <p className="text-base md:text-lg opacity-80">{t('home.businessDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <SearchHeader greeting={`Hey ${firstName} 👋`} />
        )}

        <ExplorerBanner />
        <SharedContent showMembership={!isBusiness} />
        <Footer />
      </div>
    );
  }

  // Logged-out
  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <PageSEO
        title="Québec City Tours & Experiences — Xplora"
        description="Discover the best of Québec City: guided tours, self-guided walks, local perks, and events in Vieux-Québec and beyond. Your insider guide to the city."
        canonical="/"
        schema={LOCAL_BUSINESS_SCHEMA}
      />

      <div className="bg-gradient-to-b from-primary/40 to-primary/20 text-foreground min-h-[calc(100vh-64px)] flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-2 md:py-4 w-full">
          <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
            <XploraLogo variant="full" className="h-36 md:h-52" />
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest opacity-60">Xplora — Québec City</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">{t('landing.headline')}</h1>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm opacity-70 pt-2">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Québec City</span>
              <span>·</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4" /> {t('home.launching')}</span>
              <span>·</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {t('home.audience')}</span>
            </div>
          </div>
        </div>
      </div>

      <ExplorerBanner />
      <SharedContent showMembership={true} />
      <Footer />
    </div>
  );
}
