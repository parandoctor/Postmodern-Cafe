"use client";

import * as React from "react";

/* ============================================================
   AuthParticleBackground — 登录/注册页「数字粒子动力学」背景
   风格：touchdesigner-particles（粒子源点爆发 + 放射扩散）
   - 左下角能量源向右上放射：白色高光粒子 + 灰阶粒子 + 光迹拖尾
   - 全局噪点颗粒 + 边缘暗角，纯黑白灰，可叠加文字
   - Canvas rAF 驱动，标签页隐藏自动暂停；prefers-reduced-motion 降级为静态
   ============================================================ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  maxLife: number;
  gray: number;
  trail: { x: number; y: number }[];
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function AuthParticleBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let W = 0;
    let H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let running = true;

    const src = () => ({ x: W * 0.16, y: H * 0.86 });

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(260, Math.max(90, Math.floor((W * H) / 8000)));
      particles = Array.from({ length: count }, () => spawn(true));
    };

    const spawn = (initial = false): Particle => {
      const s = src();
      // 放射方向：偏右上（-65° ~ 75°）
      const angle = (-65 + Math.random() * 140) * (Math.PI / 180);
      const speed = 0.25 + Math.random() * 1.15;
      const life = 60 + Math.random() * 140;
      return {
        x: s.x + (initial ? (Math.random() - 0.5) * W * 0.25 : 0),
        y: s.y + (initial ? (Math.random() - 0.5) * H * 0.12 : 0),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.72,
        r: 0.3 + Math.random() * 1.6,
        life,
        maxLife: life,
        gray: 150 + Math.floor(Math.random() * 105),
        trail: [],
      };
    };

    const drawStatic = () => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      const s = src();
      const rays = 90;
      for (let i = 0; i < rays; i++) {
        const angle = (-65 + Math.random() * 140) * (Math.PI / 180);
        const dist = 0.08 + Math.random() * 0.82;
        const g = 120 + Math.floor(Math.random() * 135);
        ctx.globalAlpha = 0.25 + Math.random() * 0.5;
        ctx.fillStyle = `rgb(${g},${g},${g})`;
        ctx.beginPath();
        ctx.arc(
          s.x + Math.cos(angle) * dist * Math.min(W, H),
          s.y + Math.sin(angle) * dist * Math.min(W, H) * 0.72,
          0.3 + Math.random() * 1.4,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const frame = () => {
      // 渐隐轨迹
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "lighter";
      const s = src();

      // 源点光晕
      const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, Math.min(W, H) * 0.34);
      glow.addColorStop(0, "rgba(255,255,255,0.10)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      for (const p of particles) {
        p.life -= 1;
        if (p.life <= 0) {
          Object.assign(p, spawn());
          continue;
        }
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.012;
        p.x += p.vx;
        p.y += p.vy;

        // 光迹拖尾
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 5) p.trail.shift();
        for (let i = 1; i < p.trail.length; i++) {
          const a = p.trail[i - 1] as { x: number; y: number } | undefined;
          const b = p.trail[i] as { x: number; y: number } | undefined;
          if (!a || !b) continue;
          ctx.strokeStyle = `rgba(${p.gray},${p.gray},${p.gray},${0.10 * i})`;
          ctx.lineWidth = p.r * 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        const t = p.life / p.maxLife;
        const alpha = Math.min(0.9, t * 1.2);
        ctx.fillStyle = `rgba(${p.gray},${p.gray},${p.gray},${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.6 + t * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      const visible = document.visibilityState === "visible";
      if (visible && running && !reduced) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      }
      running = visible;
    };

    resize();
    if (reduced) {
      drawStatic();
    } else {
      frame();
    }
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* 噪点颗粒 */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* 边缘暗角 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 18% 86%, transparent 18%, rgba(0,0,0,0.55) 78%)",
        }}
      />
    </div>
  );
}
