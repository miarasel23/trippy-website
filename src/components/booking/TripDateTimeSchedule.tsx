'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Calendar, Clock, RotateCcw, Timer, AlertCircle } from 'lucide-react';

interface TripDateTimeScheduleProps {
  serviceType: string;
  startDatetime: string;
  endDatetime: string;
  hoursBooked: string;
  onChangeStartDatetime: (val: string) => void;
  onChangeEndDatetime: (val: string) => void;
  onChangeHoursBooked: (val: string) => void;
}

export function formatDateTimeToApi(date: Date): string {
  // Convert or format date to BD Time YYYY-MM-DD HH:mm:ss
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

/** Convert API string "YYYY-MM-DD HH:mm:ss" → input[type=datetime-local] value "YYYY-MM-DDTHH:mm" */
function apiToInputValue(apiStr: string): string {
  if (!apiStr) return '';
  return apiStr.replace(' ', 'T').slice(0, 16);
}

/** Convert input[type=datetime-local] value "YYYY-MM-DDTHH:mm" → API string "YYYY-MM-DD HH:mm:ss" */
function inputToApiValue(inputVal: string): string {
  if (!inputVal) return '';
  return inputVal.replace('T', ' ') + ':00';
}

/** Format an API datetime string into a human-readable "Mon, DD MMM YYYY · h:mm AM/PM" label */
function formatDisplayLabel(apiStr: string): string {
  if (!apiStr) return '';
  try {
    const date = new Date(apiStr.replace(' ', 'T'));
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

export const TripDateTimeSchedule: React.FC<TripDateTimeScheduleProps> = ({
  serviceType,
  startDatetime,
  endDatetime,
  hoursBooked,
  onChangeStartDatetime,
  onChangeEndDatetime,
  onChangeHoursBooked,
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const isReturn = serviceType === 'RETURN';
  const isHourly = serviceType === 'HOURLY';
  const isRideShare = serviceType === 'RIDE_SHARE';

  // Minimum allowed start time: now for RIDE_SHARE, or now + 2 hours for all scheduled/non-rideshare services
  const minLeadMs = isRideShare ? 0 : 2 * 3600 * 1000;
  const minAllowedDate = new Date(Date.now() + minLeadMs);

  // Automatically select current time + 2 hours for non-rideshare trips, or now for rideshare if past
  React.useEffect(() => {
    const now = Date.now();
    const minRequiredTs = now + minLeadMs;
    const currentStartTs = startDatetime ? new Date(startDatetime.replace(' ', 'T')).getTime() : 0;

    // If startDatetime is missing, invalid, or earlier than the required lead time:
    if (!startDatetime || isNaN(currentStartTs) || currentStartTs < minRequiredTs - 30 * 1000) {
      const autoDate = new Date(minRequiredTs);
      onChangeStartDatetime(formatDateTimeToApi(autoDate));
      if (isReturn) {
        const currentEndTs = endDatetime ? new Date(endDatetime.replace(' ', 'T')).getTime() : 0;
        if (!endDatetime || isNaN(currentEndTs) || currentEndTs <= minRequiredTs) {
          const laterEnd = new Date(autoDate.getTime() + 8 * 3600 * 1000);
          onChangeEndDatetime(formatDateTimeToApi(laterEnd));
        }
      }
    }
  }, [serviceType, isRideShare, minLeadMs]);

  const [activePreset, setActivePreset] = React.useState<'earliest' | 'today_evening' | 'tomorrow_morning' | null>(null);

  const setQuickSchedule = (type: 'earliest' | 'today_evening' | 'tomorrow_morning') => {
    setActivePreset(type);
    const now = new Date();
    if (type === 'earliest') {
      const earliest = new Date(now.getTime() + minLeadMs);
      onChangeStartDatetime(formatDateTimeToApi(earliest));
      if (isReturn) {
        const later = new Date(earliest.getTime() + 8 * 3600 * 1000);
        onChangeEndDatetime(formatDateTimeToApi(later));
      }
    } else if (type === 'today_evening') {
      const evening = new Date();
      evening.setHours(18, 0, 0, 0);
      // Ensure it respects 2-hour lead time
      const minDate = new Date(now.getTime() + minLeadMs);
      if (evening < minDate) {
        evening.setDate(evening.getDate() + 1);
      }
      onChangeStartDatetime(formatDateTimeToApi(evening));
      if (isReturn) {
        const later = new Date(evening.getTime() + 10 * 3600 * 1000);
        onChangeEndDatetime(formatDateTimeToApi(later));
      }
    } else if (type === 'tomorrow_morning') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      const minDate = new Date(now.getTime() + minLeadMs);
      if (tomorrow < minDate) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      onChangeStartDatetime(formatDateTimeToApi(tomorrow));
      if (isReturn) {
        const later = new Date(tomorrow.getTime() + 12 * 3600 * 1000);
        onChangeEndDatetime(formatDateTimeToApi(later));
      }
    }
  };

  const presets: { key: 'earliest' | 'today_evening' | 'tomorrow_morning'; label: string; labelBn: string }[] = [
    {
      key: 'earliest',
      label: isRideShare ? '⚡ Ride Now' : '⏱️ Earliest (+2 Hours)',
      labelBn: isRideShare ? '⚡ এখনই যাত্রা' : '⏱️ দ্রুততম (২ ঘন্টা পর)',
    },
    { key: 'today_evening',    label: '🌆 This Evening (6:00 PM)',     labelBn: '🌆 আজ সন্ধ্যায় (৬:০০ PM)' },
    { key: 'tomorrow_morning', label: '🌅 Tomorrow Morning (9:00 AM)', labelBn: '🌅 কাল সকালে (৯:০০ AM)' },
  ];

  // Helper check if selected start time is in the past or less than 2 hours for scheduled rides
  const nowTs = Date.now();
  const startTs = startDatetime ? new Date(startDatetime.replace(' ', 'T')).getTime() : 0;
  const isPastTime = !isRideShare && startTs > 0 && startTs < (nowTs - 60 * 1000);
  const isStartTimeTooEarly = !isRideShare && startTs > 0 && startTs < (nowTs + 2 * 3600 * 1000 - 60 * 1000);

  const startDisplay = formatDisplayLabel(startDatetime);
  const endDisplay   = formatDisplayLabel(endDatetime);

  // Minimum return datetime should be at least 30 mins after startDatetime
  const minEndDate = startTs > 0
    ? new Date(startTs + 30 * 60 * 1000)
    : minAllowedDate;

  return (
    <div className="space-y-3 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            {isBn ? 'সময়সূচি (বাংলাদেশ সময়)' : 'Schedule (Bangladesh Time)'}
          </span>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
            {isBn ? 'যাত্রার তারিখ ও সময় নির্ধারণ' : 'Select Travel Date & Time'}
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          {!isRideShare && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {isBn ? 'কমপক্ষে ২ ঘন্টা আগে' : 'Min 2h Advance'}
            </span>
          )}
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            BD Time (UTC+6)
          </span>
        </div>
      </div>

      {/* Quick Schedule Presets — with active/selected highlight */}
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const isActive = activePreset === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setQuickSchedule(p.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                isActive
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-transparent'
              }`}
            >
              {isBn ? p.labelBn : p.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Start Datetime — native picker with min attribute (disallowing past and < 2h for non-rideshare) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 focus-within:border-black transition-all">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-600" />
              {isBn ? 'যাত্রার তারিখ ও সময়' : 'Departure Date & Time'}
            </label>
            <span className="text-[10px] font-bold text-slate-500">
              {isRideShare
                ? (isBn ? 'ন্যূনতম: এখন' : 'Min: Now')
                : (isBn ? 'ন্যূনতম: ২ ঘন্টা পর' : 'Min: 2h later')}
            </span>
          </div>
          <input
            type="datetime-local"
            min={apiToInputValue(formatDateTimeToApi(minAllowedDate))}
            value={apiToInputValue(startDatetime)}
            onChange={(e) => {
              setActivePreset(null);
              const val = e.target.value;
              if (!val) return;
              const chosenTs = new Date(val).getTime();
              const currentNow = Date.now();
              const requiredMin = currentNow + (isRideShare ? 0 : 2 * 3600 * 1000);

              // Disallow selecting past time or < 2h for non-rideshare
              if (chosenTs < requiredMin - 30 * 1000) {
                const clamped = new Date(requiredMin);
                onChangeStartDatetime(formatDateTimeToApi(clamped));
                if (isReturn) {
                  const endTs = new Date(endDatetime.replace(' ', 'T')).getTime();
                  if (isNaN(endTs) || endTs <= clamped.getTime()) {
                    onChangeEndDatetime(formatDateTimeToApi(new Date(clamped.getTime() + 8 * 3600 * 1000)));
                  }
                }
              } else {
                onChangeStartDatetime(inputToApiValue(val));
                if (isReturn) {
                  const endTs = new Date(endDatetime.replace(' ', 'T')).getTime();
                  if (isNaN(endTs) || endTs <= chosenTs) {
                    onChangeEndDatetime(formatDateTimeToApi(new Date(chosenTs + 8 * 3600 * 1000)));
                  }
                }
              }
            }}
            className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
          />
          {startDisplay && (
            <p className="text-[10px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {startDisplay}
            </p>
          )}
        </div>

        {/* Return End Datetime (MANDATORY IF RETURN) */}
        {isReturn && (
          <div className="bg-amber-50/70 border-2 border-amber-400/90 rounded-xl p-3 focus-within:border-black transition-all">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] uppercase font-extrabold text-amber-900 tracking-wider flex items-center gap-1">
                <RotateCcw className="w-3 h-3 text-amber-700" />
                {isBn ? 'ফেরার তারিখ ও সময় (আবশ্যক)' : 'Return Date & Time (Required)'}
              </label>
              <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                Required
              </span>
            </div>
            <input
              type="datetime-local"
              min={apiToInputValue(formatDateTimeToApi(minEndDate))}
              value={apiToInputValue(endDatetime)}
              onChange={(e) => {
                setActivePreset(null);
                const val = e.target.value;
                if (!val) return;
                const chosenTs = new Date(val).getTime();
                const currentStartTs = new Date(startDatetime.replace(' ', 'T')).getTime();
                const minReturnTs = !isNaN(currentStartTs) && currentStartTs > 0
                  ? currentStartTs + 30 * 60 * 1000
                  : Date.now() + 2 * 3600 * 1000;

                if (chosenTs < minReturnTs) {
                  const clamped = new Date(minReturnTs);
                  onChangeEndDatetime(formatDateTimeToApi(clamped));
                } else {
                  onChangeEndDatetime(inputToApiValue(val));
                }
              }}
              className="w-full bg-transparent text-xs sm:text-sm font-bold text-amber-950 focus:outline-none cursor-pointer"
            />
            {endDisplay && (
              <p className="text-[10px] text-amber-800 font-bold mt-1.5 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {endDisplay}
              </p>
            )}
          </div>
        )}

        {/* Hourly Duration Selector */}
        {isHourly && (
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3">
            <label className="block text-[10px] uppercase font-bold text-blue-800 tracking-wider mb-1.5 flex items-center gap-1">
              <Timer className="w-3 h-3 text-blue-600" />
              {isBn ? 'কত ঘন্টার প্যাকেজ?' : 'Hours Package:'}
            </label>
            <div className="flex gap-1.5">
              {['2', '4', '6', '8', '12', '24'].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => onChangeHoursBooked(h)}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                    hoursBooked === h
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-blue-100/60 border border-blue-200/60'
                  }`}
                >
                  {isBn ? `${h}ঘ` : `${h}h`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isPastTime && (
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-800 bg-red-50 border border-red-300 rounded-xl px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-600" />
          <span>
            {isBn
              ? isRideShare
                ? 'অতীতের সময় নির্বাচন করা যাবে না। রাইড শেয়ারের জন্য বর্তমান সময় বা ভবিষ্যতের সময় নির্বাচন করুন।'
                : 'অতীতের তারিখ বা সময় নির্বাচন করা যাবে না। অনুগ্রহ করে বর্তমান বা ভবিষ্যতের সময় নির্ধারণ করুন।'
              : isRideShare
                ? 'Cannot select a past time. For Ride Share, please select the current time or later.'
                : 'Cannot select a past date or time. Please select a current or future departure time.'}
          </span>
        </div>
      )}

      {isStartTimeTooEarly && (
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 rounded-xl px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
          <span>
            {isBn
              ? 'নোট: ইন্টারসিটি/রিটার্ন ট্রিপের জন্য শিডিউল কমপক্ষে বর্তমান সময় থেকে ২ ঘন্টা পরের হতে হবে।'
              : 'Notice: Non-rideshare services require departure scheduled at least 2 hours in advance.'}
          </span>
        </div>
      )}

      {isReturn && !endDatetime && (
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {isBn
              ? 'রিটার্ন ট্রিপের জন্য ফেরার তারিখ ও সময় প্রদান করা বাধ্যতামূলক।'
              : 'Return date and time is mandatory for round trips.'}
          </span>
        </div>
      )}
    </div>
  );
};

export default TripDateTimeSchedule;

