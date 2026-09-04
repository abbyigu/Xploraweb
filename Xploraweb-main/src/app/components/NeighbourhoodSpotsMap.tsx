import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleMap, InfoWindowF, MarkerF, PolygonF, PolylineF } from '@react-google-maps/api';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import type { Spot } from '../data/products';
import { SPOT_CATEGORY_KEY } from '../data/products';

// Inline award/ribbon glyph — matches the icon used elsewhere for the Michelin badge.
function AwardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l2.9 6.26L21.5 9l-4.8 4.4 1.3 6.6L12 16.9 5.9 20l1.3-6.6L2.5 9l6.6-.74z" />
    </svg>
  );
}

// Read-only map showing a neighbourhood's boundary/centre and its local spots.

const QC_CENTRE = { lat: 46.8139, lng: -71.208 };

// Teardrop pin path (30x38 viewBox, anchored at the tip) shared by both
// marker variants below.
const PIN_PATH = 'M15 0C6.7 0 0 6.7 0 15c0 10.5 13.6 22 14.2 22.5.5.4 1.2.4 1.7 0C16.4 37 30 25.5 30 15 30 6.7 23.3 0 15 0z';

function spotIcon(): google.maps.Symbol {
  return {
    path: PIN_PATH,
    fillColor: '#12343B',
    fillOpacity: 1,
    strokeWeight: 0,
    scale: 1,
    anchor: new google.maps.Point(15, 38),
  };
}

// Numbered pin used for itinerary stops so travel order is visible on the map.
function numberedSpotIcon(): google.maps.Symbol {
  return spotIcon();
}

interface Props {
  spots: Spot[];
  center: [number, number] | null;
  boundary: [number, number][] | null;
  route?: [number, number][] | null;
  websiteLabel?: string;
  michelinLabel?: string;
  activeCategory?: string | null;
  onCategoryChange?: (category: string | null) => void;
  michelinOnly?: boolean;
  onMichelinChange?: (michelinOnly: boolean) => void;
  /** Show 1, 2, 3… markers reflecting spot order instead of plain pins (used for itinerary stops). */
  numbered?: boolean;
  /** Whether this map's container is currently visible (e.g. behind a mobile list/map toggle). Triggers a resize instead of a costly full remount. */
  visible?: boolean;
  /** Show the category/Michelin filter chip row above the map. Off for compact previews (e.g. an itinerary's sidebar map card). */
  showFilters?: boolean;
  /** Map container height in px. */
  height?: number;
}

const MAP_OPTIONS: google.maps.MapOptions = { scrollwheel: false, streetViewControl: false, mapTypeControl: false };

export function NeighbourhoodSpotsMap({
  spots,
  center,
  boundary,
  route,
  websiteLabel = 'Website',
  michelinLabel = 'Michelin Guide',
  activeCategory = null,
  onCategoryChange,
  michelinOnly = false,
  onMichelinChange,
  numbered = false,
  visible = true,
  showFilters = true,
  height = 360,
}: Props) {
  const { t } = useTranslation();
  const { isLoaded } = useGoogleMaps();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [openSpotIndex, setOpenSpotIndex] = useState<number | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(spots.map(s => s.category).filter(Boolean) as string[])).sort(),
    [spots],
  );
  const categoryLabel = (cat: string) => SPOT_CATEGORY_KEY[cat] ? t(`categories.${SPOT_CATEGORY_KEY[cat]}`, cat) : cat;
  const hasMichelinSpots = useMemo(() => spots.some(s => !!s.michelinUrl), [spots]);

  const visibleSpots = useMemo(
    () =>
      spots
        .map((spot, index) => ({ spot, index }))
        .filter(({ spot }) => {
          const matches = (!activeCategory || spot.category === activeCategory) && (!michelinOnly || !!spot.michelinUrl);
          return matches && spot.lat != null && spot.lng != null;
        }),
    [spots, activeCategory, michelinOnly],
  );

  const boundaryPath = useMemo(
    () => (boundary && boundary.length >= 3 ? boundary.map(([lat, lng]) => ({ lat, lng })) : null),
    [boundary],
  );
  const routePath = useMemo(
    () => (route && route.length >= 2 ? route.map(([lat, lng]) => ({ lat, lng })) : null),
    [route],
  );

  const fitToContent = (map: google.maps.Map) => {
    const bounds = new google.maps.LatLngBounds();
    let count = 0;
    boundaryPath?.forEach(p => { bounds.extend(p); count++; });
    routePath?.forEach(p => { bounds.extend(p); count++; });
    visibleSpots.forEach(({ spot }) => { bounds.extend({ lat: spot.lat!, lng: spot.lng! }); count++; });

    if (count === 1) {
      map.setCenter(bounds.getCenter());
      map.setZoom(15);
    } else if (count > 1) {
      map.fitBounds(bounds, 40);
    }
  };

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    fitToContent(map);
  };

  const onUnmount = () => {
    mapRef.current = null;
  };

  // Recalculate layout when the container becomes visible again (e.g. a
  // mobile list/map toggle) — the map was mounted once while hidden.
  useEffect(() => {
    if (!visible || !mapRef.current) return;
    const id = setTimeout(() => {
      google.maps.event.trigger(mapRef.current!, 'resize');
      fitToContent(mapRef.current!);
    }, 50);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <div className="w-full space-y-2">
      {showFilters && (categories.length > 1 || hasMichelinSpots) && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange?.(activeCategory === cat ? null : cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeCategory === cat
                  ? 'bg-[#12343B] text-white border-[#12343B]'
                  : 'bg-white text-[#12343B] border-[#12343B]/20 hover:bg-[#12343B]/5'
              }`}
            >
              {categoryLabel(cat)}
            </button>
          ))}
          {hasMichelinSpots && (
            <button
              onClick={() => onMichelinChange?.(!michelinOnly)}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                michelinOnly
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-red-600 border-red-600/30 hover:bg-red-50'
              }`}
            >
              <AwardIcon className="w-3 h-3" /> {michelinLabel}
            </button>
          )}
        </div>
      )}
      <div
        className="w-full rounded-2xl overflow-hidden border border-gray-200"
        style={{ height, background: '#e8eef0' }}
      >
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center ? { lat: center[0], lng: center[1] } : QC_CENTRE}
            zoom={14}
            options={MAP_OPTIONS}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {boundaryPath && (
              <PolygonF
                path={boundaryPath}
                options={{ strokeColor: '#12343B', strokeWeight: 2, fillColor: '#7ecfcf', fillOpacity: 0.12 }}
              />
            )}
            {routePath && (
              <PolylineF
                path={routePath}
                options={{ strokeColor: '#12343B', strokeWeight: 6, strokeOpacity: 0.9 }}
              />
            )}
            {visibleSpots.map(({ spot, index }) => (
              <MarkerF
                key={spot.id}
                position={{ lat: spot.lat!, lng: spot.lng! }}
                icon={numbered ? numberedSpotIcon() : spotIcon()}
                label={numbered ? { text: String(index + 1), color: '#ffffff', fontSize: '14px', fontWeight: '700' } : undefined}
                onClick={() => setOpenSpotIndex(index)}
              >
                {openSpotIndex === index && (
                  <InfoWindowF onCloseClick={() => setOpenSpotIndex(null)}>
                    <div style={{ width: 180, fontFamily: 'inherit' }}>
                      {spot.image && (
                        <img src={spot.image} alt="" style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                      )}
                      {(spot.category || spot.priceRange) && (
                        <div style={{ fontSize: 11, color: '#12343B', fontWeight: 600, marginBottom: 2 }}>
                          {[spot.category ? categoryLabel(spot.category) : undefined, spot.priceRange].filter(Boolean).join(' · ')}
                        </div>
                      )}
                      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25 }}>{spot.name}</div>
                      {spot.address && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{spot.address}</div>}
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 6 }}>
                        {spot.website && (
                          <a href={spot.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: '#12343B' }}>
                            {websiteLabel} ↗
                          </a>
                        )}
                        {spot.michelinUrl && (
                          <a
                            href={spot.michelinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
                              color: '#ffffff', background: '#dc2626', padding: '3px 8px', borderRadius: 9999,
                            }}
                          >
                            <AwardIcon className="w-2.5 h-2.5" /> {michelinLabel}
                          </a>
                        )}
                      </div>
                    </div>
                  </InfoWindowF>
                )}
              </MarkerF>
            ))}
          </GoogleMap>
        )}
      </div>
    </div>
  );
}
