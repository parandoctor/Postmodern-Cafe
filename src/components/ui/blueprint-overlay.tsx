"use client";

import * as React from "react";

/* ============================================================
   Global Blueprint Overlay
   纯黑白灰 · 白底黑线 / 黑底白线 · 天体轨道 · 坐标十字 · 月球肌理
   ============================================================ */

function useSeededDots(count: number, seed: number) {
  return React.useMemo(() => {
    let s = seed;
    const rand = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0xFFFFFFFF;
    };
    return Array.from({ length: count }, () => ({
      x: rand() * 100,
      y: rand() * 100,
      r: 0.5 + rand() * 2.5,
      o: 0.05 + rand() * 0.13,
    }));
  }, [count, seed]);
}

const CROSSHAIRS = [
  { x: 25, y: 20 }, { x: 75, y: 18 }, { x: 15, y: 65 },
  { x: 85, y: 55 }, { x: 50, y: 80 }, { x: 35, y: 42 },
  { x: 65, y: 35 }, { x: 10, y: 88 }, { x: 90, y: 82 },
  { x: 42, y: 72 }, { x: 58, y: 62 }, { x: 20, y: 38 },
];

export function BlueprintOverlay() {
  const dots = useSeededDots(180, 77);

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Layer 1: Fine coordinate grid */}
      <svg
        className="absolute inset-0 h-full w-full text-black/[0.10] dark:text-white/[0.09]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="bp-fine" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bp-fine)" />
      </svg>

      {/* Layer 2: Major grid with crossroads */}
      <svg
        className="absolute inset-0 h-full w-full text-black/[0.14] dark:text-white/[0.11]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="bp-major" width="160" height="160" patternUnits="userSpaceOnUse">
            <path d="M 160 0 L 0 0 0 160" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="3" fill="none" stroke="currentColor" strokeWidth="0.7" />
            <line x1="-6" y1="0" x2="6" y2="0" stroke="currentColor" strokeWidth="0.5" />
            <line x1="0" y1="-6" x2="0" y2="6" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bp-major)" />
      </svg>

      {/* Layer 3: Celestial orbit curves */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <g className="text-black/[0.17] dark:text-white/[0.13]">
          <ellipse cx="50%" cy="48%" rx="44%" ry="34%" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="6 14" />
          <ellipse cx="48%" cy="50%" rx="38%" ry="28%" fill="none" stroke="currentColor" strokeWidth="1.0" strokeDasharray="4 12" />
          <ellipse cx="52%" cy="46%" rx="32%" ry="22%" fill="none" stroke="currentColor" strokeWidth="0.9" strokeDasharray="3 10" />
        </g>
        <g className="text-black/[0.13] dark:text-white/[0.10]">
          <ellipse cx="50%" cy="48%" rx="26%" ry="16%" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 8" />
          <ellipse cx="50%" cy="48%" rx="20%" ry="10%" fill="none" stroke="currentColor" strokeWidth="0.7" />
          <ellipse cx="50%" cy="47%" rx="40%" ry="30%" fill="none" stroke="currentColor" strokeWidth="0.9" strokeDasharray="6 16" transform="rotate(18 50% 47%)" />
          <ellipse cx="50%" cy="49%" rx="35%" ry="25%" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="8 14" transform="rotate(-14 50% 49%)" />
          <ellipse cx="50%" cy="45%" rx="30%" ry="20%" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="4 10" transform="rotate(25 50% 45%)" />
        </g>
        <g className="text-black/[0.08] dark:text-white/[0.06]">
          <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 10" />
          <line x1="0%" y1="48%" x2="100%" y2="48%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 10" />
        </g>
        <g className="text-black/[0.25] dark:text-white/[0.18]">
          <circle cx="50%" cy="48%" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <line x1="43%" y1="48%" x2="57%" y2="48%" stroke="currentColor" strokeWidth="1.0" />
          <line x1="50%" y1="41%" x2="50%" y2="55%" stroke="currentColor" strokeWidth="1.0" />
          <circle cx="50%" cy="48%" r="1.5" fill="currentColor" />
        </g>
      </svg>

      {/* Layer 4: Scattered crosshair markers */}
      <svg
        className="absolute inset-0 h-full w-full text-black/[0.14] dark:text-white/[0.10]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {CROSSHAIRS.map((ch, i) => (
          <g key={i} transform={`translate(${ch.x}%, ${ch.y}%)`}>
            <circle cx="0" cy="0" r="2.8" fill="none" stroke="currentColor" strokeWidth="0.7" />
            <line x1="-8" y1="0" x2="8" y2="0" stroke="currentColor" strokeWidth="0.5" />
            <line x1="0" y1="-8" x2="0" y2="8" stroke="currentColor" strokeWidth="0.5" />
          </g>
        ))}
      </svg>

      {/* Layer 5: Lunar texture dots */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {dots.map((d, i) => (
          <circle key={i} cx={`${d.x}%`} cy={`${d.y}%`} r={d.r}
            className="fill-black dark:fill-white"
            style={{ opacity: d.o * 1.1 }}
          />
        ))}
        {/* Craters */}
        {[
          { x: 22, y: 18, r: 5 }, { x: 72, y: 22, r: 4 },
          { x: 38, y: 68, r: 6 }, { x: 82, y: 72, r: 3.5 },
          { x: 58, y: 38, r: 5.5 }, { x: 15, y: 48, r: 3.5 },
          { x: 68, y: 85, r: 4 }, { x: 45, y: 15, r: 3 },
        ].map((cr, i) => (
          <g key={`crater-${i}`} className="text-black/[0.14] dark:text-white/[0.10]">
            <circle cx={`${cr.x}%`} cy={`${cr.y}%`} r={cr.r} fill="none" stroke="currentColor" strokeWidth="0.7" />
            <circle cx={`${cr.x}%`} cy={`${cr.y}%`} r={cr.r * 0.65} fill="none" stroke="currentColor" strokeWidth="0.5" />
          </g>
        ))}
      </svg>

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.05) 100%)",
        }}
      />
    </div>
  );
}
