"use client";

import * as React from "react";

/* ============================================================
   AuthTdBackground — 登录/注册页背景（直接使用参考图）
   - 底图：touchdesigner 黑白粒子抽象图（1440x1080，原素材）
   - 全幅覆盖 + 轻微灰度/对比 + 极慢缓慢缩放（Ken Burns）
   - 叠加极轻动态颗粒噪点 + 暗角，保卡片可读
   ============================================================ */

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

export function AuthTdBackground() {
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

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      // 极轻颗粒闪烁
      const n = Math.floor((W * H) / 1600);
      for (let i = 0; i < n; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const g = Math.floor(Math.random() * 220);
        ctx.fillStyle = `rgba(${g},${g},${g},${0.03 + Math.random() * 0.05})`;
        ctx.fillRect(x, y, 1, 1);
      }
      raf = requestAnimationFrame(frame);
    };

    resize();
    if (!reduced) frame();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      {/* 参考图底图（缓慢缩放） */}
      <img
        src="/art/auth-td-particles.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          filter: "grayscale(1) contrast(1.05) brightness(0.96)",
          animation: reduced ? undefined : "tdZoom 36s ease-in-out infinite alternate",
        }}
        draggable={false}
      />

      {/* 极轻动态颗粒 */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* 全幅细噪点 */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* 暗角 + 轻微压暗保卡片可读 */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 45%, transparent 34%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.15) 46%, transparent 66%)" }} />

      <style>{`
        @keyframes tdZoom {
          from { transform: scale(1); }
          to { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}
