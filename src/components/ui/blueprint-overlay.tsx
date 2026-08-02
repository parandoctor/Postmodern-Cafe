"use client";

import * as React from "react";
import { HoloEarth } from "@/components/ui/holo-earth";

/* ============================================================
   Blueprint Overlay — 白底黑线 · 天体轨道 · 坐标网络
   高纯度黑白对比 · 密集多层 · 狂放不克制
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
      r: 0.6 + rand() * 3.0,
      o: 0.08 + rand() * 0.18,
    }));
  }, [count, seed]);
}

const CROSSHAIRS = [
  { x: 25, y: 20 }, { x: 75, y: 18 }, { x: 15, y: 65 },
  { x: 85, y: 55 }, { x: 50, y: 80 }, { x: 35, y: 42 },
  { x: 65, y: 35 }, { x: 10, y: 88 }, { x: 90, y: 82 },
  { x: 42, y: 72 }, { x: 58, y: 62 }, { x: 20, y: 38 },
  { x: 8, y: 12 }, { x: 93, y: 30 }, { x: 55, y: 92 },
  { x: 30, y: 88 }, { x: 78, y: 8 }, { x: 88, y: 92 },
];

// Large craters
const CRATERS = [
  { x: 22, y: 18, r: 7 }, { x: 72, y: 22, r: 5.5 },
  { x: 38, y: 68, r: 8 }, { x: 82, y: 72, r: 5 },
  { x: 58, y: 38, r: 7 }, { x: 15, y: 48, r: 5 },
  { x: 68, y: 85, r: 5.5 }, { x: 45, y: 15, r: 4 },
  { x: 90, y: 10, r: 4.5 }, { x: 5, y: 78, r: 4 },
  { x: 30, y: 55, r: 3.5 }, { x: 60, y: 70, r: 3 },
];

/* ============================================================
   3D 动态公转引擎 — JS 驱动，精确匹配椭圆轨道
   近大远小 (scale) + 前后遮挡 (zIndex) = 立体公转
   ============================================================ */
function useOrbiter(
  cx: number, cy: number, rx: number, ry: number,
  duration: number, delay = 0
) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    let raf = 0;
    const start = performance.now() + delay * 1000;
    const tick = (t: number) => {
      const el = ref.current;
      if (el) {
        const p = (((t - start) / 1000) % duration) / duration;
        const theta = p * Math.PI * 2;
        const x = cx + rx * Math.cos(theta);
        const y = cy + ry * Math.sin(theta);
        const depth = 0.7 + 0.3 * ((Math.sin(theta) + 1) / 2);
        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
        el.style.transform = `translate(-50%, -50%) scale(${depth.toFixed(3)})`;
        el.style.zIndex = String(Math.sin(theta) > 0 ? 2 : 1);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cx, cy, rx, ry, duration, delay]);
  return ref;
}

function Orbiter({
  cx, cy, rx, ry, duration, delay = 0, size, children,
}: {
  cx: number; cy: number; rx: number; ry: number;
  duration: number; delay?: number; size: number;
  children: React.ReactNode;
}) {
  const ref = useOrbiter(cx, cy, rx, ry, duration, delay);
  return (
    <div
      ref={ref}
      className="absolute will-change-transform"
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}

/* ============================================================
   NeuralOrb — 全息神经网络行星
   Fibonacci 球面节点 + 最近邻连线 = 仿真神经网络
   JS 驱动 rotateY 投影 → 真实 3D 自转 · 深度光照 · 全息投影感
   ============================================================ */
function NeuralOrb({
  size, nodeCount = 88, seed = 11, duration = 26,
  lineColor = "rgba(0,0,0,0.5)", nodeColor = "#0a0a0a",
  style, className,
}: {
  size: number; nodeCount?: number; seed?: number; duration?: number;
  lineColor?: string; nodeColor?: string;
  style?: React.CSSProperties; className?: string;
}) {
  const nodeRefs = React.useRef<(SVGCircleElement | null)[]>([]);
  const edgeRefs = React.useRef<(SVGLineElement | null)[]>([]);

  const pts3 = React.useMemo(() => {
    let s = (seed * 2654435761) >>> 0;
    const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xFFFFFFFF; };
    const pts: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const t = (i + 0.5) / nodeCount;
      const theta = 2 * Math.PI * i * (3 - Math.sqrt(5));
      const phi = Math.acos(1 - 2 * t);
      const jitter = 0.045 * (rand() - 0.5);
      pts.push({
        x: Math.sin(phi) * Math.cos(theta) + jitter,
        y: Math.cos(phi) + jitter,
        z: Math.sin(phi) * Math.sin(theta) + jitter,
      });
    }
    return pts;
  }, [nodeCount, seed]);

  const edges = React.useMemo(() => {
    const list: [number, number][] = [];
    const MAX = 0.6;
    for (let i = 0; i < pts3.length; i++) {
      const pi = pts3[i];
      if (!pi) continue;
      for (let j = i + 1; j < pts3.length; j++) {
        const pj = pts3[j];
        if (!pj) continue;
        const dx = pi.x - pj.x;
        const dy = pi.y - pj.y;
        const dz = pi.z - pj.z;
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < MAX) list.push([i, j]);
      }
    }
    return list;
  }, [pts3]);

  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const R = 46;
    const tick = (t: number) => {
      const ang = ((t - start) / 1000) * ((2 * Math.PI) / duration);
      const c = Math.cos(ang), s = Math.sin(ang);
      for (let i = 0; i < pts3.length; i++) {
        const p = pts3[i];
        if (!p) continue;
        const xr = p.x * c + p.z * s;
        const zr = -p.x * s + p.z * c;
        const el = nodeRefs.current[i];
        if (el) {
          const depth = (zr + 1) / 2;
          el.setAttribute("cx", String(50 + xr * R));
          el.setAttribute("cy", String(50 + p.y * R * 0.92));
          el.setAttribute("r", String(0.9 + depth * 1.7));
          el.setAttribute("opacity", String(0.25 + depth * 0.75));
        }
      }
      for (let e = 0; e < edges.length; e++) {
        const edge = edges[e];
        if (!edge) continue;
        const [i, j] = edge;
        const pi = pts3[i], pj = pts3[j];
        if (!pi || !pj) continue;
        const zi = -pi.x * s + pi.z * c;
        const zj = -pj.x * s + pj.z * c;
        const el = edgeRefs.current[e];
        if (el) {
          el.setAttribute("x1", String(50 + (pi.x * c + pi.z * s) * R));
          el.setAttribute("y1", String(50 + pi.y * R * 0.92));
          el.setAttribute("x2", String(50 + (pj.x * c + pj.z * s) * R));
          el.setAttribute("y2", String(50 + pj.y * R * 0.92));
          el.setAttribute("opacity", String(0.05 + ((zi + zj) / 2 + 1) / 2 * 0.5));
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pts3, edges, duration]);

  return (
    <div className={className} style={{ width: size, height: size, ...style }}>
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
        {/* Holographic halo */}
        <circle cx="50" cy="50" r="48" fill="none" stroke={lineColor} strokeWidth="0.35" opacity="0.3" />
        <circle cx="50" cy="50" r="52" fill="none" stroke={lineColor} strokeWidth="0.2" opacity="0.16" />
        {edges.map((_, e) => (
          <line key={`e${e}`} ref={(el) => { edgeRefs.current[e] = el; }}
            x1="50" y1="50" x2="50" y2="50"
            stroke={lineColor} strokeWidth="0.3" />
        ))}
        {pts3.map((_, i) => (
          <circle key={`n${i}`} ref={(el) => { nodeRefs.current[i] = el; }}
            cx="50" cy="50" r="1.4" fill={nodeColor} />
        ))}
      </svg>
    </div>
  );
}

export function BlueprintOverlay() {
  const dots = useSeededDots(320, 77);

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Layer 0 — 黑白大块面 · 真正的黑白交替（黑盘白线 vs 白盘黑线） */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: "-12%", top: "-16%",
          width: "min(54vw, 54vh)", height: "min(54vw, 54vh)",
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 32%, #2a2a2a 0%, #0d0d0d 55%, #000 100%)",
          boxShadow: "0 0 90px rgba(0,0,0,0.30)",
        }}
      >
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="bp-dark-fine" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.2" />
            </pattern>
            <pattern id="bp-dark-major" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="0.4" />
              <circle cx="0" cy="0" r="1.6" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#bp-dark-fine)" />
          <rect width="100" height="100" fill="url(#bp-dark-major)" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="0.7" strokeDasharray="3 2" />
          <circle cx="50" cy="50" r="26" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="16" fill="none" stroke="rgba(255,255,255,0.26)" strokeWidth="0.6" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="7" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.7" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.10)" strokeWidth="0.3" strokeDasharray="1.5 2.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.10)" strokeWidth="0.3" strokeDasharray="1.5 2.5" />
          <circle cx="50" cy="16" r="1.4" fill="#ffffff" />
          <circle cx="16" cy="50" r="1.1" fill="rgba(255,255,255,0.85)" />
        </svg>
      </div>

      {/* 白盘 — 右下 · 白底黑线（黑白交替的另一极） */}
      <div
        className="absolute overflow-hidden"
        style={{
          right: "-9%", bottom: "-12%",
          width: "min(40vw, 40vh)", height: "min(40vw, 40vh)",
          borderRadius: "50%",
          background: "radial-gradient(circle at 36% 32%, #ffffff 0%, #f5f5f5 55%, #e2e2e2 100%)",
          boxShadow: "0 0 70px rgba(0,0,0,0.12)",
        }}
      >
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="bp-light-fine" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="0.2" />
            </pattern>
            <pattern id="bp-light-major" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.16)" strokeWidth="0.4" />
              <circle cx="0" cy="0" r="1.6" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#bp-light-fine)" />
          <rect width="100" height="100" fill="url(#bp-light-major)" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="0.7" strokeDasharray="3 2" />
          <circle cx="50" cy="50" r="21" fill="none" stroke="rgba(0,0,0,0.20)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(0,0,0,0.24)" strokeWidth="0.6" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="5" fill="none" stroke="rgba(0,0,0,0.32)" strokeWidth="0.7" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(0,0,0,0.10)" strokeWidth="0.3" strokeDasharray="1.5 2.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(0,0,0,0.10)" strokeWidth="0.3" strokeDasharray="1.5 2.5" />
          <circle cx="50" cy="18" r="1.4" fill="#000000" />
        </svg>
      </div>

      {/* Layer 1 — Fine grid 30px */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="bp-fine" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none"
              stroke="rgba(0,0,0,0.18)" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bp-fine)" />
      </svg>

      {/* Layer 2 — Major grid 120px with crossroad dots */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="bp-major" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M 120 0 L 0 0 0 120" fill="none"
              stroke="rgba(0,0,0,0.30)" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="4" fill="none"
              stroke="rgba(0,0,0,0.38)" strokeWidth="1.1" />
            <line x1="-9" y1="0" x2="9" y2="0"
              stroke="rgba(0,0,0,0.22)" strokeWidth="0.8" />
            <line x1="0" y1="-9" x2="0" y2="9"
              stroke="rgba(0,0,0,0.22)" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bp-major)" />
      </svg>

      {/* Layer 3 — 3D 轨道系统：perspective + rotateX 立体透视 */}
      <div style={{ position: "absolute", inset: 0, perspective: "1400px" }}>
        <div
          style={{
            position: "absolute", inset: 0,
            transform: "rotateX(32deg)",
            transformOrigin: "50% 48%",
            transformStyle: "preserve-3d",
          }}
        >
          <svg
            className="absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Bold black bands — black/white rhythm */}
            <ellipse cx="50%" cy="48%" rx="46%" ry="36%"
              fill="none" stroke="rgba(0,0,0,0.16)" strokeWidth="5" />
            <ellipse cx="50%" cy="48%" rx="46%" ry="36%"
              fill="none" stroke="rgba(0,0,0,0.40)" strokeWidth="1.6"
              strokeDasharray="22 18"
              className="bp-dash-flow"
              style={{ "--dash-to": "-240", animationDuration: "110s" } as React.CSSProperties} />
            <ellipse cx="48%" cy="50%" rx="37%" ry="27%"
              fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="4.5" />
            <ellipse cx="48%" cy="50%" rx="37%" ry="27%"
              fill="none" stroke="rgba(0,0,0,0.36)" strokeWidth="1.4"
              strokeDasharray="16 16"
              className="bp-dash-flow"
              style={{ "--dash-to": "-224", animationDuration: "90s", animationDirection: "reverse" } as React.CSSProperties} />
            <ellipse cx="50%" cy="48%" rx="22%" ry="12%"
              fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="4" />
            <ellipse cx="50%" cy="48%" rx="22%" ry="12%"
              fill="none" stroke="rgba(0,0,0,0.30)" strokeWidth="1.2"
              strokeDasharray="12 12"
              className="bp-dash-flow"
              style={{ "--dash-to": "-240", animationDuration: "60s" } as React.CSSProperties} />

            {/* Outer orbits — bold */}
            <ellipse cx="50%" cy="48%" rx="42%" ry="32%"
              fill="none" stroke="rgba(0,0,0,0.34)" strokeWidth="1.5"
              strokeDasharray="7 13"
              className="bp-dash-flow"
              style={{ "--dash-to": "-200", animationDuration: "140s", animationDirection: "reverse" } as React.CSSProperties} />

            {/* Mid orbits */}
            <ellipse cx="52%" cy="46%" rx="33%" ry="23%"
              fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="1.3"
              strokeDasharray="5 11"
              className="bp-dash-flow"
              style={{ "--dash-to": "-224", animationDuration: "75s" } as React.CSSProperties} />
            <ellipse cx="50%" cy="48%" rx="28%" ry="18%"
              fill="none" stroke="rgba(0,0,0,0.24)" strokeWidth="1.1"
              strokeDasharray="4 10"
              className="bp-dash-flow"
              style={{ "--dash-to": "-210", animationDuration: "55s", animationDirection: "reverse" } as React.CSSProperties} />

            {/* Inner tight orbits */}
            <ellipse cx="50%" cy="48%" rx="16%" ry="8%"
              fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="1.0"
              strokeDasharray="6 8"
              className="bp-dash-flow"
              style={{ "--dash-to": "-210", animationDuration: "40s" } as React.CSSProperties} />
            <ellipse cx="50%" cy="48%" rx="10%" ry="5%"
              fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="0.9" />
            <ellipse cx="50%" cy="48%" rx="5%" ry="2.5%"
              fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />

            {/* Tilted orbits — dynamic 3D */}
            <ellipse cx="50%" cy="47%" rx="44%" ry="32%"
              fill="none" stroke="rgba(0,0,0,0.26)" strokeWidth="1.3"
              strokeDasharray="8 18"
              className="bp-dash-flow"
              style={{ "--dash-to": "-234", animationDuration: "130s", transform: "rotate(18deg)", transformBox: "fill-box", transformOrigin: "50% 50%" } as React.CSSProperties} />
            <ellipse cx="50%" cy="49%" rx="38%" ry="26%"
              fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="1.1"
              strokeDasharray="12 14"
              className="bp-dash-flow"
              style={{ "--dash-to": "-234", animationDuration: "100s", animationDirection: "reverse", transform: "rotate(-14deg)", transformBox: "fill-box", transformOrigin: "50% 50%" } as React.CSSProperties} />
            <ellipse cx="50%" cy="45%" rx="32%" ry="22%"
              fill="none" stroke="rgba(0,0,0,0.20)" strokeWidth="1.0"
              strokeDasharray="6 12"
              className="bp-dash-flow"
              style={{ "--dash-to": "-216", animationDuration: "70s", transform: "rotate(25deg)", transformBox: "fill-box", transformOrigin: "50% 50%" } as React.CSSProperties} />
            <ellipse cx="50%" cy="50%" rx="26%" ry="18%"
              fill="none" stroke="rgba(0,0,0,0.16)" strokeWidth="0.9"
              strokeDasharray="5 13"
              className="bp-dash-flow"
              style={{ "--dash-to": "-216", animationDuration: "60s", animationDirection: "reverse", transform: "rotate(-32deg)", transformBox: "fill-box", transformOrigin: "50% 50%" } as React.CSSProperties} />

            {/* Full crosshair axis */}
            <line x1="50%" y1="0%" x2="50%" y2="100%"
              stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" strokeDasharray="4 12" />
            <line x1="0%" y1="48%" x2="100%" y2="48%"
              stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" strokeDasharray="4 12" />

            {/* Center focal point */}
            <circle cx="50%" cy="48%" r="6" fill="none"
              stroke="rgba(0,0,0,0.32)" strokeWidth="1.4" />
            <circle cx="50%" cy="48%" r="3" fill="none"
              stroke="rgba(0,0,0,0.24)" strokeWidth="0.8" />
            <line x1="42%" y1="48%" x2="58%" y2="48%"
              stroke="rgba(0,0,0,0.28)" strokeWidth="1.2" />
            <line x1="50%" y1="40%" x2="50%" y2="56%"
              stroke="rgba(0,0,0,0.28)" strokeWidth="1.2" />
            <circle cx="50%" cy="48%" r="2" fill="rgba(0,0,0,0.35)" />

            {/* 轨道光点 — 沿椭圆轨道飞驰（3D 动态） */}
            <circle r="2.4" fill="#ffffff" stroke="rgba(0,0,0,0.55)" strokeWidth="0.7">
              <animateMotion dur="38s" repeatCount="indefinite"
                path="M 50% 48% m -46% 0 a 46% 36% 0 1 1 92% 0 a 46% 36% 0 1 1 -92% 0" />
            </circle>
            <circle r="1.8" fill="#000000" stroke="rgba(0,0,0,0.30)" strokeWidth="0.5">
              <animateMotion dur="56s" repeatCount="indefinite"
                path="M 48% 50% m -37% 0 a 37% 27% 0 1 1 74% 0 a 37% 27% 0 1 1 -74% 0" />
            </circle>
            <circle r="1.5" fill="#ffffff" stroke="rgba(0,0,0,0.45)" strokeWidth="0.5">
              <animateMotion dur="24s" repeatCount="indefinite"
                path="M 50% 48% m -22% 0 a 22% 12% 0 1 1 44% 0 a 22% 12% 0 1 1 -44% 0" />
            </circle>
            <circle r="1.1" fill="#000000" stroke="rgba(255,255,255,0.8)" strokeWidth="0.4">
              <animateMotion dur="18s" repeatCount="indefinite"
                path="M 50% 48% m -10% 0 a 10% 5% 0 1 1 20% 0 a 10% 5% 0 1 1 -20% 0" />
            </circle>
          </svg>

          {/* 公转行星 — JS 驱动精确匹配椭圆轨道 · 近大远小 + 前后遮挡 */}
          <Orbiter cx={50} cy={48} rx={46} ry={36} duration={150} size={24}>
            <div className="h-full w-full rounded-full" style={{
              background: "radial-gradient(circle at 32% 30%, #555555 0%, #0a0a0a 70%)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.45)",
            }}>
              <div className="absolute rounded-full bg-white/90" style={{ left: "20%", top: "16%", width: 4, height: 4 }} />
              <div className="absolute rounded-full bg-white/50" style={{ left: "56%", top: "58%", width: 3, height: 3 }} />
            </div>
          </Orbiter>
          <Orbiter cx={50} cy={48} rx={37} ry={27} duration={96} delay={8} size={16}>
            <div className="h-full w-full rounded-full" style={{
              background: "radial-gradient(circle at 32% 30%, #ffffff 0%, #d9d9d9 60%, #a6a6a6 100%)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
            }}>
              <div className="absolute rounded-full bg-black/60" style={{ left: "30%", top: "26%", width: 5, height: 5 }} />
            </div>
          </Orbiter>
          <Orbiter cx={50} cy={48} rx={22} ry={12} duration={54} delay={4} size={10}>
            <div className="h-full w-full rounded-full" style={{
              background: "radial-gradient(circle at 34% 30%, #f0f0f0 0%, #333333 60%, #000000 100%)",
              boxShadow: "0 3px 8px rgba(0,0,0,0.4)",
            }} />
          </Orbiter>
          <Orbiter cx={50} cy={48} rx={10} ry={5} duration={26} delay={2} size={6}>
            <div className="h-full w-full rounded-full bg-black" style={{ boxShadow: "0 2px 5px rgba(0,0,0,0.5)" }} />
          </Orbiter>
        </div>
      </div>

      {/* Layer 4 — Scattered crosshair markers */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {CROSSHAIRS.map((ch, i) => (
          <g key={i}>
            <circle cx={`${ch.x}%`} cy={`${ch.y}%`} r="3.5" fill="none"
              stroke="rgba(0,0,0,0.22)" strokeWidth="0.8" />
            <line x1={`${ch.x - 10}%`} y1={`${ch.y}%`}
              x2={`${ch.x + 10}%`} y2={`${ch.y}%`}
              stroke="rgba(0,0,0,0.14)" strokeWidth="0.6" />
            <line x1={`${ch.x}%`} y1={`${ch.y - 10}%`}
              x2={`${ch.x}%`} y2={`${ch.y + 10}%`}
              stroke="rgba(0,0,0,0.14)" strokeWidth="0.6" />
          </g>
        ))}
      </svg>

      {/* Layer 5 — Lunar texture dots */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {dots.map((d, i) => (
          <circle key={i} cx={`${d.x}%`} cy={`${d.y}%`}
            r={d.r} fill={`rgba(0,0,0,${d.o})`} />
        ))}
      </svg>

      {/* Layer 6 — Craters */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {CRATERS.map((cr, i) => (
          <g key={`crater-${i}`}>
            <circle cx={`${cr.x}%`} cy={`${cr.y}%`} r={cr.r}
              fill="none" stroke="rgba(0,0,0,0.20)" strokeWidth="0.8" />
            <circle cx={`${cr.x}%`} cy={`${cr.y}%`} r={cr.r * 0.6}
              fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="0.6" />
            <circle cx={`${cr.x}%`} cy={`${cr.y}%`} r={cr.r * 0.3}
              fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="0.5" />
          </g>
        ))}
      </svg>

      {/* 静态行星 — 全息神经网络投影 · 3D 自转 + 扫描环 + 浮动 */}

      {/* 黑曜神经网络行星（大 · 黑色网络 · 无包围环） */}
      <div className="bp-float absolute" style={{ left: "65%", top: "4%", width: 136, height: 136, animationDuration: "9s" }}>
        <NeuralOrb size={136} nodeCount={110} seed={11} duration={30}
          lineColor="rgba(0,0,0,0.62)" nodeColor="#050505" />
        {/* 全息辉光 */}
        <div className="pointer-events-none absolute inset-0 rounded-full" style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 62%)",
          mixBlendMode: "screen",
        }} />
      </div>

      {/* 全息线框数字地球（左上 · HUD 测绘蓝图 · 深空黑背景内） */}
      <div className="bp-float absolute" style={{ left: "5.5%", top: "7%", width: 112, height: 112, animationDuration: "14s" }}>
        <HoloEarth size={112} duration={45} lineColor="rgba(255,255,255,0.92)" />
      </div>

      {/* 灰网小行星（小 · 半透明灰色网络 · 右下白盘 · 无包围环） */}
      <div className="bp-float absolute" style={{ left: "71%", top: "63%", width: 52, height: 52, animationDuration: "13s" }}>
        <NeuralOrb size={52} nodeCount={48} seed={37} duration={16}
          lineColor="rgba(0,0,0,0.42)" nodeColor="rgba(10,10,10,0.85)" />
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.06) 100%)",
        }}
      />
    </div>
  );
}
