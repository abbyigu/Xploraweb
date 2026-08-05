import { type ReactNode, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, ArrowLeft, Flame, Heart, Compass, MapPin, Mail, Building2, Award, Star, Sparkles, Search, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSiteContent } from '../hooks/useSiteContent';
import { useReveal } from '../hooks/useReveal';
import { useNeighbourhoods, localizedTagline } from '../hooks/useNeighbourhoods';
import { useSpots } from '../hooks/useSpots';
import { SPOT_CATEGORY_KEY } from '../data/products';
import { neighbourhoodImage, neighbourhoodImageWebp, DEFAULT_NBHD_IMG } from '../lib/neighbourhoodImages';
import { Footer } from './Footer';
import { SpotFinder } from './SpotFinder';
import { HeroSlideshow } from './HeroSlideshow';
import { SiteSearch } from './SiteSearch';
import { NEIGHBOURHOODS_FALLBACK } from './NeighbourhoodsScreen';

function FeatureTile({
  label,
  desc,
  icon: Icon,
  image,
  webpImage,
  imagePosition,
  onClick,
  delay,
  className: extraClassName,
}: {
  label: string;
  desc: string;
  icon: LucideIcon;
  image: string;
  webpImage?: string;
  imagePosition?: string;
  onClick: () => void;
  delay: number;
  className?: string;
}) {
  const { ref, className, style } = useReveal<HTMLButtonElement>({ delay });
  return (
    <button
      ref={ref}
      style={style}
      onClick={onClick}
      className={`group flex flex-col text-left rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg hover:border-[#12343B]/30 hover:-translate-y-0.5 transition-all ${className} ${extraClassName ?? ''}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <picture>
          {webpImage && <source srcSet={webpImage} type="image/webp" />}
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ objectPosition: imagePosition ?? 'center' }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-transparent" />
        <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
          <Icon className="w-4 h-4 text-[#12343B]" />
        </div>
      </div>
      <div className="p-4 md:p-5">
        <p className="font-semibold text-sm md:text-base text-gray-900">{label}</p>
        <p className="text-xs md:text-sm text-gray-400 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}

function ValuePillar({ label, desc, icon, delay, className: extraClassName }: { label: string; desc: string; icon: ReactNode; delay: number; className?: string }) {
  const { ref, className, style } = useReveal<HTMLDivElement>({ delay });
  const iconStyle = style ? { animationDelay: `${delay + 150}ms` } : undefined;
  return (
    <div ref={ref} style={style} className={`group text-left ${className} ${extraClassName ?? ''}`}>
      <div
        style={iconStyle}
        className={`w-12 h-12 rounded-2xl bg-[#E6F6F8] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${
          className.includes('opacity-0') ? 'opacity-0' : 'animate-in zoom-in-75 fade-in duration-500 fill-mode-both'
        }`}
      >
        {icon}
      </div>
      <p className="text-[15px] md:text-base font-semibold text-[#12343B] mb-1">{label}</p>
      <p className="text-[13px] md:text-sm text-gray-500 leading-snug">{desc}</p>
    </div>
  );
}

function NeighbourhoodCard({ name, tagline, image, webpImage, count, onClick, delay }: {
  name: string;
  tagline: string;
  image: string;
  webpImage?: string | null;
  count: number | null;
  onClick: () => void;
  delay: number;
}) {
  const { t } = useTranslation();
  const { ref, className, style } = useReveal<HTMLButtonElement>({ delay });
  return (
    <button
      ref={ref}
      style={style}
      onClick={onClick}
      className={`group relative text-left h-[260px] rounded-2xl overflow-hidden ${className}`}
    >
      <picture>
        {webpImage && <source srcSet={webpImage} type="image/webp" />}
        <img
          src={image}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={e => { if (e.currentTarget.src !== DEFAULT_NBHD_IMG) e.currentTarget.src = DEFAULT_NBHD_IMG; }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-t from-[#12343B]/90 via-[#12343B]/10 to-transparent" />
      <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
        <MapPin className="w-4 h-4 text-[#12343B]" />
      </div>
      <div className="absolute bottom-3.5 left-3.5 right-3.5">
        <p className="text-[15px] font-semibold text-white mb-1 leading-tight">{name}</p>
        {tagline && <p className="text-xs text-white/80 leading-snug mb-1.5 line-clamp-2">{tagline}</p>}
        {count != null && <p className="text-[11px] text-white/65">{t('home.placesCount', { count })}</p>}
      </div>
    </button>
  );
}

function GemCard({ image, title, category, rating, reviews, area, onClick, delay }: {
  image?: string;
  title: string;
  category?: string;
  rating?: number;
  reviews?: number;
  area?: string;
  onClick?: () => void;
  delay: number;
}) {
  const { t } = useTranslation();
  const { ref, className, style } = useReveal<HTMLDivElement>({ delay });
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      ref={ref as any}
      style={style}
      onClick={onClick}
      className={`group text-left ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-gray-100">
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <MapPin className="w-8 h-8" />
          </div>
        )}
        {category && (
          <div className="absolute bottom-2.5 left-2.5 bg-[#12343B]/75 text-white text-[10.5px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
            {category}
          </div>
        )}
      </div>
      <p className="text-[14.5px] font-semibold text-[#12343B] mb-1 leading-tight">{title}</p>
      <div className="flex items-center gap-1 text-xs text-gray-500">
        {typeof rating === 'number' && (
          <>
            <Star className="w-3 h-3 fill-[#119FB3] text-[#119FB3]" />
            <span className="font-medium text-gray-700">{rating.toFixed(1)}</span>
            {typeof reviews === 'number' && <span>({reviews})</span>}
            {area && <span>· {area}</span>}
          </>
        )}
        {typeof rating !== 'number' && area && <span>{area}</span>}
      </div>
    </Wrapper>
  );
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { content: siteContent } = useSiteContent();
  const heroHeadline = siteContent.heroHeadline ?? t('home.heroHeadline');
  const heroSubheadline = siteContent.heroSubheadline ?? t('home.heroSubheadline');
  const heroCtaLabel = siteContent.heroCtaLabel ?? t('home.heroCtaLabel');

  const { neighbourhoods } = useNeighbourhoods();
  const { spots } = useSpots();

  const moreWaysReveal = useReveal<HTMLAnchorElement>();
  const businessReveal = useReveal<HTMLDivElement>();
  const howVisualReveal = useReveal<HTMLDivElement>({ delay: 150 });

  const FEATURE_TILES = [
    { label: t('home.tileHotspotsLabel'), desc: t('home.tileHotspotsDesc'), icon: Flame,   to: '/hotspots', image: '/hero/jazz-band-night.jpg', webpImage: '/hero/jazz-band-night-tile.webp' },
    { label: t('home.tileLovedLabel'),    desc: t('home.tileLovedDesc'),    icon: Heart,   to: '/loved', image: '/hero/balloon-art-alley.jpg', webpImage: '/hero/balloon-art-alley-tile.webp', imagePosition: 'center 15%' },
    { label: t('home.tileMichelinLabel'), desc: t('home.tileMichelinDesc'), icon: Award,   to: '/michelin', image: '/hero/michelin-plated-dish.jpg', webpImage: '/hero/michelin-plated-dish.webp' },
    { label: t('home.tileWalkLabel'),     desc: t('home.tileWalkDesc'),     icon: Compass, to: '/itinerary', image: '/hero/park-garden-walk.jpg', webpImage: '/hero/park-garden-walk-tile.webp' },
    { label: t('home.tileHoodsLabel'),    desc: t('home.tileHoodsDesc'),    icon: MapPin,  to: '/neighbourhoods?sort=new', image: '/nbhd/montcalm.jpg', webpImage: '/nbhd/montcalm.webp' },
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

  const HOW_STEPS = [
    { icon: Sparkles, title: t('home.howStep1Title'), desc: t('home.howStep1Desc') },
    { icon: Compass,  title: t('home.howStep2Title'), desc: t('home.howStep2Desc') },
    { icon: Heart,    title: t('home.howStep3Title'), desc: t('home.howStep3Desc') },
    { icon: ArrowRight, title: t('home.howStep4Title'), desc: t('home.howStep4Desc') },
  ];

  // Top 5 neighbourhoods (real admin data, falling back to the same static
  // list NeighbourhoodsScreen uses when the table is empty), with a live
  // spot count matched by free-text neighbourhood name (same matching
  // pattern as NeighbourhoodsOverviewMap's per-neighbourhood spot dots).
  const showcaseNeighbourhoods = useMemo(() => {
    const base = (neighbourhoods.length ? neighbourhoods : NEIGHBOURHOODS_FALLBACK).slice(0, 5);
    return base.map(n => ({
      ...n,
      spotCount: spots.filter(s => (s.neighbourhood || '').trim().toLowerCase() === n.name.trim().toLowerCase()).length,
    }));
  }, [neighbourhoods, spots]);

  // Curated highlights for "Hidden gems" — loved spots first, hotspots next,
  // so the section is never empty once the admin has flagged anything.
  const slugByName = useMemo(() => new Map(neighbourhoods.map(n => [n.name, n.slug])), [neighbourhoods]);
  const gemSpots = useMemo(() => {
    const loved = spots.filter(s => s.isLoved);
    const hot = spots.filter(s => s.isHotspot && !s.isLoved);
    return [...loved, ...hot].slice(0, 5);
  }, [spots]);

  return (
    <div className="min-h-screen pb-24 md:pb-0 font-sans">

      {/* Hero — boxed/framed image card, matching the imported mockup */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-5">
        <div className="relative h-[560px] sm:h-[580px] md:h-[600px] rounded-[20px] md:rounded-3xl overflow-hidden">
          <HeroSlideshow />
          <div className="absolute inset-0 bg-gradient-to-r from-[#12343B]/85 via-[#12343B]/45 to-[#12343B]/5 md:from-[#12343B]/60 md:via-[#12343B]/18 md:to-[#12343B]/0 pointer-events-none" />

          <div className="absolute inset-0 flex flex-col md:flex-row items-center md:justify-between gap-8 px-6 sm:px-9 md:px-11 py-10 md:py-0">
            {/* Wording + CTA — left */}
            <div className="flex-1 min-w-0 md:max-w-[480px] flex flex-col items-center md:items-start text-center md:text-left gap-5">
              <p className="inline-flex items-center gap-2 bg-white/90 text-[#12343B] px-3.5 py-[7px] rounded-full text-[12.5px] font-semibold tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-both">
                <Sparkles className="w-3 h-3 text-[#119FB3]" />
                {t('home.heroEyebrow')}
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl leading-[1.1] text-white drop-shadow animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
                {heroHeadline.split('\n').map((line, i, lines) => (
                  <span key={i} className="block">
                    {i === lines.length - 1 && lines.length > 1
                      ? <em className="not-italic font-medium italic text-[#7ecfcf]">{line}</em>
                      : line}
                  </span>
                ))}
              </h1>
              <p className="text-base leading-relaxed text-white/90 max-w-md drop-shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
                {heroSubheadline}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                <Link
                  to="/itinerary"
                  className="inline-flex items-center gap-2 px-[22px] py-[14px] bg-[#12343B] text-white rounded-full text-[14.5px] font-semibold hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all whitespace-nowrap"
                >
                  {heroCtaLabel}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/neighbourhoods"
                  className="inline-flex items-center px-[22px] py-[14px] bg-white/92 text-[#12343B] rounded-full text-[14.5px] font-semibold hover:bg-white hover:-translate-y-0.5 hover:shadow-lg transition-all whitespace-nowrap"
                >
                  {t('home.heroExploreMap')}
                </Link>
              </div>
            </div>

            {/* Floating AI itinerary preview card — right */}
            <div className="hidden md:block flex-shrink-0 w-[320px] bg-white/97 rounded-[20px] shadow-2xl shadow-[#12343B]/25 p-[26px] animate-in fade-in slide-in-from-right-6 duration-700 delay-300 fill-mode-both">
              <div className="inline-flex items-center gap-1.5 bg-[#E6F6F8] text-[#119FB3] px-3 py-[5px] rounded-full text-[11px] font-semibold mb-4">
                <Sparkles className="w-2.5 h-2.5" />
                {t('home.previewEyebrow')}
              </div>
              <p className="font-serif text-[21px] font-semibold text-[#12343B] mb-4">{t('home.previewTitle')}</p>
              <div className="flex items-center gap-2.5 bg-[#F7F8F5] rounded-xl px-3.5 py-[13px] mb-2.5">
                <MapPin className="w-[15px] h-[15px] text-gray-500 flex-shrink-0" />
                <span className="text-sm text-[#12343B]">{t('home.previewLocationValue')}</span>
              </div>
              <div className="flex items-center gap-2.5 bg-[#F7F8F5] rounded-xl px-3.5 py-[13px] mb-[18px]">
                <Compass className="w-[15px] h-[15px] text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-500">{t('home.previewVibeValue')}</span>
              </div>
              <Link
                to="/itinerary"
                className="flex items-center justify-center gap-2 bg-[#12343B] text-white py-[13px] rounded-xl text-[14.5px] font-semibold mb-3 hover:opacity-90 transition"
              >
                {t('home.previewCta')}
                <Sparkles className="w-3 h-3" />
              </Link>
              <p className="text-center text-xs text-gray-500">{t('home.previewFootnote')}</p>
            </div>
          </div>
        </div>

        {/* Utility row — nav shortcuts + search, tucked below the framed hero */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 pt-4 pb-2">
          <div className="flex items-center gap-3 text-sm">
            <Link to="/how-it-works" className="text-[#12343B]/80 hover:text-[#12343B] underline underline-offset-4 transition">
              {t('home.heroSeeHowItWorks')}
            </Link>
            <span className="text-[#12343B]/30">·</span>
            <Link to="/business" className="text-[#12343B]/80 hover:text-[#12343B] underline underline-offset-4 transition">
              {t('home.heroForBusiness')}
            </Link>
          </div>
          <SiteSearch variant="hero" className="w-full max-w-sm" />
        </div>
      </section>

      {/* Feature strip */}
      <section className="pt-12 md:pt-16 pb-4">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1 -mx-6 px-6 md:grid md:grid-cols-4 md:gap-10 md:overflow-visible md:mx-0 md:px-0 md:pb-0">
            {VALUE_PILLARS.map(({ label, desc, icon }, i) => (
              <ValuePillar key={label} label={label} desc={desc} icon={icon} delay={i * 75} className="w-[46%] flex-shrink-0 snap-start md:w-auto md:flex-shrink md:snap-none" />
            ))}
          </div>
        </div>
      </section>

      {/* Discover more */}
      <section className="pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h2 className="font-serif text-xl md:text-2xl text-gray-900 mb-4">{t('home.whereToStart')}</h2>
          <div className="relative">
            <div className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory pb-1 -mx-6 px-6 md:mx-0 md:px-0">
              {FEATURE_TILES.map(({ label, desc, icon, to, image, webpImage, imagePosition }, i) => (
                <FeatureTile key={label} label={label} desc={desc} icon={icon} image={image} webpImage={webpImage} imagePosition={imagePosition} onClick={() => navigate(to)} delay={i * 75} className="w-[42%] md:w-[23%] flex-shrink-0 snap-start" />
              ))}
            </div>
            <div className="pointer-events-none absolute top-0 right-0 bottom-1 w-10 md:w-16 bg-gradient-to-l from-background to-transparent" />
          </div>
          <Link
            ref={moreWaysReveal.ref}
            style={moreWaysReveal.style}
            to="/how-it-works"
            className={`mt-3 flex items-center justify-between gap-4 rounded-2xl border border-[#b0d8d8]/60 bg-[#c9e8e8]/20 px-5 py-4 hover:bg-[#c9e8e8]/30 hover:-translate-y-0.5 transition-all ${moreWaysReveal.className}`}
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">{t('home.moreWaysTitle')}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('home.moreWaysDesc')}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#12343B] flex-shrink-0" />
          </Link>
        </div>
      </section>

      {/* Discover by neighbourhood */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pt-14 md:pt-16 pb-4">
        <div className="flex items-baseline justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-semibold text-[#119FB3] uppercase tracking-wide mb-2">{t('home.neighbourhoodsEyebrow')}</p>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#12343B]">{t('home.neighbourhoodsTitle')}</h2>
          </div>
          <Link to="/neighbourhoods" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[#12343B] hover:gap-2 transition-all flex-shrink-0">
            {t('home.neighbourhoodsCta')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {showcaseNeighbourhoods.map((n, i) => (
            <NeighbourhoodCard
              key={n.id}
              name={n.name}
              tagline={localizedTagline(n, i18n.language)}
              image={neighbourhoodImage(n.name, n.coverImage)}
              webpImage={neighbourhoodImageWebp(n.name, n.coverImage)}
              count={n.spotCount > 0 ? n.spotCount : null}
              onClick={() => navigate(`/neighbourhoods/${encodeURIComponent(n.slug || n.id)}`)}
              delay={i * 60}
            />
          ))}
        </div>
      </section>

      {/* Hidden gems */}
      {gemSpots.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-8 pt-14 md:pt-16 pb-4">
          <div className="flex items-baseline justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-semibold text-[#119FB3] uppercase tracking-wide mb-2">{t('home.gemsEyebrow')}</p>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#12343B]">{t('home.gemsTitle')}</h2>
            </div>
            <Link to="/loved" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[#12343B] hover:gap-2 transition-all flex-shrink-0">
              {t('home.gemsCta')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {gemSpots.map((spot, i) => {
              const slug = spot.neighbourhood ? slugByName.get(spot.neighbourhood) : undefined;
              return (
                <GemCard
                  key={spot.id}
                  image={spot.image}
                  title={spot.name}
                  category={spot.category ? t(`categories.${SPOT_CATEGORY_KEY[spot.category]}`, spot.category) : undefined}
                  rating={spot.googleRating}
                  reviews={spot.googleReviewCount}
                  area={spot.neighbourhood}
                  onClick={slug ? () => navigate(`/neighbourhoods/${encodeURIComponent(slug)}`) : undefined}
                  delay={i * 60}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Spot finder — mobile only; desktop matches the Claude Design mockup without it */}
      <div className="md:hidden pt-8">
        <SpotFinder />
      </div>

      {/* How Goxplora works */}
      <section className="mt-8 bg-[#ECEEE8] px-6 py-16 md:py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-14 md:gap-16 items-center">
          <div>
            <p className="text-xs font-semibold text-[#119FB3] uppercase tracking-wide mb-2.5">{t('home.howEyebrow')}</p>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#12343B] mb-9">{t('home.howTitle')}</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4 sm:gap-x-4 lg:flex lg:items-start lg:gap-x-0">
              {HOW_STEPS.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="flex items-start lg:flex-1 w-full">
                  <div className="lg:pr-4">
                    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center mb-3.5">
                      <Icon className="w-5 h-5 text-[#12343B]" />
                    </div>
                    <p className="text-[13.5px] font-semibold text-[#12343B] mb-1 max-w-[130px]">{title}</p>
                    <p className="text-xs leading-relaxed text-gray-500 max-w-[160px]">{desc}</p>
                  </div>
                  {i < HOW_STEPS.length - 1 && (
                    <div
                      className="hidden lg:block flex-1 h-px mt-[22px] mx-1"
                      style={{ backgroundImage: 'repeating-linear-gradient(90deg, #B9C4C0 0 6px, transparent 6px 12px)' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Phone mockup */}
          <div
            ref={howVisualReveal.ref}
            style={howVisualReveal.style}
            className={`relative w-[260px] h-[520px] mx-auto bg-[#12343B] rounded-[40px] p-3.5 shadow-2xl shadow-[#12343B]/25 ${howVisualReveal.className}`}
          >
            <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-[#ECEEE8]">
              <svg viewBox="0 0 260 480" className="absolute inset-0 w-full h-full">
                <rect width="260" height="480" fill="#ECEEE8" />
                <path d="M-10 360C55 335 95 400 160 372C215 348 245 380 280 362" stroke="#DCE3D9" strokeWidth="32" fill="none" />
                <path d="M-10 130C65 158 112 102 168 130C215 154 242 112 280 136" stroke="#DFEDEC" strokeWidth="40" fill="none" />
              </svg>
              <div className="absolute top-4 left-4 right-4 bg-white/95 rounded-xl px-3 py-2.5 flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-[11px] text-gray-500 truncate">{t('home.howSearchPlaceholder')}</span>
              </div>
              {[{ top: '30%', left: '28%' }, { top: '47%', left: '60%' }, { top: '63%', left: '38%' }].map((p, i) => (
                <div key={i} className="absolute -translate-x-1/2 -translate-y-full" style={{ top: p.top, left: p.left }}>
                  <svg width="20" height="26" viewBox="0 0 30 38" fill="none">
                    <path d="M15 0C6.7 0 0 6.7 0 15C0 26 15 38 15 38C15 38 30 26 30 15C30 6.7 23.3 0 15 0Z" fill={i === 1 ? '#33C0A3' : '#119FB3'} />
                    <circle cx="15" cy="15" r="6" fill="#fff" />
                  </svg>
                </div>
              ))}
              <div className="absolute left-3.5 right-3.5 bottom-4 bg-white rounded-xl shadow-lg px-3 py-2.5 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-[#12343B] truncate">{t('home.howPopupTitle')}</p>
                  <p className="text-[10px] text-gray-500">{t('home.howPopupSubtitle')}</p>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 rotate-180" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Business */}
      <section id="for-business" className="px-6 py-10 md:py-12">
        <div
          ref={businessReveal.ref}
          style={businessReveal.style}
          className={`max-w-2xl mx-auto text-center bg-[#12343B] text-white rounded-3xl p-8 md:p-10 ${businessReveal.className}`}
        >
          <p className="text-xs uppercase tracking-widest text-[#7ecfcf] mb-3 inline-flex items-center gap-2 justify-center">
            <Building2 className="w-3.5 h-3.5" /> {t('home.businessComingSoonEyebrow')}
          </p>
          <h2 className="font-serif text-2xl md:text-3xl text-white mb-3">{t('home.businessComingSoonTitle')}</h2>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto mb-6">
            {t('home.businessComingSoonBody')}
          </p>
          <a
            href="mailto:hello@goxplora.ca"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#7ecfcf] text-[#0d2328] rounded-2xl text-sm font-semibold hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            <Mail className="w-4 h-4" />
            {t('home.businessComingSoonCta')}
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
