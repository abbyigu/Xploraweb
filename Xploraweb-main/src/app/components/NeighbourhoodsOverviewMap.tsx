import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { GoogleMap, InfoWindowF, MarkerF, PolygonF } from '@react-google-maps/api';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import type { Neighbourhood } from '../hooks/useNeighbourhoods';
import type { Spot } from '../data/products';

// Read-only overview map for the /neighbourhoods listing page: one pin/shape
// per neighbourhood, each in its own colour, click-through to its page, plus
// every spot from the shared spots library plotted as a small dot in its
// neighbourhood's colour.

const QC_CENTRE = { lat: 46.8139, lng: -71.208 };

// Distinct, high-contrast colours, one per neighbourhood. Cycles if more
// neighbourhoods exist than swatches, so new additions always get a colour.
const PALETTE = [
  '#12343B', '#E07A5F', '#3D8B8B', '#B08968', '#5B6C9E',
  '#C9A227', '#7B4B94', '#2E7D32', '#C1447E', '#4A6741',
];

function colorFor(index: number) {
  return PALETTE[index % PALETTE.length];
}

const PIN_PATH = 'M15 0C6.7 0 0 6.7 0 15c0 10.5 13.6 22 14.2 22.5.5.4 1.2.4 1.7 0C16.4 37 30 25.5 30 15 30 6.7 23.3 0 15 0z';

function markerIcon(color: string): google.maps.Symbol {
  return {
    path: PIN_PATH,
    fillColor: color,
    fillOpacity: 1,
    strokeWeight: 0,
    scale: 0.87,
    anchor: new google.maps.Point(15, 38),
  };
}

// Small dot icon for spots — a fixed *pixel* size (unlike Google's `Circle`,
// which is sized in real-world meters and would shrink/grow with zoom).
function dotIcon(color: string): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 0.9,
    strokeColor: '#ffffff',
    strokeWeight: 1.5,
    scale: 6,
  };
}

// Neutral fallback for spots whose `neighbourhood` text doesn't match any
// known neighbourhood name (typo, or the field is empty).
const UNMATCHED_SPOT_COLOR = '#9CA3AF';

const MAP_OPTIONS: google.maps.MapOptions = { scrollwheel: false, streetViewControl: false, mapTypeControl: false };

interface Props {
  neighbourhoods: Neighbourhood[];
  lang: string;
  spots?: Spot[];
}

export function NeighbourhoodsOverviewMap({ neighbourhoods, lang, spots = [] }: Props) {
  const navigate = useNavigate();
  const { isLoaded } = useGoogleMaps();
  const [openSpotId, setOpenSpotId] = useState<string | null>(null);

  const colorByNeighbourhood = useMemo(() => {
    const map = new Map<string, string>();
    neighbourhoods.forEach((n, i) => {
      if (n.name) map.set(n.name.trim().toLowerCase(), colorFor(i));
    });
    return map;
  }, [neighbourhoods]);

  const onLoad = (map: google.maps.Map) => {
    const bounds = new google.maps.LatLngBounds();
    let count = 0;
    neighbourhoods.forEach(n => {
      if (n.boundary && n.boundary.length >= 3) {
        n.boundary.forEach(([lat, lng]) => { bounds.extend({ lat, lng }); count++; });
      }
      if (n.lat != null && n.lng != null) {
        bounds.extend({ lat: n.lat, lng: n.lng });
        count++;
      }
    });

    if (count === 1) {
      map.setCenter(bounds.getCenter());
      map.setZoom(14);
    } else if (count > 1) {
      map.fitBounds(bounds, 30);
    }
  };

  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-gray-200"
      style={{ height: 420, background: '#e8eef0' }}
    >
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={QC_CENTRE}
          zoom={13}
          options={MAP_OPTIONS}
          onLoad={onLoad}
        >
          {neighbourhoods.map((n, i) => {
            const color = colorFor(i);
            // Clicking always navigates straight to the neighbourhood page
            // (matches the old Leaflet marker/polygon click handler).
            const goTo = () => navigate(`/neighbourhoods/${encodeURIComponent(n.slug || n.id)}`);

            return (
              <div key={n.id}>
                {n.boundary && n.boundary.length >= 3 && (
                  <PolygonF
                    path={n.boundary.map(([lat, lng]) => ({ lat, lng }))}
                    options={{ strokeColor: color, fillColor: color, fillOpacity: 0.2, strokeWeight: 2 }}
                    onClick={goTo}
                  />
                )}
                {n.lat != null && n.lng != null && (
                  <MarkerF
                    position={{ lat: n.lat, lng: n.lng }}
                    icon={markerIcon(color)}
                    onClick={goTo}
                  />
                )}
              </div>
            );
          })}

          {spots.map(spot => {
            if (spot.lat == null || spot.lng == null) return null;
            const color = spot.neighbourhood
              ? colorByNeighbourhood.get(spot.neighbourhood.trim().toLowerCase()) ?? UNMATCHED_SPOT_COLOR
              : UNMATCHED_SPOT_COLOR;
            return (
              <MarkerF
                key={spot.id}
                position={{ lat: spot.lat, lng: spot.lng }}
                icon={dotIcon(color)}
                onClick={() => setOpenSpotId(spot.id)}
              >
                {openSpotId === spot.id && (
                  <InfoWindowF onCloseClick={() => setOpenSpotId(null)}>
                    <div style={{ fontFamily: 'inherit' }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{spot.name}</div>
                      {spot.neighbourhood && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{spot.neighbourhood}</div>}
                    </div>
                  </InfoWindowF>
                )}
              </MarkerF>
            );
          })}
        </GoogleMap>
      )}
    </div>
  );
}
