export type VehicleKey = 'sedan' | 'noah' | 'hiace' | 'chander';

export type VehicleCategory = 'all' | 'sedan' | 'family' | 'adventure';

export interface VehicleInfo {
  id: VehicleKey;
  name: string;
  category: 'sedan' | 'family' | 'adventure';
  tag: string;
  seats: string;
  seatCount: number;
  luggage: string;
  features: string[];
  description: string;
  baseFare: number;
  imagePosition: string;
  scale?: number;
}

export interface IntercityRoute {
  id: string;
  from: string;
  to: string;
  distance: string;
  duration: string;
  prices: {
    sedan: string;
    noah: string;
    hiace: string;
  };
}

export const FLEET_VEHICLES: Record<VehicleKey, VehicleInfo> = {
  sedan: {
    id: 'sedan',
    name: 'Sedan Premium',
    category: 'sedan',
    tag: 'Popular City Ride',
    seats: '4 Seats',
    seatCount: 4,
    luggage: '2 Bags',
    features: ['👥 4 Seats', '🧳 2 Bags', '❄️ Full AC'],
    description: 'Comfortable modern sedans (Axio, Allion, Premio) for smooth intra-city travel, business meetings, and executive airport transfers.',
    baseFare: 603,
    imagePosition: 'top',
    scale: 1.6,
  },
  noah: {
    id: 'noah',
    name: 'Toyota Noah (7-Seater)',
    category: 'family',
    tag: 'Family & Holiday',
    seats: '7 Seats',
    seatCount: 7,
    luggage: '4 Bags',
    features: ['👥 7 Seats', '🧳 4 Bags', '❄️ Dual Zone AC'],
    description: 'Spacious 7-seater minivan tailored for family vacations, airport transfers with large luggage, and intercity trips across Bangladesh.',
    baseFare: 844,
    imagePosition: '50% 35%',
    scale: 1.6,
  },
  hiace: {
    id: 'hiace',
    name: 'Toyota Hiace Microbus (11-Seater)',
    category: 'family',
    tag: 'Executive Group',
    seats: '11 Seats',
    seatCount: 11,
    luggage: '6 Bags',
    features: ['👥 11 Seats', '🧳 6 Bags', '❄️ Super GL AC'],
    description: 'High-capacity microbus for corporate delegations, wedding guest transfers, and long distance nationwide team excursions.',
    baseFare: 1607,
    imagePosition: '50% 50%',
    scale: 1.6,
  },
  chander: {
    id: 'chander',
    name: 'Mountain Chander Gari',
    category: 'adventure',
    tag: '4x4 Hill-Tracts Safari',
    seats: '8-12 Seats',
    seatCount: 10,
    luggage: 'All Terrain',
    features: ['👥 8-12 Seats', '⛰️ 4WD Offroad', '🌲 Open Air / Roll Cage'],
    description: 'Rugged high-clearance off-road vehicles engineered for steep climbs in Sajek Valley, Bandarban, Nilgiri, and remote hill tracts.',
    baseFare: 1207,
    imagePosition: 'bottom',
    scale: 1.6,
  },
};

export const INTERCITY_ROUTES: IntercityRoute[] = [
  {
    id: 'dhaka-ctg',
    from: 'Dhaka',
    to: 'Chittagong',
    distance: '248 km',
    duration: '4.5 hrs',
    prices: {
      sedan: 'BDT 5,500 - 6,200',
      noah: 'BDT 7,500 - 8,500',
      hiace: 'BDT 10,500 - 12,000',
    },
  },
  {
    id: 'dhaka-sylhet',
    from: 'Dhaka',
    to: 'Sylhet',
    distance: '240 km',
    duration: '5 hrs',
    prices: {
      sedan: 'BDT 5,200 - 5,900',
      noah: 'BDT 7,000 - 8,000',
      hiace: 'BDT 9,800 - 11,200',
    },
  },
  {
    id: 'dhaka-cox',
    from: 'Dhaka',
    to: "Cox's Bazar",
    distance: '390 km',
    duration: '8 hrs',
    prices: {
      sedan: 'BDT 9,500 - 11,000',
      noah: 'BDT 12,500 - 14,000',
      hiace: 'BDT 16,000 - 18,500',
    },
  },
];
