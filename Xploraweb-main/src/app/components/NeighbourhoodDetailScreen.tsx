import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, ArrowRight, MapPin, Clock, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Footer } from './Footer';
import { PageSEO } from './PageSEO';
import { ExperienceCard } from './ExperienceCard';
import { NeighbourhoodSpotsMap } from './NeighbourhoodSpotsMap';
import { useNeighbourhoods } from '../hooks/useNeighbourhoods';
import { useExperiences } from '../hooks/useExperiences';
import { useSpots } from '../hooks/useSpots';
import { neighbourhoodImage, DEFAULT_NBHD_IMG } from '../lib/neighbourhoodImages';
import type { Spot } from '../data/products';

function SpotCard({ spot }: { spot: Spot }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white flex flex-col">
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        {spot.image ? (
          <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <MapPin className="w-7 h-7" />
          </div>
        )}
        {spot.category && (
          <span className="absolute top-2 left-2 text-[11px] font-medium px-2 py-1 rounded-full bg-white/90 text-[#12343B]">
            {spot.category}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-gray-900 leading-tight">{spot.name}</p>
          {spot.visitTime && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" /> {spot.visitTime}
            </span>
          )}
        </div>
        {spot.description && <p className="text-sm text-gray-600 line-clamp-3">{spot.description}</p>}
        {spot.address && <p className="text-xs text-muted-foreground mt-0.5">{spot.address}</p>}
        {spot.website && (
          <a
            href={spot.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="mt-1 inline-flex items-center gap-1 text-sm text-[#12343B] font-medium hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" /> {t('neighbourhoodDetail.website', 'Website')}
          </a>
        )}
      </div>
    </div>
  );
}

export function NeighbourhoodDetailScreen() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { neighbourhoods, loading } = useNeighbourhoods();
  const { experiences } = useExperiences();
  const { spots } = useSpots();

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

  const nbhdName = nbhd.name.trim().toLowerCase();
  const items = experiences.filter(
    e => e.neighbourhood?.trim().toLowerCase() === nbhdName,
  );
  const localSpots = spots.filter(
    s => s.neighbourhood?.trim().toLowerCase() === nbhdName,
  );

  return (
    <div className="min-h-screen pb-24 md:pb-0 font-sans">
      <PageSEO
        title={`${nbhd.name} — Xplora`}
        description={nbhd.description || nbhd.tagline || `Discover experiences in ${nbhd.name}, Québec City.`}
        canonical={`/neighbourhoods/${nbhd.slug || nbhd.id}`}
      />

      {/* Hero */}
      <section className="relative">
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img
            src={neighbourhoodImage(nbhd.name, nbhd.coverImage)}
            alt={nbhd.name}
            onError={e => { if (e.currentTarget.src !== DEFAULT_NBHD_IMG) e.currentTarget.src = DEFAULT_NBHD_IMG; }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-6 md:px-8 pb-6 md:pb-8">
            <Link
              to="/neighbourhoods"
              className="inline-flex items-center gap-1.5 text-white/90 text-sm font-medium mb-3 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> {t('neighbourhoodDetail.back', 'All neighbourhoods')}
            </Link>
            <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight flex items-center gap-2">
              <MapPin className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0" /> {nbhd.name}
            </h1>
            {nbhd.tagline && <p className="text-white/85 text-base md:text-lg mt-1.5">{nbhd.tagline}</p>}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-12 space-y-10">
        {/* Description — only shown here, on the neighbourhood's own page */}
        {nbhd.description && (
          <section className="max-w-3xl mx-auto text-center">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{nbhd.description}</p>
          </section>
        )}

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

        {/* Local spots in this neighbourhood */}
        {localSpots.length > 0 && (
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-gray-900 mb-1.5">
              {t('neighbourhoodDetail.spots', 'Local spots')}
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              {t('neighbourhoodDetail.spotsSub', 'Handpicked places worth a stop in this neighbourhood.')}
            </p>
            {(nbhd.lat != null || nbhd.boundary || localSpots.some(s => s.lat != null)) && (
              <div className="mb-5">
                <NeighbourhoodSpotsMap
                  spots={localSpots}
                  center={nbhd.lat != null && nbhd.lng != null ? [nbhd.lat, nbhd.lng] : null}
                  boundary={nbhd.boundary}
                  websiteLabel={t('neighbourhoodDetail.website', 'Website')}
                />
              </div>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {localSpots.map(spot => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
