'use client';

import React from 'react';
import { Heart, Calendar, MapPin, CheckCircle } from 'lucide-react';

export default function StickyBottomNav() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { id: 'story', label: 'Story', icon: Heart },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'venue', label: 'Venue', icon: MapPin },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 p-2 sm:p-3 pointer-events-none"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
    >
      <nav className="pointer-events-auto mx-auto flex max-w-sm items-center justify-between gap-1 rounded-full border border-rose-500/25 bg-[#16080C]/95 px-2 py-1.5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="flex flex-col items-center gap-0.5 rounded-full px-2.5 sm:px-3.5 py-1 text-[10px] sm:text-[11px] font-medium text-rose-300/70 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95 cursor-pointer"
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* RSVP — accent pill */}
        <button
          onClick={() => scrollTo('rsvp')}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-800 px-4 sm:px-5 py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_4px_16px_-4px_rgba(225,29,72,0.5)] transition-all duration-200 hover:brightness-110 active:scale-95 cursor-pointer"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          <span>RSVP</span>
        </button>
      </nav>
    </div>
  );
}
