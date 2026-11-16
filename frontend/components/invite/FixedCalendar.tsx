'use client';

import React from 'react';
import { Download, ExternalLink } from 'lucide-react';

interface FixedCalendarProps {
  dateIso: string;
  inviteCode: string;
  coupleNames: string;
  venueName: string;
  title?: string;
}

export default function FixedCalendar({
  dateIso,
  inviteCode,
  coupleNames,
  venueName,
  title = 'Save The Date',
}: FixedCalendarProps) {
  const weddingDate = new Date(dateIso);
  const year = weddingDate.getFullYear();
  const dayOfMonth = weddingDate.getDate();
  const monthName = weddingDate.toLocaleString('default', { month: 'long' }) || 'December';
  const dayName = weddingDate.toLocaleDateString('default', { weekday: 'long' }) || 'Saturday';
  const dateFormatted = `${dayName}, ${monthName} ${dayOfMonth}, ${year}`;

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const firstDay = new Date(year, weddingDate.getMonth(), 1).getDay();
  const totalDays = new Date(year, weddingDate.getMonth() + 1, 0).getDate();

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= totalDays; d++) calendarCells.push(d);

  const startTimeIso = weddingDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const endDate = new Date(weddingDate.getTime() + 6 * 60 * 60 * 1000);
  const endTimeIso = endDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Wedding of ${coupleNames}`
  )}&dates=${startTimeIso}/${endTimeIso}&details=${encodeURIComponent(
    `You are warmly invited to celebrate the wedding of ${coupleNames}.`
  )}&location=${encodeURIComponent(venueName)}`;

  return (
    <div className="olive-card p-4 sm:p-5 max-w-sm mx-auto shadow-md">
      {/* Label & Date */}
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-600 mb-1">
        {title}
      </p>
      <h3 className="font-playfair italic text-xl sm:text-2xl font-normal text-stone-900 mb-3 sm:mb-4">
        {dateFormatted}
      </h3>

      {/* Inner Calendar Panel */}
      <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-3 sm:p-4 shadow-xs">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-rose-700 text-center mb-2.5 sm:mb-3">
          {monthName} {year}
        </p>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {daysOfWeek.map((day, idx) => (
            <div key={idx} className="text-[9px] sm:text-[10px] font-semibold text-rose-600">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-1.5 sm:gap-y-2 text-center text-xs">
          {calendarCells.map((day, idx) => {
            if (!day) return <div key={idx} className="h-7 w-7" />;
            const isWeddingDay = day === dayOfMonth;

            return (
              <div key={idx} className="flex items-center justify-center">
                {isWeddingDay ? (
                  <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-rose-600 font-bold text-white shadow-[0_2px_12px_rgba(225,29,72,0.4)] border-2 border-rose-200">
                    <span className="text-[11px] sm:text-xs">{day}</span>
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[8px] text-rose-600 animate-heart-beat shadow-sm">
                      ♥
                    </span>
                  </div>
                ) : (
                  <span className="text-stone-700 text-[11px] sm:text-xs font-normal">{day}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sync links */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 pt-2 border-t border-rose-100">
        <a
          href={`/api/calendar/${inviteCode}`}
          download
          className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-rose-300 py-2 px-3 text-[10px] uppercase tracking-wider text-rose-700 hover:bg-rose-50 transition text-center"
        >
          <Download className="h-3 w-3" />
          <span>Download .ics</span>
        </a>

        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 py-2 px-3 text-[10px] uppercase tracking-wider text-rose-700 hover:bg-rose-100 transition text-center font-medium"
        >
          <ExternalLink className="h-3 w-3" />
          <span>Google Cal</span>
        </a>
      </div>
    </div>
  );
}
