import { useEffect, useState } from 'react';
import { useJsApiLoader, type Libraries } from '@react-google-maps/api';
import { initGoogleMapsAppCheck } from '../lib/googleMapsAppCheck';

// Module-level constant so the `libraries` array reference is stable across
// renders — useJsApiLoader reloads the script (and warns) if it changes.
const LIBRARIES: Libraries = ['drawing'];

/** Loads the Google Maps JS SDK once, shared by every map component. */
export function useGoogleMaps() {
  const jsApi = useJsApiLoader({
    id: 'xplora-google-maps',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
    libraries: LIBRARIES,
  });

  // Wire up Firebase App Check (no-op until configured, see
  // googleMapsAppCheck.ts) before any component is allowed to render a
  // <GoogleMap>, so no request goes out without a token once App Check is
  // actually enforced on the key.
  const [appCheckReady, setAppCheckReady] = useState(false);
  useEffect(() => {
    if (!jsApi.isLoaded) return;
    let cancelled = false;
    initGoogleMapsAppCheck().finally(() => {
      if (!cancelled) setAppCheckReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [jsApi.isLoaded]);

  return { ...jsApi, isLoaded: jsApi.isLoaded && appCheckReady };
}
