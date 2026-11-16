'use client';

import React from 'react';

interface ScheduleTimelineProps {
  poruwaTime?: string;
  receptionTime: string;
  title?: string;
}

export default function ScheduleTimeline({
  poruwaTime,
  receptionTime,
  title = 'Schedule',
}: ScheduleTimelineProps) {
  const hasPoruwa = Boolean(
    poruwaTime &&
    poruwaTime.trim() !== '' &&
    poruwaTime.trim() !== '-' &&
    poruwaTime.toLowerCase() !== 'none'
  );

  return (
    <div className="olive-card p-5 max-w-sm mx-auto shadow-xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-400 mb-4">
        {title}
      </p>

      {/* Poruwa (Optional - only if time is configured) */}
      {hasPoruwa && (
        <>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">💍</span>
              <span className="font-playfair italic text-base text-white">
                Poruwa Ceremony
              </span>
            </div>
            <span className="font-semibold text-sm text-rose-300 tracking-wide">
              {poruwaTime}
            </span>
          </div>

          <div className="my-2.5 h-px bg-rose-900/30" />
        </>
      )}

      {/* Reception */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🥂</span>
          <span className="font-playfair italic text-base text-white">
            Reception
          </span>
        </div>
        <span className="font-semibold text-sm text-rose-300 tracking-wide">
          {receptionTime || '06:00 PM'}
        </span>
      </div>
    </div>
  );
}
