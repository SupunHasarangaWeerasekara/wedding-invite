'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnvelopeCoverProps {
  guestName: string;
  coupleNames: string;
  coupleNamesSi?: string;
  venueName?: string;
  weddingDateStr?: string;
  onOpen: () => void;
  onPlayMusic?: () => void;
}

export default function EnvelopeCover({
  guestName,
  coupleNames,
  coupleNamesSi,
  venueName = 'Shangri-La Hotel Colombo',
  weddingDateStr = 'Saturday, December 18, 2026',
  onOpen,
  onPlayMusic,
}: EnvelopeCoverProps) {
  const [isOpening, setIsOpening] = useState(false);

  const nameParts = coupleNames.split('&').map((n) => n.trim());

  const handleOpenClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isOpening) return;

    // Immediately trigger music inside user's gesture to guarantee browser audio permission
    if (onPlayMusic) {
      try {
        onPlayMusic();
      } catch (err) {
        console.warn('Audio play trigger error:', err);
      }
    }
    setIsOpening(true);
    onOpen();
  };

  return (
    <AnimatePresence mode="wait">
      {!isOpening && (
        <motion.div
          key="envelope-cover"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFFDFD] text-[#1E1B1E] px-4 py-8 select-none overflow-y-auto"
        >
          {/* Center Content Box - perfectly centered & responsive for all mobile viewports */}
          <div className="relative z-20 my-auto flex w-full max-w-sm flex-col items-center text-center">
            {/* Top red sparkle with fading lines */}
            <div className="flex items-center justify-center gap-3 w-36 mb-4 sm:mb-5 opacity-90">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-rose-400" />
              <span className="text-rose-500 text-xs">✦</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-rose-400" />
            </div>

            {/* Personalized Guest Greeting */}
            <p className="font-playfair italic text-base sm:text-lg text-stone-700 tracking-wide mb-1">
              Dear {guestName},
            </p>

            {/* Sub-label */}
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.28em] font-semibold text-rose-600 mb-4 sm:mb-5">
              You Are Warmly Invited To The Wedding Of
            </p>

            {/* Center Ring Badge */}
            <div className="relative mb-4 sm:mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white shadow-[0_4px_25px_rgba(225,29,72,0.18)] border-2 border-rose-300">
              <span className="text-2xl sm:text-3xl">💍</span>
            </div>

            {/* Couple Names - English & Sinhala */}
            <div className="mb-2 text-center w-full">
              <h1 className="font-playfair italic text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-stone-900 drop-shadow-sm">
                {nameParts[0]}
              </h1>
              <span className="font-playfair italic text-xl sm:text-2xl text-rose-500 my-0.5 block">&</span>
              <h1 className="font-playfair italic text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-stone-900 drop-shadow-sm">
                {nameParts[1]}
              </h1>

              {/* Sinhala Couple Typography */}
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50/90 px-3.5 sm:px-4 py-1.5 shadow-sm">
                <span className="text-rose-500 text-xs">✦</span>
                <span className="font-sinhala text-base sm:text-lg md:text-xl font-bold text-rose-900 tracking-wider">
                  {coupleNamesSi || 'විනෝද් සහ නිම්නාදී'}
                </span>
                <span className="text-rose-500 text-xs">✦</span>
              </div>
            </div>

            {/* Crimson Accent underline */}
            <div className="my-4 sm:my-5 h-[2px] w-20 sm:w-24 bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded-full" />

            {/* Wedding Date & Venue */}
            <p className="font-playfair italic text-xs sm:text-sm text-stone-700 mb-1">
              {weddingDateStr}
            </p>
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-rose-700 font-semibold mb-5 sm:mb-6">
              {venueName}
            </p>

            {/* Pill CTA Button */}
            <button
              onClick={handleOpenClick}
              className="w-full max-w-[270px] rounded-full py-3 sm:py-3.5 px-6 font-playfair italic text-sm sm:text-base text-white shadow-[0_8px_25px_rgba(225,29,72,0.35)] transition hover:brightness-110 active:scale-97 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 50%, #881337 100%)',
              }}
            >
              Open Our Invitation
            </button>

            {/* Tap to reveal label */}
            <p className="mt-3 sm:mt-4 text-[9px] uppercase tracking-[0.35em] text-rose-600 font-medium">
              Tap To Reveal
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
