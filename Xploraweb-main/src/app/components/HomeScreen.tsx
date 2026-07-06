import { Link, useNavigate } from 'react-router';
import { ArrowRight, Flame, Heart, Compass, MapPin, Handshake } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { Footer } from './Footer';
import { SpotFinder } from './SpotFinder';

const AVATAR_SEEDS = ['Alex', 'Béa', 'Cam', 'Dana'];

const FEATURE_TILES = [
  { label: 'Hotspots',           desc: 'Buzzing spots nearby',      icon: Flame,   to: '/hotspots' },
  { label: 'Places We Love',     desc: 'Our favorite local finds',  icon: Heart,   to: '/loved' },
  { label: 'New Tour',           desc: 'Fresh self-guided routes',  icon: Compass, to: '/itinerary' },
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
    desc: 'Supporting local businesses along the way.',
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
          <Link
            to="/itinerary"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#12343B] text-white rounded-2xl text-base font-medium hover:opacity-90 transition w-full sm:w-auto justify-center"
          >
            {siteContent.heroCtaLabel}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Discover more */}
      <section className="pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h2 className="font-serif text-xl md:text-2xl text-gray-900 mb-4">Discover more</h2>
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
        </div>
      </section>

      {/* Section break */}
      <div className="bg-[#c9e8e8]/30 border-t border-b border-[#b0d8d8]/40 py-10 px-6 text-center">
        <p className="font-serif text-2xl md:text-3xl text-[#12343B]">Born from a love of wandering</p>
      </div>

      <SpotFinder />

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
              src="/hero/umbrella-alley.jpg"
              alt="Colorful umbrellas hanging over a Québec City alley"
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
                detail: "Your venue gets featured on the specific self-guided routes that pass your door, with your name, photos, and a short blurb explorers see mid-walk — not buried in a generic directory.",
                icon: (
                  <svg className="w-5 h-5 text-[#7ecfcf]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                ),
              },
              {
                title: 'Real foot traffic',
                desc: 'Track how many Xplorators walked past or visited your venue — with simple, clear analytics.',
                detail: 'A dashboard shows visits by day and route, so you can see which tours actually send people through your door and double down on what works.',
                icon: (
                  <svg className="w-5 h-5 text-[#7ecfcf]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                ),
              },
              {
                title: 'Partnerships',
                desc: 'Team up with other local businesses on cross-promotions, bundles, and joint experiences.',
                detail: "Pair up with nearby shops and cafés on the same route to co-host events, cross-promote each other, or bundle a multi-stop deal explorers can redeem in one visit.",
                icon: <Handshake className="w-5 h-5 text-[#7ecfcf]" />,
              },
            ].map(({ title, desc, detail, icon }) => (
              <div key={title} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#7ecfcf]/20 flex items-center justify-center mb-4">
                  {icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-3">{desc}</p>
                <p className="text-xs text-white/35 leading-relaxed border-t border-white/10 pt-3">{detail}</p>
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
    </div>
  );
}
