'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  className?: string;
}

export default function ThemeToggle({ theme, onToggle, className = '' }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition cursor-pointer shadow-xs ${
        isDark
          ? 'bg-[#24151C] border border-rose-500/30 text-rose-200 hover:bg-[#301B25] hover:text-white'
          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900'
      } ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[11px] font-bold text-amber-200">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-[#C87D55]" />
          <span className="text-[11px] font-bold text-gray-700">Dark Mode</span>
        </>
      )}
    </button>
  );
}
