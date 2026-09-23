import { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';

// Uses the raw Google Maps JS API imperatively (not the declarative
// <GoogleMap>/<PolygonF> components) so live vertex edits never fight with
// React re-rendering a controlled `path` prop — mirrors the mount-once
// imperative style the old Leaflet version used. Drawing is a small
// click-to-add-points tool (Google removed the Drawing library's
// DrawingManager in Maps JS v3.65).

const QC = { lat: 46.8139, lng: -71.208 };

export interface MapState {
  lat: number | null;
  lng: number | null;
  boundary: [number, number][] | null; // ring of [lat, lng] pairs
  route: [number, number][] | null; // walk-route polyline of [lat, lng] pairs
}

interface Props {
  value: MapState;
  onChange: (v: MapState) => void;
}

const BOUNDARY_STYLE: google.maps.PolygonOptions = {
  strokeColor: '#12343B', fillColor: '#7ecfcf', fillOpacity: 0.15, strokeWeight: 2,
  editable: true, draggable: false,
};

// Style for the highlighted walk route (e.g. "stroll rue du Petit-Champlain").
const ROUTE_STYLE: google.maps.PolylineOptions = {
  strokeColor: '#12343B', strokeWeight: 6, strokeOpacity: 0.9, editable: true, draggable: false,
};

function ringOf(path: google.maps.MVCArray<google.maps.LatLng>): [number, number][] {
  return path.getArray().map(ll => [+ll.lat().toFixed(6), +ll.lng().toFixed(6)]);
}

function lineOf(path: google.maps.MVCArray<google.maps.LatLng>): [number, number][] {
  return path.getArray().map(ll => [+ll.lat().toFixed(6), +ll.lng().toFixed(6)]);
}

export function NeighbourhoodMap({ value, onChange }: Props) {
  const { isLoaded } = useGoogleMaps();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const polyRef = useRef<google.maps.Polygon | null>(null);
  const routeRef = useRef<google.maps.Polyline | null>(null);
  const draftRef = useRef<google.maps.Polygon | google.maps.Polyline | null>(null);
  const draftPtsRef = useRef<google.maps.LatLng[]>([]);
  const modeRef = useRef<'boundary' | 'route' | null>(null);
  const [mode, setModeState] = useState<'boundary' | 'route' | null>(null);
  const [ptCount, setPtCount] = useState(0);
  const setMode = (m: 'boundary' | 'route' | null) => { modeRef.current = m; setModeState(m); };

  // Keep the latest value/onChange reachable from map event handlers
  // without re-initialising the map.
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const syncBoundary = () =>
    onChangeRef.current({ ...valueRef.current, boundary: polyRef.current ? ringOf(polyRef.current.getPath()) : null });
  const syncRoute = () =>
    onChangeRef.current({ ...valueRef.current, route: routeRef.current ? lineOf(routeRef.current.getPath()) : null });

  const attachPathListeners = (path: google.maps.MVCArray<google.maps.LatLng>, sync: () => void) => {
    path.addListener('insert_at', sync);
    path.addListener('remove_at', sync);
    path.addListener('set_at', sync);
  };

  const discardDraft = () => {
    draftRef.current?.setMap(null);
    draftRef.current = null;
    draftPtsRef.current = [];
    setPtCount(0);
    setMode(null);
  };

  const startDraw = (kind: 'boundary' | 'route') => {
    const map = mapRef.current;
    if (!map) return;
    discardDraft();
    const draft = kind === 'boundary'
      ? new google.maps.Polygon({ ...BOUNDARY_STYLE, editable: false, clickable: false, map })
      : new google.maps.Polyline({ ...ROUTE_STYLE, editable: false, clickable: false, map });
    draftRef.current = draft;
    setMode(kind);
  };

  const finishDraw = () => {
    const kind = modeRef.current;
    const draft = draftRef.current;
    const pts = draftPtsRef.current;
    if (!kind || !draft || pts.length < (kind === 'boundary' ? 3 : 2)) { discardDraft(); return; }
    draft.setOptions({ editable: true, clickable: true });
    draftRef.current = null;
    draftPtsRef.current = [];
    setPtCount(0);
    setMode(null);
    // Keep a single shape of each kind: drop the previous one.
    if (kind === 'boundary') {
      polyRef.current?.setMap(null);
      polyRef.current = draft as google.maps.Polygon;
      attachPathListeners(polyRef.current.getPath(), syncBoundary);
      syncBoundary();
    } else {
      routeRef.current?.setMap(null);
      routeRef.current = draft as google.maps.Polyline;
      attachPathListeners(routeRef.current.getPath(), syncRoute);
      syncRoute();
    }
  };

  // ── Init map once (after the SDK has loaded) ────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !containerRef.current || mapRef.current) return;

    const map = new google.maps.Map(containerRef.current, {
      center: value.lat != null && value.lng != null ? { lat: value.lat, lng: value.lng } : QC,
      zoom: 14,
      streetViewControl: false,
      mapTypeControl: false,
    });
    mapRef.current = map;

    // Click to set the centre pin.
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      // While drawing, clicks add vertices instead of moving the pin.
      if (modeRef.current && draftRef.current) {
        draftPtsRef.current = [...draftPtsRef.current, e.latLng];
        draftRef.current.setPath(draftPtsRef.current);
        setPtCount(draftPtsRef.current.length);
        return;
      }
      onChangeRef.current({
        ...valueRef.current,
        lat: +e.latLng.lat().toFixed(6),
        lng: +e.latLng.lng().toFixed(6),
      });
    });

    // Seed an existing boundary as an editable polygon.
    if (value.boundary && value.boundary.length >= 3) {
      const polygon = new google.maps.Polygon({ ...BOUNDARY_STYLE, paths: value.boundary.map(([lat, lng]) => ({ lat, lng })) });
      polygon.setMap(map);
      polyRef.current = polygon;
      attachPathListeners(polygon.getPath(), syncBoundary);
    }

    // Seed an existing walk route as an editable polyline.
    if (value.route && value.route.length >= 2) {
      const polyline = new google.maps.Polyline({ ...ROUTE_STYLE, path: value.route.map(([lat, lng]) => ({ lat, lng })) });
      polyline.setMap(map);
      routeRef.current = polyline;
      attachPathListeners(polyline.getPath(), syncRoute);
    }

    return () => {
      draftRef.current?.setMap(null);
      polyRef.current?.setMap(null);
      routeRef.current?.setMap(null);
      markerRef.current?.setMap(null);
      mapRef.current = null;
      markerRef.current = null;
      polyRef.current = null;
      routeRef.current = null;
      draftRef.current = null;
      draftPtsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // ── Sync the centre marker to value (covers clicks + "Clear all") ───────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (value.lat != null && value.lng != null) {
      if (markerRef.current) markerRef.current.setPosition({ lat: value.lat, lng: value.lng });
      else markerRef.current = new google.maps.Marker({ position: { lat: value.lat, lng: value.lng }, map });
    } else if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
  }, [value.lat, value.lng]);

  // ── Remove the boundary polygon when cleared from outside ───────────────────
  useEffect(() => {
    if ((!value.boundary || value.boundary.length < 3) && polyRef.current) {
      polyRef.current.setMap(null);
      polyRef.current = null;
    }
  }, [value.boundary]);

  // ── Remove the walk route when cleared from outside ─────────────────────────
  useEffect(() => {
    if ((!value.route || value.route.length < 2) && routeRef.current) {
      routeRef.current.setMap(null);
      routeRef.current = null;
    }
  }, [value.route]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">Map</label>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>📍 Click map to set centre pin</span>
                  </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {mode ? (
          <>
            <span className="text-muted-foreground">
              Click the map to add points ({ptCount}) — {mode === 'boundary' ? 'at least 3' : 'at least 2'}.
            </span>
            <button type="button" onClick={finishDraw} className="px-3 py-1 rounded-lg bg-[#12343B] text-white">Finish</button>
            <button type="button" onClick={discardDraft} className="px-3 py-1 rounded-lg border border-border">Cancel</button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => startDraw('boundary')} className="px-3 py-1 rounded-lg border border-border hover:bg-muted">⬡ Draw boundary</button>
            <button type="button" onClick={() => startDraw('route')} className="px-3 py-1 rounded-lg border border-border hover:bg-muted">〰 Draw walk route</button>
          </>
        )}
      </div>

      <div
        ref={containerRef}
        className="rounded-xl overflow-hidden border border-border"
        style={{ height: 360 }}
      />

      {(value.lat != null || value.boundary || value.route) && (
        <div className="flex gap-4 text-xs text-muted-foreground font-mono bg-muted/40 rounded-lg px-3 py-2">
          {value.lat != null && (
            <span>📍 {value.lat}, {value.lng}</span>
          )}
          {value.boundary && (
            <span>⬡ {value.boundary.length} boundary points</span>
          )}
          {value.route && (
            <span>〰 {value.route.length}-point route</span>
          )}
          <button
            type="button"
            onClick={() => onChange({ lat: null, lng: null, boundary: null, route: null })}
            className="ml-auto text-red-400 hover:text-red-600 transition"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
