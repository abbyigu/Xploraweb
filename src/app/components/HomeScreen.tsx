import { Link, useNavigate } from 'react-router';
import { ArrowRight, MapPin, Star, Users, LayoutDashboard, User, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { XploraLogo } from './XploraLogo';
import { SearchHeader } from './SearchHeader';
import { ExperienceCard } from './ExperienceCard';
import { DealCard } from './DealCard';
import { EXPERIENCE_CATEGORIES } from '../data/products';
import { useExperiences } from '../hooks/useExperiences';
import { perks } from '../data/mockData';
import { Footer } from './Footer';
import { useState, useEffect } from 'react';
import { supabase, getProfile } from '../lib/supabase';

const AVATAR_SEEDS = ['Alex', 'Béa', 'Cam', 'Dana'];

function CardCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'right' ? 200 : -200, behavior: 'smooth' });
  };
  return (
    <div className="relative group">
      {/* Desktop: side arrows on hover */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-border items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/40"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible scrollbar-hide"
      >
        {children}
      </div>

      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-border items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/40"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Mobile: always-visible prev/next buttons below cards */}
      <div className="flex md:hidden justify-end gap-2 mt-2 pr-1">
        <button
          onClick={() => scroll('left')}
          className="w-7 h-7 rounded-full bg-white shadow border border-border flex items-center justify-center hover:bg-muted/40 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="w-7 h-7 rounded-full bg-white shadow border border-border flex items-center justify-center hover:bg-muted/40 active:scale-95 transition-transform"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ExplorerBanner() {
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
          Be among the first to discover Québec City
        </p>
      </div>
    </div>
  );
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { experiences } = useExperiences();
  const [authState, setAuthState] = useState<{
    loading: boolean;
    loggedIn: boolean;
    name: string;
    accountType: string;
    isAdmin: boolean;
  }>({ loading: true, loggedIn: false, name: '', accountType: '', isAdmin: false });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setAuthState({ loading: false, loggedIn: false, name: '', accountType: '', isAdmin: false });
        return;
      }
      const profile = await getProfile();
      setAuthState({
        loading: false,
        loggedIn: true,
        name: profile?.name || '',
        accountType: (profile as any)?.account_type || '',
        isAdmin: !!(profile as any)?.is_admin,
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

  // Logged-in welcome screen
  if (authState.loggedIn) {
    const isBusiness = authState.accountType === 'business' && !authState.isAdmin;
    const firstName = authState.name.split(' ')[0] || 'there';

    return (
      <div className="min-h-screen pb-24 md:pb-8">

        {/* Hero / greeting */}
        {isBusiness ? (
          <div className="bg-gradient-to-b from-primary/40 to-primary/20 text-foreground">
            <div className="max-w-7xl mx-auto px-6 md:px-8 py-14 md:py-24">
              <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
                <XploraLogo variant="full" className="h-28 md:h-40" />
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest opacity-60">Welcome back</p>
                  <h1 className="text-3xl md:text-5xl leading-tight">Hey {firstName} 👋</h1>
                  <p className="text-base md:text-lg opacity-80">Manage your perks, track your listings, and grow your reach.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
                  <button
                    onClick={() => navigate('/business/dashboard')}
                    className="px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/account')}
                    className="px-8 py-4 bg-white/40 backdrop-blur-sm text-foreground rounded-2xl text-base hover:bg-white/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <User className="w-5 h-5" /> Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <SearchHeader greeting={`Hey ${firstName} 👋`} />
        )}

        {/* Shared content for all logged-in users */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8 space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-16">

          <section>
            <h2 className="text-xl md:text-2xl mb-6 md:mb-8">Xperiences</h2>
            <div className="space-y-10">
              {EXPERIENCE_CATEGORIES.filter(cat => cat.id !== 'xploranights').map(cat => {
                const items = experiences.filter(e => e.category === cat.id);
                if (!items.length) return null;
                return (
                  <div key={cat.id}>
                    <div className="mb-3">
                      <h3 className="text-lg font-medium">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">{cat.tagline}</p>
                    </div>
                    <CardCarousel>
                      {items.slice(0, 3).map(exp => (
                        <div key={exp.id} className="w-[160px] md:w-auto flex-shrink-0 md:flex-shrink h-full">
                          <ExperienceCard exp={exp} />
                        </div>
                      ))}
                    </CardCarousel>
                    <button
                      onClick={() => navigate(`/itinerary?category=${cat.id}`)}
                      className="mt-3 text-sm text-primary font-medium hover:underline flex items-center gap-1"
                    >
                      Explore more →
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Membership banner — regular users only */}
          {!isBusiness && (
            <section>
              <div
                className="bg-primary text-primary-foreground rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => navigate('/membership')}
              >
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Xplora</p>
                  <h2 className="text-xl md:text-2xl mb-2">Become a Member</h2>
                  <ul className="space-y-1 text-sm opacity-90">
                    <li>🎟️ 48h early access to all experiences</li>
                    <li>👫 1 free guest pass every month</li>
                    <li>🍸 Monthly members-only 5 à 7</li>
                  </ul>
                </div>
                <div className="text-center md:text-right flex-shrink-0">
                  <p className="text-3xl font-serif">$10</p>
                  <p className="text-sm opacity-80">/month</p>
                  <button className="mt-3 bg-white text-primary px-5 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors">Learn more</button>
                </div>
              </div>
            </section>
          )}

          {(() => {
            const nightCat = EXPERIENCE_CATEGORIES.find(c => c.id === 'xploranights')!;
            const items = experiences.filter(e => e.category === 'xploranights');
            return items.length ? (
              <section>
                <div className="mb-3">
                  <h3 className="text-lg font-medium">{nightCat.name}</h3>
                  <p className="text-sm text-muted-foreground">{nightCat.tagline}</p>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible">
                  {items.slice(0, 3).map(exp => (
                    <div key={exp.id} className="w-[160px] md:w-auto flex-shrink-0 md:flex-shrink h-full">
                      <ExperienceCard exp={exp} />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate(`/itinerary?category=xploranights`)}
                  className="mt-3 text-sm text-primary font-medium hover:underline flex items-center gap-1"
                >
                  Explore more →
                </button>
              </section>
            ) : null;
          })()}

          <section>
            <h2 className="text-xl md:text-2xl mb-4 md:mb-6">Perks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
              {perks.map((perk) => (
                <DealCard key={perk.id} {...perk} />
              ))}
            </div>
          </section>
        </div>

        <Footer />
      </div>
    );
  }

  // Logged-out: show public landing
  return (
    <div className="min-h-screen pb-24 md:pb-8">

      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/40 to-primary/20 text-foreground flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-14 md:py-24 w-full">
          <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
            <XploraLogo variant="full" className="h-36 md:h-52" />
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest opacity-60">Xplora — Québec City</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
                Your guide to the best<br />of Québec City
              </h1>
              <p className="text-base md:text-lg opacity-80 max-w-xl mx-auto">
                Curated experiences, insider perks, and local events — whether you're visiting for a weekend or calling Québec City home.
              </p>
            </div>
            {/* Social proof */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium">
                <Users className="w-4 h-4" />
                <span>500+ explorers</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium">
                <MapPin className="w-4 h-4" />
                <span>30+ bookings this week</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explorer count banner */}
      <ExplorerBanner />

      <SearchHeader />

      {/* Experiences feed */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8 space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-16">
        <section>
          <h2 className="text-xl md:text-2xl mb-6 md:mb-8">Xperiences</h2>
          <div className="space-y-10">
            {EXPERIENCE_CATEGORIES.filter(cat => cat.id !== 'xploranights').map(cat => {
              const items = experiences.filter(e => e.category === cat.id);
              if (!items.length) return null;
              return (
                <div key={cat.id}>
                  <div className="mb-3">
                    <h3 className="text-lg font-medium">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">{cat.tagline}</p>
                  </div>
                  <CardCarousel>
                    {items.slice(0, 3).map(exp => (
                      <div key={exp.id} className="w-[160px] md:w-auto flex-shrink-0 md:flex-shrink h-full">
                        <ExperienceCard exp={exp} />
                      </div>
                    ))}
                  </CardCarousel>
                  <button
                    onClick={() => navigate(`/itinerary?category=${cat.id}`)}
                    className="mt-3 text-sm text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    Explore more →
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Membership banner */}
        <section>
          <div
            className="bg-primary text-primary-foreground rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => navigate('/membership')}
          >
            <div>
              <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Xplora</p>
              <h2 className="text-xl md:text-2xl mb-2">Become a Member</h2>
              <ul className="space-y-1 text-sm opacity-90">
                <li>🎟️ 48h early access to all experiences</li>
                <li>👫 1 free guest pass every month</li>
                <li>🍸 Monthly members-only 5 à 7</li>
              </ul>
            </div>
            <div className="text-center md:text-right flex-shrink-0">
              <p className="text-3xl font-serif">$10</p>
              <p className="text-sm opacity-80">/month</p>
              <button className="mt-3 bg-white text-primary px-5 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors">
                Learn more
              </button>
            </div>
          </div>
        </section>

        {(() => {
          const nightCat = EXPERIENCE_CATEGORIES.find(c => c.id === 'xploranights')!;
          const items = experiences.filter(e => e.category === 'xploranights');
          return items.length ? (
            <section>
              <div className="mb-3">
                <h3 className="text-lg font-medium">{nightCat.name}</h3>
                <p className="text-sm text-muted-foreground">{nightCat.tagline}</p>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible">
                {items.slice(0, 3).map(exp => (
                  <div key={exp.id} className="w-[160px] md:w-auto flex-shrink-0 md:flex-shrink h-full">
                    <ExperienceCard exp={exp} />
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate(`/itinerary?category=xploranights`)}
                className="mt-3 text-sm text-primary font-medium hover:underline flex items-center gap-1"
              >
                Explore more →
              </button>
            </section>
          ) : null;
        })()}

        <section>
          <h2 className="text-xl md:text-2xl mb-4 md:mb-6">Perks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            {perks.map((perk) => (
              <DealCard key={perk.id} {...perk} />
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
