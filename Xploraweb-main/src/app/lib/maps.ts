import type { GeneratedItineraryStop } from '../data/itineraryFilters';

// Google Maps' free directions URL supports true multi-stop routes on any
// device (opens the app if installed, else the web). Apple Maps has no
// equivalent multi-waypoint URL scheme, so we standardize on Google Maps.
//
// The route is always anchored to the itinerary's own stops (first stop =
// origin, last = destination) — never to the browser's live geolocation.
// Desktop/IP-based geolocation is frequently wildly inaccurate, and this is
// a "here's the route" link, not a "navigate to me" link; the user can
// always re-route from their real position once inside the Maps app.
export function buildGoogleMapsUrl(stops: GeneratedItineraryStop[]): string | null {
  const coords = stops
    .filter(s => s.spot.lat != null && s.spot.lng != null)
    .map(s => `${s.spot.lat},${s.spot.lng}`);
  if (coords.length === 0) return null;
  if (coords.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${coords[0]}`;
  }

  const origin = coords[0];
  const destination = coords[coords.length - 1];
  const waypoints = coords.slice(1, -1);

  const params = new URLSearchParams({ api: '1', origin, destination, travelmode: 'walking' });
  if (waypoints.length > 0) params.set('waypoints', waypoints.join('|'));

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
