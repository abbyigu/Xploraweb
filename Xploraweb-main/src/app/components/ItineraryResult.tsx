import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Map as MapIcon, List as ListIcon } from 'lucide-react';
import { SpotCard } from './SpotCard';
import { NeighbourhoodSpotsMap } from './NeighbourhoodSpotsMap';
import type { GeneratedItinerary } from '../data/itineraryFilters';

interface Props {
  result: GeneratedItinerary;
  origin: { lat: number; lng: number } | null;
}

export function ItineraryResult({ result, origin }: Props) {
  const { t } = useTranslation();
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  const stopsWithCoords = result.stops.filter(s => s.spot.lat != null && s.spot.lng != null);
  const route: [number, number][] = stopsWithCoords.map(s => [s.spot.lat!, s.spot.lng!]);
  const firstStop = stopsWithCoords[0]?.spot;
  const center: [number, number] | null = origin
    ? [origin.lat, origin.lng]
    : firstStop ? [firstStop.lat!, firstStop.lng!] : null;

  return (
    <div className="max-w-7xl mx-auto mt-8">
      <div className="px-6 md:px-8 mb-4">
        <h2 className="text-xl md:text-2xl font-medium">{result.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{result.summary}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {t('itineraryBuilder.resultMeta', { duration: result.estimatedDurationMin, distance: result.estimatedDistanceKm })}
        </p>
      </div>

      <div className="md:flex md:items-start">
        <div className={`${mobileView === 'map' ? 'hidden' : 'block'} md:block w-full md:w-3/5 lg:w-[62%]`}>
          <div className="px-6 md:px-8 pb-8 space-y-4">
            {result.stops.map(stop => (
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

        <div className="hidden md:block md:w-2/5 lg:w-[38%] md:sticky md:top-0 md:self-start md:h-screen">
          <NeighbourhoodSpotsMap spots={stopsWithCoords.map(s => s.spot)} center={center} boundary={null} route={route} />
        </div>

        {mobileView === 'map' && (
          <div className="md:hidden h-[calc(100vh-13rem)] w-full">
            <NeighbourhoodSpotsMap spots={stopsWithCoords.map(s => s.spot)} center={center} boundary={null} route={route} />
          </div>
        )}
      </div>

      <button
        onClick={() => setMobileView(v => (v === 'map' ? 'list' : 'map'))}
        className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#12343B] text-white text-sm font-medium shadow-lg"
      >
        {mobileView === 'map'
          ? <><ListIcon className="w-4 h-4" aria-hidden="true" /> List</>
          : <><MapIcon className="w-4 h-4" aria-hidden="true" /> Map</>}
      </button>
    </div>
  );
}
