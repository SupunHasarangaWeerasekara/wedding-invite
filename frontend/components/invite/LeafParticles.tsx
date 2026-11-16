'use client';

import React, { useMemo, useState, useEffect } from 'react';

export default function LeafParticles({ count: propCount }: { count?: number }) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 18 particles on mobile, 30 on desktop for 60fps buttery smoothness
  const count = propCount ?? (isMobile ? 18 : 30);

  const hearts = useMemo(() => {
    const colors = [
      '#FF1744', // bright ruby
      '#F43F5E', // rose
      '#FB7185', // light rose
      '#E11D48', // primary crimson
      '#FDA4AF', // blush pink
      '#FF4D6D', // vibrant pink
      '#BE123C', // deep ruby
      '#FFF1F2', // shimmering highlight
    ];

    return Array.from({ length: count }, (_, i) => {
      const baseLeft = (i * 96) / count + 2;
      const sway = ((i * 17) % 7) - 3;
      const left = Math.max(1, Math.min(99, baseLeft + sway));
      const duration = 5.2 + ((i * 1.35) % 4.5); // 5.2s to 9.7s
      const delay = -((i * 0.45) % 9.0); // Negative delay so screen is immediately filled
      const size = 11 + (i % 5) * 3; // 11px to 23px
      const opacity = 0.45 + (i % 5) * 0.11; // 0.45 to 0.89
      const color = colors[i % colors.length];

      return {
        id: i,
        left: `${left.toFixed(1)}%`,
        duration: `${duration.toFixed(2)}s`,
        delay: `${delay.toFixed(2)}s`,
        size: Math.round(size),
        opacity: Number(opacity.toFixed(2)),
        color,
      };
    });
  }, [count]);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-[70]"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        contain: 'strict',
      }}
    >
      <style>{`
        @keyframes heartFallSmooth {
          0% {
            transform: translate3d(0, -40px, 0) rotate(-14deg);
            opacity: 0;
          }
          12% {
            opacity: 0.9;
          }
          50% {
            transform: translate3d(14px, 52vh, 0) rotate(12deg);
          }
          88% {
            opacity: 0.85;
          }
          100% {
            transform: translate3d(-10px, 106vh, 0) rotate(22deg);
            opacity: 0;
          }
        }
      `}</style>
      {hearts.map((h) => (
        <div
          key={h.id}
          style={{
            position: 'absolute',
            top: 0,
            left: h.left,
            opacity: h.opacity,
            animation: `heartFallSmooth ${h.duration} linear infinite ${h.delay}`,
            WebkitAnimation: `heartFallSmooth ${h.duration} linear infinite ${h.delay}`,
            pointerEvents: 'none',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        >
          <svg
            width={h.size}
            height={h.size}
            viewBox="0 0 24 24"
            fill={h.color}
            xmlns="http://www.w3.org/2000/svg"
            style={{
              display: 'block',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))',
            }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}
    </div>
  );
}
