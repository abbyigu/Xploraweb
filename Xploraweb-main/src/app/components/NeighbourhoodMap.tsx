import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

// Rendered with vanilla Leaflet (not react-leaflet): react-leaflet v5 requires
// React 19 and crashes under React 18, blanking the page. Same approach as
// ExperienceMap.

// Fix Leaflet default marker icons broken by Vite bundling
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9/dist/images/marker-shadow.png',
});

const QC: [number, number] = [46.8139, -71.208];

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

// Style for the highlighted walk route (e.g. "stroll rue du Petit-Champlain").
const ROUTE_STYLE: L.PolylineOptions = {
  color: '#12343B', weight: 6, opacity: 0.9, lineCap: 'round', lineJoin: 'round',
};

function ringOf(layer: L.Polygon): [number, number][] {
  const lls = layer.getLatLngs()[0] as L.LatLng[];
  return lls.map(ll => [+ll.lat.toFixed(6), +ll.lng.toFixed(6)]);
}

function lineOf(layer: L.Polyline): [number, number][] {
  const lls = layer.getLatLngs() as L.LatLng[];
  return lls.map(ll => [+ll.lat.toFixed(6), +ll.lng.toFixed(6)]);
}

export function NeighbourhoodMap({ value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polyRef = useRef<L.Polygon | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);

  // Keep the latest value/onChange reachable from Leaflet event handlers
  // without re-initialising the map.
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // ── Init map once ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(
      value.lat != null && value.lng != null ? [value.lat, value.lng] : QC,
      14,
    );
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Click to set the centre pin.
    map.on('click', (e: L.LeafletMouseEvent) => {
      onChangeRef.current({
        ...valueRef.current,
        lat: +e.latlng.lat.toFixed(6),
        lng: +e.latlng.lng.toFixed(6),
      });
    });

    const syncBoundary = () =>
      onChangeRef.current({ ...valueRef.current, boundary: polyRef.current ? ringOf(polyRef.current) : null });
    const syncRoute = () =>
      onChangeRef.current({ ...valueRef.current, route: routeRef.current ? lineOf(routeRef.current) : null });

    // Seed an existing boundary as an editable polygon.
    if (value.boundary && value.boundary.length >= 3) {
      polyRef.current = L.polygon(value.boundary, {
        color: '#12343B', fillColor: '#7ecfcf', fillOpacity: 0.15, weight: 2,
      }).addTo(map);
      polyRef.current.on('pm:edit', syncBoundary);
    }

    // Seed an existing walk route as an editable polyline.
    if (value.route && value.route.length >= 2) {
      routeRef.current = L.polyline(value.route, ROUTE_STYLE).addTo(map);
      routeRef.current.on('pm:edit', syncRoute);
    }

    // Geoman drawing toolbar (boundary polygon + walk-route polyline).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pm = (map as any).pm;
    if (pm) {
      pm.addControls({
        position: 'topright',
        drawMarker: false, drawCircleMarker: false, drawPolyline: true,
        drawRectangle: false, drawCircle: false, drawText: false,
        drawPolygon: true, editMode: true, dragMode: false,
        cutPolygon: false, removalMode: true, rotateMode: false,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.on('pm:create', (e: any) => {
        if (e.shape === 'Line') {
          // Keep a single walk route: drop the previously seeded/drawn line.
          if (routeRef.current && routeRef.current !== e.layer) map.removeLayer(routeRef.current);
          routeRef.current = e.layer as L.Polyline;
          routeRef.current.setStyle(ROUTE_STYLE);
          e.layer.on('pm:edit', syncRoute);
          syncRoute();
        } else {
          // Keep a single boundary: drop the previously seeded/drawn polygon.
          if (polyRef.current && polyRef.current !== e.layer) map.removeLayer(polyRef.current);
          polyRef.current = e.layer as L.Polygon;
          e.layer.on('pm:edit', syncBoundary);
          syncBoundary();
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.on('pm:remove', (e: any) => {
        if (e.layer === routeRef.current) { routeRef.current = null; syncRoute(); }
        else if (e.layer === polyRef.current) { polyRef.current = null; syncBoundary(); }
      });
    }

    // Container may mount at zero size inside the form; recompute after paint.
    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      polyRef.current = null;
      routeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync the centre marker to value (covers clicks + "Clear all") ───────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (value.lat != null && value.lng != null) {
      if (markerRef.current) markerRef.current.setLatLng([value.lat, value.lng]);
      else markerRef.current = L.marker([value.lat, value.lng]).addTo(map);
    } else if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  }, [value.lat, value.lng]);

  // ── Remove the boundary polygon when cleared from outside ───────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if ((!value.boundary || value.boundary.length < 3) && polyRef.current) {
      map.removeLayer(polyRef.current);
      polyRef.current = null;
    }
  }, [value.boundary]);

  // ── Remove the walk route when cleared from outside ─────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if ((!value.route || value.route.length < 2) && routeRef.current) {
      map.removeLayer(routeRef.current);
      routeRef.current = null;
    }
  }, [value.route]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">Map</label>
        <div className="flex gap-3 text-[11px] text-muted-foreground">
          <span>📍 Click map to set centre pin</span>
          <span>⬡ Draw boundary</span>
          <span>〰 Draw walk route</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="rounded-xl overflow-hidden border border-border"
        style={{ height: 360 }}
      />

      {(value.lat != null || value.boundary || value.route) && (
        <div className="flex gap-4 text-[11px] text-muted-foreground font-mono bg-muted/40 rounded-lg px-3 py-2">
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
