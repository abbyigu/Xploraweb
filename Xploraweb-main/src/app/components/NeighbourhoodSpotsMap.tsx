import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Map as MLMap } from 'maplibre-gl';
import { fitPoints, HtmlMarker, MapPopup, MapView, Polygon, Polyline, type LatLng } from './MapLibre';
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

// Teardrop pin (30x38, anchored at the tip), optionally numbered so travel order is visible (itinerary stops).
function SpotPin({ label, onClick }: { label?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label ? `Stop ${label}` : 'Spot'} style={{ display: 'block', background: 'none', border: 0, padding: 0, cursor: 'pointer' }}>
      <svg width="30" height="38" viewBox="0 0 30 38" aria-hidden="true">
        <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 13.6 22 14.2 22.5.5.4 1.2.4 1.7 0C16.4 37 30 25.5 30 15 30 6.7 23.3 0 15 0z" fill="#12343B" />
        {label && <text x="15" y="20" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700" fontFamily="inherit">{label}</text>}
      </svg>
    </button>
  );
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
  const mapRef = useRef<MLMap | null>(null);
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
    (): LatLng[] | null => (boundary && boundary.length >= 3 ? boundary.map(([lat, lng]) => ({ lat, lng })) : null),
    [boundary],
  );
  const routePath = useMemo(
    () => (route && route.length >= 2 ? route.map(([lat, lng]) => ({ lat, lng })) : null),
    [route],
  );

  const fitToContent = (map: MLMap, animate = false) => {
    const pts: LatLng[] = [
      ...(boundaryPath ?? []),
      ...(routePath ?? []),
      ...visibleSpots.map(({ spot }) => ({ lat: spot.lat!, lng: spot.lng! })),
    ];
    if (pts.length) fitPoints(map, pts, 40, 15, animate);
  };

  const onLoad = (map: MLMap) => {
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
      mapRef.current!.resize();
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
              type="button"
              aria-pressed={activeCategory === cat}
              onClick={() => onCategoryChange?.(activeCategory === cat ? null : cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeCategory === cat
                  ? 'bg-xplora-ink text-white border-xplora-ink'
                  : 'bg-white text-xplora-ink border-xplora-ink/20 hover:bg-xplora-ink/5'
              }`}
            >
              {categoryLabel(cat)}
            </button>
          ))}
          {hasMichelinSpots && (
            <button
              type="button"
              aria-pressed={michelinOnly}
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
        className="w-full isolate rounded-2xl overflow-hidden border border-gray-200"
        style={{ height, background: '#e8eef0' }}
      >
        <MapView
          center={center ? { lat: center[0], lng: center[1] } : QC_CENTRE}
          zoom={14}
          options={{ scrollZoom: false }}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {boundaryPath && <Polygon path={boundaryPath} color="#12343B" width={2} fillColor="#7ecfcf" fillOpacity={0.12} />}
          {routePath && <Polyline path={routePath} color="#12343B" width={6} opacity={0.9} />}
          {visibleSpots.map(({ spot, index }) => (
            <HtmlMarker key={spot.id} position={{ lat: spot.lat!, lng: spot.lng! }} anchor="bottom">
              <SpotPin label={numbered ? String(index + 1) : undefined} onClick={() => setOpenSpotIndex(index)} />
              {openSpotIndex === index && (
                <MapPopup position={{ lat: spot.lat!, lng: spot.lng! }} offset={40} onClose={() => setOpenSpotIndex(null)}>
                    <div style={{ width: 180, fontFamily: 'inherit' }}>
                      {spot.image && (
                        <img loading="lazy" decoding="async" src={spot.image} alt="" style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
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
                </MapPopup>
              )}
            </HtmlMarker>
          ))}
        </MapView>
      </div>
    </div>
  );
}
