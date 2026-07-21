import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Spot } from '../data/products';
import { SPOT_CATEGORY_KEY } from '../data/products';

// Read-only map showing a neighbourhood's boundary/centre and its local spots.
// Vanilla Leaflet (not react-leaflet) so it works under React 18 — same
// approach as ExperienceMap / NeighbourhoodMap.

const QC_CENTRE: [number, number] = [46.8139, -71.2080];

// Self-contained SVG pin so we never depend on Leaflet's external marker PNGs
// (which can fail to load and render as a broken image).
const SPOT_ICON = L.divIcon({
  className: 'xplora-spot-marker',
  html: `<svg width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 13.6 22 14.2 22.5.5.4 1.2.4 1.7 0C16.4 37 30 25.5 30 15 30 6.7 23.3 0 15 0z" fill="#12343B"/>
    <circle cx="15" cy="15" r="5.5" fill="#ffffff"/>
  </svg>`,
  iconSize: [30, 38],
  iconAnchor: [15, 38],
  popupAnchor: [0, -34],
});

// Numbered pin used for itinerary stops so travel order is visible on the map.
function numberedSpotIcon(n: number): L.DivIcon {
  return L.divIcon({
    className: 'xplora-spot-marker-numbered',
    html: `<svg width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 13.6 22 14.2 22.5.5.4 1.2.4 1.7 0C16.4 37 30 25.5 30 15 30 6.7 23.3 0 15 0z" fill="#12343B"/>
      <text x="15" y="15" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-size="14" font-weight="700" font-family="inherit">${n}</text>
    </svg>`,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });
}

function spotPopupHtml(spot: Spot, websiteLabel: string, categoryLabel: (cat: string) => string): string {
  const meta = [spot.category ? categoryLabel(spot.category) : undefined, spot.priceRange].filter(Boolean).join(' · ');
  const cat = meta ? `<div style="font-size:11px;color:#12343B;font-weight:600;margin-bottom:2px">${meta}</div>` : '';
  const addr = spot.address ? `<div style="font-size:12px;color:#6b7280;margin-top:4px">${spot.address}</div>` : '';
  const site = spot.website
    ? `<a href="${spot.website}" target="_blank" rel="noopener noreferrer" style="display:inline-block;font-size:12px;font-weight:600;color:#12343B;margin-top:6px">${websiteLabel} ↗</a>`
    : '';
  return `
    <div style="width:180px;font-family:inherit">
      ${spot.image ? `<img src="${spot.image}" alt="" style="width:100%;height:90px;object-fit:cover;border-radius:8px;margin-bottom:8px" />` : ''}
      ${cat}
      <div style="font-size:14px;font-weight:600;line-height:1.25">${spot.name}</div>
      ${addr}
      ${site}
    </div>`;
}

interface Props {
  spots: Spot[];
  center: [number, number] | null;
  boundary: [number, number][] | null;
  route?: [number, number][] | null;
  websiteLabel?: string;
  activeCategory?: string | null;
  onCategoryChange?: (category: string | null) => void;
  /** Show 1, 2, 3… markers reflecting spot order instead of plain pins (used for itinerary stops). */
  numbered?: boolean;
}

export function NeighbourhoodSpotsMap({
  spots,
  center,
  boundary,
  route,
  websiteLabel = 'Website',
  activeCategory = null,
  onCategoryChange,
  numbered = false,
}: Props) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayersRef = useRef<{ marker: L.Marker; category: string }[]>([]);

  const categories = Array.from(new Set(spots.map(s => s.category).filter(Boolean) as string[])).sort();
  const categoryLabel = (cat: string) => SPOT_CATEGORY_KEY[cat] ? t(`categories.${SPOT_CATEGORY_KEY[cat]}`, cat) : cat;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { scrollWheelZoom: false, zoomControl: true })
      .setView(center ?? QC_CENTRE, 14);
    mapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    const fitPoints: [number, number][] = [];

    if (boundary && boundary.length >= 3) {
      const poly = L.polygon(boundary, {
        color: '#12343B', fillColor: '#7ecfcf', fillOpacity: 0.12, weight: 2,
      }).addTo(map);
      (poly.getLatLngs()[0] as L.LatLng[]).forEach(ll => fitPoints.push([ll.lat, ll.lng]));
    }

    if (route && route.length >= 2) {
      const line = L.polyline(route, {
        color: '#12343B', weight: 6, opacity: 0.9, lineCap: 'round', lineJoin: 'round',
      }).addTo(map);
      (line.getLatLngs() as L.LatLng[]).forEach(ll => fitPoints.push([ll.lat, ll.lng]));
    }

    markerLayersRef.current = [];
    spots.forEach((spot, index) => {
      if (spot.lat == null || spot.lng == null) return;
      const pos: [number, number] = [spot.lat, spot.lng];
      fitPoints.push(pos);
      const icon = numbered ? numberedSpotIcon(index + 1) : SPOT_ICON;
      const marker = L.marker(pos, { icon })
        .addTo(map)
        .bindPopup(spotPopupHtml(spot, websiteLabel, categoryLabel), { closeButton: true, minWidth: 180 });
      markerLayersRef.current.push({ marker, category: spot.category ?? '' });
    });

    if (fitPoints.length === 1) {
      map.setView(fitPoints[0], 15);
    } else if (fitPoints.length > 1) {
      map.fitBounds(L.latLngBounds(fitPoints), { padding: [40, 40], maxZoom: 16 });
    }

    setTimeout(() => map.invalidateSize(), 80);

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show/hide markers when the category filter changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markerLayersRef.current.forEach(({ marker, category }) => {
      if (!activeCategory || category === activeCategory) {
        if (!map.hasLayer(marker)) marker.addTo(map);
      } else {
        if (map.hasLayer(marker)) marker.remove();
      }
    });
  }, [activeCategory]);

  return (
    <div className="w-full space-y-2">
      {categories.length > 1 && (
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
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full rounded-2xl overflow-hidden border border-gray-200"
        style={{ height: 360, background: '#e8eef0' }}
      />
    </div>
  );
}
