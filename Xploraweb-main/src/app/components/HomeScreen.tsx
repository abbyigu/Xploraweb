import React from 'react';
import { useNavigate, Link } from 'react-router';
import { MapPin, Star, Users, Clock, ArrowRight, ShieldCheck, MapPinned, Languages } from 'lucide-react';
import { SearchHeader } from './SearchHeader';
import { XploraLogo } from './XploraLogo';
import { Footer } from './Footer';
import { PageSEO } from './PageSEO';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useFeaturedExperiences, FeaturedExperience } from '../hooks/useFeaturedExperiences';
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
        <a
          href="https://xplora.kit.com/e3bd366421"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-white underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          {t('home.explorers')}
        </a>
      </div>
    </div>
  );
}

const TRUST_PHOTOS = [
  {
    src: 'https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=crop&h=320&w=240',
    alt: 'Walking tour Québec City',
  },
  {
    src: 'https://images.unsplash.com/photo-1758346972493-86586fc8e5d0?crop=entropy&cs=tinysrgb&fit=crop&h=320&w=240',
    alt: 'Québec City experience',
  },
  {
    src: 'https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=crop&h=320&w=240',
    alt: 'Local guide Québec City',
  },
  {
    src: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?crop=entropy&cs=tinysrgb&fit=crop&h=320&w=240',
    alt: 'Vieux-Québec streets',
  },
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=crop&h=320&w=240',
    alt: 'Québec City landscape',
  },
];

function TrustSection() {
  const { t } = useTranslation();

  const reviews = [
    { quote: t('landing.t1quote'), author: t('landing.t1author'), role: t('landing.t1role') },
    { quote: t('landing.t2quote'), author: t('landing.t2author'), role: t('landing.t2role') },
    { quote: t('landing.t3quote'), author: t('landing.t3author'), role: t('landing.t3role') },
  ];

  const diffs: { icon: React.ReactNode; title: string; desc: string }[] = [
    { icon: <MapPinned className="w-5 h-5 text-primary" />, title: t('trust.diff1'), desc: t('trust.diff1Desc') },
    { icon: <Users className="w-5 h-5 text-primary" />, title: t('trust.diff2'), desc: t('trust.diff2Desc') },
    { icon: <Languages className="w-5 h-5 text-primary" />, title: t('trust.diff3'), desc: t('trust.diff3Desc') },
    { icon: <ShieldCheck className="w-5 h-5 text-primary" />, title: t('trust.diff4'), desc: t('trust.diff4Desc') },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-8 text-center">

      {/* ── Photo carousel ── */}
      <div className="relative">
        <p className="sr-only">{t('trust.photosLabel')}</p>
        <div className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 px-6 md:px-8 scrollbar-hide justify-start">
          {TRUST_PHOTOS.map((photo, i) => (
            <div
              key={i}
              className="flex-shrink-0 snap-start w-44 h-60 rounded-2xl overflow-hidden bg-muted"
            >
              <ImageWithFallback
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        {/* edge fades */}
        <div className="absolute left-0 top-0 bottom-1 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" aria-hidden="true" />
        <div className="absolute right-0 top-0 bottom-1 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" aria-hidden="true" />
      </div>

      {/* ── Aggregate rating ── */}
      <div className="px-6 md:px-8 flex items-center justify-center gap-2">
        <div className="flex gap-0.5" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          ))}
        </div>
        <span className="text-sm font-semibold">{t('trust.ratingScore')}</span>
        <span className="text-sm text-muted-foreground">· {t('trust.ratingLabel')}</span>
      </div>

      {/* ── Review quote strip ── */}
      <div className="space-y-4">
        <h2 className="text-base font-medium px-6 md:px-8">{t('trust.reviewsTitle')}</h2>
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 px-6 md:px-8 scrollbar-hide">
            {reviews.map((r, i) => (
              <div
                key={i}
                className="flex-shrink-0 snap-start w-72 bg-card border border-border rounded-2xl p-4 space-y-3 text-left"
              >
                <div className="flex gap-0.5" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{r.quote}"</p>
                <div>
                  <p className="text-sm font-medium">{r.author}</p>
                  <p className="text-xs text-muted-foreground">{r.role}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute left-0 top-0 bottom-1 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" aria-hidden="true" />
          <div className="absolute right-0 top-0 bottom-1 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" aria-hidden="true" />
        </div>
      </div>

      {/* ── Why Xplora? differentiators ── */}
      <div className="px-6 md:px-8 space-y-4">
        <h2 className="text-base font-medium">{t('trust.whyTitle')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {diffs.map((d, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-2 flex flex-col items-center">
              {d.icon}
              <p className="text-sm font-medium leading-snug">{d.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
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
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-12 text-center">
      <h2 className="text-xl md:text-2xl mb-6">{t(vibeKey)}</h2>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 justify-center">
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
        <div className="flex flex-wrap gap-2 justify-center">
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

function FeaturedExperienceCard({ exp }: { exp: FeaturedExperience }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div
      className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-md transition-shadow cursor-pointer flex flex-col"
      onClick={() => navigate(`/experience/${exp.id}`)}
    >
      <div className="relative h-44 overflow-hidden">
        <ImageWithFallback src={exp.image} alt={exp.name} className="w-full h-full object-cover" />
        {exp.neighbourhood && (
          <span className="absolute top-3 left-3 bg-white/90 text-foreground text-xs px-2.5 py-1 rounded-full backdrop-blur-sm font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3" />{exp.neighbourhood}
          </span>
        )}
        {exp.badge && (
          <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
            {exp.badge}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="text-sm font-medium leading-snug">{exp.name}</h3>
        {exp.duration && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3 flex-shrink-0" />{exp.duration}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="text-sm font-semibold">
            {exp.price === 0 ? t('common.free') : `${t('landing.from')} $${(exp.price / 100).toFixed(0)}`}
          </p>
          <button
            className="px-3 py-1.5 bg-[#12343B] text-white rounded-xl text-xs font-medium hover:bg-[#12343B]/90 transition-colors"
            onClick={(e) => { e.stopPropagation(); navigate(`/experience/${exp.id}`); }}
          >
            {t('experienceCard.book')}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeaturedSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { experiences, loading } = useFeaturedExperiences();

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-14">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl">{t('landing.featuredTitle')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('landing.featuredSub')}</p>
        </div>
        <button
          onClick={() => navigate('/itinerary')}
          className="hidden md:flex items-center gap-2 text-sm text-primary hover:underline"
        >
          {t('landing.seeAll')} <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : experiences.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {experiences.map(exp => (
              <FeaturedExperienceCard key={exp.id} exp={exp} />
            ))}
          </div>
          <div className="mt-6 flex justify-center md:hidden">
            <button
              onClick={() => navigate('/itinerary')}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              {t('home.exploreMore')}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground text-sm mb-5">{t('landing.subheadline')}</p>
          <button
            onClick={() => navigate('/itinerary')}
            className="px-6 py-3 bg-[#12343B] text-white rounded-2xl text-sm font-medium hover:bg-[#12343B]/90 transition-colors inline-flex items-center gap-2"
          >
            {t('landing.exploreExperiences')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
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

function SharedContent({ showMembership, showFeatured = true }: { showMembership: boolean; showFeatured?: boolean }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { experiences, reviews, loading } = useFeaturedExperiences();

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 md:px-8 pb-8 md:pb-10 space-y-10">
        {showFeatured && (
        <section>
          <div className="flex flex-col items-center gap-2 mb-6 text-center">
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
        )}

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
          <h2 className="text-xl md:text-2xl mb-4 md:mb-6 text-center">{t('home.perks')}</h2>
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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
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

    // Business: photo hero → vibe → shared content → footer
    if (isBusiness) {
      return (
        <div className="min-h-screen pb-24 md:pb-8">
          {/* Hero images */}
          <div className="bg-gradient-to-b from-primary/40 to-primary/20 text-foreground">
            <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-10 w-full">
              <div className="flex flex-col md:flex-row md:items-center md:gap-12">
                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3 flex-1">
                  <XploraLogo variant="full" className="h-28 md:h-36" />
                  <p className="text-xs uppercase tracking-widest opacity-60">{t('home.welcomeBack')}</p>
                  <h1 className="text-2xl md:text-4xl leading-tight">{t('home.hey')} {firstName} 👋</h1>
                </div>
                {/* Desktop photo collage */}
                <div className="hidden md:grid grid-cols-2 gap-2 flex-shrink-0 w-[400px] h-[320px] rounded-3xl overflow-hidden">
                  <img src="/hero/petit-champlain.jpg" alt="Rue du Petit-Champlain" className="col-span-1 row-span-2 w-full h-full object-cover" loading="eager" />
                  <img src="/hero/chateau-night.webp" alt="Château Frontenac at night" className="w-full h-full object-cover rounded-tr-3xl" loading="eager" />
                  <img src="/hero/chateau-dusk.jpg" alt="Château Frontenac at dusk" className="w-full h-full object-cover rounded-br-3xl" loading="eager" />
                </div>
              </div>
              {/* Mobile photo strip */}
              <div className="md:hidden flex gap-3 overflow-x-auto mt-5 pb-2 -mx-6 px-6 scrollbar-hide">
                {[
                  { src: '/hero/petit-champlain.jpg', alt: 'Rue du Petit-Champlain' },
                  { src: '/hero/chateau-night.jpg',   alt: 'Château Frontenac at night' },
                  { src: '/hero/chateau-dusk.jpg',    alt: 'Château Frontenac at dusk' },
                ].map((p) => (
                  <img key={p.alt} src={p.src} alt={p.alt} className="flex-shrink-0 w-40 h-28 rounded-2xl object-cover" loading="eager" />
                ))}
              </div>
            </div>
          </div>

          <VibeSection />
          <SharedContent showMembership={false} />
          <Footer />
        </div>
      );
    }

    // Regular user
    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <SearchHeader greeting={`Hey ${firstName} 👋`} />
        <ExplorerBanner />
        <TrustSection />
        <SharedContent showMembership={true} />
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

      <div className="bg-gradient-to-b from-primary/40 to-primary/20 text-foreground">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-10 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:gap-12">

            {/* Brand + CTA */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 flex-1">
              <XploraLogo variant="full" className="h-36 md:h-44" />
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest opacity-60">Xplora — Québec City</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl leading-tight">{t('landing.headline')}</h1>
                <p className="text-sm md:text-base opacity-75 max-w-sm mx-auto md:mx-0">{t('landing.heroSub')}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto md:w-full">
                <Link
                  to="/itinerary"
                  className="px-8 py-4 bg-[#12343B] text-white rounded-2xl text-base font-medium hover:bg-[#12343B]/90 transition-opacity flex items-center justify-center gap-2"
                >
                  {t('landing.exploreExperiences')}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm opacity-70 pt-2">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Québec City</span>
                <span>·</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {t('home.audience')}</span>
              </div>
            </div>

            {/* Photo collage — desktop only */}
            <div className="hidden md:grid grid-cols-2 gap-2 flex-shrink-0 w-[400px] h-[380px] rounded-3xl overflow-hidden">
              <img
                src="/hero/petit-champlain.jpg"
                alt="Rue du Petit-Champlain, Québec City"
                className="col-span-1 row-span-2 w-full h-full object-cover"
                loading="eager"
              />
              <img
                src="/hero/chateau-night.webp"
                alt="Château Frontenac at night"
                className="w-full h-full object-cover rounded-tr-3xl"
                loading="eager"
              />
              <img
                src="/hero/chateau-dusk.jpg"
                alt="Château Frontenac at dusk"
                className="w-full h-full object-cover rounded-br-3xl"
                loading="eager"
              />
            </div>
          </div>

          {/* Photo strip — mobile only */}
          <div className="md:hidden flex gap-3 overflow-x-auto mt-6 pb-2 -mx-6 px-6 scrollbar-hide">
            {[
              { src: '/hero/petit-champlain.jpg', alt: 'Rue du Petit-Champlain, Québec City' },
              { src: '/hero/chateau-night.jpg',   alt: 'Château Frontenac at night' },
              { src: '/hero/chateau-dusk.jpg',    alt: 'Château Frontenac at dusk' },
            ].map((p) => (
              <img
                key={p.alt}
                src={p.src}
                alt={p.alt}
                className="flex-shrink-0 w-40 h-28 rounded-2xl object-cover"
                loading="eager"
              />
            ))}
          </div>
        </div>
      </div>

      <ExplorerBanner />
      <VibeSection />
      <FeaturedSection />
      <TrustSection />
      <SharedContent showMembership={true} showFeatured={false} />
      <Footer />
    </div>
  );
}
