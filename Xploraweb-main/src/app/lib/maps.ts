import type { GeneratedItineraryStop } from '../data/itineraryFilters';

// Google Maps' free directions URL supports true multi-stop routes on any
// device (opens the app if installed, else the web). Apple Maps has no
// equivalent multi-waypoint URL scheme, so we standardize on Google Maps.
export function buildGoogleMapsUrl(
  stops: GeneratedItineraryStop[],
  origin: { lat: number; lng: number } | null,
): string | null {
  const coords = stops
    .filter(s => s.spot.lat != null && s.spot.lng != null)
    .map(s => `${s.spot.lat},${s.spot.lng}`);
  if (coords.length === 0) return null;

  const destination = coords[coords.length - 1];
  const waypoints = coords.slice(0, -1);

  const params = new URLSearchParams({ api: '1', destination, travelmode: 'walking' });
  if (origin) params.set('origin', `${origin.lat},${origin.lng}`);
  if (waypoints.length > 0) params.set('waypoints', waypoints.join('|'));

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
