import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router';
import type { Product } from '../data/products';
import { getExperienceCoords, getRating } from '../lib/experienceMeta';

// Rendered with vanilla Leaflet (not react-leaflet) so it works regardless of
// the installed React version.

const QC_CENTRE: [number, number] = [46.8139, -71.2080];

function priceLabel(exp: Product): string {
  return exp.price === 0 ? 'Free' : `$${Math.round(exp.price / 100)}`;
}

// AllTrails / Airbnb-style price pill marker.
function makePriceIcon(label: string, active: boolean): L.DivIcon {
  return L.divIcon({
    className: 'xplora-price-marker',
    html: `<span class="${active ? 'is-active' : ''}">${label}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function popupHtml(exp: Product): string {
  const { rating } = getRating(exp);
  const place = exp.neighbourhood ?? 'Québec City';
  return `
    <div style="width:172px;font-family:inherit">
      <img src="${exp.image}" alt="" style="width:100%;height:92px;object-fit:cover;border-radius:8px;margin-bottom:8px" />
      <div style="font-size:12px;color:#b45309;font-weight:600;margin-bottom:2px">★ ${rating.toFixed(1)}</div>
      <div style="font-size:14px;font-weight:600;line-height:1.25;margin-bottom:4px">${exp.name}</div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:8px">${place} · ${priceLabel(exp)}</div>
      <button data-nav="${exp.id}" style="width:100%;font-size:12px;font-weight:600;color:#fff;background:#12343B;border:none;border-radius:8px;padding:7px 12px;cursor:pointer">View details</button>
    </div>`;
}

interface ExperienceMapProps {
  experiences: Product[];
  activeId?: string | null;
  onMarkerClick?: (id: string) => void;
}

export function ExperienceMap({ experiences, activeId, onMarkerClick }: ExperienceMapProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // Keep latest callbacks without re-initialising the map.
  const navRef = useRef(navigate);
  navRef.current = navigate;
  const clickRef = useRef(onMarkerClick);
  clickRef.current = onMarkerClick;

  // Initialise the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView(QC_CENTRE, 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    map.on('popupopen', (e: L.PopupEvent) => {
      const btn = e.popup.getElement()?.querySelector('[data-nav]') as HTMLElement | null;
      if (!btn) return;
      const id = btn.getAttribute('data-nav');
      const handler = () => id && navRef.current(`/experience/${id}`);
      btn.addEventListener('click', handler, { once: true });
    });

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 80);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // Sync markers whenever the result set changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    const points: [number, number][] = [];
    experiences.forEach(exp => {
      const pos = getExperienceCoords(exp);
      points.push(pos);
      const marker = L.marker(pos, { icon: makePriceIcon(priceLabel(exp), exp.id === activeId) })
        .addTo(map)
        .bindPopup(popupHtml(exp), { closeButton: true, minWidth: 172 });
      marker.on('click', () => clickRef.current?.(exp.id));
      markersRef.current[exp.id] = marker;
    });

    if (points.length === 1) {
      map.setView(points[0], 14);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 15 });
    }
    setTimeout(() => map.invalidateSize(), 80);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experiences]);

  // Highlight the active marker.
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const span = marker.getElement()?.querySelector('span');
      if (span) span.classList.toggle('is-active', id === activeId);
    });
  }, [activeId]);

  return <div ref={containerRef} className="w-full h-full" style={{ background: '#e8eef0' }} />;
}
