import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Flame, Heart, Compass, MapPin, Mail, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSiteContent } from '../hooks/useSiteContent';
import { supabase, getProfile } from '../lib/supabase';
import { Footer } from './Footer';
import { SpotFinder } from './SpotFinder';
import { HeroSlideshow } from './HeroSlideshow';
import { WelcomeDiscoverPanel } from './WelcomeDiscoverPanel';

const AVATAR_SEEDS = ['Alex', 'Béa', 'Cam', 'Dana'];

export function HomeScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { content: siteContent } = useSiteContent();
  const [memberName, setMemberName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      getProfile().then((data) => setMemberName(data?.name || session.user.email || ''));
    });
  }, []);

  const FEATURE_TILES = [
    { label: t('home.tileHotspotsLabel'), desc: t('home.tileHotspotsDesc'), icon: Flame,   to: '/hotspots' },
    { label: t('home.tileLovedLabel'),    desc: t('home.tileLovedDesc'),    icon: Heart,   to: '/loved' },
    { label: t('home.tileWalkLabel'),     desc: t('home.tileWalkDesc'),     icon: Compass, to: '/itinerary' },
    { label: t('home.tileHoodsLabel'),    desc: t('home.tileHoodsDesc'),    icon: MapPin,  to: '/neighbourhoods?sort=new' },
  ];

  const VALUE_PILLARS = [
    {
      label: t('home.pillarSelfGuidedLabel'),
      desc: t('home.pillarSelfGuidedDesc'),
      icon: (
        <svg className="w-6 h-6 text-[#12343B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
        </svg>
      ),
    },
    {
      label: t('home.pillarLocalLabel'),
      desc: t('home.pillarLocalDesc'),
      icon: (
        <svg className="w-6 h-6 text-[#12343B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
        </svg>
      ),
    },
    {
      label: t('home.pillarCuratedLabel'),
      desc: t('home.pillarCuratedDesc'),
      icon: (
        <svg className="w-6 h-6 text-[#12343B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
        </svg>
      ),
    },
    {
      label: t('home.pillarCommunityLabel'),
      desc: t('home.pillarCommunityDesc'),
      icon: (
        <svg className="w-6 h-6 text-[#12343B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-0 font-sans">

      {/* Hero */}
      <section className="relative min-h-[520px] md:min-h-[600px] flex overflow-hidden">
        <HeroSlideshow />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/65" />
        <div className="relative w-full max-w-3xl mx-auto px-6 py-12 md:py-16 text-center flex flex-col items-center justify-center gap-8">
          {/* Wording — top */}
          <div className="flex flex-col items-center gap-5">
            <p className="text-xs uppercase tracking-widest text-white/80">{t('home.heroEyebrow')}</p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-tight text-white drop-shadow">
              {heroHeadline.split('\n').map((line, i, lines) => (
                <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
              ))}
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-xl drop-shadow-sm">
              {heroSubheadline}
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
            <Link
              to="/itinerary"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#12343B] text-white rounded-2xl text-base font-medium hover:opacity-90 transition w-full sm:w-auto justify-center"
            >
              {heroCtaLabel}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <Link to="/how-it-works" className="text-white/90 hover:text-white underline underline-offset-4 transition">
                {t('home.heroSeeHowItWorks')}
              </Link>
              <span className="text-white/40">·</span>
              <Link to="/business" className="text-white/90 hover:text-white underline underline-offset-4 transition">
                {t('home.heroForBusiness')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {memberName !== null && <WelcomeDiscoverPanel name={memberName} />}

      {/* Discover more */}
      <section className="pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h2 className="font-serif text-xl md:text-2xl text-gray-900 mb-4">{t('home.whereToStart')}</h2>
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
              <p className="text-sm font-semibold text-gray-900">{t('home.moreWaysTitle')}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('home.moreWaysDesc')}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#12343B] flex-shrink-0" />
          </Link>
        </div>
      </section>

      <SpotFinder />

      {/* Section break */}
      <div className="bg-[#c9e8e8]/30 border-t border-b border-[#b0d8d8]/40 py-10 px-6 text-center">
        <p className="font-serif text-2xl md:text-3xl text-[#12343B]">{t('home.sectionBreakQuote')}</p>
      </div>

      {/* About */}
      <section id="about" className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">{t('home.storyEyebrow')}</p>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              {t('home.storyBody')}
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden aspect-[16/9] max-w-3xl mx-auto mb-16">
            <img
              src="/hero/slate-roof-dormers.jpg"
              alt={t('home.storyImageAlt')}
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
            <Building2 className="w-3.5 h-3.5" /> {t('home.businessComingSoonEyebrow')}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">{t('home.businessComingSoonTitle')}</h2>
          <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto mb-8">
            {t('home.businessComingSoonBody')}
          </p>
          <a
            href="mailto:hello@goxplora.ca"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#7ecfcf] text-[#0d2328] rounded-2xl text-base font-semibold hover:opacity-90 transition"
          >
            <Mail className="w-5 h-5" />
            {t('home.businessComingSoonCta')}
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
