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
}

interface Props {
  value: MapState;
  onChange: (v: MapState) => void;
}

function ringOf(layer: L.Polygon): [number, number][] {
  const lls = layer.getLatLngs()[0] as L.LatLng[];
  return lls.map(ll => [+ll.lat.toFixed(6), +ll.lng.toFixed(6)]);
}

export function NeighbourhoodMap({ value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polyRef = useRef<L.Polygon | null>(null);

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

    // Seed an existing boundary as an editable polygon.
    if (value.boundary && value.boundary.length >= 3) {
      polyRef.current = L.polygon(value.boundary, {
        color: '#12343B', fillColor: '#7ecfcf', fillOpacity: 0.15, weight: 2,
      }).addTo(map);
    }

    // Geoman drawing toolbar (boundary polygon only).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pm = (map as any).pm;
    if (pm) {
      pm.addControls({
        position: 'topright',
        drawMarker: false, drawCircleMarker: false, drawPolyline: false,
        drawRectangle: false, drawCircle: false, drawText: false,
        drawPolygon: true, editMode: true, dragMode: false,
        cutPolygon: false, removalMode: true, rotateMode: false,
      });

      const sync = () => {
        let ring: [number, number][] | null = null;
        map.eachLayer(l => {
          if (l instanceof L.Polygon && !(l instanceof L.Rectangle)) ring = ringOf(l as L.Polygon);
        });
        onChangeRef.current({ ...valueRef.current, boundary: ring });
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.on('pm:create', (e: any) => {
        // Keep a single boundary: drop the previously seeded/drawn polygon.
        if (polyRef.current && polyRef.current !== e.layer) map.removeLayer(polyRef.current);
        polyRef.current = e.layer as L.Polygon;
        e.layer.on('pm:edit', sync);
        sync();
      });
      map.on('pm:remove', () => { polyRef.current = null; sync(); });
      map.on('pm:edit', sync);
      if (polyRef.current) polyRef.current.on('pm:edit', sync);
    }

    // Container may mount at zero size inside the form; recompute after paint.
    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      polyRef.current = null;
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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">Map</label>
        <div className="flex gap-3 text-[11px] text-muted-foreground">
          <span>📍 Click map to set centre pin</span>
          <span>⬡ Use toolbar to draw boundary</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="rounded-xl overflow-hidden border border-border"
        style={{ height: 360 }}
      />

      {(value.lat != null || value.boundary) && (
        <div className="flex gap-4 text-[11px] text-muted-foreground font-mono bg-muted/40 rounded-lg px-3 py-2">
          {value.lat != null && (
            <span>📍 {value.lat}, {value.lng}</span>
          )}
          {value.boundary && (
            <span>⬡ {value.boundary.length} boundary points</span>
          )}
          <button
            type="button"
            onClick={() => onChange({ lat: null, lng: null, boundary: null })}
            className="ml-auto text-red-400 hover:text-red-600 transition"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
