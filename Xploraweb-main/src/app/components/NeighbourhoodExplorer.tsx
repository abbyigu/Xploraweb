import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Info, MapPin, Sparkles, Star, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Map as MLMap } from 'maplibre-gl';
import { fitPoints, HtmlMarker, MapView, Polygon, toBounds } from './MapLibre';
import { type Neighbourhood } from '../hooks/useNeighbourhoods';
import type { Spot } from '../data/products';
import { neighbourhoodColor } from '../lib/neighbourhoodColors';
import { SaveSpotButton } from './SaveSpotButton';
import { getVisitedSpots, onVisitedSpotsChange } from '../lib/visitedSpots';

// The /neighbourhoods page's interactive map: replaces the old plain
// NeighbourhoodsOverviewMap with a live explorer — coloured polygons/labels
// per neighbourhood, a search-chip picker, a spot-count side panel, and
// floating spot cards that filter to whichever neighbourhood is selected.

const QC_CENTRE = { lat: 46.8139, lng: -71.208 };
// 'scrollZoom: false' keeps page scroll working over the map; one-finger touch
// drag pans directly on mobile.
const MAP_OPTIONS = { scrollZoom: false, cooperativeGestures: false, attributionControl: { compact: true } } as const;

function centroidOf(boundary: [number, number][]) {
  const [[w, s], [e, n]] = toBounds(boundary.map(([lat, lng]) => ({ lat, lng }))) as [[number, number], [number, number]];
  return { lat: (s + n) / 2, lng: (w + e) / 2 };
}

interface Props {
  neighbourhoods: Neighbourhood[];
  spots: Spot[];
  activeNeighbourhood: string | null;
  onSelectNeighbourhood: (name: string | null) => void;
}

export function NeighbourhoodExplorer({ neighbourhoods, spots, activeNeighbourhood: activeNbhd, onSelectNeighbourhood }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mapFailed, setMapFailed] = useState(false);
  // Fallback if WebGL is unavailable or the tile style can't load.
  useEffect(() => {
    const canvas = document.createElement('canvas');
    if (!canvas.getContext('webgl2') && !canvas.getContext('webgl')) setMapFailed(true);
  }, []);
  const mapRef = useRef<MLMap | null>(null);
  const initialPointsRef = useRef<{ lat: number; lng: number }[]>([]);
  const timersRef = useRef<number[]>([]);

  const [toast, setToast] = useState<{ visible: boolean; label: string }>({ visible: false, label: '' });
  const [visitedIds, setVisitedIds] = useState<Set<string>>(() => new Set(getVisitedSpots().map(s => s.id)));
  const [showPanelHint, setShowPanelHint] = useState(false);

  useEffect(() => onVisitedSpotsChange(() => setVisitedIds(new Set(getVisitedSpots().map(s => s.id)))), []);

  const hasMapData = useMemo(
    () => neighbourhoods.some(n => (n.boundary && n.boundary.length >= 3) || (n.lat != null && n.lng != null)),
    [neighbourhoods]
  );

  const slugByName = useMemo(() => new Map(neighbourhoods.map(n => [n.name.trim().toLowerCase(), n.slug])), [neighbourhoods]);

  // Live spot count per neighbourhood — real data, no fabricated metric.
  const spotCountFor = (name: string) =>
    spots.filter(s => (s.neighbourhood || '').trim().toLowerCase() === name.trim().toLowerCase()).length;

  // Personal exploration breakdown: of the places this visitor has marked
  // "I've been here", what share sits in each neighbourhood.
  const categorizedVisitedCount = useMemo(
    () => spots.filter(s => visitedIds.has(s.id) && (s.neighbourhood || '').trim()).length,
    [spots, visitedIds]
  );
  const visitedCountFor = (name: string) =>
    spots.filter(s => visitedIds.has(s.id) && (s.neighbourhood || '').trim().toLowerCase() === name.trim().toLowerCase()).length;

  const centroids = useMemo(() => {
    const map: Record<string, { lat: number; lng: number }> = {};
    neighbourhoods.forEach(n => {
      if (n.boundary && n.boundary.length >= 3) {
        map[n.id] = centroidOf(n.boundary);
      } else if (n.lat != null && n.lng != null) {
        map[n.id] = { lat: n.lat, lng: n.lng };
      }
    });
    return map;
  }, [neighbourhoods]);

  const selectNeighbourhood = (name: string) => {
    onSelectNeighbourhood(activeNbhd === name ? null : name);
  };

  // Pan/zoom the map to whatever's selected (or back to the full view).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const target = activeNbhd ? neighbourhoods.find(n => n.name === activeNbhd) : null;
    if (target?.boundary && target.boundary.length >= 3) {
      fitPoints(map, target.boundary.map(([lat, lng]) => ({ lat, lng })), 48, 15.5);
    } else if (target?.lat != null && target?.lng != null) {
      map.easeTo({ center: [target.lng, target.lat], zoom: 15.5 });
    } else if (initialPointsRef.current.length) {
      fitPoints(map, initialPointsRef.current, 32, 13);
    }
  }, [activeNbhd, neighbourhoods]);

  const onMapLoad = (map: MLMap) => {
    mapRef.current = map;
    const pts: { lat: number; lng: number }[] = [];
    neighbourhoods.forEach(n => {
      if (n.boundary && n.boundary.length >= 3) {
        n.boundary.forEach(([lat, lng]) => pts.push({ lat, lng }));
      } else if (n.lat != null && n.lng != null) {
        pts.push({ lat: n.lat, lng: n.lng });
      }
    });
    initialPointsRef.current = pts;
    if (pts.length) fitPoints(map, pts, 32, 13, false);
  };

  const defaultCards = useMemo(() => {
    const loved = spots.filter(s => s.isLoved);
    const hot = spots.filter(s => s.isHotspot && !s.isLoved);
    return [...loved, ...hot].slice(0, 2);
  }, [spots]);

  const cards = useMemo(() => {
    if (!activeNbhd) return defaultCards;
    const inNbhd = spots.filter(s => (s.neighbourhood || '').trim().toLowerCase() === activeNbhd.trim().toLowerCase()).slice(0, 2);
    return inNbhd.length ? inNbhd : defaultCards;
  }, [activeNbhd, spots, defaultCards]);

  useEffect(() => () => timersRef.current.forEach(id => window.clearTimeout(id)), []);

  const runSurprise = () => {
    if (!neighbourhoods.length) return;
    timersRef.current.forEach(id => window.clearTimeout(id));
    setToast({ visible: true, label: t('neighbourhoods.explorerFinding') });
    const t1 = window.setTimeout(() => {
      const pick = neighbourhoods[Math.floor(Math.random() * neighbourhoods.length)];
      onSelectNeighbourhood(pick.name);
      setToast({ visible: true, label: t('neighbourhoods.explorerFound', { count: spotCountFor(pick.name) }) });
    }, 1600);
    const t2 = window.setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    timersRef.current = [t1, t2];
  };

  const slugFor = (spot: Spot) => (spot.neighbourhood ? slugByName.get(spot.neighbourhood.trim().toLowerCase()) : undefined);
  const goToSpot = (spot: Spot) => {
    const slug = slugFor(spot);
    if (slug) navigate(`/neighbourhoods/${encodeURIComponent(slug)}`);
  };

  return (
    <div className={`relative isolate flex flex-col h-[600px] sm:h-[660px] md:h-[700px] rounded-2xl ${mapFailed ? 'overflow-y-auto' : 'overflow-hidden'} border border-gray-200 shadow-lg shadow-xplora-ink/10 bg-[#ECEEE8]`}>
      {hasMapData && !mapFailed ? (
        <MapView center={QC_CENTRE} zoom={13} options={MAP_OPTIONS} onLoad={onMapLoad}>
          {neighbourhoods.map((n, i) => {
            const color = neighbourhoodColor(i);
            const dim = activeNbhd != null && activeNbhd !== n.name;
            const centroid = centroids[n.id];
            const count = spotCountFor(n.name);
            return (
              <div key={n.id}>
                {n.boundary && n.boundary.length >= 3 && (
                  <Polygon
                    path={n.boundary.map(([lat, lng]) => ({ lat, lng }))}
                    color={color}
                    width={activeNbhd === n.name ? 3.5 : 2.5}
                    opacity={dim ? 0.25 : 0.85}
                    fillOpacity={activeNbhd === n.name ? 0.22 : 0.1}
                    onClick={() => selectNeighbourhood(n.name)}
                  />
                )}
                {centroid && (
                  <HtmlMarker position={centroid}>
                    <button
                      type="button"
                      onClick={() => selectNeighbourhood(n.name)}
                      aria-pressed={activeNbhd === n.name}
                      style={{ borderColor: color, color, opacity: dim ? 0.4 : 1 }}
                      className="flex items-center gap-1 px-2.5 py-[3px] rounded-full text-xs font-bold uppercase tracking-wide bg-white/90 border-[1.3px] cursor-pointer whitespace-nowrap shadow-sm transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xplora-ink/40"
                    >
                      {n.name}
                      {count > 0 && <span className="opacity-70">· {count}</span>}
                    </button>
                  </HtmlMarker>
                )}
              </div>
            );
          })}
        </MapView>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#ECEEE8] to-[#dbe4e0]" />
      )}

      {mapFailed && (
        <p role="status" className="relative z-20 mx-4 sm:mx-6 mt-4 sm:mt-5 text-sm text-xplora-ink/70">
          {t('neighbourhoods.explorerMapUnavailable')}
        </p>
      )}

      {/* Search / chip card */}
      <div className={`${mapFailed ? 'relative m-4 sm:m-6' : 'absolute top-4 sm:top-5 left-4 sm:left-6 right-4 sm:right-6 max-h-[calc(100%-32px)] overflow-y-auto'} md:right-auto md:w-[420px] z-20 bg-white/85 backdrop-blur-xl border border-white/60 rounded-2xl p-4 shadow-xl shadow-xplora-ink/15`}>
        <p className="text-xs font-bold uppercase tracking-wide text-primary mb-2.5">{t('neighbourhoods.explorerSearchLabel')}</p>
        <div className="flex flex-wrap gap-2">
          {neighbourhoods.map((n, i) => (
            <button
              key={n.id}
              type="button"
              onClick={() => selectNeighbourhood(n.name)}
              aria-pressed={activeNbhd === n.name}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold border transition-all hover:-translate-y-0.5 ${
                activeNbhd === n.name ? 'text-white border-transparent' : 'bg-[#F7F8F5] text-xplora-ink border-xplora-ink/10'
              }`}
              style={activeNbhd === n.name ? { background: neighbourhoodColor(i) } : undefined}
            >
              <span className="w-2 h-2 rounded-full flex-none" style={{ background: activeNbhd === n.name ? '#fff' : neighbourhoodColor(i) }} />
              {n.name}
              <span className={activeNbhd === n.name ? 'opacity-80' : 'text-xplora-ink/50'}>{spotCountFor(n.name)}</span>
            </button>
          ))}
          <button
            onClick={runSurprise}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold bg-xplora-ink text-white hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('neighbourhoods.explorerSurpriseMe')}
          </button>
        </div>
        {categorizedVisitedCount === 0 && (
          <p className="mt-3 text-xs leading-snug text-xplora-ink/55">{t('neighbourhoods.explorerPanelEmpty')}</p>
        )}
      </div>

      {mapFailed && (
        <ul className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mx-4 sm:mx-6 mb-6">
          {neighbourhoods.filter(n => n.slug).map(n => (
            <li key={n.id}>
              <Link
                to={`/neighbourhoods/${encodeURIComponent(n.slug)}`}
                className="block rounded-2xl bg-white border border-xplora-ink/10 px-4 py-3 hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xplora-ink/40"
              >
                <span className="block font-serif text-[15px] font-semibold text-xplora-ink">{n.name}</span>
                <span className="block text-xs text-xplora-ink/60 mt-0.5">{t('neighbourhoods.explorerSpotCount', { count: spotCountFor(n.name) })}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Neighbourhood side panel — desktop only. Shows this visitor's own
          exploration breakdown: of the places marked "I've been here", what
          share falls in each neighbourhood. */}
      {!mapFailed && categorizedVisitedCount > 0 && (
        <div className="hidden lg:block absolute top-[220px] left-6 z-[15] w-[190px] max-h-[calc(100%-236px)] overflow-y-auto bg-white rounded-2xl p-3.5 shadow-lg shadow-xplora-ink/10">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-xplora-ink/55">{t('neighbourhoods.explorerPanelTitle')}</h3>
            <button
              type="button"
              onClick={() => setShowPanelHint(v => !v)}
              aria-label={t('neighbourhoods.explorerPanelInfoLabel', 'How this works')}
              aria-pressed={showPanelHint}
              className="w-5 h-5 rounded-full flex items-center justify-center text-xplora-ink/40 hover:text-primary hover:bg-xplora-primary/10 transition-colors flex-none"
            >
              {showPanelHint ? <X className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showPanelHint ? (
            <p className="text-[12px] leading-relaxed text-xplora-ink/70">
              {t(
                'neighbourhoods.explorerPanelHint',
                "This is your own exploration breakdown — it fills in as you go. Tap the ✓ on any place card to mark \"I've been here\", and that neighbourhood's share grows."
              )}
            </p>
          ) : (
            neighbourhoods.map((n, i) => {
              const count = visitedCountFor(n.name);
              const pct = categorizedVisitedCount > 0 ? Math.round((count / categorizedVisitedCount) * 100) : 0;
              const isActive = activeNbhd === n.name;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => selectNeighbourhood(n.name)}
                  aria-pressed={isActive}
                  className={`block w-full text-left -mx-1.5 px-1.5 py-1 rounded-lg mb-2 last:mb-0 transition-colors ${isActive ? 'bg-xplora-primary/10' : 'hover:bg-xplora-ink/5'}`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-xplora-ink mb-1">
                    <span className="truncate">{n.name}</span>
                    <span className="text-primary font-bold flex-none ml-1.5">{pct}%</span>
                  </div>
                  <div className="w-16 h-[5px] rounded-full bg-xplora-ink/8 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 3)}%`, background: neighbourhoodColor(i) }} />
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Floating spot cards */}
      {!mapFailed && cards.length > 0 && (
        <div className="absolute bottom-4 sm:bottom-5 left-4 right-4 sm:left-auto sm:right-6 z-[14] flex gap-4 justify-end overflow-x-auto sm:overflow-visible">
          {cards.map((spot, i) => (
            <div
              key={spot.id}
              className={`group relative flex-none w-[168px] sm:w-[188px] rounded-2xl overflow-hidden bg-white border border-xplora-ink/8 shadow-lg shadow-xplora-ink/15 cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both ${
                i === 0 ? '' : 'hidden sm:block'
              }`}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
                {spot.image ? (
                  <img loading="lazy" decoding="async" src={spot.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><MapPin className="w-6 h-6" /></div>
                )}
                <SaveSpotButton spot={spot} />
              </div>
              <div className="p-3">
                <p className="font-serif text-[14px] font-semibold text-xplora-ink leading-tight truncate">
                  {slugFor(spot) ? (
                    <button type="button" onClick={() => goToSpot(spot)} className="block w-full text-left truncate after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-xplora-ink/40">{spot.name}</button>
                  ) : spot.name}
                </p>
                {typeof spot.googleRating === 'number' ? (
                  <span className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Star className="w-3 h-3 fill-xplora-primary text-primary" />
                    <span className="font-medium text-gray-700">{spot.googleRating.toFixed(1)}</span>
                    {spot.neighbourhood && <span className="truncate">· {spot.neighbourhood}</span>}
                  </span>
                ) : spot.neighbourhood ? (
                  <p className="text-xs text-gray-500 mt-1 truncate">{spot.neighbourhood}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Surprise-me toast */}
      <div
        role="status"
        aria-live="polite"
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-[80] min-w-[220px] bg-xplora-ink text-white px-5 py-3.5 rounded-2xl text-[13px] font-semibold shadow-2xl transition-all duration-300 ${
          toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        {toast.label}
      </div>
    </div>
  );
}
