import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart, MapPin, Sparkles, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GoogleMap, OverlayViewF, OVERLAY_MOUSE_TARGET, PolygonF } from '@react-google-maps/api';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { type Neighbourhood } from '../hooks/useNeighbourhoods';
import type { Spot } from '../data/products';
import { neighbourhoodColor } from '../lib/neighbourhoodColors';

// The /neighbourhoods page's interactive map: replaces the old plain
// NeighbourhoodsOverviewMap with a live explorer — coloured polygons/labels
// per neighbourhood, a search-chip picker, a spot-count side panel, and
// floating spot cards that filter to whichever neighbourhood is selected.

const QC_CENTRE = { lat: 46.8139, lng: -71.208 };
const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  scrollwheel: false,
  streetViewControl: false,
  mapTypeControl: false,
  // 'greedy' so a single-finger touch drag pans the map directly on mobile —
  // 'cooperative' requires a two-finger gesture to pan, which just eats a
  // normal one-finger swipe (feels broken/unresponsive on phones).
  gestureHandling: 'greedy',
};

function centroidOf(boundary: [number, number][]) {
  const bounds = new google.maps.LatLngBounds();
  boundary.forEach(([lat, lng]) => bounds.extend({ lat, lng }));
  const c = bounds.getCenter();
  return { lat: c.lat(), lng: c.lng() };
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
  const { isLoaded } = useGoogleMaps();
  const mapRef = useRef<google.maps.Map | null>(null);
  const initialBoundsRef = useRef<google.maps.LatLngBounds | null>(null);
  const timersRef = useRef<number[]>([]);

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ visible: boolean; label: string }>({ visible: false, label: '' });

  const hasMapData = useMemo(
    () => neighbourhoods.some(n => (n.boundary && n.boundary.length >= 3) || (n.lat != null && n.lng != null)),
    [neighbourhoods]
  );

  const slugByName = useMemo(() => new Map(neighbourhoods.map(n => [n.name.trim().toLowerCase(), n.slug])), [neighbourhoods]);

  // Live spot-count share per neighbourhood — real data, no fabricated metric.
  const categorizedSpotCount = useMemo(() => spots.filter(s => (s.neighbourhood || '').trim()).length, [spots]);
  const spotCountFor = (name: string) =>
    spots.filter(s => (s.neighbourhood || '').trim().toLowerCase() === name.trim().toLowerCase()).length;

  const centroids = useMemo(() => {
    if (!isLoaded) return {} as Record<string, { lat: number; lng: number }>;
    const map: Record<string, { lat: number; lng: number }> = {};
    neighbourhoods.forEach(n => {
      if (n.boundary && n.boundary.length >= 3) {
        map[n.id] = centroidOf(n.boundary);
      } else if (n.lat != null && n.lng != null) {
        map[n.id] = { lat: n.lat, lng: n.lng };
      }
    });
    return map;
  }, [isLoaded, neighbourhoods]);

  const selectNeighbourhood = (name: string) => {
    onSelectNeighbourhood(activeNbhd === name ? null : name);
  };

  // Pan/zoom the map to whatever's selected (or back to the full view).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;
    const target = activeNbhd ? neighbourhoods.find(n => n.name === activeNbhd) : null;
    if (target?.boundary && target.boundary.length >= 3) {
      const bounds = new google.maps.LatLngBounds();
      target.boundary.forEach(([lat, lng]) => bounds.extend({ lat, lng }));
      map.fitBounds(bounds, 48);
    } else if (target?.lat != null && target?.lng != null) {
      map.panTo({ lat: target.lat, lng: target.lng });
      map.setZoom(15.5);
    } else if (initialBoundsRef.current) {
      map.fitBounds(initialBoundsRef.current, 32);
    }
  }, [activeNbhd, isLoaded, neighbourhoods]);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    const bounds = new google.maps.LatLngBounds();
    let count = 0;
    neighbourhoods.forEach(n => {
      if (n.boundary && n.boundary.length >= 3) {
        n.boundary.forEach(([lat, lng]) => { bounds.extend({ lat, lng }); count++; });
      } else if (n.lat != null && n.lng != null) {
        bounds.extend({ lat: n.lat, lng: n.lng });
        count++;
      }
    });
    if (count > 0) {
      initialBoundsRef.current = bounds;
      map.fitBounds(bounds, 32);
    }
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

  const toggleLiked = (id: string) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

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

  const goToSpot = (spot: Spot) => {
    const slug = spot.neighbourhood ? slugByName.get(spot.neighbourhood.trim().toLowerCase()) : undefined;
    if (slug) navigate(`/neighbourhoods/${encodeURIComponent(slug)}`);
  };

  return (
    <div className="relative flex flex-col h-[600px] sm:h-[660px] md:h-[700px] rounded-2xl overflow-hidden border border-gray-200 shadow-lg shadow-[#12343B]/10 bg-[#ECEEE8]">
      {isLoaded && hasMapData ? (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={QC_CENTRE}
          zoom={13}
          options={MAP_OPTIONS}
          onLoad={onMapLoad}
        >
          {neighbourhoods.map((n, i) => {
            const color = neighbourhoodColor(i);
            const dim = activeNbhd != null && activeNbhd !== n.name;
            const centroid = centroids[n.id];
            const count = spotCountFor(n.name);
            return (
              <div key={n.id}>
                {n.boundary && n.boundary.length >= 3 && (
                  <PolygonF
                    path={n.boundary.map(([lat, lng]) => ({ lat, lng }))}
                    options={{
                      strokeColor: color,
                      strokeWeight: activeNbhd === n.name ? 3.5 : 2.5,
                      strokeOpacity: dim ? 0.25 : 0.85,
                      fillColor: color,
                      fillOpacity: activeNbhd === n.name ? 0.22 : 0.1,
                    }}
                    onClick={() => selectNeighbourhood(n.name)}
                  />
                )}
                {centroid && (
                  <OverlayViewF position={centroid} mapPaneName={OVERLAY_MOUSE_TARGET} getPixelPositionOffset={(w, h) => ({ x: -w / 2, y: -h / 2 })}>
                    <div
                      onClick={() => selectNeighbourhood(n.name)}
                      style={{ borderColor: color, color, opacity: dim ? 0.4 : 1 }}
                      className="flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[10px] font-bold uppercase tracking-wide bg-white/90 border-[1.3px] cursor-pointer whitespace-nowrap shadow-sm transition-opacity"
                    >
                      {n.name}
                      {count > 0 && <span className="opacity-70">· {count}</span>}
                    </div>
                  </OverlayViewF>
                )}
              </div>
            );
          })}
        </GoogleMap>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#ECEEE8] to-[#dbe4e0]" />
      )}

      {/* Search / chip card */}
      <div className="absolute top-4 sm:top-5 left-4 sm:left-6 right-4 sm:right-6 md:right-auto md:w-[420px] max-h-[calc(100%-32px)] overflow-y-auto z-20 bg-white/85 backdrop-blur-xl border border-white/60 rounded-2xl p-4 shadow-xl shadow-[#12343B]/15">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#119FB3] mb-2.5">{t('neighbourhoods.explorerSearchLabel')}</p>
        <div className="flex flex-wrap gap-2">
          {neighbourhoods.map((n, i) => (
            <button
              key={n.id}
              onClick={() => selectNeighbourhood(n.name)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold border transition-all hover:-translate-y-0.5 ${
                activeNbhd === n.name ? 'text-white border-transparent' : 'bg-[#F7F8F5] text-[#12343B] border-[#12343B]/10'
              }`}
              style={activeNbhd === n.name ? { background: neighbourhoodColor(i) } : undefined}
            >
              <span className="w-2 h-2 rounded-full flex-none" style={{ background: activeNbhd === n.name ? '#fff' : neighbourhoodColor(i) }} />
              {n.name}
              <span className={activeNbhd === n.name ? 'opacity-80' : 'text-[#12343B]/50'}>{spotCountFor(n.name)}</span>
            </button>
          ))}
          <button
            onClick={runSurprise}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold bg-[#12343B] text-white hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('neighbourhoods.explorerSurpriseMe')}
          </button>
        </div>
      </div>

      {/* Neighbourhood side panel — desktop only */}
      {neighbourhoods.length > 0 && (
        <div className="hidden lg:block absolute top-[220px] left-6 z-[15] w-[190px] max-h-[calc(100%-236px)] overflow-y-auto bg-white rounded-2xl p-3.5 shadow-lg shadow-[#12343B]/10">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-[#12343B]/55 mb-2.5">{t('neighbourhoods.explorerPanelTitle')}</h3>
          {neighbourhoods.map((n, i) => {
            const count = spotCountFor(n.name);
            const pct = categorizedSpotCount > 0 ? Math.round((count / categorizedSpotCount) * 100) : 0;
            const isActive = activeNbhd === n.name;
            return (
              <button
                key={n.id}
                onClick={() => selectNeighbourhood(n.name)}
                className={`block w-full text-left -mx-1.5 px-1.5 py-1 rounded-lg mb-2 last:mb-0 transition-colors ${isActive ? 'bg-[#119FB3]/10' : 'hover:bg-[#12343B]/5'}`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-[#12343B] mb-1">
                  <span className="truncate">{n.name}</span>
                  <span className="text-[#119FB3] font-bold flex-none ml-1.5">{pct}%</span>
                </div>
                <div className="w-16 h-[5px] rounded-full bg-[#12343B]/8 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 3)}%`, background: neighbourhoodColor(i) }} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Floating spot cards */}
      {cards.length > 0 && (
        <div className="absolute bottom-4 sm:bottom-5 left-4 right-4 sm:left-auto sm:right-6 z-[14] flex gap-4 justify-end overflow-x-auto sm:overflow-visible">
          {cards.map((spot, i) => (
            <div
              key={spot.id}
              onClick={() => goToSpot(spot)}
              className={`group flex-none w-[168px] sm:w-[188px] rounded-2xl overflow-hidden bg-white border border-[#12343B]/8 shadow-lg shadow-[#12343B]/15 cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both ${
                i === 0 ? '' : 'hidden sm:block'
              }`}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
                {spot.image ? (
                  <img src={spot.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><MapPin className="w-6 h-6" /></div>
                )}
                <button
                  onClick={e => { e.stopPropagation(); toggleLiked(spot.id); }}
                  aria-label={t('a11y.toggleLike', 'Like')}
                  className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    likedIds.has(spot.id) ? 'bg-[#119FB3]' : 'bg-white/85 hover:bg-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${likedIds.has(spot.id) ? 'fill-white stroke-white' : 'stroke-[#12343B]'}`} />
                </button>
              </div>
              <div className="p-3">
                <p className="font-serif text-[14px] font-semibold text-[#12343B] leading-tight truncate">{spot.name}</p>
                {typeof spot.googleRating === 'number' ? (
                  <span className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                    <Star className="w-3 h-3 fill-[#119FB3] text-[#119FB3]" />
                    <span className="font-medium text-gray-700">{spot.googleRating.toFixed(1)}</span>
                    {spot.neighbourhood && <span className="truncate">· {spot.neighbourhood}</span>}
                  </span>
                ) : spot.neighbourhood ? (
                  <p className="text-[11px] text-gray-500 mt-1 truncate">{spot.neighbourhood}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Surprise-me toast */}
      <div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-[80] min-w-[220px] bg-[#12343B] text-white px-5 py-3.5 rounded-2xl text-[13px] font-semibold shadow-2xl transition-all duration-300 ${
          toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        {toast.label}
      </div>
    </div>
  );
}
