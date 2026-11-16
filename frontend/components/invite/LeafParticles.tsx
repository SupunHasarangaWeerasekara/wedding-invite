'use client';

import React, { useMemo, useState, useEffect } from 'react';

export default function LeafParticles({ count = 48 }: { count?: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      // Even distribution across mobile & desktop viewports (2% to 98%)
      const baseLeft = (i * 96) / count + 2;
      const sway = ((i * 19) % 7) - 3;
      const left = Math.max(1, Math.min(99, baseLeft + sway));
      const duration = 4.2 + ((i * 1.35) % 4.8); // 4.2s to 9.0s
      const delay = -((i * 0.42) % 8.5); // Negative delay ensures rain is fully falling immediately
      const size = 11 + (i % 6) * 3.5; // 11px to 28.5px
      const opacity = 0.45 + (i % 5) * 0.12; // 0.45 to 0.93
      const color = colors[i % colors.length];
      const hasGlow = i % 3 === 0;

      return {
        id: i,
        left: `${left.toFixed(1)}%`,
        duration: `${duration.toFixed(2)}s`,
        delay: `${delay.toFixed(2)}s`,
        size: Math.round(size),
        opacity: Number(opacity.toFixed(2)),
        color,
        filter: hasGlow
          ? 'drop-shadow(0 0 8px rgba(225, 29, 72, 0.85)) drop-shadow(0 0 2px rgba(255, 241, 242, 0.9))'
          : 'drop-shadow(0 0 3px rgba(244, 63, 94, 0.45))',
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
      }}
    >
      <style>{`
        @keyframes heartFallAnim {
          0% {
            transform: translate3d(0, -50px, 0) rotate(-16deg) scale(0.85);
            opacity: 0;
          }
          10% {
            opacity: 0.95;
            transform: translate3d(10px, 12vh, 0) rotate(8deg) scale(1);
          }
          30% {
            transform: translate3d(-14px, 32vh, 0) rotate(-12deg) scale(0.95);
          }
          55% {
            opacity: 0.95;
            transform: translate3d(16px, 55vh, 0) rotate(14deg) scale(1.05);
          }
          75% {
            transform: translate3d(-10px, 75vh, 0) rotate(-6deg) scale(0.95);
          }
          90% {
            opacity: 0.85;
            transform: translate3d(12px, 90vh, 0) rotate(10deg) scale(1);
          }
          100% {
            transform: translate3d(18px, 108vh, 0) rotate(22deg) scale(0.75);
            opacity: 0;
          }
        }
        @-webkit-keyframes heartFallAnim {
          0% {
            -webkit-transform: translate3d(0, -50px, 0) rotate(-16deg) scale(0.85);
            opacity: 0;
          }
          10% {
            opacity: 0.95;
            -webkit-transform: translate3d(10px, 12vh, 0) rotate(8deg) scale(1);
          }
          30% {
            -webkit-transform: translate3d(-14px, 32vh, 0) rotate(-12deg) scale(0.95);
          }
          55% {
            opacity: 0.95;
            -webkit-transform: translate3d(16px, 55vh, 0) rotate(14deg) scale(1.05);
          }
          75% {
            -webkit-transform: translate3d(-10px, 75vh, 0) rotate(-6deg) scale(0.95);
          }
          90% {
            opacity: 0.85;
            -webkit-transform: translate3d(12px, 90vh, 0) rotate(10deg) scale(1);
          }
          100% {
            -webkit-transform: translate3d(18px, 108vh, 0) rotate(22deg) scale(0.75);
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
            filter: h.filter,
            animation: `heartFallAnim ${h.duration} linear infinite ${h.delay}`,
            WebkitAnimation: `heartFallAnim ${h.duration} linear infinite ${h.delay}`,
            pointerEvents: 'none',
            willChange: 'transform, opacity',
          }}
        >
          {/* Glowing Romantic Falling SVG Heart */}
          <svg
            width={h.size}
            height={h.size}
            viewBox="0 0 24 24"
            fill={h.color}
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block' }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}
    </div>
  );
}
