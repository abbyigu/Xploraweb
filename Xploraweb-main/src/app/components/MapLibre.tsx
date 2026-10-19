import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Map as MLMap, MapOptions, LngLatBoundsLike } from 'maplibre-gl';

// Thin React wrapper over MapLibre GL JS. Tiles come from OpenFreeMap
// (free, no API key, no usage fees) — swap STYLE_URL to change provider.
// maplibre-gl is dynamically imported so it stays out of every entry chunk.
// ponytail: public OpenFreeMap instance, self-host or switch to a paid tile
// provider if traffic ever outgrows their fair-use expectations.

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

export type LatLng = { lat: number; lng: number };
type MapLib = typeof import('maplibre-gl');

let libPromise: Promise<MapLib> | null = null;
function loadLib(): Promise<MapLib> {
  libPromise ??= Promise.all([
    import('maplibre-gl'),
    import('maplibre-gl/dist/maplibre-gl.css'),
  ]).then(([m]) => (m as unknown as { default?: MapLib }).default ?? m);
  return libPromise;
}

interface Ctx { map: MLMap; lib: MapLib }
const MapCtx = createContext<Ctx | null>(null);
const useMapCtx = () => useContext(MapCtx);

export function toBounds(points: LatLng[]): LngLatBoundsLike | null {
  if (!points.length) return null;
  let [w, s, e, n] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const p of points) {
    w = Math.min(w, p.lng); e = Math.max(e, p.lng);
    s = Math.min(s, p.lat); n = Math.max(n, p.lat);
  }
  return [[w, s], [e, n]];
}

/** Fits the camera to the given points; a single point just centres with `singleZoom`. */
export function fitPoints(map: MLMap, points: LatLng[], padding: number, singleZoom: number, animate = true) {
  if (points.length === 1) {
    map.easeTo({ center: [points[0].lng, points[0].lat], zoom: singleZoom, duration: animate ? 500 : 0 });
    return;
  }
  const b = toBounds(points);
  if (b) map.fitBounds(b, { padding, duration: animate ? 500 : 0, maxZoom: 17 });
}

interface MapViewProps {
  center: LatLng;
  zoom: number;
  options?: Partial<MapOptions>;
  className?: string;
  /** Called once with the live map (style loaded) — use for initial camera fit and refs. */
  onLoad?: (map: MLMap) => void;
  onUnmount?: () => void;
  /** Map-level click, e.g. the admin editor's "drop a pin". */
  onClick?: (ll: LatLng) => void;
  children?: ReactNode;
}

export function MapView({ center, zoom, options, className, onLoad, onUnmount, onClick, children }: MapViewProps) {
  const el = useRef<HTMLDivElement>(null);
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const cb = useRef({ onLoad, onUnmount, onClick });
  cb.current = { onLoad, onUnmount, onClick };

  useEffect(() => {
    let map: MLMap | null = null;
    let cancelled = false;
    loadLib().then(lib => {
      if (cancelled || !el.current) return;
      map = new lib.Map({
        container: el.current,
        style: STYLE_URL,
        center: [center.lng, center.lat],
        zoom,
        attributionControl: { compact: true },
        ...options,
      });
      map.on('click', e => {
        // Clicks on markers/handles bubble up to the map; they aren't map clicks.
        if ((e.originalEvent.target as HTMLElement | null)?.closest?.('.maplibregl-marker, .maplibregl-popup')) return;
        cb.current.onClick?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });
      // 'style.load' (not 'load') so overlays don't wait on every base tile.
      map.once('style.load', () => {
        if (cancelled || !map) return;
        cb.current.onLoad?.(map);
        setCtx({ map, lib });
      });
    });
    return () => {
      cancelled = true;
      cb.current.onUnmount?.();
      map?.remove();
      setCtx(null);
    };
    // Mount once; camera changes go through the map instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={el} className={className} style={{ width: '100%', height: '100%' }}>
      {ctx && <MapCtx.Provider value={ctx}>{children}</MapCtx.Provider>}
    </div>
  );
}

/** HTML marker whose contents are ordinary React children (rendered via a portal). */
export function HtmlMarker({ position, anchor = 'center', draggable, onDragEnd, children }: {
  position: LatLng;
  anchor?: 'center' | 'bottom';
  draggable?: boolean;
  onDragEnd?: (ll: LatLng) => void;
  children?: ReactNode;
}) {
  const ctx = useMapCtx()!;
  const [node] = useState(() => document.createElement('div'));
  const markerRef = useRef<InstanceType<MapLib['Marker']> | null>(null);
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  useEffect(() => {
    const marker = new ctx.lib.Marker({ element: node, anchor, draggable })
      .setLngLat([position.lng, position.lat])
      .addTo(ctx.map);
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLngLat();
      onDragEndRef.current?.({ lat, lng });
    });
    markerRef.current = marker;
    return () => { marker.remove(); markerRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, anchor, draggable]);

  useEffect(() => { markerRef.current?.setLngLat([position.lng, position.lat]); }, [position.lat, position.lng]);

  return createPortal(children, node);
}

/** Popup (the InfoWindow replacement) with React content. */
export function MapPopup({ position, onClose, offset = 0, children }: {
  position: LatLng;
  onClose: () => void;
  offset?: number;
  children?: ReactNode;
}) {
  const ctx = useMapCtx()!;
  const [node] = useState(() => document.createElement('div'));
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const popup = new ctx.lib.Popup({ offset, maxWidth: '220px', closeOnClick: false })
      .setLngLat([position.lng, position.lat])
      .setDOMContent(node)
      .addTo(ctx.map);
    let disposed = false;
    popup.on('close', () => { if (!disposed) closeRef.current(); });
    return () => { disposed = true; popup.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, position.lat, position.lng]);

  return createPortal(children, node);
}

let shapeSeq = 0;

interface ShapeProps {
  path: LatLng[];
  color: string;
  width?: number;
  opacity?: number;
  /** Polygons only. */
  fillColor?: string;
  fillOpacity?: number;
  onClick?: () => void;
}

function useShape(kind: 'polygon' | 'line', p: ShapeProps) {
  const ctx = useMapCtx()!;
  const [id] = useState(() => `shape-${++shapeSeq}`);
  const clickRef = useRef(p.onClick);
  clickRef.current = p.onClick;

  const coords = p.path.map(q => [q.lng, q.lat]);
  const data: GeoJSON.Feature = kind === 'polygon'
    ? { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[...coords, coords[0]]] } }
    : { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } };

  useEffect(() => {
    const { map } = ctx;
    map.addSource(id, { type: 'geojson', data });
    if (kind === 'polygon') {
      map.addLayer({ id: `${id}-fill`, type: 'fill', source: id, paint: {} });
    }
    map.addLayer({
      id: `${id}-line`, type: 'line', source: id,
      layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: {},
    });
    const click = (e: { originalEvent: MouseEvent }) => {
      if ((e.originalEvent.target as HTMLElement | null)?.closest?.('.maplibregl-marker, .maplibregl-popup')) return;
      clickRef.current?.();
    };
    const target = `${id}-${kind === 'polygon' ? 'fill' : 'line'}`;
    if (p.onClick) {
      map.on('click', target, click);
      map.on('mouseenter', target, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', target, () => { map.getCanvas().style.cursor = ''; });
    }
    return () => {
      if (!map.getStyle()) return;
      [`${id}-fill`, `${id}-line`].forEach(l => map.getLayer(l) && map.removeLayer(l));
      if (map.getSource(id)) map.removeSource(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, kind, !!p.onClick]);

  useEffect(() => {
    const { map } = ctx;
    (map.getSource(id) as import('maplibre-gl').GeoJSONSource | undefined)?.setData(data);
    if (kind === 'polygon') {
      map.setPaintProperty(`${id}-fill`, 'fill-color', p.fillColor ?? p.color);
      map.setPaintProperty(`${id}-fill`, 'fill-opacity', p.fillOpacity ?? 0.1);
    }
    map.setPaintProperty(`${id}-line`, 'line-color', p.color);
    map.setPaintProperty(`${id}-line`, 'line-width', p.width ?? 2);
    map.setPaintProperty(`${id}-line`, 'line-opacity', p.opacity ?? 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });
}

export function Polygon(p: ShapeProps) { useShape('polygon', p); return null; }
export function Polyline(p: ShapeProps) { useShape('line', p); return null; }
