import { Link, useNavigate } from 'react-router';
import { ArrowRight, LayoutDashboard, User, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { XploraLogo } from './XploraLogo';
import { ExperienceCard } from './ExperienceCard';
import { EXPERIENCE_CATEGORIES } from '../data/products';
import { useExperiences } from '../hooks/useExperiences';
import { useNeighbourhoods } from '../hooks/useNeighbourhoods';
import { useSiteContent } from '../hooks/useSiteContent';
import { neighbourhoodImage } from '../lib/neighbourhoodImages';
import { Footer } from './Footer';
import { supabase, getProfile } from '../lib/supabase';

const AVATAR_SEEDS = ['Alex', 'Béa', 'Cam', 'Dana'];

const NBHD_DATA = [
  { label: 'Old Port',        sub: 'History & waterfront',  img: '/nbhd/old-port.jpeg' },
  { label: 'Saint-Roch',      sub: 'Art, coffee & cool',    img: '/nbhd/saint-roch.webp' },
  { label: 'Petit-Champlain', sub: 'Cobblestones & charm',  img: '/nbhd/champlain.jpeg' },
  { label: 'Montcalm',        sub: 'Parks & grand avenues', img: '/nbhd/montcalm.jpg' },
  { label: 'Limoilou',        sub: 'Murals & local eats',   img: '/nbhd/limoilou.jpeg' },
  { label: 'Maguire',         sub: 'Boutiques & terrasses', img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600' },
];

const VALUE_PILLARS = [
  {
    label: 'Self-guided',
    desc: 'Go at your pace, on your terms.',
    icon: (
      <svg className="w-6 h-6 text-[#12343B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
      </svg>
    ),
  },
  {
    label: 'Local first',
    desc: 'Routes built by people who live here.',
    icon: (
      <svg className="w-6 h-6 text-[#12343B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
      </svg>
    ),
  },
  {
    label: 'Curated',
    desc: 'Every stop is handpicked, not crowdsourced.',
    icon: (
      <svg className="w-6 h-6 text-[#12343B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
      </svg>
    ),
  },
  {
    label: 'Community',
    desc: 'Supporting local businesses along the way.',
    icon: (
      <svg className="w-6 h-6 text-[#12343B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
      </svg>
    ),
  },
];

function CardCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'right' ? 200 : -200, behavior: 'smooth' });
  };
  return (
    <div className="relative group">
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

export function HomeScreen() {
  const navigate = useNavigate();
  const { experiences } = useExperiences();
  const { neighbourhoods } = useNeighbourhoods();
  const { content: siteContent } = useSiteContent();

  // Prefer admin-managed neighbourhoods; fall back to the static list when the
  // table is empty or hasn't been created yet. `slug` powers the link to each
  // neighbourhood's page (preset tours + spots map).
  const nbhdList = neighbourhoods.length
    ? neighbourhoods.map(n => ({
        label: n.name,
        sub: n.tagline,
        img: neighbourhoodImage(n.name, n.coverImage),
        slug: n.slug || n.id,
      }))
    : NBHD_DATA.map(n => ({
        ...n,
        slug: n.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      }));
  const [authState, setAuthState] = useState<{
    loggedIn: boolean;
    name: string;
    accountType: string;
    isAdmin: boolean;
  }>({ loggedIn: false, name: '', accountType: '', isAdmin: false });
  // Stays false until the auth check resolves, so we never render the
  // logged-out landing before flipping to the logged-in view (the "flash").
  const [authReady, setAuthReady] = useState(false);
  const [showFab, setShowFab] = useState(false);

  // Neighbourhood carousel state
  const nbhdRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem('hiw_fab_dismissed')) return;
    const timer = setTimeout(() => setShowFab(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { setAuthReady(true); return; }
      const profile = await getProfile();
      setAuthState({
        loggedIn: true,
        name: profile?.name || '',
        accountType: (profile as any)?.account_type || '',
        isAdmin: !!(profile as any)?.is_admin,
      });
      setAuthReady(true);
    }).catch(() => setAuthReady(true));
  }, []);

  function nbhdScroll(dir: 1 | -1) {
    const track = nbhdRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('.nbhd-card');
    const step = card ? card.offsetWidth + 12 : 332;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  function handleNbhdScroll() {
    const track = nbhdRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('.nbhd-card');
    const step = card ? card.offsetWidth + 12 : 332;
    setActiveDot(Math.round(track.scrollLeft / step));
  }

  // Wait for the auth check before choosing a view, otherwise logged-in users
  // briefly see the logged-out landing before it swaps to their feed.
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Business dashboard (logged in with a business account) ──────────────────
  if (authState.loggedIn && authState.accountType === 'business' && !authState.isAdmin) {
    const firstName = authState.name.split(' ')[0] || 'there';

    return (
      <div className="min-h-screen pb-24 md:pb-8">
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
        </div>

        <Footer />
      </div>
    );
  }

  // ── Landing page (logged-out visitors and regular logged-in users) ──────────
  const soloCat = EXPERIENCE_CATEGORIES.find(c => c.id === 'xplorators')!;
  const soloItems = experiences.filter(e => e.category === 'xplorators');

  return (
    <div className="min-h-screen pb-24 md:pb-0 font-sans">

      {/* Hero */}
      <section className="relative min-h-[520px] md:min-h-[600px] flex">
        <img
          src={siteContent.heroImageUrl}
          alt="People exploring Petit-Champlain in Québec City"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/65" />
        <div className="relative w-full max-w-3xl mx-auto px-6 py-12 md:py-16 text-center flex flex-col items-center gap-8">
          {/* Wording — top */}
          <div className="flex flex-col items-center gap-5">
            <p className="text-xs uppercase tracking-widest text-white/80">Québec City</p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-tight text-white drop-shadow">
              {siteContent.heroHeadline.split('\n').map((line, i, lines) => (
                <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
              ))}
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-xl drop-shadow-sm">
              {siteContent.heroSubheadline}
            </p>
          </div>

          {/* CTA — bottom */}
          <Link
            to="/itinerary"
            className="mt-auto inline-flex items-center gap-2 px-8 py-4 bg-[#12343B] text-white rounded-2xl text-base font-medium hover:opacity-90 transition w-full sm:w-auto justify-center"
          >
            {siteContent.heroCtaLabel}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Explore by neighbourhood */}
      <section className="pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl md:text-2xl text-gray-900">Explore by neighbourhood</h2>
          <div className="flex gap-2">
            <button
              onClick={() => nbhdScroll(-1)}
              aria-label="Previous"
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => nbhdScroll(1)}
              aria-label="Next"
              className="w-9 h-9 rounded-full bg-[#12343B] text-white flex items-center justify-center hover:opacity-90 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={nbhdRef}
          onScroll={handleNbhdScroll}
          className="flex gap-3 overflow-x-auto pb-2 pl-6 md:pl-8 [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', paddingRight: 40 }}
        >
          {nbhdList.map(({ label, sub, img, slug }) => (
            <button
              key={label}
              onClick={() => navigate(`/neighbourhoods/${encodeURIComponent(slug)}`)}
              className="nbhd-card flex-shrink-0 relative rounded-2xl overflow-hidden group"
              style={{ scrollSnapAlign: 'start', width: 'min(72vw, 320px)', aspectRatio: '3/4' }}
            >
              <img src={img} alt={label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-left">
                <p className="text-white font-semibold text-sm md:text-base leading-tight">{label}</p>
                <p className="text-white/70 text-xs md:text-sm mt-0.5">{sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {nbhdList.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === activeDot ? 20 : 6,
                background: i === activeDot ? '#12343B' : '#D1D5DB',
              }}
            />
          ))}
        </div>
      </section>

      {/* Xperiences — Solo */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-10">
        <h2 className="font-serif text-xl md:text-2xl text-gray-900">Xperiences</h2>
        <div>
          <h3 className="text-lg font-medium mb-0.5">{soloCat.name}</h3>
          <p className="text-sm text-gray-400 mb-4">{soloCat.tagline}</p>
          {soloItems.length > 0 ? (
            <>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible [&::-webkit-scrollbar]:hidden">
                {soloItems.slice(0, 5).map(exp => (
                  <div key={exp.id} className="w-[160px] md:w-auto flex-shrink-0 md:flex-shrink h-full">
                    <ExperienceCard exp={exp} />
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate(`/itinerary?category=xplorators`)}
                className="mt-3 text-sm text-[#12343B] font-medium hover:underline flex items-center gap-1"
              >
                Explore more →
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-400">Coming soon — check back shortly.</p>
          )}
        </div>
      </section>

      {/* Section break */}
      <div className="bg-[#c9e8e8]/30 border-t border-b border-[#b0d8d8]/40 py-10 px-6 text-center">
        <p className="text-xs uppercase tracking-widest text-[#12343B]/50 mb-2">Who we are</p>
        <p className="font-serif text-2xl md:text-3xl text-[#12343B]">Discover the city like a local</p>
      </div>

      {/* About */}
      <section id="about" className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Our story</p>
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-5">Born from a love of wandering</h2>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              GoXplora started with a simple belief: the best way to know a city is to walk it — slowly, curiously, without a bus schedule. We built the tools to make that possible for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
                alt="Old Québec streets"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#12343B]/30 to-transparent" />
            </div>
            <div className="space-y-5">
              <h3 className="font-serif text-xl md:text-2xl text-gray-900">Québec City is our backyard</h3>
              <p className="text-gray-500 leading-relaxed">
                Discovering local has always been a family tradition. There's something special about hopping in the car with no real plan and ending up somewhere you've never been — Victoriaville, St-Jean-Port-Jolie, Portneuf, and so many more hidden corners of Québec.
              </p>
              <p className="text-gray-500 leading-relaxed">
                I especially love that feeling of stumbling onto a new place — a street, a café, a view — that wasn't on any list. Xplora was born from that same spirit: making it easy for everyone to wander, discover, and fall in love with local.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#c9e8e8]">
                  <img src="/team/founder.jpeg" alt="Ariel B." className="w-full h-full object-cover object-top" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Ariel B.</p>
                  <p className="text-xs text-gray-400">Founder, GoXplora</p>
                </div>
              </div>
            </div>
          </div>

          {/* Value pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-gray-100 pt-12">
            {VALUE_PILLARS.map(({ label, desc, icon }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#c9e8e8]/60 flex items-center justify-center mx-auto mb-3">
                  {icon}
                </div>
                <p className="text-sm font-semibold text-gray-800 mb-1">{label}</p>
                <p className="text-xs text-gray-400 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Business */}
      <section id="for-business" className="bg-[#12343B] text-white py-16 px-6 mt-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-[#7ecfcf] mb-3">For Business Owners</p>
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Get your business on the map</h2>
            <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto">
              Partner with GoXplora and get discovered by thousands of curious explorers walking through your neighbourhood every day.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: 'Local visibility',
                desc: 'Appear on curated neighbourhood routes right when explorers are nearby and ready to discover.',
                icon: (
                  <svg className="w-5 h-5 text-[#7ecfcf]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                ),
              },
              {
                title: 'Real foot traffic',
                desc: 'Track how many Xplorators walked past or visited your venue — with simple, clear analytics.',
                icon: (
                  <svg className="w-5 h-5 text-[#7ecfcf]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                ),
              },
              {
                title: 'Exclusive offers',
                desc: 'Share special deals or perks for GoXplora members — build loyalty and drive repeat visits.',
                icon: (
                  <svg className="w-5 h-5 text-[#7ecfcf]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                  </svg>
                ),
              },
            ].map(({ title, desc, icon }) => (
              <div key={title} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#7ecfcf]/20 flex items-center justify-center mb-4">
                  {icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link
              to="/business"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#7ecfcf] text-[#0d2328] rounded-2xl text-base font-semibold hover:opacity-90 transition"
            >
              List your business
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="mailto:hello@goxplora.ca" className="text-sm text-white/50 hover:text-white transition">
              Contact our partnerships team →
            </a>
          </div>

          <p className="text-center text-xs text-white/25 mt-10">
            Trusted by local restaurants, boutiques, cafés & attractions across Québec City
          </p>
        </div>
      </section>

      <Footer />

      {/* FAB */}
      {showFab && (
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
