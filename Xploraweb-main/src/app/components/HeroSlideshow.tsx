import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SLIDES = [
  { src: '/hero/quebec-street-le-forgeron-dor.jpg', altKey: 'home.heroSlideAlt1', desktopFocus: 'md:object-[50%_75%]' },
  { src: '/hero/brick-wall-cafe-interior.jpg', altKey: 'home.heroSlideAlt2', desktopFocus: 'md:object-[35%_80%]' },
  { src: '/hero/illy-cafe-terrace.jpg', altKey: 'home.heroSlideAlt3', desktopFocus: 'md:object-[55%_55%]' },
  { src: '/hero/park-walk-dusk.jpg', altKey: 'home.heroSlideAlt4', desktopFocus: 'md:object-[50%_70%]' },
  { src: '/hero/petit-champlain-chateau-view.jpg', altKey: 'home.heroSlideAlt5', desktopFocus: 'md:object-[50%_85%]' },
  { src: '/hero/depanneur-cafe-storefront.jpg', altKey: 'home.heroSlideAlt6', desktopFocus: 'md:object-[50%_80%]' },
  { src: '/hero/laval-statue-building.jpg', altKey: 'home.heroSlideAlt7', desktopFocus: 'md:object-[30%_85%]' },
  { src: '/hero/blue-heritage-house.jpg', altKey: 'home.heroSlideAlt8', desktopFocus: 'md:object-[40%_80%]' },
];

const SLIDE_DURATION_MS = 6000;

export function HeroSlideshow() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const goTo = (index: number) => {
    setActiveIndex((index + SLIDES.length) % SLIDES.length);
  };

  return (
    <div className="absolute inset-0">
      {SLIDES.map((slide, i) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={t(slide.altKey)}
          className={`absolute inset-0 w-full h-full object-cover ${slide.desktopFocus} transition-opacity duration-1000 ease-in-out ${
            i === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

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
