import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, ArrowLeft, Heart, Compass, MapPin, Mail, Building2, Award, Star, Sparkles, Search, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fitPoints, HtmlMarker, MapView } from './MapLibre';
import { useSiteContent } from '../hooks/useSiteContent';
import { useReveal } from '../hooks/useReveal';
import { useNeighbourhoods, localizedTagline } from '../hooks/useNeighbourhoods';
import { useSpots } from '../hooks/useSpots';
import { SPOT_CATEGORY_KEY, type Spot } from '../data/products';
import { neighbourhoodImage, neighbourhoodImageWebp, DEFAULT_NBHD_IMG } from '../lib/neighbourhoodImages';
import { Footer } from './Footer';
import { OutingStarters } from './OutingStarters';
import { SampleOuting } from './SampleOuting';
import { HeroSlideshow } from './HeroSlideshow';
import { SiteSearch } from './SiteSearch';
import { NEIGHBOURHOODS_FALLBACK } from './NeighbourhoodsScreen';

// Small read-only map used inside the "How GoXplora works" phone mockup —
// shows a couple of real nearby spots instead of decorative fake pins.
const PHONE_PIN_PATH = 'M15 0C6.7 0 0 6.7 0 15C0 26 15 38 15 38C15 38 30 26 30 15C30 6.7 23.3 0 15 0Z';
const PHONE_PIN_COLORS = ['#119FB3', '#33C0A3', '#119FB3'];
// Decorative: no interaction at all.
const PHONE_MAP_OPTIONS = { interactive: false, attributionControl: false } as const;

// The map library only loads once this decorative phone-mock map is near the viewport,
// so it stays off the critical path of the landing page.
function HowItWorksMap({ spots }: { spots: Spot[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (!('IntersectionObserver' in window)) { setNear(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);
  return (
    <div ref={ref} className="absolute inset-0">
      {near ? <HowItWorksMapLoaded spots={spots} /> : <div className="absolute inset-0 bg-[#ECEEE8]" />}
    </div>
  );
}

function HowItWorksMapLoaded({ spots }: { spots: Spot[] }) {
  if (spots.length === 0) {
    return <div className="absolute inset-0 bg-[#ECEEE8]" />;
  }
  return (
    <MapView
      center={{ lat: spots[0].lat!, lng: spots[0].lng! }}
      zoom={14}
      options={PHONE_MAP_OPTIONS}
      onLoad={map => {
        if (spots.length > 1) fitPoints(map, spots.map(s => ({ lat: s.lat!, lng: s.lng! })), 30, 14, false);
      }}
    >
      {spots.map((spot, i) => (
        <HtmlMarker key={spot.id} position={{ lat: spot.lat!, lng: spot.lng! }} anchor="bottom">
          <svg width="21" height="27" viewBox="0 0 30 38" aria-hidden="true"><path d={PHONE_PIN_PATH} fill={PHONE_PIN_COLORS[i % PHONE_PIN_COLORS.length]} /></svg>
        </HtmlMarker>
      ))}
    </MapView>
  );
}

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
      className={`group flex flex-col text-left rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg hover:border-xplora-ink/30 hover:-translate-y-0.5 transition-all ${className} ${extraClassName ?? ''}`}
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
          <Icon className="w-4 h-4 text-xplora-ink" />
        </div>
      </div>
      <div className="p-4 md:p-5">
        <p className="font-semibold text-sm md:text-base text-gray-900">{label}</p>
        <p className="text-xs md:text-sm text-gray-600 mt-0.5">{desc}</p>
      </div>
    </button>
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
      <div className="absolute inset-0 bg-gradient-to-t from-xplora-ink/90 via-xplora-ink/10 to-transparent" />
      <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
        <MapPin className="w-4 h-4 text-xplora-ink" />
      </div>
      <div className="absolute bottom-3.5 left-3.5 right-3.5">
        <p className="text-[15px] font-semibold text-white mb-1 leading-tight">{name}</p>
        {tagline && <p className="text-xs text-white/80 leading-snug mb-1.5 line-clamp-2">{tagline}</p>}
        {count != null && <p className="text-xs text-white/65">{t('home.placesCount', { count })}</p>}
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
          <div className="absolute bottom-2.5 left-2.5 bg-xplora-ink/75 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
            {category}
          </div>
        )}
      </div>
      <p className="text-[14.5px] font-semibold text-xplora-ink mb-1 leading-tight">{title}</p>
      <div className="flex items-center gap-1 text-xs text-gray-500">
        {typeof rating === 'number' && (
          <>
            <Star className="w-3 h-3 fill-xplora-primary text-primary" />
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
  const [browseOpen, setBrowseOpen] = useState(false);
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
    { label: t('home.tileLovedLabel'),    desc: t('home.tileLovedDesc'),    icon: Heart,   to: '/loved', image: '/hero/balloon-art-alley.jpg', webpImage: '/hero/balloon-art-alley-tile.webp', imagePosition: 'center 15%' },
    { label: t('home.tileMichelinLabel'), desc: t('home.tileMichelinDesc'), icon: Award,   to: '/michelin', image: '/hero/michelin-plated-dish.jpg', webpImage: '/hero/michelin-plated-dish.webp' },
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
  // pattern as NeighbourhoodExplorer's per-neighbourhood spot dots).
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

  // A couple of real, geolocated spots for the "How GoXplora works" phone
  // mockup map — prefers the same curated set as Hidden gems.
  const phoneMapSpots = useMemo(() => {
    const withCoords = (list: typeof spots) => list.filter(s => s.lat != null && s.lng != null);
    const curated = withCoords(gemSpots);
    return (curated.length ? curated : withCoords(spots)).slice(0, 3);
  }, [gemSpots, spots]);

  return (
    <div className="min-h-screen pb-24 md:pb-0 font-sans">

      {/* Hero — boxed/framed image card, matching the imported mockup */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-5">
        <div className="relative h-[460px] sm:h-[480px] md:h-[480px] rounded-[20px] md:rounded-3xl overflow-hidden">
          <HeroSlideshow />
          <div className="absolute inset-0 bg-gradient-to-r from-xplora-ink/85 via-xplora-ink/45 to-xplora-ink/5 md:from-xplora-ink/60 md:via-xplora-ink/18 md:to-xplora-ink/0 pointer-events-none" />

          <div className="absolute inset-0 flex flex-col md:flex-row items-center md:justify-between gap-8 px-6 sm:px-9 md:px-11 py-10 md:py-0">
            {/* Wording + CTA — left */}
            <div className="flex-1 min-w-0 md:max-w-[480px] flex flex-col items-center md:items-start text-center md:text-left gap-5">
              <p className="inline-flex items-center gap-2 bg-white/90 text-xplora-ink px-3.5 py-[7px] rounded-full text-[12.5px] font-semibold tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-both">
                <Sparkles className="w-3 h-3 text-primary" />
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
                  className="inline-flex items-center gap-2 px-[22px] py-[14px] bg-xplora-ink text-white rounded-full text-[14.5px] font-semibold hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all whitespace-nowrap"
                >
                  {heroCtaLabel}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a href="#browse-places" onClick={() => setBrowseOpen(true)} className="inline-flex min-h-11 items-center text-sm text-white underline underline-offset-4">
                  {t('home.browseSecondary')}
                </a>
              </div>
            </div>


          </div>
        </div>


      </section>

      <OutingStarters />

      <SampleOuting spots={spots} />

      <details id="browse-places" open={browseOpen} onToggle={event => setBrowseOpen(event.currentTarget.open)} className="max-w-7xl mx-auto scroll-mt-24 mb-8">
        <summary className="mx-6 md:mx-8 rounded-2xl bg-card px-5 py-4 cursor-pointer font-medium text-xplora-ink">{t('home.browseSecondary')}</summary>
        <div className="px-6 md:px-8 pt-5"><SiteSearch variant="hero" className="w-full max-w-lg" /></div>

      {/* Discover more */}
      <section className="pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h2 className="font-serif text-xl md:text-2xl text-gray-900 mb-4">{t('home.browsePlacesTitle')}</h2>
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
            <ArrowRight className="w-4 h-4 text-xplora-ink flex-shrink-0" />
          </Link>
        </div>
      </section>

      {/* Discover by neighbourhood */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pt-14 md:pt-16 pb-4">
        <div className="flex items-baseline justify-between gap-4 mb-5">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-xplora-ink">{t('home.neighbourhoodsTitle')}</h2>
          </div>
          <Link to="/neighbourhoods" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-xplora-ink hover:gap-2 transition-all flex-shrink-0">
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
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-xplora-ink">{t('home.gemsTitle')}</h2>
            </div>
            <Link to="/loved" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-xplora-ink hover:gap-2 transition-all flex-shrink-0">
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

      </details>

      {/* How GoXplora works */}
      <section className="mt-8 bg-[#ECEEE8] px-6 py-16 md:py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-14 md:gap-16 items-center">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-xplora-ink mb-9">{t('home.howTitle')}</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4 sm:gap-x-4 lg:flex lg:items-start lg:gap-x-0">
              {HOW_STEPS.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="flex items-start lg:flex-1 w-full">
                  <div className="lg:pr-4">
                    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center mb-3.5">
                      <Icon className="w-5 h-5 text-xplora-ink" />
                    </div>
                    <p className="text-[13.5px] font-semibold text-xplora-ink mb-1 max-w-[130px]">{title}</p>
                    <p className="text-xs leading-relaxed text-gray-600 max-w-[160px]">{desc}</p>
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
            className={`relative w-[260px] h-[520px] mx-auto bg-xplora-ink rounded-[40px] p-3.5 shadow-2xl shadow-xplora-ink/25 ${howVisualReveal.className}`}
          >
            <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-[#ECEEE8]">
              <HowItWorksMap spots={phoneMapSpots} />
              <div className="absolute top-4 left-4 right-4 bg-white/95 rounded-xl px-3 py-2.5 flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-xs text-gray-500 truncate">{t('home.howSearchPlaceholder')}</span>
              </div>
              <div className="absolute left-3.5 right-3.5 bottom-4 bg-white rounded-xl shadow-lg px-3 py-2.5 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {phoneMapSpots[0]?.image ? (
                    <img loading="lazy" decoding="async" src={phoneMapSpots[0].image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <MapPin className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-xplora-ink truncate">{phoneMapSpots[0]?.name ?? t('home.howPopupTitle')}</p>
                  <p className="text-xs text-gray-500 truncate">{phoneMapSpots[0]?.neighbourhood ?? t('home.howPopupSubtitle')}</p>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 rotate-180" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-8 py-10">
        <div className="rounded-3xl bg-card p-6 md:p-8">
          <p className="text-xs uppercase tracking-widest text-primary">{t('home.storyEyebrow')}</p>
          <h2 className="font-serif text-2xl text-xplora-ink mt-2">{t('home.sectionBreakQuote')}</h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl">{t('home.storyBody')}</p>
          <Link to="/about" className="inline-flex min-h-11 items-center text-primary underline underline-offset-4">{t('outingStarters.meetFounder')}</Link>
        </div>
      </section>

      {/* For Business */}
      <section id="for-business" className="px-6 py-10 md:py-12">
        <div
          ref={businessReveal.ref}
          style={businessReveal.style}
          className={`max-w-2xl mx-auto text-center bg-xplora-ink text-white rounded-3xl p-8 md:p-10 ${businessReveal.className}`}
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

