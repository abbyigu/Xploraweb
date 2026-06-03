import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

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

function PinLayer({ value, onChange }: Props) {
  useMapEvents({
    click(e) {
      onChange({ ...value, lat: +e.latlng.lat.toFixed(6), lng: +e.latlng.lng.toFixed(6) });
    },
  });
  return value.lat != null && value.lng != null
    ? <Marker position={[value.lat, value.lng]} />
    : null;
}

function GeomanLayer({ value, onChange }: Props) {
  const map = useMap();
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pm = (map as any).pm;
    if (!pm) return;

    pm.addControls({
      position: 'topright',
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawCircle: false,
      drawText: false,
      drawPolygon: true,
      editMode: true,
      dragMode: false,
      cutPolygon: false,
      removalMode: true,
      rotateMode: false,
    });

    function extractRing(layer: L.Polygon): [number, number][] {
      const lls = layer.getLatLngs()[0] as L.LatLng[];
      return lls.map(ll => [+ll.lat.toFixed(6), +ll.lng.toFixed(6)]);
    }

    function syncAll() {
      const rings: [number, number][][] = [];
      map.eachLayer(l => {
        if (l instanceof L.Polygon && !(l instanceof L.Rectangle)) {
          rings.push(extractRing(l));
        }
      });
      onChange({ ...valueRef.current, boundary: rings.length ? rings[0] : null });
    }

    map.on('pm:create', syncAll);
    map.on('pm:remove', syncAll);
    map.on('pm:edit', syncAll);

    return () => {
      pm.removeControls();
      map.off('pm:create', syncAll);
      map.off('pm:remove', syncAll);
      map.off('pm:edit', syncAll);
    };
  }, [map]);

  return null;
}

function BoundaryLayer({ boundary }: { boundary: [number, number][] | null }) {
  if (!boundary || boundary.length < 3) return null;
  return (
    <Polygon
      positions={boundary}
      pathOptions={{ color: '#12343B', fillColor: '#7ecfcf', fillOpacity: 0.15, weight: 2 }}
    />
  );
}

export function NeighbourhoodMap({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">Map</label>
        <div className="flex gap-3 text-[11px] text-muted-foreground">
          <span>📍 Click map to set centre pin</span>
          <span>⬡ Use toolbar to draw boundary</span>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-border" style={{ height: 360 }}>
        <MapContainer
          center={value.lat != null ? [value.lat, value.lng!] : QC}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <PinLayer value={value} onChange={onChange} />
          <BoundaryLayer boundary={value.boundary} />
          <GeomanLayer value={value} onChange={onChange} />
        </MapContainer>
      </div>

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
