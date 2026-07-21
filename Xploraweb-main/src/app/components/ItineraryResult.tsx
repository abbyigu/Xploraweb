import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Map as MapIcon, List as ListIcon, ExternalLink, Heart, Loader2 } from 'lucide-react';
import { SpotCard } from './SpotCard';
import { NeighbourhoodSpotsMap } from './NeighbourhoodSpotsMap';
import { supabase } from '../lib/supabase';
import { saveItinerary } from '../lib/savedItineraries';
import { buildGoogleMapsUrl } from '../lib/maps';
import type { GeneratedItinerary } from '../data/itineraryFilters';

interface Props {
  result: GeneratedItinerary;
}

export function ItineraryResult({ result }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [isGuest, setIsGuest] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsGuest(!session?.user));
  }, []);

  async function handleSave() {
    if (isGuest) { navigate('/signup'); return; }
    setSaveState('saving');
    const { ok } = await saveItinerary(result);
    setSaveState(ok ? 'saved' : 'error');
  }

  const mapsUrl = buildGoogleMapsUrl(result.stops);

  const stopsWithCoords = result.stops.filter(s => s.spot.lat != null && s.spot.lng != null);
  const route: [number, number][] = stopsWithCoords.map(s => [s.spot.lat!, s.spot.lng!]);
  const firstStop = stopsWithCoords[0]?.spot;
  const center: [number, number] | null = firstStop ? [firstStop.lat!, firstStop.lng!] : null;

  return (
    <div className="max-w-7xl mx-auto mt-8">
      <div className="px-6 md:px-8 mb-4">
        <h2 className="text-xl md:text-2xl font-medium">{result.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{result.summary}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {t('itineraryBuilder.resultMeta', { duration: result.estimatedDurationMin, distance: result.estimatedDistanceKm })}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
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
          <button
            type="button"
            onClick={handleSave}
            disabled={saveState === 'saving' || saveState === 'saved'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted/50 transition disabled:opacity-70"
          >
            {saveState === 'saving' ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Heart className={`w-4 h-4 ${saveState === 'saved' ? 'fill-secondary text-secondary' : ''}`} aria-hidden="true" />
            )}
            {saveState === 'saved' ? t('itineraryBuilder.saved') : t('itineraryBuilder.saveRoute')}
          </button>
          {saveState === 'error' && (
            <p className="w-full text-xs text-red-600">{t('itineraryBuilder.saveError')}</p>
          )}
        </div>
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
          <NeighbourhoodSpotsMap spots={stopsWithCoords.map(s => s.spot)} center={center} boundary={null} route={route} websiteLabel={t('neighbourhoodDetail.website', 'Website')} michelinLabel={t('neighbourhoodDetail.michelinGuide', 'Michelin Guide')} numbered />
          <NeighbourhoodSpotsMap spots={stopsWithCoords.map(s => s.spot)} center={center} boundary={null} route={route} websiteLabel={t('neighbourhoodDetail.website', 'Website')} numbered />
        </div>

        {mobileView === 'map' && (
          <div className="md:hidden h-[calc(100vh-13rem)] w-full">
            <NeighbourhoodSpotsMap spots={stopsWithCoords.map(s => s.spot)} center={center} boundary={null} route={route} websiteLabel={t('neighbourhoodDetail.website', 'Website')} michelinLabel={t('neighbourhoodDetail.michelinGuide', 'Michelin Guide')} numbered />
            <NeighbourhoodSpotsMap spots={stopsWithCoords.map(s => s.spot)} center={center} boundary={null} route={route} websiteLabel={t('neighbourhoodDetail.website', 'Website')} numbered />
          </div>
        )}
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
