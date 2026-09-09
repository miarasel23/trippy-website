import { VehicleKey } from './fleet';

export type ServiceType = 'rideshare' | 'intercity' | 'return' | 'hourly';

export interface DriverBid {
  id: string;
  driverName: string;
  rating: number;
  completedRides: number;
  carModel: string;
  licensePlate: string;
  avatarUrl: string;
  proposedFare: number;
  driverFare: number;
  timeAwayMins: number;
}

export interface BookingState {
  service: ServiceType;
  pickup: string;
  dropoff: string;
  distanceKm: number;
  estimatedTime: string;
  vehicle: VehicleKey;
  fare: number;
  note: string;
  isSearching: boolean;
  incomingBid: DriverBid | null;
}

export interface TripTelemetry {
  tripId: string;
  status: 'en_route' | 'arriving' | 'completed';
  speedKmH: number;
  etaMins: number;
  distanceRemainingKm: number;
  phoneBatteryPct: number;
  routeProgressPct: number;
}
