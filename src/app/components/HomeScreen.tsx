import { Link, useNavigate } from 'react-router';
import { ArrowRight, MapPin, Star, Users, LayoutDashboard, User, Compass, ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
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

function HowItWorksStrip() {
  return (
    <div className="border-t-4 border-primary bg-card">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary whitespace-nowrap hidden md:block">
            How it works
          </span>
          {[
            { n: 1, title: 'Pick your vibe', desc: 'Tell us your mood & neighbourhood' },
            { n: 2, title: 'Book in seconds', desc: 'Instant confirmation, free cancellation' },
            { n: 3, title: 'Show up & explore', desc: 'Your guide handles everything else' },
          ].map(({ n, title, desc }) => (
            <div key={n} className="flex items-start gap-3 flex-1">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {n}
              </div>
              <div>
                <div className="text-sm font-semibold">{title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
          <Link
            to="/how-it-works"
            className="text-sm text-primary font-semibold hover:underline whitespace-nowrap md:ml-auto"
          >
            See full details →
          </Link>
        </div>
      </div>
    </div>
  );
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { experiences } = useExperiences();
  const [authState, setAuthState] = useState<{
    loggedIn: boolean;
    name: string;
    accountType: string;
    isAdmin: boolean;
  }>({ loading: true, loggedIn: false, name: '', accountType: '', isAdmin: false });
  const [showFab, setShowFab] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('hiw_fab_dismissed')) return;
    const timer = setTimeout(() => setShowFab(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      const profile = await getProfile();
      setAuthState({
        loggedIn: true,
        name: profile?.name || '',
        accountType: (profile as any)?.account_type || '',
        isAdmin: !!(profile as any)?.is_admin,
      });
    });
  }, []);

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
                      {items.slice(0, 5).map(exp => (
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
                  <button className="mt-3 bg-white text-primary px-5 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors">Join — $10/month</button>
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
                  {items.slice(0, 5).map(exp => (
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
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-24 w-full">
          <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest opacity-60">Xplora — Québec City</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
                Discover local.<br />Live more.
              </h1>
              <p className="text-base md:text-lg opacity-80 max-w-xl mx-auto">
                Self-guided tours through Québec City's most vibrant neighbourhoods. No tourist traps — just real local experiences.
              </p>
            </div>

            {/* Destination photo tiles */}
            <div className="flex gap-2 w-full overflow-x-auto pb-1 -mx-6 px-6 [&::-webkit-scrollbar]:hidden md:justify-center">
              {[
                { label: 'Old Port', img: 'https://images.unsplash.com/photo-1758346972493-86586fc8e5d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300' },
                { label: 'Saint-Roch', img: 'https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300' },
                { label: 'Petit-Champlain', img: 'https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300' },
              ].map(({ label, img }) => (
                <button
                  key={label}
                  onClick={() => navigate(`/itinerary?neighbourhood=${encodeURIComponent(label)}`)}
                  className="flex-shrink-0 relative w-24 h-24 rounded-2xl overflow-hidden"
                >
                  <img src={img} alt={label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1.5 left-0 right-0 text-white text-[10px] font-medium text-center leading-tight px-1">{label}</span>
                </button>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto">
              <Link
                to="/itinerary"
                className="px-8 py-4 bg-[#12343B] text-white rounded-2xl text-base font-medium hover:bg-[#12343B]/90 transition-opacity flex items-center justify-center gap-2"
              >
                Start self-guided exploring
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>4.9/5 · 47 reviews</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium">
                <Users className="w-4 h-4" />
                <span>500+ explorers</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium">
                <MapPin className="w-4 h-4" />
                <span>50+ curated experiences</span>
              </div>
            </div>

            <Link to="/login" className="text-sm opacity-60 hover:opacity-80 transition-opacity underline underline-offset-2">
              Already a member? Sign in
            </Link>
          </div>
        </div>
      </div>

      <SearchHeader />

      {/* Neighbourhood vibe section */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-8 pb-0">
        <h2 className="text-xl md:text-2xl mb-4">Explore by neighbourhood</h2>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {[
            { label: 'Old Port', sub: 'History & waterfront', img: 'https://images.unsplash.com/photo-1758346972493-86586fc8e5d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600' },
            { label: 'Saint-Roch', sub: 'Art, coffee & cool', img: 'https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600' },
            { label: 'Petit-Champlain', sub: 'Cobblestones & charm', img: 'https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600' },
          ].map(({ label, sub, img }) => (
            <button
              key={label}
              onClick={() => navigate(`/itinerary?neighbourhood=${encodeURIComponent(label)}`)}
              className="relative rounded-2xl overflow-hidden aspect-[3/4] md:aspect-[4/5] group"
            >
              <img src={img} alt={label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-left">
                <p className="text-white font-semibold text-sm md:text-base leading-tight">{label}</p>
                <p className="text-white/70 text-xs md:text-sm mt-0.5 hidden md:block">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

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
                    {items.slice(0, 5).map(exp => (
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

      </div>

      <Footer />

      {showFab && !authState.loggedIn && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          <Link
            to="/how-it-works"
            className="flex items-center gap-2 bg-[#12343B] text-white px-5 py-3 rounded-full shadow-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
            New here? Learn how it works
          </Link>
          <button
            onClick={() => {
              setShowFab(false);
              sessionStorage.setItem('hiw_fab_dismissed', '1');
            }}
            aria-label="Dismiss"
            className="w-6 h-6 rounded-full bg-white text-foreground shadow border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
