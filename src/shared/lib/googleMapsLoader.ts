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

export interface CreateMarkerOptions {
  map: any;
  position: { lat: number; lng: number } | any;
  title?: string;
  draggable?: boolean;
  content?: HTMLElement;
  pinOptions?: {
    background?: string;
    borderColor?: string;
    glyphColor?: string;
    glyph?: string;
    scale?: number;
  };
  legacyIcon?: any;
  zIndex?: number;
  onDragEnd?: (lat: number, lng: number) => void;
  onClick?: () => void;
}

/**
 * Creates an AdvancedMarkerElement when available (official 2024+ standard),
 * completely removing the "google.maps.Marker is deprecated" console warning.
 * Gracefully falls back to legacy Marker if AdvancedMarkerElement is not supported.
 */
export function createMapMarker(options: CreateMarkerOptions): any {
  const {
    map,
    position,
    title,
    draggable = false,
    content,
    pinOptions,
    legacyIcon,
    zIndex,
    onDragEnd,
    onClick,
  } = options;

  const hasAdvancedMarker =
    typeof window !== 'undefined' &&
    typeof (window as any).google?.maps?.marker?.AdvancedMarkerElement === 'function';

  if (hasAdvancedMarker) {
    let markerContent = content;

    // Use official PinElement if custom pinOptions are provided without custom content
    if (!markerContent && pinOptions && (window as any).google?.maps?.marker?.PinElement) {
      try {
        const pin = new (window as any).google.maps.marker.PinElement({
          background: pinOptions.background || '#10b981',
          borderColor: pinOptions.borderColor || '#ffffff',
          glyphColor: pinOptions.glyphColor || '#ffffff',
          glyphText: pinOptions.glyph || '',
          scale: pinOptions.scale || 1.0,
        });
        // Pass PinElement directly (pin.element is deprecated)
        markerContent = pin;
      } catch (e) {
        console.warn('[Trippy] Failed to create PinElement:', e);
      }
    }

    const marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      title: title || '',
      content: markerContent,
      gmpDraggable: draggable,
      zIndex,
    });

    if (onDragEnd) {
      const handleDragEnd = () => {
        const pos = marker.position;
        const lat = typeof pos?.lat === 'function' ? pos.lat() : Number(pos?.lat ?? 0);
        const lng = typeof pos?.lng === 'function' ? pos.lng() : Number(pos?.lng ?? 0);
        onDragEnd(lat, lng);
      };
      if (typeof marker.addEventListener === 'function') {
        marker.addEventListener('gmp-dragend', handleDragEnd);
      } else if (typeof marker.addListener === 'function') {
        marker.addListener('dragend', handleDragEnd);
      }
    }

    if (onClick) {
      if (typeof marker.addEventListener === 'function') {
        marker.addEventListener('gmp-click', onClick);
      } else if (typeof marker.addListener === 'function') {
        marker.addListener('click', onClick);
      }
    }

    return marker;
  }

  // Fallback to legacy Marker
  const legacyMarker = new (window as any).google.maps.Marker({
    map,
    position,
    title,
    draggable,
    icon: legacyIcon,
    zIndex,
  });

  if (onDragEnd) {
    legacyMarker.addListener('dragend', (e: any) => {
      const lat = e?.latLng?.lat?.() ?? position.lat;
      const lng = e?.latLng?.lng?.() ?? position.lng;
      onDragEnd(lat, lng);
    });
  }

  if (onClick) {
    legacyMarker.addListener('click', onClick);
  }

  return legacyMarker;
}

export function setMarkerPosition(marker: any, position: { lat: number; lng: number } | any): void {
  if (!marker) return;
  if ('position' in marker) {
    marker.position = position;
  } else if (typeof marker.setPosition === 'function') {
    marker.setPosition(position);
  }
}

export function setMarkerContent(marker: any, content: HTMLElement): void {
  if (!marker) return;
  if ('content' in marker) {
    marker.content = content;
  }
}

export function removeMarker(marker: any): void {
  if (!marker) return;
  if ('map' in marker) {
    marker.map = null;
  }
  if (typeof marker.setMap === 'function') {
    marker.setMap(null);
  }
}

export function openMarkerInfoWindow(infoWindow: any, map: any, marker: any): void {
  if (!infoWindow || !marker) return;
  // Modern Google Maps syntax supports anchor object for both legacy and AdvancedMarkerElement
  infoWindow.open({
    map,
    anchor: marker,
  });
}
