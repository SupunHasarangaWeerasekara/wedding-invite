'use client';

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface MusicPlayerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export default function MusicPlayer({ isPlaying, onTogglePlay }: MusicPlayerProps) {
  return (
    <div className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-40">
      <motion.button
        onClick={onTogglePlay}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
        className={`relative flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all duration-300 border cursor-pointer ${
          isPlaying
            ? 'bg-white border-rose-400 text-rose-600 shadow-[0_4px_20px_rgba(225,29,72,0.3)]'
            : 'bg-white/95 border-rose-200 text-stone-400'
        }`}
      >
        {isPlaying ? (
          <>
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-25 bg-rose-400"
              style={{ animationDuration: '2s' }}
            />
            <Volume2 className="h-5 w-5 text-rose-600" />
          </>
        ) : (
          <VolumeX className="h-5 w-5 text-stone-400" />
        )}
      </motion.button>
    </div>
  );
}
