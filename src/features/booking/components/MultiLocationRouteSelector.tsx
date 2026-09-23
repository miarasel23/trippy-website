'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LocationSearchResult } from '@/features/trips/types/customerApi';
import { customerTripService } from '@/features/trips/services/customerTripService';
import { MapLocationModal } from './MapLocationModal';
import { useLanguage } from '@/context/LanguageContext';
import {
  Navigation,
  MapPin,
  Plus,
  Trash2,
  Map,
  Loader2,
  X,
  Compass,
  Search,
} from 'lucide-react';

interface MultiLocationRouteSelectorProps {
  pickupLocations: LocationSearchResult[];
  dropoffLocations: LocationSearchResult[];
  onChangePickups: (locations: LocationSearchResult[]) => void;
  onChangeDropoffs: (locations: LocationSearchResult[]) => void;
  onSelectActiveLocation?: (type: 'pickup' | 'dropoff', index: number) => void;
}

interface SingleLocationFieldProps {
  label: string;
  placeholder: string;
  isPickup: boolean;
  location: LocationSearchResult | null;
  onSelect: (loc: LocationSearchResult) => void;
  onRemove?: () => void;
  canRemove?: boolean;
  onOpenMap: () => void;
  onFocusField?: () => void;
}

// Popular locations in Bangladesh for instant 1-click selection on click
const DEFAULT_POPULAR_LOCATIONS: LocationSearchResult[] = [

];

const SingleLocationField: React.FC<SingleLocationFieldProps> = ({
  label,
  placeholder,
  isPickup,
  location,
  onSelect,
  onRemove,
  canRemove = false,
  onOpenMap,
  onFocusField,
}) => {
  const { language } = useLanguage();
  const [query, setQuery] = useState(location?.address || '');
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(location?.address || '');
  }, [location]);

  // When user clicks/focuses or types in the input
  const handleOpenDropdown = async () => {
    setIsOpen(true);
    onFocusField?.();
    if (!query || query.trim().length === 0) {
      setSuggestions(DEFAULT_POPULAR_LOCATIONS);
    } else {
      setIsLoading(true);
      const results = await customerTripService.searchLocations(query, language);
      setSuggestions(results.length > 0 ? results : DEFAULT_POPULAR_LOCATIONS);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (!query || query.trim().length < 2) {
      setSuggestions(DEFAULT_POPULAR_LOCATIONS);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const results = await customerTripService.searchLocations(query, language);
      setSuggestions(results.length > 0 ? results : DEFAULT_POPULAR_LOCATIONS);
      setIsLoading(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [query, isOpen, language]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative group" ref={containerRef}>
      <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 focus-within:border-black focus-within:ring-1 focus-within:ring-black/10 transition-all">
        {/* Type Icon Indicator */}
        <span
          className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 border ${isPickup
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-red-50 text-red-600 border-red-200'
            }`}
        >
          {isPickup ? (
            <Navigation className="w-3.5 h-3.5" />
          ) : (
            <MapPin className="w-3.5 h-3.5" />
          )}
        </span>

        {/* Input area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {label}
            </label>
            {location?.latitude && location?.longitude ? (
              <span className="text-[10px] text-emerald-600 font-mono font-medium">
                ({location.latitude.toFixed(2)}, {location.longitude.toFixed(2)})
              </span>
            ) : null}
          </div>
          <input
            type="text"
            value={query}
            onClick={handleOpenDropdown}
            onFocus={handleOpenDropdown}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            placeholder={placeholder}
            className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none truncate"
          />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin flex-shrink-0" />
          )}

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions(DEFAULT_POPULAR_LOCATIONS);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}



          {/* Remove Stop Button */}
          {canRemove && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              title={language === 'bn' ? 'এই স্টপ বাদ দিন' : 'Remove this stop'}
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
          <div className="px-3.5 py-1.5 bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {query.trim().length >= 2
              ? language === 'bn'
                ? 'অনুসন্ধান ফলাফল'
                : 'Search Results'
              : language === 'bn'
                ? 'জনপ্রিয় লোকেশন নির্বাচন করুন'
                : 'Popular Locations in Bangladesh'}
          </div>
          {suggestions.map((item, idx) => (
            <button
              key={`${item.uuid || item.place_id || idx}`}
              type="button"
              onClick={() => {
                onSelect(item);
                setQuery(item.address);
                setIsOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-start gap-2.5 transition-colors group/item"
            >
              <MapPin className="w-4 h-4 text-slate-400 group-hover/item:text-black flex-shrink-0 mt-0.5 transition-colors" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {item.address.split(',')[0]}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {item.address}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const MultiLocationRouteSelector: React.FC<MultiLocationRouteSelectorProps> = ({
  pickupLocations,
  dropoffLocations,
  onChangePickups,
  onChangeDropoffs,
  onSelectActiveLocation,
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [activeMapTarget, setActiveMapTarget] = useState<{
    type: 'pickup' | 'dropoff';
    index: number;
  } | null>(null);

  // Add extra pickup stop
  const handleAddPickup = () => {
    onChangePickups([
      ...pickupLocations,
      {
        uuid: '',
        address: '',
        latitude: 23.8103,
        longitude: 90.4125,
      },
    ]);
  };

  // Remove pickup stop
  const handleRemovePickup = (index: number) => {
    const updated = pickupLocations.filter((_, idx) => idx !== index);
    onChangePickups(updated);
  };

  // Update specific pickup stop
  const handleUpdatePickup = (index: number, loc: LocationSearchResult) => {
    const updated = [...pickupLocations];
    updated[index] = loc;
    onChangePickups(updated);
  };

  // Update single dropoff stop
  const handleUpdateDropoff = (index: number, loc: LocationSearchResult) => {
    const updated = [...dropoffLocations];
    updated[index] = loc;
    onChangeDropoffs(updated);
  };

  return (
    <div className="space-y-4 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm">
      {/* Pickup Locations List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {isBn
              ? `পিকআপ পয়েন্ট (${pickupLocations.length})`
              : `Pickup Points (${pickupLocations.length})`}
          </span>
          <button
            type="button"
            onClick={handleAddPickup}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />{' '}
            {isBn ? 'মাল্টি পিকআপ যোগ করুন' : 'Add Pickup Stop'}
          </button>
        </div>

        {pickupLocations.map((loc, idx) => (
          <SingleLocationField
            key={`pickup-${idx}`}
            label={
              isBn
                ? `পিকআপ পয়েন্ট ${pickupLocations.length > 1 ? `#${idx + 1}` : ''}`
                : `Pickup Point ${pickupLocations.length > 1 ? `#${idx + 1}` : ''}`
            }
            placeholder={
              isBn
                ? 'পিকআপ লোকেশন নির্বাচন করুন বা লিখুন...'
                : 'Enter or select pickup location...'
            }
            isPickup={true}
            location={loc.address ? loc : null}
            onSelect={(selected) => handleUpdatePickup(idx, selected)}
            onRemove={() => handleRemovePickup(idx)}
            canRemove={pickupLocations.length > 1}
            onFocusField={() => onSelectActiveLocation?.('pickup', idx)}
            onOpenMap={() => {
              setActiveMapTarget({ type: 'pickup', index: idx });
              onSelectActiveLocation?.('pickup', idx);
            }}
          />
        ))}
      </div>

      <div className="border-t border-slate-100 my-1" />

      {/* Single Dropoff Location (Dropoff is strictly single) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {isBn
              ? 'ড্রপঅফ গন্তব্য (একটি গন্তব্য)'
              : 'Dropoff Destination (Single)'}
          </span>
        </div>

        <SingleLocationField
          key="single-dropoff"
          label={isBn ? 'ড্রপঅফ গন্তব্য' : 'Dropoff Destination'}
          placeholder={
            isBn
              ? 'কোথায় যাবেন? গন্তব্য নির্বাচন বা সার্চ করুন...'
              : 'Where to? Enter or select destination...'
          }
          isPickup={false}
          location={dropoffLocations[0]?.address ? dropoffLocations[0] : null}
          onSelect={(selected) => handleUpdateDropoff(0, selected)}
          canRemove={false}
          onFocusField={() => onSelectActiveLocation?.('dropoff', 0)}
          onOpenMap={() => {
            setActiveMapTarget({ type: 'dropoff', index: 0 });
            onSelectActiveLocation?.('dropoff', 0);
          }}
        />
      </div>

      {/* Interactive Map Location Picker Modal */}
      {activeMapTarget && (
        <MapLocationModal
          isOpen={Boolean(activeMapTarget)}
          onClose={() => setActiveMapTarget(null)}
          title={
            activeMapTarget.type === 'pickup'
              ? isBn
                ? `পিকআপ পয়েন্ট #${activeMapTarget.index + 1} ম্যাপে পরিবর্তন`
                : `Adjust Pickup Point #${activeMapTarget.index + 1} on Map`
              : isBn
                ? 'ড্রপঅফ গন্তব্য ম্যাপে পরিবর্তন'
                : 'Adjust Dropoff Destination on Map'
          }
          initialLocation={
            activeMapTarget.type === 'pickup'
              ? pickupLocations[activeMapTarget.index]
              : dropoffLocations[activeMapTarget.index]
          }
          onSelectLocation={(selectedLoc) => {
            if (activeMapTarget.type === 'pickup') {
              handleUpdatePickup(activeMapTarget.index, selectedLoc);
            } else {
              handleUpdateDropoff(activeMapTarget.index, selectedLoc);
            }
          }}
        />
      )}
    </div>
  );
};

export default MultiLocationRouteSelector;
