"use client";

import * as React from "react";

// ============================================================
// Pure Gold Curve Cursor Trail — single elegant stroke
// ============================================================

interface TrailPoint { x: number; y: number; }

const TRAIL_LEN       = 55;
const SAMPLE_DIST     = 3;
const STILL_FRAMES    = 50;    // frames without move → still
const SHRINK_SPEED    = 0.07;

export function CursorTrail() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const trailRef     = React.useRef<TrailPoint[]>([]);
  const mouseRef     = React.useRef({ x: -100, y: -100 });
  const rafRef       = React.useRef<number>(0);
  const stillCount   = React.useRef(0);
  const isStillRef   = React.useRef(false);
  const shrinkRef    = React.useRef(0);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap   = "round";
    ctx.lineJoin  = "round";

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    /* ---- mouse ---- */
    const onMove = (e: MouseEvent) => {
      const prev = mouseRef.current;
      const nx = e.clientX, ny = e.clientY;
      mouseRef.current = { x: nx, y: ny };

      if (prev.x < 0) { prev.x = nx; prev.y = ny; }

      const dx = nx - prev.x, dy = ny - prev.y;
      const dist = Math.hypot(dx, dy);

      if (dist >= SAMPLE_DIST) {
        // Interpolate intermediate points for smoothness at any speed
        const steps = Math.ceil(dist / SAMPLE_DIST);
        for (let s = 1; s <= steps; s++) {
          trailRef.current.push({
            x: prev.x + dx * (s / steps),
            y: prev.y + dy * (s / steps),
          });
        }
        while (trailRef.current.length > TRAIL_LEN) trailRef.current.shift();
        stillCount.current = 0;
        isStillRef.current = false;
        shrinkRef.current  = 0;
      } else {
        stillCount.current++;
      }
    };

    const onLeave = () => {
      mouseRef.current = { x: -100, y: -100 };
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    /* ---- animation ---- */
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const trail = trailRef.current;
      const { x: mx, y: my } = mouseRef.current;
      const on = mx > 0 && my > 0;

      if (stillCount.current > STILL_FRAMES) isStillRef.current = true;
      const still = isStillRef.current;

      // ---- Still: shrink trail to cursor ----
      if (on && still && trail.length >= 2) {
        shrinkRef.current = Math.min(shrinkRef.current + SHRINK_SPEED, 1);
        for (let i = 0; i < trail.length; i++) {
          const pt = trail[i]!;
          pt.x += (mx - pt.x) * shrinkRef.current;
          pt.y += (my - pt.y) * shrinkRef.current;
        }
        const target = Math.max(4, Math.floor(TRAIL_LEN * (1 - shrinkRef.current)));
        while (trail.length > target) trail.shift();
      }

      if (!on || trail.length < 2) {
        // ---- Still pulse dot ----
        if (on && still) {
          const pulse = 0.45 + 0.3 * Math.sin(Date.now() / 400);
          const g = ctx.createRadialGradient(mx, my, 0, mx, my, 10);
          g.addColorStop(0, `rgba(255,215,0,${pulse})`);
          g.addColorStop(0.4, `rgba(255,180,30,${pulse * 0.35})`);
          g.addColorStop(1, "rgba(255,140,0,0)");
          ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
          ctx.beginPath(); ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,240,180,${0.9 + pulse * 0.1})`; ctx.fill();
        }
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      // ---- Draw trail as segmented bezier curve ----
      const pts = trail;
      const n   = pts.length;

      for (let pass = 0; pass < 2; pass++) {
        const glow = pass === 0;

        for (let i = 1; i < n; i++) {
          const p0 = pts[i - 1]!;
          const p1 = pts[i]!;
          const t  = i / (n - 1);                // 0=tail 1=head

          // Alpha curve: steep fade at tail, full in body
          let alpha: number;
          const cut = 20 / TRAIL_LEN;
          if (t < cut) {
            alpha = (t / cut) ** 3;
          } else {
            alpha = 1;
          }
          if (alpha < 0.003) continue;

          const w = glow
            ? 1.5 + 9.5 * t
            : 0.3 + 2.2 * t;

          ctx.beginPath();

          if (i < n - 1) {
            const p2 = pts[i + 1]!;
            const mx2 = (p1.x + p2.x) / 2;
            const my2 = (p1.y + p2.y) / 2;
            ctx.moveTo(p0.x, p0.y);
            ctx.quadraticCurveTo(p1.x, p1.y, mx2, my2);
          } else {
            ctx.moveTo(p0.x, p0.y);
            ctx.quadraticCurveTo(p1.x, p1.y, mx, my);
          }

          ctx.lineWidth = w;

          if (glow) {
            ctx.strokeStyle = `rgba(255,195,45,${(alpha * 0.3).toFixed(3)})`;
            ctx.shadowColor = `rgba(255,170,20,${(alpha * 0.55).toFixed(3)})`;
            ctx.shadowBlur  = w * 2;
          } else {
            const g = Math.round(185 + t * 60);
            const b = Math.round(15 + t * 100);
            ctx.strokeStyle = `rgba(255,${g},${b},${(alpha * 0.92).toFixed(3)})`;
            ctx.shadowColor  = "transparent";
            ctx.shadowBlur   = 0;
          }

          ctx.stroke();
        }

        // Head dot
        if (!still) {
          ctx.shadowColor  = "transparent";
          ctx.shadowBlur   = 0;
          ctx.beginPath();
          ctx.arc(mx, my, glow ? 5 : 2.2, 0, Math.PI * 2);
          ctx.fillStyle = glow
            ? "rgba(255,220,100,0.5)"
            : "rgba(255,245,190,0.95)";
          ctx.fill();
        }
      }

      // Reset shadow for next frame
      ctx.shadowColor  = "transparent";
      ctx.shadowBlur   = 0;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden="true"
    />
  );
}



