import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_API_KEY } from '@/shared/config/appUrls';

let isConfigured = false;
let loadPromise: Promise<void> | null = null;

/**
 * Initializes Google Maps JavaScript API via the official @googlemaps/js-api-loader.
 * Follows modern dynamic importLibrary standards with async loading, avoiding all
 * "loaded directly without loading=async" performance warnings and race conditions.
 */
export async function initGoogleMaps(): Promise<void> {
  if (typeof window === 'undefined') return;

  // If already fully loaded and available
  if (
    typeof (window as any).google?.maps?.Map === 'function' &&
    typeof (window as any).google?.maps?.DirectionsService === 'function'
  ) {
    return;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      if (!isConfigured) {
        setOptions({
          key: GOOGLE_MAPS_API_KEY,
          v: 'weekly',
        });
        isConfigured = true;
      }

      await Promise.all([
        importLibrary('maps'),
        importLibrary('places'),
        importLibrary('geocoding'),
        importLibrary('routes'),
        importLibrary('geometry'),
        importLibrary('marker'),
      ]);
    } catch (err) {
      loadPromise = null;
      throw err;
    }
  })();

  return loadPromise;
}

/**
 * Callback-compatible loader helper for React component effects.
 */
export function loadGoogleMapsScript(callback: () => void): void {
  initGoogleMaps()
    .then(() => {
      callback();
    })
    .catch((err) => {
      console.error('[Trippy] Failed to load Google Maps via js-api-loader:', err);
    });
}
