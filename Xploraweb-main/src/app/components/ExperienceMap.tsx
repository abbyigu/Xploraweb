import { useMemo, useState } from 'react';
import { GoogleMap, InfoWindowF, OverlayView, OverlayViewF } from '@react-google-maps/api';
import { useNavigate } from 'react-router';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
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

const MAP_OPTIONS: google.maps.MapOptions = { scrollwheel: false, streetViewControl: false, mapTypeControl: false };

export function ExperienceMap({ experiences, activeId, onMarkerClick }: ExperienceMapProps) {
  const navigate = useNavigate();
  const { isLoaded } = useGoogleMaps();
  const [openId, setOpenId] = useState<string | null>(null);

  const points = useMemo(
    () => experiences.map(exp => ({ exp, pos: getExperienceCoords(exp) })),
    [experiences],
  );
  const openExp = points.find(p => p.exp.id === openId)?.exp ?? null;

  const onLoad = (map: google.maps.Map) => {
    const bounds = new google.maps.LatLngBounds();
    points.forEach(({ pos }) => bounds.extend({ lat: pos[0], lng: pos[1] }));
    if (points.length === 1) {
      map.setCenter({ lat: points[0].pos[0], lng: points[0].pos[1] });
      map.setZoom(14);
    } else if (points.length > 1) {
      map.fitBounds(bounds, 48);
    }
  };

  return (
    <div className="w-full h-full" style={{ background: '#e8eef0' }}>
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={QC_CENTRE}
          zoom={13}
          options={MAP_OPTIONS}
          onLoad={onLoad}
        >
          {points.map(({ exp, pos }) => (
            <OverlayViewF
              key={exp.id}
              position={{ lat: pos[0], lng: pos[1] }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div className="xplora-price-marker">
                <span
                  className={exp.id === activeId ? 'is-active' : ''}
                  onClick={() => {
                    setOpenId(exp.id);
                    onMarkerClick?.(exp.id);
                  }}
                >
                  {priceLabel(exp)}
                </span>
              </div>
            </OverlayViewF>
          ))}

          {openExp && (
            <InfoWindowF
              position={{ lat: getExperienceCoords(openExp)[0], lng: getExperienceCoords(openExp)[1] }}
              onCloseClick={() => setOpenId(null)}
            >
              <div style={{ width: 172, fontFamily: 'inherit' }}>
                <img src={openExp.image} alt="" style={{ width: '100%', height: 92, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
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
            </InfoWindowF>
          )}
        </GoogleMap>
      )}
    </div>
  );
}
