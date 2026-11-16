'use client';

import React, { useState } from 'react';
import { GalleryPhoto } from '@/lib/types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LightboxGalleryProps {
  photos: GalleryPhoto[];
}

export default function LightboxGallery({ photos }: LightboxGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openModal = (idx: number) => setSelectedIndex(idx);
  const closeModal = () => setSelectedIndex(null);

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  };

  return (
    <div>
      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 max-w-sm mx-auto">
        {photos.map((photo, idx) => (
          <motion.div
            key={photo.id || idx}
            whileHover={{ scale: 1.02 }}
            onClick={() => openModal(idx)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-rose-200/80 bg-white shadow-md aspect-4/5"
          >
            <img
              src={photo.image_url}
              alt={photo.caption || 'Wedding moment'}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-2 sm:p-2.5">
              <p className="text-[10px] text-white font-medium">
                {photo.caption}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0406]/95 p-4 backdrop-blur-xl"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition cursor-pointer"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition cursor-pointer"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div
              className="relative max-w-md w-full overflow-hidden rounded-2xl border border-rose-500/30 bg-[#16080C] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos[selectedIndex].image_url}
                alt={photos[selectedIndex].caption || 'Wedding moment'}
                className="max-h-[70vh] w-full object-contain bg-black/40"
              />
              {photos[selectedIndex].caption && (
                <div className="p-3 text-center bg-[#16080C]">
                  <p className="text-xs text-rose-200">
                    {photos[selectedIndex].caption}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
