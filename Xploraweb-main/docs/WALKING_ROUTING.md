# Walking-first itinerary generation

The generator requires a working server-side `GOOGLE_MAPS_API_KEY` with the
Google Maps Routes API enabled and permitted for this deployment. Keep this
key in the hosting environment; never expose it through a `VITE_` variable.
Existing Google API billing, restrictions and quotas still apply. No new key
or billing configuration is provisioned by these code changes.

The service narrows active places into geographic shortlists of at most 12
points, then requests actual walking distances and durations. It tries at
most two distinct shortlists per generation. Category coverage, pinned-stop
order, role caps and the selected maximum walking time constrain route
selection. Category order is a preference, not permission to make a detour.
The default maximum connection is 10 minutes; the UI offers 15, 20 and 30.

AI writes descriptions only after a valid route is selected. A copy failure
uses factual fallback copy; it does not change the route. Walking totals come
from the routing service; visit durations are estimates.

Each stop's optional `walkToNext` stores verified distance/time, source and
the exact endpoint IDs. This object survives saving in the existing stops
JSON column, so no database migration is needed. Older saved routes without
these metrics show that walking details must be checked in Google Maps.

Replacement uses the same server endpoint and verifies the updated route,
including both connections around the replacement. It never silently falls
back to the previous client-side nearest-place calculation.

`ROUTING_UNAVAILABLE` means the provider could not verify walking paths.
Check the server key, Routes API access, quota and function logs. The service
does not manufacture a walking time from straight-line distance.
`NO_COMPACT_ROUTE` means a verified matrix could not produce a suitable route
within the selected constraints. Increase the walking limit, adjust interests
or neighbourhoods, or reduce the stop count. Pins can make a compact route
impossible. Street-by-street navigation remains in Google Maps; the embedded
map draws connections between stops, not a sidewalk-level route polyline.
