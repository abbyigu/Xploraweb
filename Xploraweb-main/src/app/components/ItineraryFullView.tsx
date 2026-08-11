import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Map as MapIcon, List as ListIcon, ExternalLink } from 'lucide-react';
import { SpotCard } from './SpotCard';
import { NeighbourhoodSpotsMap } from './NeighbourhoodSpotsMap';
import { buildGoogleMapsUrl } from '../lib/maps';
import type { GeneratedItinerary } from '../data/itineraryFilters';

interface Props {
  itinerary: GeneratedItinerary;
  /** Save / Copy-link / Share / Remove — whatever action set fits the
   * context this view is rendered in (ephemeral preview vs. /i/:slug page). */
  actions?: React.ReactNode;
  /** Full-width block under the action row — e.g. a "Your itinerary is
   * saved!" success confirmation with its share link. */
  banner?: React.ReactNode;
  /** Skip the itinerary.title heading — used on /i/:slug, which shows the
   * title in its own hero band instead. */
  hideTitle?: boolean;
}

/** The full stop-by-stop view of one itinerary — header/meta, stops + map,
 * shared by the pre-save preview dialog and the permanent /i/:slug page. */
export function ItineraryFullView({ itinerary, actions, banner, hideTitle }: Props) {
  const { t } = useTranslation();
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [michelinOnly, setMichelinOnly] = useState(false);

  const mapsUrl = buildGoogleMapsUrl(itinerary.stops);

  const stopsWithCoords = itinerary.stops.filter(s => s.spot.lat != null && s.spot.lng != null);
  const route: [number, number][] = stopsWithCoords.map(s => [s.spot.lat!, s.spot.lng!]);
  const firstStop = stopsWithCoords[0]?.spot;
  const center: [number, number] | null = firstStop ? [firstStop.lat!, firstStop.lng!] : null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="px-6 md:px-8 mb-4">
        {!hideTitle && <h2 className="text-xl md:text-2xl font-medium">{itinerary.title}</h2>}
        <p className="text-sm text-muted-foreground mt-1">{itinerary.summary}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {t('itineraryBuilder.resultMeta', { duration: itinerary.estimatedDurationMin, distance: itinerary.estimatedDistanceKm })}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#12343B] text-white text-sm font-medium hover:opacity-90 transition"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              {t('itineraryBuilder.openInMaps')}
            </a>
          )}
          {actions}
        </div>

        {banner}
      </div>

      <div className="md:flex md:items-start">
        <div className={`${mobileView === 'map' ? 'hidden' : 'block'} md:block w-full md:w-3/5 lg:w-[62%]`}>
          <div className="px-6 md:px-8 pb-8 space-y-4">
            <p className="text-[13px] font-semibold text-xplora-ink uppercase tracking-wide">{t('sharedItinerary.yourItinerary')}</p>
            {itinerary.stops.map(stop => (
              <div key={stop.spot.id} className="space-y-2">
                <SpotCard
                  spot={stop.spot}
                  badge={
                    <span className="absolute bottom-2 left-2 w-6 h-6 rounded-full bg-[#12343B] text-white text-xs font-semibold flex items-center justify-center">
                      {stop.order}
                    </span>
                  }
                />
                {stop.note && <p className="text-sm text-muted-foreground italic px-1">{stop.note}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Single map instance, kept mounted across the mobile list/map toggle — swapping visibility via
            CSS instead of unmount/remount avoids re-running Leaflet's expensive init on every tap. */}
        <div
          className={`${mobileView === 'map' ? 'block h-[calc(100vh-13rem)]' : 'hidden'} md:block md:w-2/5 lg:w-[38%] md:sticky md:top-0 md:self-start md:h-screen w-full`}
        >
          <NeighbourhoodSpotsMap spots={stopsWithCoords.map(s => s.spot)} center={center} boundary={null} route={route} websiteLabel={t('neighbourhoodDetail.website', 'Website')} michelinLabel={t('neighbourhoodDetail.michelinGuide', 'Michelin Guide')} activeCategory={activeCategory} onCategoryChange={setActiveCategory} michelinOnly={michelinOnly} onMichelinChange={setMichelinOnly} numbered visible={mobileView === 'map'} />
        </div>
      </div>

      <button
        onClick={() => setMobileView(v => (v === 'map' ? 'list' : 'map'))}
        className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#12343B] text-white text-sm font-medium shadow-lg"
      >
        {mobileView === 'map'
          ? <><ListIcon className="w-4 h-4" aria-hidden="true" /> {t('itineraryBuilder.listView')}</>
          : <><MapIcon className="w-4 h-4" aria-hidden="true" /> {t('itineraryBuilder.mapView')}</>}
      </button>
    </div>
  );
}
