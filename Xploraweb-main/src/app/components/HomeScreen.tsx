import { Link, useNavigate } from 'react-router';
import { ArrowRight, Flame, Heart, Compass, MapPin, Mail, Building2 } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { Footer } from './Footer';
import { SpotFinder } from './SpotFinder';

const AVATAR_SEEDS = ['Alex', 'Béa', 'Cam', 'Dana'];

const FEATURE_TILES = [
  { label: 'Hotspots',           desc: 'Buzzing spots nearby',      icon: Flame,   to: '/hotspots' },
  { label: 'Places We Love',     desc: 'Our favorite local finds',  icon: Heart,   to: '/loved' },
  { label: 'New Walk',           desc: 'Fresh self-guided routes',  icon: Compass, to: '/itinerary' },
  { label: 'New Neighbourhoods', desc: 'Just added to Xplora',      icon: MapPin,  to: '/neighbourhoods?sort=new' },
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
    desc: 'Every stop supports someone who calls this city home.',
    icon: (
      <svg className="w-6 h-6 text-[#12343B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
      </svg>
    ),
  },
];

export function HomeScreen() {
  const navigate = useNavigate();
  const { content: siteContent } = useSiteContent();

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
        <div className="relative w-full max-w-3xl mx-auto px-6 py-12 md:py-16 text-center flex flex-col items-center justify-center gap-8">
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

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
            <Link
              to="/itinerary"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#12343B] text-white rounded-2xl text-base font-medium hover:opacity-90 transition w-full sm:w-auto justify-center"
            >
              {siteContent.heroCtaLabel}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <Link to="/how-it-works" className="text-white/90 hover:text-white underline underline-offset-4 transition">
                See How It Works
              </Link>
              <span className="text-white/40">·</span>
              <Link to="/business" className="text-white/90 hover:text-white underline underline-offset-4 transition">
                For Business
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Discover more */}
      <section className="pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h2 className="font-serif text-xl md:text-2xl text-gray-900 mb-4">Where to start</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {FEATURE_TILES.map(({ label, desc, icon: Icon, to }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                className="text-left rounded-2xl border border-gray-200 bg-white p-4 md:p-5 hover:shadow-lg hover:border-[#12343B]/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#c9e8e8]/60 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#12343B]" />
                </div>
                <p className="font-semibold text-sm md:text-base text-gray-900">{label}</p>
                <p className="text-xs md:text-sm text-gray-400 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
          <Link
            to="/how-it-works"
            className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-[#b0d8d8]/60 bg-[#c9e8e8]/20 px-5 py-4 hover:bg-[#c9e8e8]/30 transition"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">More ways to explore</p>
              <p className="text-xs text-gray-500 mt-0.5">Premium Walks, Guided Tours, and Evening Events — coming soon</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#12343B] flex-shrink-0" />
          </Link>
        </div>
      </section>

      <SpotFinder />

      {/* Section break */}
      <div className="bg-[#c9e8e8]/30 border-t border-b border-[#b0d8d8]/40 py-10 px-6 text-center">
        <p className="font-serif text-2xl md:text-3xl text-[#12343B]">Born from a love of wandering</p>
      </div>

      {/* About */}
      <section id="about" className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Our story</p>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              GoXplora started with a simple belief: the best way to know a city is to walk it — slowly, curiously, without a bus schedule. We built the tools to make that possible for everyone.
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden aspect-[16/9] max-w-3xl mx-auto mb-16">
            <img
              src="/hero/slate-roof-dormers.jpg"
              alt="Slate roof with yellow-trimmed dormer windows in Québec City"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#12343B]/30 to-transparent" />
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
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-[#7ecfcf] mb-3 inline-flex items-center gap-2 justify-center">
            <Building2 className="w-3.5 h-3.5" /> Partner Program
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Our business partner program is coming soon</h2>
          <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto mb-8">
            We're putting the finishing touches on how Québec City businesses can partner with Xplora and reach engaged local explorers. Want to be first in line?
          </p>
          <a
            href="mailto:hello@goxplora.ca"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#7ecfcf] text-[#0d2328] rounded-2xl text-base font-semibold hover:opacity-90 transition"
          >
            <Mail className="w-5 h-5" />
            Contact us at hello@goxplora.ca
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
