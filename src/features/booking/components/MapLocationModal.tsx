'use client';

import React, { useState } from 'react';
import { LocationSearchResult } from '@/features/trips/types/customerApi';
import { customerTripService } from '@/features/trips/services/customerTripService';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, X, Navigation, Check, Search, Loader2 } from 'lucide-react';

interface MapLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: LocationSearchResult) => void;
  title?: string;
  initialLocation?: LocationSearchResult | null;
}

const POPULAR_LOCATIONS: LocationSearchResult[] = [
  {
    uuid: '87fbc635-e85c-4f4e-bc4a-a136ffbab3c6',
    place_id: 'ChIJJ3cCAADHVTcRnf62vZTOlOs',
    address: '37 Eastern Rd, Dhaka 1212, Bangladesh',
    latitude: 23.8103308,
    longitude: 90.4124933,
  },
  {
    uuid: '2b809f83-681d-4bb8-a2be-779dcb64c440',
    place_id: 'ChIJ3-Bm22XBVTcRf-4xUi7WhZA',
    address: 'Senpara Porbota, Mirpur 10, Dhaka, Bangladesh',
    latitude: 23.804553,
    longitude: 90.3701579,
  },
  {
    uuid: '2c81229b-2fc4-46e9-b539-448b73c85fd3',
    place_id: 'ChIJO1Q4uqfHVTcRLteW0krx1ZE',
    address: 'Gulshan 2, Dhaka, Bangladesh',
    latitude: 23.7947536,
    longitude: 90.4143085,
  },
  {
    uuid: '1bafeb4d-a0bf-44d5-abb6-d0a95f8ef4cf',
    place_id: 'ChIJh-Ts-wc0VTcRSkHUmZWbBl0',
    address: 'Barisal Sadar, Barisal, Bangladesh',
    latitude: 22.7132876,
    longitude: 90.3496278,
  },
  {
    uuid: 'a8680823-331c-453d-96fa-ca50e1272cb4',
    place_id: 'ChIJAQAAADA0VTcRkou_foSDILE',
    address: 'Barishal Airport, Bhanga-Barisal Highway, Bangladesh',
    latitude: 22.798734,
    longitude: 90.2998388,
  },
];

export const MapLocationModal: React.FC<MapLocationModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  title,
  initialLocation,
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPin, setSelectedPin] = useState<LocationSearchResult>(
    initialLocation || POPULAR_LOCATIONS[0]
  );

  if (!isOpen) return null;

  const modalTitle =
    title || (isBn ? 'ম্যাপে অবস্থান নির্বাচন করুন' : 'Select Location on Map');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await customerTripService.searchLocations(searchQuery, language);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleConfirm = () => {
    onSelectLocation(selectedPin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
              <MapPin className="w-4 h-4 text-emerald-400" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                {modalTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'ম্যাপের পিন অথবা সার্চ ব্যবহার করে সঠিক অবস্থান সেট করুন'
                  : 'Set your precise location using search or map pin'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100">
          <form onSubmit={handleSearch} className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isBn
                    ? 'এলাকা, সড়ক বা শহরের নাম খুঁজুন (যেমন: বরিশাল, মিরপুর ১০, গুলশান)...'
                    : 'Search area, road or city (e.g. Barisal, Mirpur 10, Gulshan)...'
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-black transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isBn ? (
                'সার্চ'
              ) : (
                'Search'
              )}
            </button>
          </form>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto divide-y divide-slate-100">
              {searchResults.map((item) => (
                <button
                  key={item.uuid}
                  onClick={() => {
                    setSelectedPin(item);
                    setSearchResults([]);
                    setSearchQuery('');
                  }}
                  className="w-full text-left p-2.5 px-3 hover:bg-slate-50 flex items-start gap-2 text-xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-slate-900 block">
                      {item.address.split(',')[0]}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate block">
                      {item.address}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map View Simulated Workspace */}
        <div className="relative flex-1 min-h-[260px] bg-slate-100 overflow-hidden flex items-center justify-center">
          {/* Decorative Map Pattern */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Embedded Interactive Google Map Iframe based on selected coordinates */}
          <iframe
            title="Location Map"
            width="100%"
            height="100%"
            className="border-0 absolute inset-0 pointer-events-auto"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${selectedPin.latitude},${selectedPin.longitude}&z=14&output=embed`}
          />

          {/* Pin Center Marker Overlay */}
          <div className="relative z-10 flex flex-col items-center pointer-events-none -mt-8">
            <div className="bg-black text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg border border-white/20 mb-1 flex items-center gap-1.5 animate-bounce">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{selectedPin.address.split(',')[0]}</span>
            </div>
            <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white">
              <Navigation className="w-3 h-3 rotate-45" />
            </div>
          </div>

          {/* Location Quick Chips */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex gap-1.5 overflow-x-auto pb-1">
            {POPULAR_LOCATIONS.map((loc) => (
              <button
                key={loc.uuid}
                type="button"
                onClick={() => setSelectedPin(loc)}
                className={`text-[11px] whitespace-nowrap font-bold px-3 py-1.5 rounded-lg border shadow-sm transition-all ${
                  selectedPin.uuid === loc.uuid
                    ? 'bg-black text-white border-black ring-1 ring-black'
                    : 'bg-white/95 backdrop-blur-sm text-slate-700 border-slate-200 hover:bg-white'
                }`}
              >
                📍 {loc.address.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Address Confirmation Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {isBn ? 'নির্বাচিত অবস্থান ও কোঅর্ডিনেট' : 'Selected Location & Coordinates'}
            </span>
            <div className="text-xs font-bold text-slate-900 truncate">
              {selectedPin.address}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Lat: {selectedPin.latitude.toFixed(6)}, Lng: {selectedPin.longitude.toFixed(6)} | ID: {selectedPin.uuid.slice(0, 8)}...
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> {isBn ? 'অবস্থান নিশ্চিত করুন' : 'Confirm Location'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
