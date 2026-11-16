'use client';

import React from 'react';

interface VenueMapProps {
  venueName: string;
  venueAddress: string;
  mapUrl: string;
  title?: string;
}

export default function VenueMap({ venueName, venueAddress, mapUrl, title = 'Venue' }: VenueMapProps) {
  return (
    <div className="olive-card p-5 max-w-sm mx-auto shadow-md">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-600 mb-2">
        {title}
      </p>

      <h3 className="font-playfair italic text-xl font-normal text-stone-900 font-medium mb-1">
        {venueName}
      </h3>
      <p className="text-xs text-stone-600 mb-5 leading-relaxed">
        {venueAddress}
      </p>

      {/* Pill Button */}
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-full py-3 px-5 text-xs font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-98"
        style={{
          background: 'linear-gradient(135deg, #E11D48 0%, #9F1239 50%, #4C0519 100%)',
        }}
      >
        <span>📍 Open in Google Maps</span>
      </a>
    </div>
  );
}
