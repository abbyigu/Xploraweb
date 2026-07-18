import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SLIDES = [
  { src: '/hero/park-garden-walk.jpg', webpSrc: '/hero/park-garden-walk.webp', altKey: 'home.heroSlideAlt1', desktopFocus: 'md:object-[50%_60%]' },
  { src: '/hero/jazz-band-night.jpg', webpSrc: '/hero/jazz-band-night.webp', altKey: 'home.heroSlideAlt2', desktopFocus: 'md:object-[50%_45%]' },
  { src: '/hero/cafe-terrace-drinks.jpg', webpSrc: '/hero/cafe-terrace-drinks.webp', altKey: 'home.heroSlideAlt3', desktopFocus: 'md:object-[50%_65%]' },
  { src: '/hero/marina-sunset.jpg', webpSrc: '/hero/marina-sunset.webp', altKey: 'home.heroSlideAlt4', desktopFocus: 'md:object-[50%_55%]' },
  { src: '/hero/balloon-art-alley.jpg', webpSrc: '/hero/balloon-art-alley.webp', altKey: 'home.heroSlideAlt5', desktopFocus: 'md:object-[50%_40%]' },
  { src: '/hero/winter-firepit-petit-champlain.jpg', webpSrc: '/hero/winter-firepit-petit-champlain.webp', altKey: 'home.heroSlideAlt6', desktopFocus: 'md:object-[50%_75%]' },
];

const SLIDE_DURATION_MS = 6000;

export function HeroSlideshow() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(() => new Set([0]));

  const markLoaded = (index: number) => {
    setLoadedSlides((prev) => (prev.has(index) ? prev : new Set(prev).add(index)));
  };

  // Preload the next slide while the current one is showing, so the crossfade never reveals a blank frame.
  useEffect(() => {
    markLoaded((activeIndex + 1) % SLIDES.length);
  }, [activeIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const goTo = (index: number) => {
    const normalized = (index + SLIDES.length) % SLIDES.length;
    markLoaded(normalized);
    setActiveIndex(normalized);
  };

  return (
    <div className="absolute inset-0">
      {SLIDES.map((slide, i) =>
        loadedSlides.has(i) ? (
          <picture key={slide.src}>
            <source srcSet={slide.webpSrc} type="image/webp" />
            <img
              src={slide.src}
              alt={t(slide.altKey)}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'low'}
              decoding={i === 0 ? 'sync' : 'async'}
              className={`absolute inset-0 w-full h-full object-cover ${slide.desktopFocus} transition-opacity duration-1000 ease-in-out ${
                i === activeIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </picture>
        ) : null
      )}

      <button
        type="button"
        onClick={() => goTo(activeIndex - 1)}
        aria-label={t('a11y.prevPhoto')}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => goTo(activeIndex + 1)}
        aria-label={t('a11y.nextPhoto')}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={t('a11y.goToPhoto', { n: i + 1 })}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
