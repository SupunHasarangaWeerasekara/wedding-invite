'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnvelopeCoverProps {
  guestName: string;
  coupleNames: string;
  venueName?: string;
  weddingDateStr?: string;
  onOpen: () => void;
  onPlayMusic?: () => void;
}

export default function EnvelopeCover({
  guestName,
  coupleNames,
  venueName = 'Shangri-La Hotel Colombo',
  weddingDateStr = 'Saturday, December 18, 2026',
  onOpen,
  onPlayMusic,
}: EnvelopeCoverProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [showHearts, setShowHearts] = useState(false);

  const nameParts = coupleNames.split('&').map((n) => n.trim());

  const handleOpenClick = () => {
    // 1. Immediately trigger music inside user's gesture to guarantee browser audio permission
    if (onPlayMusic) {
      try {
        onPlayMusic();
      } catch (e) {
        console.warn('Audio play trigger error:', e);
      }
    }
    setShowHearts(true);
    setIsOpening(true);
    setTimeout(() => {
      onOpen();
    }, 900);
  };

  return (
    <AnimatePresence mode="wait">
      {!isOpening && (
        <motion.div
          key="envelope-cover"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0406] text-[#FFF1F2] px-4 py-8 select-none overflow-y-auto"
        >
          {/* Heart burst when clicked */}
          {showHearts && (
            <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
              {[...Array(12)].map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1.4, 0.8],
                    opacity: [1, 0.9, 0],
                    x: Math.sin((i * 30 * Math.PI) / 180) * 160 + (Math.random() * 20),
                    y: Math.cos((i * 30 * Math.PI) / 180) * 160 - 30,
                  }}
                  transition={{ duration: 0.85, ease: 'easeOut' }}
                  className="absolute text-2xl text-rose-500"
                >
                  ♥
                </motion.span>
              ))}
            </div>
          )}

          {/* Center Content Box - perfectly centered & responsive for all mobile viewports */}
          <div className="relative z-20 my-auto flex w-full max-w-sm flex-col items-center text-center">
            {/* Top red sparkle with fading lines */}
            <div className="flex items-center justify-center gap-3 w-36 mb-4 sm:mb-5 opacity-90">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-rose-500" />
              <span className="text-rose-400 text-xs">✦</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-rose-500" />
            </div>

            {/* Personalized Guest Greeting */}
            <p className="font-playfair italic text-base sm:text-lg text-rose-100 tracking-wide mb-1">
              Dear {guestName},
            </p>

            {/* Sub-label */}
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.28em] font-medium text-rose-400 mb-4 sm:mb-5">
              You Are Warmly Invited To The Wedding Of
            </p>

            {/* Center Ring Badge */}
            <div className="relative mb-4 sm:mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#1A070D] shadow-[0_0_30px_rgba(225,29,72,0.45)] border-2 border-rose-500">
              <span className="text-2xl sm:text-3xl">💍</span>
            </div>

            {/* Couple Names - English & Sinhala */}
            <div className="mb-2 text-center w-full">
              <h1 className="font-playfair italic text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white drop-shadow-sm">
                {nameParts[0]}
              </h1>
              <span className="font-playfair italic text-xl sm:text-2xl text-rose-400 my-0.5 block">&</span>
              <h1 className="font-playfair italic text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white drop-shadow-sm">
                {nameParts[1]}
              </h1>

              {/* Sinhala Couple Typography */}
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-950/50 px-3.5 sm:px-4 py-1.5 shadow-[0_0_15px_rgba(225,29,72,0.25)]">
                <span className="text-rose-400 text-xs">✦</span>
                <span className="font-sinhala text-base sm:text-lg md:text-xl font-bold text-rose-100 tracking-wider">
                  සංජය සහ ගගනි
                </span>
                <span className="text-rose-400 text-xs">✦</span>
              </div>
            </div>

            {/* Crimson Accent underline */}
            <div className="my-4 sm:my-5 h-[2px] w-20 sm:w-24 bg-gradient-to-r from-transparent via-rose-500 to-transparent rounded-full" />

            {/* Wedding Date & Venue */}
            <p className="font-playfair italic text-xs sm:text-sm text-rose-200 mb-1">
              {weddingDateStr}
            </p>
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-rose-400/80 mb-5 sm:mb-6">
              {venueName}
            </p>

            {/* Pill CTA Button */}
            <button
              onClick={handleOpenClick}
              className="w-full max-w-[270px] rounded-full py-3 sm:py-3.5 px-6 font-playfair italic text-sm sm:text-base text-white shadow-[0_8px_28px_rgba(225,29,72,0.45)] transition hover:brightness-110 active:scale-97 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #E11D48 0%, #9F1239 50%, #4C0519 100%)',
              }}
            >
              Open Our Invitation
            </button>

            {/* Tap to reveal label */}
            <p className="mt-3 sm:mt-4 text-[9px] uppercase tracking-[0.35em] text-rose-400/80 font-medium">
              Tap To Reveal
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
