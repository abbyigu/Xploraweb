import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getToken, initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check';

// Optional hardening layer for the Google Maps JS API key: attaches a
// Firebase App Check + reCAPTCHA v3 token to every Maps JS request so the
// key can eventually be enforced against scraped-key abuse (see
// https://developers.google.com/maps/documentation/javascript/dynamic-loading-app-check).
//
// No-ops until VITE_FIREBASE_* + VITE_RECAPTCHA_V3_SITE_KEY are set (see
// .env.example) — the map loads normally without this until then. Setting
// those up requires a Firebase project linked to the same Cloud project as
// the Maps key, plus a registered reCAPTCHA v3 site key; both need to be
// done by someone with access to that Google account.

let initPromise: Promise<void> | null = null;

function readConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  const siteKey = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY;
  if (!apiKey || !projectId || !appId || !siteKey) return null;

  return {
    siteKey,
    firebaseConfig: {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? `${projectId}.firebaseapp.com`,
      projectId,
      appId,
    },
  };
}

/**
 * Initialises Firebase App Check and wires its token into the Maps JS SDK.
 * Idempotent — safe to call from every map component; only runs once.
 * Resolves immediately (no-op) if Firebase env vars aren't configured yet.
 */
export function initGoogleMapsAppCheck(): Promise<void> {
  if (initPromise) return initPromise;

  const cfg = readConfig();
  if (!cfg) return Promise.resolve();

  initPromise = (async () => {
    if (import.meta.env.DEV) {
      // Lets local dev get valid tokens without a real attestation
      // provider. The debug token is printed to the console on first run —
      // register it in the Firebase console under App Check > Debug tokens.
      // https://firebase.google.com/docs/app-check/web/debug-provider#localhost
      (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    const app: FirebaseApp = initializeApp(cfg.firebaseConfig);
    const appCheck: AppCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(cfg.siteKey),
      isTokenAutoRefreshEnabled: true,
    });

    const { Settings } = await google.maps.importLibrary('core') as google.maps.CoreLibrary;
    Settings.getInstance().fetchAppCheckToken = () => getToken(appCheck, /* forceRefresh */ false);
  })();

  return initPromise;
}
