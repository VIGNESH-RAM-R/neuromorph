// 2026-08-21: powers the "Medical license region" field's live worldwide
// place search (city/state/country autocomplete -- see
// PlaceAutocompleteField.jsx / doctorOnboardingConfig.js). Same
// graceful-degradation philosophy as firebaseConfig.js's App Check block:
// a missing key isn't an error, it's "this feature isn't turned on yet" --
// the field falls back to a plain text input instead of breaking.
// Full walkthrough: GOOGLE_PLACES_SETUP.md
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
export const isGoogleMapsConfigured = Boolean(GOOGLE_MAPS_API_KEY);

// Google's own official "dynamic library import" bootstrap loader (this
// exact minified snippet is what Google's docs hand out -- not something
// hand-rolled here) -- injects a <script> tag once, then exposes
// `google.maps.importLibrary(name)` for loading individual libraries
// (e.g. 'places') on demand, only when actually needed, rather than
// pulling the whole Maps JS bundle up front.
function bootstrapLoader(key) {
  ((g) => {
    let h, a, k;
    const p = 'The Google Maps JavaScript API', c = 'google', l = 'importLibrary', q = '__ib__', m = document;
    let b = window;
    b = b[c] || (b[c] = {});
    const d = b.maps || (b.maps = {});
    const r = new Set();
    const e = new URLSearchParams();
    const u = () => h || (h = new Promise(async (f, n) => {
      await (a = m.createElement('script'));
      e.set('libraries', [...r] + '');
      for (k in g) e.set(k.replace(/[A-Z]/g, (t) => '_' + t[0].toLowerCase()), g[k]);
      e.set('callback', c + '.maps.' + q);
      a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
      d[q] = f;
      a.onerror = () => (h = n(Error(p + ' could not load.')));
      a.nonce = m.querySelector('script[nonce]')?.nonce || '';
      m.head.append(a);
    }));
    d[l] ? console.warn(p + ' only loads once. Ignoring:', g) : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)));
  })({ key, v: 'weekly' });
}

let placesLibraryPromise = null;

// Lazily loads the Maps JS bootstrap loader (only once, module-level
// singleton -- same "don't double-init" concern firebaseConfig.js has for
// Vite's HMR) and returns the 'places' library, which is where
// PlaceAutocompleteElement lives. Callers should check
// isGoogleMapsConfigured first and fall back to a plain input if false --
// this function assumes a key is present and will reject its promise
// otherwise.
export function loadGooglePlacesLibrary() {
  if (!isGoogleMapsConfigured) {
    return Promise.reject(new Error('Google Maps API key is not configured.'));
  }
  if (!placesLibraryPromise) {
    bootstrapLoader(GOOGLE_MAPS_API_KEY);
    placesLibraryPromise = window.google.maps.importLibrary('places');
  }
  return placesLibraryPromise;
}
