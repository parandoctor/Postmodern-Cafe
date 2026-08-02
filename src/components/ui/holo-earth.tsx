"use client";

import * as React from "react";

/* ============================================================
   HoloEarth — 全息线框数字地球
   HUD 测绘蓝图 · 线稿矢量轮廓 · 大陆海岸线点阵勾勒
   经纬网格 + 大陆轮廓 3D 自转 (JS rotateY 正交投影)
   纤细发光白线 · 环绕轨道细线 · 坐标刻度标尺
   十字定位标记 · 粒子点阵肌理 · 无实体填充 · 全息投影质感
   ============================================================ */

type Vec3 = { x: number; y: number; z: number };

const R = 34; // 球半径（viewBox 0 0 100 100，中心 50,50）

function latLonTo3D(lat: number, lon: number): Vec3 {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return {
    x: R * Math.cos(la) * Math.sin(lo),
    y: -R * Math.sin(la),
    z: R * Math.cos(la) * Math.cos(lo),
  };
}

/* 简化大陆轮廓（[经度, 纬度]）— 风格化线稿 · 点阵勾勒 */
const CONTINENT_CONTOURS: [number, number][][] = [
  // 欧亚大陆
  [
    [-9, 35], [0, 43], [5, 44], [10, 45], [15, 47], [20, 49], [25, 46], [30, 45],
    [35, 42], [40, 43], [45, 45], [50, 50], [55, 57], [60, 60], [65, 68], [70, 72],
    [75, 74], [80, 73], [85, 70], [90, 75], [95, 78], [100, 76], [105, 70], [110, 72],
    [115, 74], [120, 73], [125, 70], [130, 68], [135, 65], [140, 62], [145, 58], [150, 55],
    [155, 56], [160, 60], [165, 62], [170, 65], [175, 68], [180, 70], [180, 66], [175, 64],
    [170, 60], [165, 55], [160, 52], [155, 50], [150, 47], [145, 44], [140, 42], [135, 38],
    [130, 35], [125, 32], [120, 30], [115, 28], [110, 30], [105, 32], [100, 30], [95, 28],
    [90, 26], [85, 22], [80, 20], [75, 22], [70, 25], [65, 28], [60, 30], [55, 35],
    [50, 38], [45, 40], [40, 40], [35, 38], [30, 37], [25, 40], [20, 43], [15, 45],
    [10, 45], [5, 45], [0, 44], [-5, 42], [-9, 38], [-9, 35],
  ],
  // 非洲
  [
    [-5, 35], [0, 37], [5, 36], [10, 37], [15, 36], [20, 32], [25, 30], [30, 31],
    [32, 26], [34, 22], [35, 15], [34, 10], [33, 5], [32, 0], [30, -6], [28, -12],
    [25, -18], [22, -24], [18, -30], [14, -34], [10, -35], [6, -32], [2, -27], [0, -20],
    [-2, -12], [-4, -5], [-6, 2], [-8, 8], [-10, 14], [-12, 20], [-10, 26], [-8, 30], [-5, 35],
  ],
  // 北美
  [
    [-55, 48], [-50, 52], [-45, 56], [-40, 60], [-35, 64], [-30, 68], [-25, 72], [-20, 74],
    [-15, 72], [-12, 68], [-10, 64], [-10, 60], [-12, 55], [-15, 50], [-18, 46], [-20, 42],
    [-22, 38], [-22, 34], [-22, 30], [-20, 26], [-18, 22], [-15, 18], [-12, 15], [-10, 12],
    [-14, 10], [-18, 13], [-22, 16], [-26, 20], [-30, 24], [-34, 28], [-38, 32], [-42, 36],
    [-46, 40], [-50, 44], [-55, 48],
  ],
  // 南美
  [
    [-32, 5], [-28, 10], [-24, 12], [-20, 12], [-16, 10], [-12, 8], [-8, 5], [-4, 2],
    [0, -2], [3, -7], [5, -12], [6, -18], [5, -24], [3, -30], [0, -36], [-4, -42],
    [-8, -48], [-12, -52], [-16, -54], [-20, -53], [-24, -50], [-28, -46], [-32, -42], [-36, -38],
    [-40, -34], [-43, -30], [-46, -26], [-48, -22], [-49, -18], [-48, -14], [-46, -10], [-43, -6],
    [-40, -2], [-38, 2], [-35, 5], [-32, 5],
  ],
  // 澳洲
  [
    [114, -20], [118, -16], [122, -13], [126, -11], [130, -10], [134, -11], [138, -13], [142, -16],
    [146, -19], [150, -21], [153, -24], [154, -28], [152, -32], [148, -35], [144, -38], [140, -39],
    [136, -38], [132, -35], [128, -32], [124, -28], [120, -25], [116, -23], [114, -20],
  ],
  // 格陵兰
  [
    [-42, 60], [-38, 64], [-34, 68], [-30, 72], [-26, 76], [-22, 80], [-18, 82], [-14, 80],
    [-12, 76], [-12, 72], [-14, 68], [-16, 64], [-18, 60], [-22, 58], [-26, 59], [-30, 61],
    [-34, 62], [-38, 61], [-42, 60],
  ],
  // 南极洲
  [
    [-150, -70], [-120, -72], [-90, -70], [-60, -72], [-30, -74], [0, -70], [30, -72], [60, -75],
    [90, -70], [120, -72], [150, -74], [150, -84], [120, -82], [90, -84], [60, -82], [30, -84],
    [0, -82], [-30, -84], [-60, -82], [-90, -84], [-120, -82], [-150, -84], [-150, -70],
  ],
];

function sampleContour(pts: [number, number][], step: number): Vec3[] {
  const out: Vec3[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    if (!a || !b) continue;
    let dLon = b[0] - a[0];
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;
    const dLat = b[1] - a[1];
    const steps = Math.max(
      1,
      Math.ceil(Math.max(Math.abs(dLon), Math.abs(dLat)) / step),
    );
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      out.push(latLonTo3D(a[1] + dLat * t, a[0] + dLon * t));
    }
  }
  return out;
}

function buildMeridians(): Vec3[][] {
  const list: Vec3[][] = [];
  for (let lon = -180; lon < 180; lon += 30) {
    const pts: Vec3[] = [];
    for (let lat = -84; lat <= 84; lat += 6) pts.push(latLonTo3D(lat, lon));
    list.push(pts);
  }
  return list;
}

function buildParallels(): Vec3[][] {
  const list: Vec3[][] = [];
  for (let lat = -80; lat <= 80; lat += 20) {
    const pts: Vec3[] = [];
    for (let lon = 0; lon < 360; lon += 6) pts.push(latLonTo3D(lat, lon));
    list.push(pts);
  }
  return list;
}

export function HoloEarth({
  size,
  duration = 42,
  lineColor = "rgba(255,255,255,0.9)",
  glow = true,
  showOrbits = true,
  showScale = true,
  showCrosshair = true,
  particleCount = 40,
  className,
  style,
}: {
  size?: number;
  duration?: number;
  lineColor?: string;
  glow?: boolean;
  showOrbits?: boolean;
  showScale?: boolean;
  showCrosshair?: boolean;
  particleCount?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const meridianRefs = React.useRef<(SVGPolylineElement | null)[]>([]);
  const parallelRefs = React.useRef<(SVGPolylineElement | null)[]>([]);
  const coastRefs = React.useRef<(SVGPolylineElement | null)[]>([]);
  const particleRefs = React.useRef<(SVGCircleElement | null)[]>([]);

  const meridians = React.useMemo(buildMeridians, []);
  const parallels = React.useMemo(buildParallels, []);
  const coastlines = React.useMemo(
    () => CONTINENT_CONTOURS.map((c) => sampleContour(c, 3)),
    [],
  );
  const particles = React.useMemo(() => {
    let s = 4242;
    const rand = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0xFFFFFFFF;
    };
    const arr: Vec3[] = [];
    for (let i = 0; i < particleCount; i++) {
      const u = rand() * 2 - 1;
      const t = rand() * Math.PI * 2;
      const rr = Math.sqrt(Math.max(0, 1 - u * u));
      arr.push({ x: rr * Math.cos(t) * R, y: u * R, z: rr * Math.sin(t) * R });
    }
    return arr;
  }, [particleCount]);

  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const a = ((t - start) / 1000) * ((2 * Math.PI) / duration);
      const c = Math.cos(a);
      const s = Math.sin(a);

      const depthOf = (p: Vec3) => (-p.x * s + p.z * c + R) / (2 * R);
      const projectPts = (pts: Vec3[]) => {
        let out = "";
        for (const p of pts) {
          const xr = p.x * c + p.z * s;
          out += `${(50 + xr).toFixed(2)},${(50 + p.y).toFixed(2)} `;
        }
        return out;
      };

      for (let i = 0; i < meridians.length; i++) {
        const el = meridianRefs.current[i];
        const pts = meridians[i];
        if (!el || !pts) continue;
        el.setAttribute("points", projectPts(pts));
        let d = 0;
        for (const p of pts) d += depthOf(p);
        d /= pts.length;
        el.setAttribute("opacity", String(0.14 + d * 0.42));
      }
      for (let i = 0; i < parallels.length; i++) {
        const el = parallelRefs.current[i];
        const pts = parallels[i];
        if (!el || !pts) continue;
        el.setAttribute("points", projectPts(pts));
        let d = 0;
        for (const p of pts) d += depthOf(p);
        d /= pts.length;
        el.setAttribute("opacity", String(0.14 + d * 0.42));
      }
      for (let i = 0; i < coastlines.length; i++) {
        const el = coastRefs.current[i];
        const pts = coastlines[i];
        if (!el || !pts) continue;
        el.setAttribute("points", projectPts(pts));
        let d = 0;
        for (const p of pts) d += depthOf(p);
        d /= pts.length;
        el.setAttribute("opacity", String(0.22 + d * 0.62));
      }
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const el = particleRefs.current[i];
        if (!p || !el) continue;
        const xr = p.x * c + p.z * s;
        const d = depthOf(p);
        el.setAttribute("cx", String(50 + xr));
        el.setAttribute("cy", String(50 + p.y));
        el.setAttribute("opacity", String(0.1 + d * 0.75));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [meridians, parallels, coastlines, particles, duration]);

  const outerStyle: React.CSSProperties = size
    ? { width: size, height: size, ...style }
    : { ...style };

  return (
    <div className={className} style={outerStyle}>
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
        {glow && (
          <defs>
            <filter id="holo-earth-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="0.9" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}

        {/* 线稿核心：经纬网 + 大陆点阵 + 粒子（3D 自转） */}
        <g filter={glow ? "url(#holo-earth-glow)" : undefined}>
          <circle cx="50" cy="50" r={R} fill="none" stroke={lineColor}
            strokeWidth="0.5" opacity="0.55" />
          {meridians.map((_, i) => (
            <polyline key={`m${i}`}
              ref={(el) => { meridianRefs.current[i] = el; }}
              points="50,50 50,50" fill="none"
              stroke={lineColor} strokeWidth="0.26" />
          ))}
          {parallels.map((_, i) => (
            <polyline key={`p${i}`}
              ref={(el) => { parallelRefs.current[i] = el; }}
              points="50,50 50,50" fill="none"
              stroke={lineColor} strokeWidth="0.26" />
          ))}
          {coastlines.map((_, i) => (
            <polyline key={`c${i}`}
              ref={(el) => { coastRefs.current[i] = el; }}
              points="50,50 50,50" fill="none"
              stroke={lineColor} strokeWidth="0.5"
              strokeLinecap="round" strokeDasharray="0.4 3.4" />
          ))}
          {particles.map((_, i) => (
            <circle key={`d${i}`}
              ref={(el) => { particleRefs.current[i] = el; }}
              cx="50" cy="50" r="0.55" fill={lineColor} />
          ))}
        </g>

        {/* 环绕轨道细线（低透明度） */}
        {showOrbits && (
          <g opacity="0.3" fill="none" stroke={lineColor}>
            <ellipse cx="50" cy="50" rx="47" ry="19" strokeWidth="0.32"
              transform="rotate(-16 50 50)" strokeDasharray="3 5" />
            <ellipse cx="50" cy="50" rx="42" ry="15" strokeWidth="0.22"
              transform="rotate(24 50 50)" />
          </g>
        )}

        {/* 坐标刻度标尺 */}
        {showScale && (
          <g opacity="0.38" stroke={lineColor} fill="none">
            {Array.from({ length: 36 }).map((_, i) => {
              const ang = (i * 10 * Math.PI) / 180;
              const r1 = 45.5;
              const r2 = i % 9 === 0 ? 43 : 44.6;
              const fx = (n: number) => Number(n.toFixed(2));
              return (
                <line key={`s${i}`}
                  x1={fx(50 + r1 * Math.cos(ang))} y1={fx(50 + r1 * Math.sin(ang))}
                  x2={fx(50 + r2 * Math.cos(ang))} y2={fx(50 + r2 * Math.sin(ang))}
                  strokeWidth={i % 9 === 0 ? 0.6 : 0.3} />
              );
            })}
            <text x="50" y="39.5" fontSize="3.2" fill={lineColor} stroke="none"
              textAnchor="middle" opacity="0.65">0°</text>
            <text x="50" y="63.5" fontSize="3.2" fill={lineColor} stroke="none"
              textAnchor="middle" opacity="0.65">180°</text>
            <text x="8.2" y="51.5" fontSize="3.2" fill={lineColor} stroke="none"
              textAnchor="middle" opacity="0.65">90°W</text>
            <text x="91.8" y="51.5" fontSize="3.2" fill={lineColor} stroke="none"
              textAnchor="middle" opacity="0.65">90°E</text>
          </g>
        )}

        {/* 十字定位标记 */}
        {showCrosshair && (
          <g opacity="0.4" stroke={lineColor} fill="none">
            <line x1="50" y1="4" x2="50" y2="96" strokeWidth="0.24" strokeDasharray="2 3" />
            <line x1="4" y1="50" x2="96" y2="50" strokeWidth="0.24" strokeDasharray="2 3" />
            <line x1="50" y1="4" x2="50" y2="12" strokeWidth="0.5" />
            <line x1="50" y1="88" x2="50" y2="96" strokeWidth="0.5" />
            <line x1="4" y1="50" x2="12" y2="50" strokeWidth="0.5" />
            <line x1="88" y1="50" x2="96" y2="50" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="1.4" strokeWidth="0.3" />
          </g>
        )}
      </svg>
    </div>
  );
}
