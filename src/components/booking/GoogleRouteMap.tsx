'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LocationSearchResult } from '@/types/customerApi';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Navigation, Route, Sparkles, ZoomIn, ZoomOut, Locate } from 'lucide-react';
import { GOOGLE_MAPS_API_KEY } from '@/config/appUrls';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleRouteMapProps {
  pickupLocations: LocationSearchResult[];
  dropoffLocations: LocationSearchResult[];
  activeLocationIndex?: { type: 'pickup' | 'dropoff'; index: number } | null;
  onMapLocationSelect?: (
    type: 'pickup' | 'dropoff',
    index: number,
    loc: LocationSearchResult
  ) => void;
  className?: string;
}

// Bangladesh center fallback
const DEFAULT_CENTER = { lat: 23.8103, lng: 90.4125 }; // Dhaka

// Global script loading tracker
let isGoogleScriptLoaded = false;
let isGoogleScriptLoading = false;
const scriptLoadCallbacks: Array<() => void> = [];

function loadGoogleMapsScript(callback: () => void) {
  if (typeof window === 'undefined') return;

  if (window.google && window.google.maps) {
    callback();
    return;
  }

  scriptLoadCallbacks.push(callback);

  if (isGoogleScriptLoading) return;
  isGoogleScriptLoading = true;

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    isGoogleScriptLoaded = true;
    isGoogleScriptLoading = false;
    scriptLoadCallbacks.forEach((cb) => cb());
    scriptLoadCallbacks.length = 0;
  };
  script.onerror = () => {
    console.error('Failed to load Google Maps script');
    isGoogleScriptLoading = false;
  };
  document.head.appendChild(script);
}

export const GoogleRouteMap: React.FC<GoogleRouteMapProps> = ({
  pickupLocations,
  dropoffLocations,
  activeLocationIndex,
  onMapLocationSelect,
  className = '',
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);
  const fallbackPolylineRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number | null;
    durationText: string | null;
  }>({ distanceKm: null, durationText: null });

  // 1. Initialize Google Map
  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: DEFAULT_CENTER,
        zoom: 12,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true, // Clean custom Trippy UI
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'simplified' }],
          },
        ],
      });

      mapInstanceRef.current = map;

      // Directions renderer
      const renderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true, // We render custom Trippy branded markers
        polylineOptions: {
          strokeColor: '#059669', // Trippy Emerald
          strokeWeight: 5,
          strokeOpacity: 0.85,
        },
      });
      directionsRendererRef.current = renderer;

      // Fallback polyline if Directions API unavailable
      const fallbackPolyline = new window.google.maps.Polyline({
        map: null,
        strokeColor: '#059669',
        strokeWeight: 5,
        strokeOpacity: 0.85,
      });
      fallbackPolylineRef.current = fallbackPolyline;

      // Handle map click to re-edit location
      map.addListener('click', async (e: any) => {
        if (!e.latLng) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          let address = `অবস্থান (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          let placeId = '';
          if (status === 'OK' && results?.[0]) {
            address = results[0].formatted_address;
            placeId = results[0].place_id;
          }

          const newLoc: LocationSearchResult = {
            uuid: `custom-${Date.now()}`,
            place_id: placeId,
            address,
            latitude: lat,
            longitude: lng,
          };

          const target = activeLocationIndex || { type: 'pickup', index: 0 };
          onMapLocationSelect?.(target.type, target.index, newLoc);
        });
      });

      setMapLoaded(true);
    });
  }, [activeLocationIndex, onMapLocationSelect]);

  // 2. Clear existing markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  }, []);

  // 3. Update Markers & Google Polyline Route
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google?.maps) return;

    const map = mapInstanceRef.current;
    clearMarkers();

    const bounds = new window.google.maps.LatLngBounds();
    // A location is "valid" only when the user has actually selected it (has a real address)
    const validPickups = pickupLocations.filter(
      (l) => l && l.address && l.address.trim().length > 0 && l.latitude && l.longitude && (l.latitude !== 0 || l.longitude !== 0)
    );
    const validDropoffs = dropoffLocations.filter(
      (l) => l && l.address && l.address.trim().length > 0 && l.latitude && l.longitude && (l.latitude !== 0 || l.longitude !== 0)
    );

    // Render Pickup Markers (Green)
    validPickups.forEach((loc, idx) => {
      const position = { lat: loc.latitude, lng: loc.longitude };
      bounds.extend(position);

      const labelText = validPickups.length > 1 ? `P${idx + 1}` : 'P';
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: `পিকআপ: ${loc.address}`,
        draggable: true,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#10b981', // Emerald green
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
        },
        label: {
          text: labelText,
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '11px',
        },
      });

      // Drag marker to adjust location
      marker.addListener('dragend', (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          let address = loc.address;
          let placeId = loc.place_id || '';
          if (status === 'OK' && results?.[0]) {
            address = results[0].formatted_address;
            placeId = results[0].place_id;
          }
          onMapLocationSelect?.('pickup', idx, {
            ...loc,
            address,
            place_id: placeId,
            latitude: lat,
            longitude: lng,
          });
        });
      });

      // Info Window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family: inherit; padding: 4px 6px; max-width: 200px;">
            <div style="font-size: 11px; font-weight: bold; color: #059669; margin-bottom: 2px;">
              ${isBn ? `পিকআপ পয়েন্ট ${validPickups.length > 1 ? `#${idx + 1}` : ''}` : `Pickup Point ${validPickups.length > 1 ? `#${idx + 1}` : ''}`}
            </div>
            <div style="font-size: 11px; color: #334155; line-height: 1.3;">
              ${loc.address}
            </div>
            <div style="font-size: 9px; color: #64748b; margin-top: 4px;">
              ${isBn ? '📍 পিন ড্র্যাগ করে স্থান পরিবর্তন করতে পারেন' : '📍 Drag pin to adjust position'}
            </div>
          </div>
        `,
      });
      marker.addListener('click', () => infoWindow.open(map, marker));

      markersRef.current.push(marker);
    });

    // Render Single Dropoff Marker (Red)
    if (validDropoffs.length > 0) {
      const loc = validDropoffs[0];
      const position = { lat: loc.latitude, lng: loc.longitude };
      bounds.extend(position);

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: isBn ? `ড্রপঅফ: ${loc.address}` : `Dropoff: ${loc.address}`,
        draggable: true,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#ef4444', // Red
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
        },
        label: {
          text: 'D',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '11px',
        },
      });

      marker.addListener('dragend', (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          let address = loc.address;
          let placeId = loc.place_id || '';
          if (status === 'OK' && results?.[0]) {
            address = results[0].formatted_address;
            placeId = results[0].place_id;
          }
          onMapLocationSelect?.('dropoff', 0, {
            ...loc,
            address,
            place_id: placeId,
            latitude: lat,
            longitude: lng,
          });
        });
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family: inherit; padding: 4px 6px; max-width: 200px;">
            <div style="font-size: 11px; font-weight: bold; color: #ef4444; margin-bottom: 2px;">
              ${isBn ? 'ড্রপঅফ গন্তব্য' : 'Dropoff Destination'}
            </div>
            <div style="font-size: 11px; color: #334155; line-height: 1.3;">
              ${loc.address}
            </div>
            <div style="font-size: 9px; color: #64748b; margin-top: 4px;">
              ${isBn ? '📍 পিন ড্র্যাগ করে স্থান পরিবর্তন করতে পারেন' : '📍 Drag pin to adjust position'}
            </div>
          </div>
        `,
      });
      marker.addListener('click', () => infoWindow.open(map, marker));

      markersRef.current.push(marker);
    }

    // 4. Calculate Google Polyline Route (Multi-pickup to Single Dropoff)
    if (validPickups.length > 0 && validDropoffs.length > 0) {
      const origin = {
        lat: validPickups[0].latitude,
        lng: validPickups[0].longitude,
      };
      const destination = {
        lat: validDropoffs[0].latitude,
        lng: validDropoffs[0].longitude,
      };

      // Waypoints: intermediate multi-pickups
      const waypoints: any[] = [];
      for (let i = 1; i < validPickups.length; i++) {
        waypoints.push({
          location: {
            lat: validPickups[i].latitude,
            lng: validPickups[i].longitude,
          },
          stopover: true,
        });
      }

      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          optimizeWaypoints: false,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            directionsRendererRef.current?.setDirections(result);
            if (fallbackPolylineRef.current) {
              fallbackPolylineRef.current.setMap(null);
            }

            // Calculate total distance and duration from route legs
            let totalMeters = 0;
            let totalSeconds = 0;
            result.routes[0]?.legs?.forEach((leg: any) => {
              totalMeters += leg.distance?.value || 0;
              totalSeconds += leg.duration?.value || 0;
            });

            const distanceKm = Math.round((totalMeters / 1000) * 10) / 10;
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.round((totalSeconds % 3600) / 60);
            const durationText =
              hours > 0
                ? isBn
                  ? `${hours} ঘন্টা ${minutes} মিনিট`
                  : `${hours}h ${minutes}m`
                : isBn
                ? `${minutes} মিনিট`
                : `${minutes} mins`;

            setRouteInfo({ distanceKm, durationText });
          } else {
            console.warn('DirectionsService request failed or limited, drawing direct polyline:', status);
            // Fallback direct Polyline connecting multi-pickups to single dropoff
            const pathCoordinates: any[] = [];
            validPickups.forEach((p) =>
              pathCoordinates.push({ lat: p.latitude, lng: p.longitude })
            );
            pathCoordinates.push({
              lat: validDropoffs[0].latitude,
              lng: validDropoffs[0].longitude,
            });

            if (fallbackPolylineRef.current) {
              fallbackPolylineRef.current.setPath(pathCoordinates);
              fallbackPolylineRef.current.setMap(map);
            }

            // Approximate straight-line distance
            let dist = 0;
            for (let i = 0; i < pathCoordinates.length - 1; i++) {
              const p1 = new window.google.maps.LatLng(pathCoordinates[i].lat, pathCoordinates[i].lng);
              const p2 = new window.google.maps.LatLng(pathCoordinates[i + 1].lat, pathCoordinates[i + 1].lng);
              dist += window.google.maps.geometry?.spherical
                ? window.google.maps.geometry.spherical.computeDistanceBetween(p1, p2)
                : 25000;
            }
            const distanceKm = Math.round((dist / 1000) * 10) / 10;
            setRouteInfo({
              distanceKm,
              durationText: isBn
                ? `${Math.round(distanceKm * 2.2)} মিনিট (আনুমানিক)`
                : `${Math.round(distanceKm * 2.2)} mins (est.)`,
            });
          }
        }
      );

      // Fit map bounds to view all stops comfortably
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      }
    } else if (validPickups.length > 0) {
      // Only pickup exists
      map.setCenter({ lat: validPickups[0].latitude, lng: validPickups[0].longitude });
      map.setZoom(14);
      directionsRendererRef.current?.set('directions', null);
      if (fallbackPolylineRef.current) fallbackPolylineRef.current.setMap(null);
      setRouteInfo({ distanceKm: null, durationText: null });
    } else if (validDropoffs.length > 0) {
      // Only dropoff exists
      map.setCenter({ lat: validDropoffs[0].latitude, lng: validDropoffs[0].longitude });
      map.setZoom(14);
      directionsRendererRef.current?.set('directions', null);
      if (fallbackPolylineRef.current) fallbackPolylineRef.current.setMap(null);
      setRouteInfo({ distanceKm: null, durationText: null });
    } else {
      map.setCenter(DEFAULT_CENTER);
      map.setZoom(12);
      directionsRendererRef.current?.set('directions', null);
      if (fallbackPolylineRef.current) fallbackPolylineRef.current.setMap(null);
      setRouteInfo({ distanceKm: null, durationText: null });
    }
  }, [pickupLocations, dropoffLocations, mapLoaded, clearMarkers, onMapLocationSelect, isBn]);

  // Zoom controls helper
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom((mapInstanceRef.current.getZoom() || 12) + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom((mapInstanceRef.current.getZoom() || 12) - 1);
    }
  };

  const handleCenterDhaka = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(DEFAULT_CENTER);
      mapInstanceRef.current.setZoom(12);
    }
  };

  const activeAddress =
    pickupLocations[0]?.address || '37 Eastern Rd, Dhaka 1212, Bangladesh';

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-100 ${className}`}>
      {/* Map DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px] lg:min-h-[580px]" />

      {/* Top Floating Address Card */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col items-center pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200/70 flex items-center gap-2.5 max-w-md w-full pointer-events-auto">
          <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {isBn ? 'বর্তমান লোকেশন' : 'Current Location'}
            </span>
            <p className="text-xs font-bold text-slate-900 truncate">
              {activeAddress}
            </p>
          </div>
          {routeInfo.distanceKm && (
            <div className="text-right flex-shrink-0 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              <span className="block text-[11px] font-extrabold text-emerald-700">
                {routeInfo.distanceKm} {isBn ? 'কিমি' : 'km'}
              </span>
              <span className="text-[9px] text-slate-500 font-medium">
                {routeInfo.durationText}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Instructions Pill */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden sm:block">
        <div className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>
            {isBn
              ? 'ম্যাপে ক্লিক বা মার্কার ড্র্যাগ করে অবস্থান পরিবর্তন করতে পারেন'
              : 'Click map or drag marker to adjust location'}
          </span>
        </div>
      </div>

      {/* Zoom & Centering Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleCenterDhaka}
          title={isBn ? 'ঢাকা সেন্টারে রিসেট করুন' : 'Reset center to Dhaka'}
          className="w-9 h-9 bg-white hover:bg-slate-50 text-slate-700 rounded-xl shadow-md border border-slate-200 flex items-center justify-center transition-colors"
        >
          <Locate className="w-4 h-4 text-blue-600" />
        </button>
        <button
          type="button"
          onClick={handleZoomIn}
          title={isBn ? 'জুম ইন' : 'Zoom in'}
          className="w-9 h-9 bg-white hover:bg-slate-50 text-slate-700 rounded-xl shadow-md border border-slate-200 flex items-center justify-center transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title={isBn ? 'জুম আউট' : 'Zoom out'}
          className="w-9 h-9 bg-white hover:bg-slate-50 text-slate-700 rounded-xl shadow-md border border-slate-200 flex items-center justify-center transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GoogleRouteMap;
