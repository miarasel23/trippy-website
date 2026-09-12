export interface LocationSearchResult {
  uuid: string;
  place_id?: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface SearchLocationResponse {
  status: boolean;
  message: string;
  data: LocationSearchResult[];
}

export interface PriceSetInfo {
  uuid: string;
  price_per_km: number;
  minimum_booking_price: number;
  waiting_time?: number;
  waiting_price?: number;
  cancellation_fee?: number;
  busy_start_time?: string;
  busy_end_time?: string;
  busy_time_price_percentage?: number;
  country_code?: string;
}

export interface RentCalculation {
  minimum_booking_price: number;
  maximum_booking_price: number;
}

export interface CarInfo {
  uuid: string;
  car_type: string;
  set_capacity: number | string;
  car_avatar: string;
  price_sets: PriceSetInfo[];
  /** Present in trip-price-details-customer response */
  rent_calculation?: RentCalculation;
  distance?: {
    pickup_to_pickup_km: number;
    dropoff_to_dropoff_km: number;
    pickup_to_dropoff_km: number;
    total_km: number;
  };
}

export interface ServiceCategory {
  service_name: string;
  avatar: string | null;
  cars: CarInfo[];
}

export interface RentalInfoResponse {
  status: boolean;
  message: string;
  data: Record<string, ServiceCategory>;
}

export interface TripPriceDetailsRequest {
  platform?: string;
  language_code?: string;
  action_when?: string;
  servive_type: string;
  country_code?: string;
  pickup_location_uuid: string[];
  dropoff_location_uuid: string[];
  start_datetime: string;
  end_datetime?: string;
}

export interface CalculatedVehiclePrice {
  car_uuid: string;
  car_type: string;
  car_name: string;
  car_avatar: string;
  seat_capacity: number | string;
  price_set_uuid: string;
  price_per_km: number;
  minimum_booking_price: number;
  estimated_fare: number;
  distance_km?: number;
  duration_mins?: number;
}

export interface TripPriceDetailsResponse {
  status: boolean;
  message: string;
  data: any;
}

export interface LocationModel {
  uuid?: string;
  address?: string;
  latitude?: string | number;
  longitude?: string | number;
  place_id?: string;
}

export interface CreateRentalTripPayload {
  service_name: string;
  start_datetime: string;
  end_datetime?: string;
  payment_method?: string;
  customer_uuid: string;
  country_code?: string;
  action_when?: string;
  platform?: string;
  language_code?: string;
  pickup_location_uuid: string[];
  dropoff_location_uuid: string[];
  price_set_uuid: string;
  hours_booked?: string;
  note?: string;
  offer_ammount?: number | string;
}

export interface RentalDriverBid {
  uuid?: string;
  bid_uuid?: string;
  rent_bid_uuid?: string;
  rentBidUuid?: string;
  driver_uuid?: string;
  driverUuid?: string;
  name?: string;
  driver_name?: string;
  email?: string;
  phone?: string;
  driver_phone?: string;
  profile_picture?: string;
  profilePicture?: string;
  driver_photo?: string;
  country_code?: string;
  is_active?: string | boolean;
  bid_status?: string;
  has_bid?: boolean;
  review_status?: boolean | number | string;
  car_photos?: string[];
  carPhotos?: string[];
  total_completed_trips?: number;
  totalCompletedTrips?: number;
  average_rating?: number;
  averageRating?: number;
  rating?: number;
  car_reg_number?: string;
  carRegNumber?: string;
  car_plate?: string;
  car_model?: string;
  car_color?: string;
  bid_amount: number;
  total_amount?: number;
  insurance_charge_amount?: number;
  customer_discount_amount?: number;
  time_away_mins?: number;
  created_at?: string;
  rating_list?: Array<{
    uuid?: string;
    rating: number;
    comments?: string | null;
    customer_uuid?: string;
    customer_name?: string;
    customer_photo?: string;
    created_at?: string;
  }>;
}

export interface RentalTrip {
  id?: number;
  uuid?: string;
  customer_uuid?: string;
  customerUuid?: string;
  service_name?: string;
  offer_amount?: number;
  total_bids?: number;
  seen_driver_count?: number;
  seen_drivers?: Array<{
    driver_uuid?: string;
    name?: string;
    profile_picture?: string;
    created_at?: string;
  }>;
  seen_driver_photos?: string[];
  bid_summary?: {
    lowest_bid_amount?: number;
    highest_bid_amount?: number;
    total_bids?: number;
  };
  trip_status?: string;
  payment_method?: string;
  start_datetime?: string;
  end_datetime?: string;
  created_at?: string;
  country_code?: string;
  hours_booked?: string | null;
  note?: string | null;
  accepted_bid_uuid?: string | null;
  accepted_driver?: RentalDriverBid | null;
  given_review?: boolean;
  review_status?: boolean | number | string;
  total_amount?: number;
  pickup_locations?: LocationModel[];
  dropoff_locations?: LocationModel[];
  drivers?: RentalDriverBid[];
  car_category?: {
    uuid?: string;
    car_type?: string;
    set_capacity?: number | string;
    car_avatar?: string;
  };
  car_service?: {
    uuid?: string;
    service_name?: string;
    avatar?: string;
  };
  price_info?: {
    uuid?: string;
    price_per_km?: number;
    minimum_booking_price?: number;
    waiting_price?: number;
    cancellation_fee?: number;
    busy_time_percentage?: number;
  };
}

export interface DriverGeolocation {
  uuid: string;
  place_id?: string;
  latitude: string | number;
  longitude: string | number;
  address: string;
  created_at?: string;
  updated_at?: string;
}

export interface DriverTrackingRecord {
  id: number;
  uuid: string;
  geolocation_uuid: string;
  customer_uuid?: string | null;
  driver_uuid: string;
  created_at: string;
  updated_at: string;
  geolocation: DriverGeolocation;
}

export interface DriverTrackingResponse {
  status: boolean;
  message: string;
  data: DriverTrackingRecord[];
}

