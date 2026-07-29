import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, ArrowRight, MapPin, Signpost, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Footer } from './Footer';
import { PageSEO } from './PageSEO';
import { ExperienceCard } from './ExperienceCard';
import { NeighbourhoodSpotsMap } from './NeighbourhoodSpotsMap';
import { SpotCard } from './SpotCard';
import { NeighbourhoodRating } from './NeighbourhoodRating';
import { useNeighbourhoods, localizedTagline, localizedDescription } from '../hooks/useNeighbourhoods';
import { useExperiences } from '../hooks/useExperiences';
import { useSpots } from '../hooks/useSpots';
import { neighbourhoodImage, neighbourhoodImageWebp, DEFAULT_NBHD_IMG } from '../lib/neighbourhoodImages';

export function NeighbourhoodDetailScreen() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { neighbourhoods, loading } = useNeighbourhoods();
  const { experiences } = useExperiences();
  const { spots } = useSpots();
  const [activeStreet, setActiveStreet] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeMichelinOnly, setActiveMichelinOnly] = useState(false);
  const spotsRef = React.useRef<HTMLElement>(null);

  function selectStreet(street: string) {
    const next = activeStreet === street ? null : street;
    setActiveStreet(next);
    if (next) {
      // Let the filtered list render, then scroll to the activities on that street.
      requestAnimationFrame(() => {
        spotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  const nbhd = neighbourhoods.find(n => n.slug === slug || n.id === slug);

  if (loading && !nbhd) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!nbhd) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-medium">{t('neighbourhoodDetail.notFound', 'Neighbourhood not found.')}</p>
        <Link to="/neighbourhoods" className="text-sm text-[#12343B] font-medium inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> {t('neighbourhoodDetail.back', 'All neighbourhoods')}
        </Link>
      </div>
    );
  }

  const tagline = localizedTagline(nbhd, i18n.language);
  const description = localizedDescription(nbhd, i18n.language);
  const nbhdName = nbhd.name.trim().toLowerCase();
  const items = experiences.filter(
    e => e.neighbourhood?.trim().toLowerCase() === nbhdName,
  );
  const allLocalSpots = spots.filter(
    s => s.neighbourhood?.trim().toLowerCase() === nbhdName,
  );
  const streetSpots = activeStreet
    ? allLocalSpots.filter(s => s.address?.toLowerCase().includes(activeStreet.toLowerCase()))
    : allLocalSpots;
  const categorySpots = activeCategory
    ? streetSpots.filter(s => s.category === activeCategory)
    : streetSpots;
  const localSpots = activeMichelinOnly
    ? categorySpots.filter(s => !!s.michelinUrl)
    : categorySpots;

  return (
    <div className="min-h-screen pb-24 md:pb-0 font-sans">
      <PageSEO
        title={t('neighbourhoodDetail.seoTitleSuffix', { name: nbhd.name })}
        description={description || tagline || t('neighbourhoodDetail.seoDescFallback', { name: nbhd.name })}
        canonical={`/neighbourhoods/${nbhd.slug || nbhd.id}`}
      />

      {/* Hero */}
      <section className="relative">
        <div className="relative h-64 md:h-96 overflow-hidden">
          <picture>
            {neighbourhoodImageWebp(nbhd.name, nbhd.coverImage) && (
              <source srcSet={neighbourhoodImageWebp(nbhd.name, nbhd.coverImage)!} type="image/webp" />
            )}
            <img
              src={neighbourhoodImage(nbhd.name, nbhd.coverImage)}
              alt={nbhd.name}
              fetchPriority="high"
              onError={e => { if (e.currentTarget.src !== DEFAULT_NBHD_IMG) e.currentTarget.src = DEFAULT_NBHD_IMG; }}
              className="w-full h-full object-cover"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

          {/* Floating back-to-all-neighbourhoods button */}
          <Link
            to="/neighbourhoods"
            className="absolute top-4 left-4 md:top-6 md:left-6 z-10 inline-flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full bg-[#12343B] text-white text-sm font-semibold shadow-lg ring-2 ring-white/80 hover:bg-[#0d262c] hover:scale-105 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('neighbourhoodDetail.back', 'All neighbourhoods')}</span>
          </Link>

          <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-6 md:px-8 pb-6 md:pb-8">
            <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight flex items-center gap-2">
              <MapPin className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0" /> {nbhd.name}
            </h1>
            {tagline && <p className="text-white/85 text-base md:text-lg mt-1.5">{tagline}</p>}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-12 space-y-10">
        {/* Description — only shown here, on the neighbourhood's own page */}
        {description && (
          <section className="max-w-3xl mx-auto text-center">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
          </section>
        )}

        <NeighbourhoodRating neighbourhoodId={nbhd.id} />

        {/* Preset tours for this neighbourhood */}
        <section>
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="font-serif text-xl md:text-2xl text-gray-900">
              {t('neighbourhoodDetail.tours', 'Self-guided tours')}
            </h2>
            <Link
              to={`/itinerary?neighbourhood=${encodeURIComponent(nbhd.name)}`}
              className="flex-shrink-0 inline-flex items-center gap-1 text-sm text-[#12343B] font-medium hover:gap-2 transition-all"
            >
              {t('neighbourhoodDetail.findOutMore', 'Find out more')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {items.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
              <p className="text-sm text-muted-foreground">
                {t('neighbourhoodDetail.empty', 'No tours here yet — check back soon.')}
              </p>
              <button
                onClick={() => navigate('/itinerary')}
                className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#12343B] text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
              >
                {t('neighbourhoodDetail.browseAll', 'Browse all experiences')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {items.map(exp => (
                <ExperienceCard key={exp.id} exp={exp} />
              ))}
            </div>
          )}
        </section>

        {/* Famous streets in this neighbourhood */}
        {nbhd.famousStreets.length > 0 && (
          <section className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-xl md:text-2xl text-gray-900 mb-4 flex items-center justify-center gap-2">
              <Signpost className="w-5 h-5 text-[#12343B]" />
              {t('neighbourhoodDetail.famousStreets', 'Famous streets')}
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {nbhd.famousStreets.map(street => {
                const isActive = activeStreet === street;
                const spotCount = allLocalSpots.filter(s => s.address?.toLowerCase().includes(street.toLowerCase())).length;
                return (
                  <button
                    key={street}
                    onClick={() => selectStreet(street)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      isActive
                        ? 'bg-[#12343B] text-white border-[#12343B]'
                        : 'bg-[#12343B]/5 text-[#12343B] border-[#12343B]/10 hover:bg-[#12343B]/10'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" /> {street}
                    {spotCount > 0 && (
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[#12343B]/10 text-[#12343B]'}`}>
                        {spotCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {activeStreet && (
              <p className="mt-3 text-xs text-muted-foreground">
                {t('neighbourhoodDetail.filteringByStreet', 'Showing spots on')} <strong>{activeStreet}</strong>
                {' · '}
                <button onClick={() => setActiveStreet(null)} className="text-[#12343B] font-medium hover:underline inline-flex items-center gap-0.5">
                  <X className="w-3 h-3" /> {t('neighbourhoodDetail.clearFilter', 'Clear')}
                </button>
              </p>
            )}
          </section>
        )}

        {/* Local spots in this neighbourhood */}
        {allLocalSpots.length > 0 && (
          <section ref={spotsRef} className="scroll-mt-24">
            <h2 className="font-serif text-xl md:text-2xl text-gray-900 mb-1.5">
              {t('neighbourhoodDetail.spots', 'Local spots')}
              {(activeStreet || activeCategory || activeMichelinOnly) && (
                <span className="ml-2 text-base font-normal text-[#12343B]">
                  — {[activeStreet, activeCategory, activeMichelinOnly ? t('neighbourhoodDetail.michelinGuide', 'Michelin Guide') : null].filter(Boolean).join(' · ')}
                </span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              {t('neighbourhoodDetail.spotsSub', 'Handpicked places worth a stop in this neighbourhood.')}
            </p>
            {(nbhd.lat != null || nbhd.boundary || nbhd.route || streetSpots.some(s => s.lat != null)) && (
              <div className="mb-5">
                <NeighbourhoodSpotsMap
                  spots={streetSpots}
                  center={nbhd.lat != null && nbhd.lng != null ? [nbhd.lat, nbhd.lng] : null}
                  boundary={nbhd.boundary}
                  route={nbhd.route}
                  websiteLabel={t('neighbourhoodDetail.website', 'Website')}
                  michelinLabel={t('neighbourhoodDetail.michelinGuide', 'Michelin Guide')}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  michelinOnly={activeMichelinOnly}
                  onMichelinChange={setActiveMichelinOnly}
                />
              </div>
            )}
            {localSpots.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {t('neighbourhoodDetail.noSpotsOnStreet', 'No spots found here yet.')}
                </p>
                <button
                  onClick={() => { setActiveStreet(null); setActiveCategory(null); setActiveMichelinOnly(false); }}
                  className="mt-3 text-sm text-[#12343B] font-medium hover:underline"
                >
                  {t('neighbourhoodDetail.showAllSpots', 'Show all spots')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {localSpots.map(spot => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
