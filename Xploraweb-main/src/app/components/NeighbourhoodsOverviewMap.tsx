import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Neighbourhood } from '../hooks/useNeighbourhoods';
import { localizedTagline } from '../hooks/useNeighbourhoods';
import type { Spot } from '../data/products';

// Read-only overview map for the /neighbourhoods listing page: one pin/shape
// per neighbourhood, each in its own colour, click-through to its page, plus
// every spot from the shared spots library plotted as a small dot in its
// neighbourhood's colour.
// Vanilla Leaflet (not react-leaflet) — same approach as NeighbourhoodMap /
// NeighbourhoodSpotsMap (react-leaflet v5 needs React 19 and crashes here).

const QC_CENTRE: [number, number] = [46.8139, -71.208];

// Distinct, high-contrast colours, one per neighbourhood. Cycles if more
// neighbourhoods exist than swatches, so new additions always get a colour.
const PALETTE = [
  '#12343B', '#E07A5F', '#3D8B8B', '#B08968', '#5B6C9E',
  '#C9A227', '#7B4B94', '#2E7D32', '#C1447E', '#4A6741',
];

function colorFor(index: number) {
  return PALETTE[index % PALETTE.length];
}

function markerIcon(color: string) {
  return L.divIcon({
    className: 'xplora-nbhd-marker',
    html: `<svg width="26" height="34" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 13.6 22 14.2 22.5.5.4 1.2.4 1.7 0C16.4 37 30 25.5 30 15 30 6.7 23.3 0 15 0z" fill="${color}"/>
      <circle cx="15" cy="15" r="5.5" fill="#ffffff"/>
    </svg>`,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -30],
  });
}

// Neutral fallback for spots whose `neighbourhood` text doesn't match any
// known neighbourhood name (typo, or the field is empty).
const UNMATCHED_SPOT_COLOR = '#9CA3AF';

interface Props {
  neighbourhoods: Neighbourhood[];
  lang: string;
  spots?: Spot[];
}

export function NeighbourhoodsOverviewMap({ neighbourhoods, lang, spots = [] }: Props) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const spotLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  // Init map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(QC_CENTRE, 13);
    mapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    spotLayerGroupRef.current = L.layerGroup().addTo(map);

    setTimeout(() => map.invalidateSize(), 80);

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
      spotLayerGroupRef.current = null;
    };
  }, []);

  // Rebuild the neighbourhood layers whenever the list changes, so newly
  // added neighbourhoods show up as soon as they load — no map remount.
  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;
    group.clearLayers();

    const goTo = (n: Neighbourhood) => navigateRef.current(`/neighbourhoods/${encodeURIComponent(n.slug || n.id)}`);
    const fitPoints: [number, number][] = [];

    neighbourhoods.forEach((n, i) => {
      const color = colorFor(i);
      const tagline = localizedTagline(n, lang);
      const popupHtml = `<div style="font-family:inherit"><div style="font-size:14px;font-weight:600">${n.name}</div>${
        tagline ? `<div style="font-size:12px;color:#6b7280;margin-top:2px">${tagline}</div>` : ''
      }</div>`;

      if (n.boundary && n.boundary.length >= 3) {
        L.polygon(n.boundary, { color, fillColor: color, fillOpacity: 0.2, weight: 2 })
          .addTo(group)
          .bindPopup(popupHtml)
          .on('click', () => goTo(n));
        n.boundary.forEach(p => fitPoints.push(p));
      }

      if (n.lat != null && n.lng != null) {
        const pos: [number, number] = [n.lat, n.lng];
        fitPoints.push(pos);
        L.marker(pos, { icon: markerIcon(color) })
          .addTo(group)
          .bindPopup(popupHtml)
          .on('click', () => goTo(n));
      }
    });

    if (fitPoints.length === 1) {
      map.setView(fitPoints[0], 14);
    } else if (fitPoints.length > 1) {
      map.fitBounds(L.latLngBounds(fitPoints), { padding: [30, 30], maxZoom: 15 });
    }
  }, [neighbourhoods, lang]);

  // Rebuild spot dots whenever the spots list (or neighbourhood colours)
  // change. Kept in a separate layer/effect from the neighbourhood
  // pins/shapes above so re-fitting the map to neighbourhoods never jumps
  // around just because a spot loaded a moment later.
  useEffect(() => {
    const map = mapRef.current;
    const spotGroup = spotLayerGroupRef.current;
    if (!map || !spotGroup) return;
    spotGroup.clearLayers();

    const colorByNeighbourhood = new Map<string, string>();
    neighbourhoods.forEach((n, i) => {
      if (n.name) colorByNeighbourhood.set(n.name.trim().toLowerCase(), colorFor(i));
    });

    spots.forEach(spot => {
      if (spot.lat == null || spot.lng == null) return;
      const color = spot.neighbourhood
        ? colorByNeighbourhood.get(spot.neighbourhood.trim().toLowerCase()) ?? UNMATCHED_SPOT_COLOR
        : UNMATCHED_SPOT_COLOR;

      L.circleMarker([spot.lat, spot.lng], {
        radius: 6,
        color: '#ffffff',
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.9,
      })
        .addTo(spotGroup)
        .bindPopup(
          `<div style="font-family:inherit"><div style="font-size:13px;font-weight:600">${spot.name}</div>${
            spot.neighbourhood ? `<div style="font-size:11px;color:#6b7280;margin-top:2px">${spot.neighbourhood}</div>` : ''
          }</div>`,
        );
    });
  }, [spots, neighbourhoods]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden border border-gray-200"
      style={{ height: 420, background: '#e8eef0' }}
    />
  );
}
