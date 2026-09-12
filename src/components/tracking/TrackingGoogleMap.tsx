'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LocationModel } from '@/types/customerApi';
import { useLanguage } from '@/context/LanguageContext';
import { GOOGLE_MAPS_API_KEY } from '@/config/appUrls';
import {
  Navigation,
  MapPin,
  Car,
  Compass,
  ZoomIn,
  ZoomOut,
  Route,
  Phone,
  MessageCircle,
  Sparkles,
  Radio,
  RotateCcw,
} from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

interface TrackingGoogleMapProps {
  pickupLocation?: LocationModel | null;
  dropoffLocation?: LocationModel | null;
  driverLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    updated_at?: string;
  } | null;
  driverName?: string;
  carType?: string;
  carPlate?: string;
  serviceName?: string;
  tripStatus?: string;
  speed?: number;
  etaMinutes?: number;
  totalFare?: number | string;
  onCallDriver?: () => void;
  onChatDriver?: () => void;
  className?: string;
}

const DEFAULT_CENTER = { lat: 23.8014, lng: 90.3763 }; // Senpara Parbata Lane, Mirpur 10, Dhaka

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

export const TrackingGoogleMap: React.FC<TrackingGoogleMapProps> = ({
  pickupLocation,
  dropoffLocation,
  driverLocation,
  driverName = 'Driver',
  carType = 'HIACE',
  carPlate = 'Dhaka-Metro-cha-54-1400',
  serviceName = 'RIDE_SHARE',
  tripStatus = 'IN_PROGRESS',
  speed = 45,
  etaMinutes = 12,
  totalFare = 747,
  onCallDriver,
  onChatDriver,
  className = '',
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  // Determine whether vehicle is a motorcycle / bike or car
  const isMotorcycle =
    carType?.toUpperCase().includes('MOTOR') ||
    carType?.toUpperCase().includes('BIKE') ||
    carType?.toUpperCase().includes('SCOOTER') ||
    carType?.toUpperCase().includes('TWO_WHEELER') ||
    serviceName?.toUpperCase().includes('MOTOR') ||
    serviceName?.toUpperCase().includes('BIKE');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const dropoffMarkerRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const rawStatus = (tripStatus || '').toUpperCase();
  const isCompleted =
    rawStatus === 'COMPLETED' ||
    rawStatus === 'FINISHED' ||
    rawStatus === 'TRIP_COMPLETED';

  // 1. Initialize Map
  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      try {
        const initialCenter = driverLocation
          ? { lat: driverLocation.latitude, lng: driverLocation.longitude }
          : DEFAULT_CENTER;

        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 14,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
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
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ lightness: 20 }],
            },
          ],
        });

        mapInstanceRef.current = map;

        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#059669',
            strokeWeight: 6,
            strokeOpacity: 0.85,
          },
        });
        directionsRendererRef.current = directionsRenderer;

        setMapLoaded(true);
      } catch (err) {
        console.error('Error initializing Google Map in tracking:', err);
        setMapError(true);
      }
    });
  }, []);

  // 2. Render Markers and Directions Route
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google) return;
    const map = mapInstanceRef.current;

    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    // Helper: Create custom pin SVG icon
    const createPinIcon = (color: string, label: string) => ({
      url: `data:image/svg+xml;utf-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 38 48">
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.35"/>
          </filter>
          <path d="M19 0C8.5 0 0 8.5 0 19c0 14 19 29 19 29s19-15 19-29C38 8.5 29.5 0 19 0z" fill="${color}" filter="url(#shadow)"/>
          <circle cx="19" cy="18" r="9" fill="#ffffff"/>
          <text x="19" y="22" font-size="12" font-weight="900" fill="${color}" text-anchor="middle" font-family="sans-serif">${label}</text>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(38, 48),
      anchor: new window.google.maps.Point(19, 48),
    });

    // Helper: Create Top-Down Vehicle Marker SVG (Car or Motorcycle matching user design)
    const createVehicleIcon = (isBike: boolean) => {
      const svgContent = isBike
        ? `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="64" viewBox="0 0 48 64">
          <defs>
            <filter id="bikeShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.38"/>
            </filter>
          </defs>
          <g filter="url(#bikeShadow)">
            <!-- Front Wheel -->
            <rect x="21" y="4" width="6" height="14" rx="3" fill="#0f172a"/>
            <!-- Front Fender (Red) -->
            <path d="M20 13 C20 9.5, 28 9.5, 28 13 L27 18 L21 18 Z" fill="#ef4444"/>
            <!-- Yellow Headlight -->
            <circle cx="24" cy="9.5" r="2.5" fill="#fbbf24"/>
            <!-- Handlebars & Grips -->
            <rect x="8" y="17" width="32" height="3.5" rx="1.75" fill="#334155"/>
            <rect x="7" y="16" width="5" height="5.5" rx="1.5" fill="#0f172a"/>
            <rect x="36" y="16" width="5" height="5.5" rx="1.5" fill="#0f172a"/>
            <!-- Side Mirrors -->
            <circle cx="6" cy="15" r="2" fill="#94a3b8"/>
            <circle cx="42" cy="15" r="2" fill="#94a3b8"/>
            <!-- Dual Exhaust Pipes -->
            <rect x="15" y="42" width="3.5" height="11" rx="1.5" fill="#64748b"/>
            <rect x="29.5" y="42" width="3.5" height="11" rx="1.5" fill="#64748b"/>
            <!-- Rear Wheel -->
            <rect x="21" y="46" width="6" height="15" rx="3" fill="#0f172a"/>
            <!-- Green Bike Body / Fuel Tank -->
            <path d="M19 19 C16 23, 16 31, 18 34 C19 35, 29 35, 30 34 C32 31, 32 23, 29 19 Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
            <circle cx="24" cy="23" r="2" fill="#e2e8f0"/>
            <!-- Rider Shoulders / Jacket -->
            <path d="M13 24 C14 21, 20 19, 24 19 C28 19, 34 21, 35 24 C36 29, 34 35, 31 37 C29 38, 19 38, 17 37 C14 35, 12 29, 13 24 Z" fill="#1e293b"/>
            <!-- Rider Helmet (Red with Dark Visor) -->
            <circle cx="24" cy="27" r="7" fill="#ef4444" stroke="#991b1b" stroke-width="1"/>
            <path d="M19 25 C19 22, 29 22, 29 25 C29 27, 19 27, 19 25 Z" fill="#0f172a"/>
            <!-- Seat Panel (Silver Gray) -->
            <rect x="20" y="36" width="8" height="11" rx="2.5" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1"/>
            <!-- Blue GPS Location Dot & Heading Arrow -->
            <circle cx="24" cy="41.5" r="5" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
            <polygon points="18,36.5 21,39.5 19,40.5" fill="#3b82f6"/>
            <!-- Rear Taillight (Red) -->
            <rect x="21.5" y="48" width="5" height="3" rx="1.5" fill="#ef4444"/>
          </g>
        </svg>`
        : `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="64" viewBox="0 0 48 64">
          <defs>
            <filter id="carShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.38"/>
            </filter>
          </defs>
          <g filter="url(#carShadow)">
            <!-- 4 Black Wheels / Tires -->
            <rect x="4" y="11" width="6" height="14" rx="2.5" fill="#0f172a"/>
            <rect x="38" y="11" width="6" height="14" rx="2.5" fill="#0f172a"/>
            <rect x="4" y="39" width="6" height="14" rx="2.5" fill="#0f172a"/>
            <rect x="38" y="39" width="6" height="14" rx="2.5" fill="#0f172a"/>

            <!-- Main Green Car Body -->
            <path d="M12 7 C12 5, 36 5, 36 7 C40 9, 41 21, 41 34 C41 47, 40 57, 36 59 C36 61, 12 61, 12 59 C8 57, 7 47, 7 34 C7 21, 8 9, 12 7 Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>

            <!-- Red Front Hood / Cab (Winged top hood matching image) -->
            <path d="M10 13 C10 7, 14 4.5, 24 4.5 C34 4.5, 38 7, 38 13 C38 17.5, 36 21, 35 22 C33 22, 15 22, 13 22 C12 21, 10 17.5, 10 13 Z" fill="#ef4444"/>

            <!-- Yellow Headlights -->
            <circle cx="13.5" cy="5" r="2.2" fill="#fbbf24"/>
            <circle cx="34.5" cy="5" r="2.2" fill="#fbbf24"/>

            <!-- Curved Front Windshield -->
            <path d="M13 20 C13 15, 35 15, 35 20 C35 22, 13 22, 13 20 Z" fill="#0f172a"/>

            <!-- Center Roof (Light Silver Gray Panel) -->
            <rect x="13" y="21" width="22" height="23" rx="3.5" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1"/>

            <!-- Blue GPS Location Dot with Direction Arrow (Matching user design) -->
            <circle cx="24" cy="32.5" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
            <polygon points="17,25 21,29 18,30" fill="#3b82f6"/>

            <!-- Curved Rear Windshield -->
            <path d="M13 44 C13 48, 35 48, 35 44 C35 43, 13 43, 13 44 Z" fill="#0f172a"/>

            <!-- Rear Taillights (Red) -->
            <rect x="11.5" y="58" width="5" height="2.5" rx="1" fill="#ef4444"/>
            <rect x="31.5" y="58" width="5" height="2.5" rx="1" fill="#ef4444"/>
          </g>
        </svg>`;

      return {
        url: `data:image/svg+xml;utf-8,${encodeURIComponent(svgContent.trim())}`,
        scaledSize: new window.google.maps.Size(48, 64),
        anchor: new window.google.maps.Point(24, 32),
      };
    };

    // A. Pickup Marker
    const pLat = Number(pickupLocation?.latitude) || 23.8045;
    const pLng = Number(pickupLocation?.longitude) || 90.3701;
    const pPos = new window.google.maps.LatLng(pLat, pLng);

    if (pickupMarkerRef.current) {
      pickupMarkerRef.current.setPosition(pPos);
    } else {
      pickupMarkerRef.current = new window.google.maps.Marker({
        position: pPos,
        map,
        title: pickupLocation?.address || 'Pickup Point',
        icon: createPinIcon('#059669', 'A'),
      });
    }
    bounds.extend(pPos);
    hasPoints = true;

    // B. Dropoff Marker
    const dLat = Number(dropoffLocation?.latitude) || 23.7947;
    const dLng = Number(dropoffLocation?.longitude) || 90.4143;
    const dPos = new window.google.maps.LatLng(dLat, dLng);

    if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.setPosition(dPos);
    } else {
      dropoffMarkerRef.current = new window.google.maps.Marker({
        position: dPos,
        map,
        title: dropoffLocation?.address || 'Dropoff Point',
        icon: createPinIcon('#dc2626', 'B'),
      });
    }
    bounds.extend(dPos);
    hasPoints = true;

    // C. Driver Marker (Car or Motorcycle)
    if (driverLocation && driverLocation.latitude && driverLocation.longitude) {
      const drvPos = new window.google.maps.LatLng(
        driverLocation.latitude,
        driverLocation.longitude
      );

      const vehicleIcon = createVehicleIcon(isMotorcycle);

      if (driverMarkerRef.current) {
        driverMarkerRef.current.setPosition(drvPos);
        driverMarkerRef.current.setIcon(vehicleIcon);
      } else {
        driverMarkerRef.current = new window.google.maps.Marker({
          position: drvPos,
          map,
          title: `${driverName} (${carPlate})`,
          icon: vehicleIcon,
          zIndex: 999,
        });
      }
      bounds.extend(drvPos);
    }

    // D. Directions Route from Pickup to Dropoff
    if (pickupLocation?.address && dropoffLocation?.address && directionsRendererRef.current) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: pPos,
          destination: dPos,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            directionsRendererRef.current.setDirections(result);
          }
        }
      );
    }

    if (hasPoints) {
      map.fitBounds(bounds, { top: 70, bottom: 100, left: 60, right: 60 });
    }
  }, [mapLoaded, pickupLocation, dropoffLocation, driverLocation, driverName, carPlate]);

  // Recenter actions
  const handleRecenterDriver = useCallback(() => {
    if (!mapInstanceRef.current || !driverLocation) return;
    mapInstanceRef.current.panTo({
      lat: driverLocation.latitude,
      lng: driverLocation.longitude,
    });
    mapInstanceRef.current.setZoom(16);
  }, [driverLocation]);

  const handleFitFullRoute = useCallback(() => {
    if (!mapInstanceRef.current || !window.google) return;
    const bounds = new window.google.maps.LatLngBounds();
    if (pickupLocation?.latitude && pickupLocation?.longitude) {
      bounds.extend({
        lat: Number(pickupLocation.latitude),
        lng: Number(pickupLocation.longitude),
      });
    }
    if (dropoffLocation?.latitude && dropoffLocation?.longitude) {
      bounds.extend({
        lat: Number(dropoffLocation.latitude),
        lng: Number(dropoffLocation.longitude),
      });
    }
    if (driverLocation?.latitude && driverLocation?.longitude) {
      bounds.extend({
        lat: driverLocation.latitude,
        lng: driverLocation.longitude,
      });
    }
    mapInstanceRef.current.fitBounds(bounds, {
      top: 60,
      bottom: 100,
      left: 60,
      right: 60,
    });
  }, [pickupLocation, dropoffLocation, driverLocation]);

  const handleZoom = (delta: number) => {
    if (!mapInstanceRef.current) return;
    const current = mapInstanceRef.current.getZoom() || 14;
    mapInstanceRef.current.setZoom(current + delta);
  };

  const displayAddress =
    driverLocation?.address ||
    pickupLocation?.address ||
    '3 Senpara Parbata Lane, Mirpur 10, Dhaka';

  return (
    <div
      className={`relative w-full h-[580px] lg:h-[640px] rounded-3xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 ${className}`}
    >
      {/* Real Google Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Elegant Fallback Schematic Route while Google Maps is initializing or offline */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-slate-50 flex items-center justify-center pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 900 680" fill="none">
            <rect width="900" height="680" fill="#f8fafc" />

            {/* Grid Highways */}
            <path d="M-100 140 Q 400 180 1000 140" stroke="#e2e8f0" strokeWidth="18" />
            <path d="M-100 360 Q 450 320 1000 390" stroke="#e2e8f0" strokeWidth="22" />
            <path d="M-100 580 Q 450 540 1000 600" stroke="#e2e8f0" strokeWidth="16" />
            <path d="M220 -80 Q 250 360 210 760" stroke="#e2e8f0" strokeWidth="20" />
            <path d="M720 -80 Q 690 360 740 760" stroke="#e2e8f0" strokeWidth="20" />

            {/* Glowing Route Polyline */}
            <path
              d="M 280 580 Q 380 440 450 340 T 580 200 T 680 110"
              stroke="rgba(16, 185, 129, 0.25)"
              strokeWidth="28"
              strokeLinecap="round"
            />
            <path
              d="M 280 580 Q 380 440 450 340 T 580 200 T 680 110"
              stroke="#10b981"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* Pickup Point A */}
            <g transform="translate(280, 580)">
              <circle r="18" fill="rgba(16, 185, 129, 0.3)" />
              <circle r="10" fill="#10b981" />
              <circle r="4" fill="#ffffff" />
              <text x="24" y="5" fill="#0f172a" fontSize="13" fontWeight="bold">
                {pickupLocation?.address ? pickupLocation.address.slice(0, 30) : 'Pickup Point (A)'}
              </text>
            </g>

            {/* Dropoff Point B */}
            <g transform="translate(680, 110)">
              <circle r="20" fill="rgba(239, 68, 68, 0.3)" />
              <circle r="11" fill="#ef4444" />
              <circle r="4" fill="#ffffff" />
              <text x="-160" y="5" fill="#0f172a" fontSize="13" fontWeight="bold">
                {dropoffLocation?.address ? dropoffLocation.address.slice(0, 30) : 'Dropoff Point (B)'}
              </text>
            </g>

            {/* Live Vehicle Pin on route (Car or Motorcycle matching user image) */}
            <g transform={isCompleted ? 'translate(680, 110)' : 'translate(510, 260)'}>
              <circle r="34" fill="rgba(34, 197, 94, 0.25)">
                <animate attributeName="r" values="26;42;26" dur="2s" repeatCount="indefinite" />
              </circle>

              {/* Top-Down Vehicle Vector */}
              <g transform="translate(-24, -32)">
                {isMotorcycle ? (
                  /* Top-Down Motorcycle */
                  <g>
                    <rect x="21" y="4" width="6" height="14" rx="3" fill="#0f172a"/>
                    <path d="M20 13 C20 9.5, 28 9.5, 28 13 L27 18 L21 18 Z" fill="#ef4444"/>
                    <circle cx="24" cy="9.5" r="2.5" fill="#fbbf24"/>
                    <rect x="8" y="17" width="32" height="3.5" rx="1.75" fill="#334155"/>
                    <rect x="7" y="16" width="5" height="5.5" rx="1.5" fill="#0f172a"/>
                    <rect x="36" y="16" width="5" height="5.5" rx="1.5" fill="#0f172a"/>
                    <circle cx="6" cy="15" r="2" fill="#94a3b8"/>
                    <circle cx="42" cy="15" r="2" fill="#94a3b8"/>
                    <rect x="15" y="42" width="3.5" height="11" rx="1.5" fill="#64748b"/>
                    <rect x="29.5" y="42" width="3.5" height="11" rx="1.5" fill="#64748b"/>
                    <rect x="21" y="46" width="6" height="15" rx="3" fill="#0f172a"/>
                    <path d="M19 19 C16 23, 16 31, 18 34 C19 35, 29 35, 30 34 C32 31, 32 23, 29 19 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5"/>
                    <circle cx="24" cy="23" r="2" fill="#e2e8f0"/>
                    <path d="M13 24 C14 21, 20 19, 24 19 C28 19, 34 21, 35 24 C36 29, 34 35, 31 37 C29 38, 19 38, 17 37 C14 35, 12 29, 13 24 Z" fill="#1e293b"/>
                    <circle cx="24" cy="27" r="7" fill="#ef4444" stroke="#991b1b" strokeWidth="1"/>
                    <path d="M19 25 C19 22, 29 22, 29 25 C29 27, 19 27, 19 25 Z" fill="#0f172a"/>
                    <rect x="20" y="36" width="8" height="11" rx="2.5" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1"/>
                    <circle cx="24" cy="41.5" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5"/>
                    <polygon points="18,36.5 21,39.5 19,40.5" fill="#3b82f6"/>
                    <rect x="21.5" y="48" width="5" height="3" rx="1.5" fill="#ef4444"/>
                  </g>
                ) : (
                  /* Top-Down Car (Matching User Image) */
                  <g>
                    <rect x="4" y="11" width="6" height="14" rx="2.5" fill="#0f172a"/>
                    <rect x="38" y="11" width="6" height="14" rx="2.5" fill="#0f172a"/>
                    <rect x="4" y="39" width="6" height="14" rx="2.5" fill="#0f172a"/>
                    <rect x="38" y="39" width="6" height="14" rx="2.5" fill="#0f172a"/>
                    <path d="M12 7 C12 5, 36 5, 36 7 C40 9, 41 21, 41 34 C41 47, 40 57, 36 59 C36 61, 12 61, 12 59 C8 57, 7 47, 7 34 C7 21, 8 9, 12 7 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5"/>
                    <path d="M10 13 C10 7, 14 4.5, 24 4.5 C34 4.5, 38 7, 38 13 C38 17.5, 36 21, 35 22 C33 22, 15 22, 13 22 C12 21, 10 17.5, 10 13 Z" fill="#ef4444"/>
                    <circle cx="13.5" cy="5" r="2.2" fill="#fbbf24"/>
                    <circle cx="34.5" cy="5" r="2.2" fill="#fbbf24"/>
                    <path d="M13 20 C13 15, 35 15, 35 20 C35 22, 13 22, 13 20 Z" fill="#0f172a"/>
                    <rect x="13" y="21" width="22" height="23" rx="3.5" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1"/>
                    <circle cx="24" cy="32.5" r="6" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5"/>
                    <polygon points="17,25 21,29 18,30" fill="#3b82f6"/>
                    <path d="M13 44 C13 48, 35 48, 35 44 C35 43, 13 43, 13 44 Z" fill="#0f172a"/>
                    <rect x="11.5" y="58" width="5" height="2.5" rx="1" fill="#ef4444"/>
                    <rect x="31.5" y="58" width="5" height="2.5" rx="1" fill="#ef4444"/>
                  </g>
                )}
              </g>

              {/* Speed & Live Status Badge */}
              <g transform="translate(30, -14)">
                <rect x="0" y="0" width="136" height="28" rx="6" fill="#000000" stroke="#1e293b" strokeWidth="1" />
                <text x="10" y="18" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  {isCompleted ? 'Arrived ✓' : `${speed} km/h • Live`}
                </text>
              </g>
            </g>
          </svg>

          {/* Loading Indicator */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xs border border-slate-200/90 px-4 py-2 rounded-2xl shadow-md text-xs font-bold text-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{isBn ? 'স্যাটেলাইট জিপিএস ম্যাপ লোড হচ্ছে...' : 'Initializing Google Maps Live GPS...'}</span>
          </div>
        </div>
      )}

      {/* Floating Map Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {driverLocation && (
          <button
            type="button"
            onClick={handleRecenterDriver}
            className="w-10 h-10 rounded-2xl bg-white/95 hover:bg-white text-slate-800 hover:text-emerald-600 shadow-md border border-slate-200/90 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            title={isBn ? 'চালকের অবস্থানে যান' : 'Focus on Driver'}
            aria-label="Focus on driver"
          >
            <Navigation className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={handleFitFullRoute}
          className="w-10 h-10 rounded-2xl bg-white/95 hover:bg-white text-slate-800 hover:text-emerald-600 shadow-md border border-slate-200/90 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
          title={isBn ? 'সম্পূর্ণ রুট দেখুন' : 'View Full Route'}
          aria-label="View full route"
        >
          <Route className="w-4 h-4" />
        </button>

        <div className="flex flex-col bg-white/95 rounded-2xl shadow-md border border-slate-200/90 overflow-hidden">
          <button
            type="button"
            onClick={() => handleZoom(1)}
            className="w-10 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-black transition-colors cursor-pointer"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200" />
          <button
            type="button"
            onClick={() => handleZoom(-1)}
            className="w-10 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-black transition-colors cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Left Live Telemetry Pill */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 text-white text-xs font-bold backdrop-blur-md shadow-md border border-slate-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>
            {isCompleted
              ? isBn ? 'গন্তব্যে পৌঁছেছেন' : 'Arrived at Destination'
              : isBn
              ? `লাইভ ট্র্যাকিং • ${speed} কিমি/ঘণ্টা`
              : `Live GPS • ${speed} km/h`}
          </span>
        </div>
      </div>

      {/* Bottom Floating Live Driver Location & Call Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              {isBn ? 'চালকের বর্তমান অবস্থান' : 'Driver Location'}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {driverLocation?.latitude && driverLocation?.longitude
                ? `${Number(driverLocation.latitude).toFixed(4)}, ${Number(driverLocation.longitude).toFixed(4)}`
                : 'Live GPS'}
            </span>
          </div>

          <p
            className="text-xs font-bold text-slate-900 truncate"
            title={displayAddress}
          >
            {displayAddress}
          </p>

          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>{carType}</span>
            <span>•</span>
            <span className="font-mono">{carPlate}</span>
            <span>•</span>
            <span>{driverName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
          <div className="text-right mr-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {isBn ? 'ভাড়া' : 'Fare'}
            </span>
            <span className="text-sm font-black text-slate-900 font-heading">
              BDT {totalFare}
            </span>
          </div>

          {onCallDriver && (
            <button
              type="button"
              onClick={onCallDriver}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer transition-colors"
              title={isBn ? 'কল করুন' : 'Call Driver'}
              aria-label="Call driver"
            >
              <Phone className="w-4 h-4 fill-white" />
            </button>
          )}

          {onChatDriver && (
            <button
              type="button"
              onClick={onChatDriver}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer transition-colors"
              title={isBn ? 'চ্যাট করুন' : 'Chat Driver'}
              aria-label="Chat driver"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingGoogleMap;
