import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Map as MLMap } from 'maplibre-gl';
import { fitPoints, HtmlMarker, MapPopup, MapView } from './MapLibre';
import type { Product } from '../data/products';
import { getExperienceCoords, getRating } from '../lib/experienceMeta';

const QC_CENTRE = { lat: 46.8139, lng: -71.2080 };

function priceLabel(exp: Product): string {
  return exp.price === 0 ? 'Free' : `$${Math.round(exp.price / 100)}`;
}

interface ExperienceMapProps {
  experiences: Product[];
  activeId?: string | null;
  onMarkerClick?: (id: string) => void;
}



export function ExperienceMap({ experiences, activeId, onMarkerClick }: ExperienceMapProps) {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);

  const points = useMemo(
    () => experiences.map(exp => ({ exp, pos: getExperienceCoords(exp) })),
    [experiences],
  );
  const openExp = points.find(p => p.exp.id === openId)?.exp ?? null;

  const onLoad = (map: MLMap) => {
    fitPoints(map, points.map(({ pos }) => ({ lat: pos[0], lng: pos[1] })), 48, 14, false);
  };

  return (
    <div className="w-full h-full" style={{ background: '#e8eef0' }}>
      <MapView center={QC_CENTRE} zoom={13} options={{ scrollZoom: false }} onLoad={onLoad}>
          {points.map(({ exp, pos }) => (
            <HtmlMarker key={exp.id} position={{ lat: pos[0], lng: pos[1] }}>
              <div className="xplora-price-marker">
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`${exp.name}, ${priceLabel(exp)}`}
                  className={`${exp.id === activeId ? 'is-active ' : ''}focus-visible:outline focus-visible:outline-2 focus-visible:outline-xplora-ink`}
                  onClick={() => {
                    setOpenId(exp.id);
                    onMarkerClick?.(exp.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setOpenId(exp.id);
                      onMarkerClick?.(exp.id);
                    }
                  }}
                >
                  {priceLabel(exp)}
                </span>
              </div>
            </HtmlMarker>
          ))}

          {openExp && (
            <MapPopup
              position={{ lat: getExperienceCoords(openExp)[0], lng: getExperienceCoords(openExp)[1] }}
              onClose={() => setOpenId(null)} offset={18}
            >
              <div style={{ width: 172, fontFamily: 'inherit' }}>
                <img loading="lazy" decoding="async" src={openExp.image} alt="" style={{ width: '100%', height: 92, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600, marginBottom: 2 }}>
                  ★ {getRating(openExp).rating.toFixed(1)}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25, marginBottom: 4 }}>{openExp.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                  {openExp.neighbourhood ?? 'Québec City'} · {priceLabel(openExp)}
                </div>
                <button
                  onClick={() => navigate(`/experience/${openExp.id}`)}
                  style={{ width: '100%', fontSize: 12, fontWeight: 600, color: '#fff', background: '#12343B', border: 'none', borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}
                >
                  View details
                </button>
              </div>
            </MapPopup>
          )}
      </MapView>
    </div>
  );
}
