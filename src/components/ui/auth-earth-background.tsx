"use client";

import * as React from "react";
import { HoloEarth } from "@/components/ui/holo-earth";

/* ============================================================
   AuthEarthBackground — 登录/注册页深空测绘背景
   纯黑背景 · 全息线框地球居中 · 多层环绕轨道
   边缘轻量化测绘刻度标识 · 低透明度线条柔和不刺眼
   黑白单色 · 可叠加文字 · 不干扰前景 UI
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
      r: 0.4 + rand() * 1.1,
      o: 0.06 + rand() * 0.14,
      tw: 4 + rand() * 7,
      dl: rand() * 6,
    }));
  }, [count, seed]);
}

const EDGE_MARKS = Array.from({ length: 24 }, (_, i) => {
  const ang = (i * 15 * Math.PI) / 180;
  const fx = (n: number) => Number(n.toFixed(2));
  return {
    x1: fx(50 + 49 * Math.cos(ang)),
    y1: fx(50 + 49 * Math.sin(ang)),
    x2: fx(50 + (i % 6 === 0 ? 46.4 : 47.8) * Math.cos(ang)),
    y2: fx(50 + (i % 6 === 0 ? 46.4 : 47.8) * Math.sin(ang)),
    major: i % 6 === 0,
  };
});

export function AuthEarthBackground() {
  const dots = useSeededDots(90, 20260802);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      {/* 极细坐标网格 */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="auth-grid" width="42" height="42" patternUnits="userSpaceOnUse">
            <path d="M 42 0 L 0 0 0 42" fill="none"
              stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid)" />
      </svg>

      {/* 中央全息线框地球 — 低透明度 · 可叠加文字 */}
      <div
        className="absolute left-1/2 top-1/2 h-[min(46vw,46vh)] w-[min(46vw,46vh)] -translate-x-1/2 -translate-y-1/2"
        style={{ opacity: 0.42 }}
      >
        <HoloEarth duration={75} lineColor="rgba(255,255,255,0.85)" />
      </div>

      {/* 多层环绕轨道 + 边缘刻度标识 + 十字定位 */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* 多层环绕轨道（细线 · 缓慢流动） */}
        <g opacity="0.2" fill="none" stroke="#ffffff">
          <ellipse cx="50%" cy="50%" rx="44%" ry="17%" strokeWidth="0.8"
            strokeDasharray="12 14"
            className="bp-dash-flow"
            style={{ "--dash-to": "-234", animationDuration: "260s" } as React.CSSProperties} />
          <ellipse cx="50%" cy="50%" rx="38%" ry="13%" strokeWidth="0.6" />
          <ellipse cx="50%" cy="50%" rx="32%" ry="10%" strokeWidth="0.5"
            strokeDasharray="5 11"
            className="bp-dash-flow"
            style={{ "--dash-to": "-240", animationDuration: "180s", animationDirection: "reverse" } as React.CSSProperties} />
        </g>

        {/* 边缘轻量化测绘刻度标识 */}
        <g opacity="0.3" stroke="#ffffff" fill="none">
          {EDGE_MARKS.map((m, i) => (
            <line key={i}
              x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
              strokeWidth={m.major ? 0.7 : 0.35} />
          ))}
        </g>

        {/* 十字定位（贯穿画面 · 极淡） */}
        <g opacity="0.14" stroke="#ffffff" fill="none">
          <line x1="50%" y1="0" x2="50%" y2="100%" strokeWidth="0.4" strokeDasharray="4 10" />
          <line x1="0" y1="50%" x2="100%" y2="50%" strokeWidth="0.4" strokeDasharray="4 10" />
        </g>
      </svg>

      {/* 低透明度深空粒子 */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {dots.map((d, i) => (
          <circle key={i} cx={`${d.x}%`} cy={`${d.y}%`} r={d.r}
            fill="#ffffff" opacity={d.o}
            className="bp-twinkle"
            style={{ animationDuration: `${d.tw}s`, animationDelay: `${d.dl}s` } as React.CSSProperties} />
        ))}
      </svg>

      {/* 边缘渐暗 vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 32%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </div>
  );
}
