"use client";

import * as React from "react";

function hash(x: number, y: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export function StippleWave({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

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
    };

    const draw = (time: number) => {
      if (!running) return;
      if (time - last > 42) {
        last = time;
        const phase = reduced ? 0 : time * 0.00022;
        context.clearRect(0, 0, width, height);
        const stepX = Math.max(5, width / 240);
        for (let x = 0; x <= width; x += stepX) {
          const nx = x / width;
          const edge = Math.sin(Math.PI * nx) ** 0.65;
          const centerY =
            height * 0.5 +
            Math.sin(x * 0.009 + phase) * height * 0.12 +
            Math.sin(x * 0.021 - phase * 0.8) * height * 0.035;
          const spread = height * 0.26;
          for (let band = -11; band <= 11; band += 1) {
            const ratio = band / 11;
            const y = centerY + ratio * spread * (0.78 + 0.22 * Math.sin(nx * 8 + phase));
            const density = Math.pow(1 - Math.abs(ratio), 1.8) * edge;
            if (hash(x * 0.13, band) > density * 0.72) continue;
            context.globalAlpha = 0.05 + density * 0.5;
            context.fillStyle = "#111111";
            const size = density > 0.55 ? 1.25 : 0.9;
            context.fillRect(x, y, size, size);
          }
        }
        context.globalAlpha = 1;
      }
      frame = window.requestAnimationFrame(draw);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    frame = window.requestAnimationFrame(draw);

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}

