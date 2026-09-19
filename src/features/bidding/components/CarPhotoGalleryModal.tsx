'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '@/features/trips/services/customerTripService';
import { useLanguage } from '@/context/LanguageContext';

interface CarPhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  carName?: string;
  regNumber?: string;
}

export const CarPhotoGalleryModal: React.FC<CarPhotoGalleryModalProps> = ({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  carName,
  regNumber,
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const activeImage = images[currentIndex];
  const activeImageUrl = getImageUrl(activeImage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 text-white">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <ImageIcon className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                {carName || (isBn ? 'গাড়ির ছবি' : 'Vehicle Photos')}
              </h3>
              {regNumber && (
                <p className="text-[11px] font-mono text-emerald-400 font-semibold">{regNumber}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Image Counter Badge */}
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 border border-white/10 text-slate-300">
              {currentIndex + 1} / {images.length}
            </span>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Large Image Viewport */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[440px] bg-black flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-[320px] sm:h-[460px]">
            <Image
              src={activeImageUrl}
              alt={`Car photo ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>

          {/* Previous Arrow */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Arrow */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 shadow-lg"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Thumbnails Strip */}
        {images.length > 1 && (
          <div className="px-5 py-3 border-t border-white/10 bg-slate-900/90 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {images.map((img, idx) => {
              const thumbUrl = getImageUrl(img);
              const isActive = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                    isActive
                      ? 'border-emerald-400 scale-105 ring-2 ring-emerald-400/20'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={thumbUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarPhotoGalleryModal;
