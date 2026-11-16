'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDateIso: string;
  title?: string;
}

export default function CountdownTimer({
  targetDateIso,
  title = 'Until We Say "I Do"',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDateIso) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDateIso]);

  const items = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HRS', value: timeLeft.hours },
    { label: 'MIN', value: timeLeft.minutes },
    { label: 'SEC', value: timeLeft.seconds },
  ];

  return (
    <div className="olive-card p-4 sm:p-5 max-w-sm mx-auto shadow-md">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-600 mb-3 sm:mb-4 text-center">
        {title}
      </p>

      <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center rounded-2xl py-2.5 sm:py-3 px-1 border border-rose-200 shadow-xs"
            style={{
              background: 'linear-gradient(180deg, #FFF5F6 0%, #FFE4E6 100%)',
            }}
          >
            <span className="font-playfair text-xl sm:text-2xl md:text-3xl font-medium text-stone-900">
              {item.value}
            </span>
            <span className="text-[8px] sm:text-[9px] font-semibold tracking-wider text-rose-700 mt-0.5">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
