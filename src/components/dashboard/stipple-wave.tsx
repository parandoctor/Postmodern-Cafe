"use client";

import * as React from "react";

function hash(x: number, y: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export function StippleWave({
  className,
  focusX = null,
  active = false,
}: {
  className?: string;
  focusX?: number | null;
  active?: boolean;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const focusRef = React.useRef({ x: focusX, active });
  const renderRef = React.useRef<((time: number) => void) | null>(null);

  React.useEffect(() => {
    focusRef.current = { x: focusX, active };
    renderRef.current?.(performance.now());
  }, [focusX, active]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let running = true;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let last = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderRef.current?.(performance.now());
    };

    const draw = (time: number) => {
      if (!running) return;
      if (time - last > 32) {
        last = time;
        const { x: focus, active: focused } = focusRef.current;
        const phase = reduced ? 0 : time * 0.0009;
        const breath = reduced ? 1 : 1 + Math.sin(time * 0.0008) * 0.14;
        const focusShift = focus === null ? 0 : (focus - 0.5) * 3.2;
        context.clearRect(0, 0, width, height);
        const stepX = Math.max(4, width / 260);
        for (let x = 0; x <= width; x += stepX) {
          const nx = x / width;
          const edge = Math.sin(Math.PI * nx) ** 0.62;
          const proximity = focus === null ? 0 : Math.max(0, 1 - Math.abs(nx - focus) * 2.6);
          const centerY =
            height * 0.5 +
            Math.sin(x * 0.011 + phase + focusShift) * height * 0.13 * breath +
            Math.sin(x * 0.024 - phase * 0.9 + focusShift * 0.6) * height * 0.04;
          const spread = height * (0.3 + (focused ? 0.05 : 0)) * breath;
          for (let band = -12; band <= 12; band += 1) {
            const ratio = band / 12;
            const y = centerY + ratio * spread * (0.78 + 0.22 * Math.sin(nx * 9 + phase));
            const density = Math.min(1, Math.pow(1 - Math.abs(ratio), 1.7) * edge + proximity * (focused ? 0.32 : 0.14));
            if (hash(x * 0.13, band) > density * 0.82) continue;
            context.globalAlpha = 0.05 + density * (focused ? 0.66 : 0.55);
            context.fillStyle = "#111111";
            const size = density > 0.55 ? 1.35 : 0.95;
            context.fillRect(x, y, size, size);
          }
        }
        context.globalAlpha = 1;
      }
      if (!reduced) frame = window.requestAnimationFrame(draw);
    };

    renderRef.current = (time: number) => {
      if (reduced) {
        last = -100;
        draw(time);
      }
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    if (!reduced) frame = window.requestAnimationFrame(draw);

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      renderRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}

