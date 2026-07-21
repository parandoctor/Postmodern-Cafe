"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useCallback } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Zap, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useMousePosition } from "@/hooks";

// ---- Three.js Particle System ----
function Particles({ count = 2000 }) {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const color1 = new THREE.Color(isDark ? "#60a5fa" : "#3b82f6");
    const color2 = new THREE.Color(isDark ? "#a78bfa" : "#8b5cf6");

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;

      const c = color1.clone().lerp(color2, Math.random());
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      siz[i] = Math.random() * 3 + 1;
    }
    return [pos, col, siz];
  }, [count, isDark]);

  // Mouse tracking for attraction
  const handlePointerMove = useCallback((e: { clientX: number; clientY: number }) => {
    mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  React.useEffect(() => {
    window.addEventListener("mousemove", handlePointerMove);
    return () => window.removeEventListener("mousemove", handlePointerMove);
  }, [handlePointerMove]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const attr = mesh.geometry.attributes.position;
    if (!attr) return;
    const posAttr = attr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Slow floating motion
      posAttr[i3]! += Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.001;
      posAttr[i3 + 1]! += Math.cos(state.clock.elapsedTime * 0.2 + i * 0.5) * 0.001;
      posAttr[i3 + 2]! += Math.sin(state.clock.elapsedTime * 0.15 + i * 0.3) * 0.001;

      // Mouse attraction
      const dx = mouseRef.current.x * 15 - posAttr[i3]!;
      const dy = mouseRef.current.y * 10 - posAttr[i3 + 1]!;
      posAttr[i3]! += dx * 0.0002;
      posAttr[i3 + 1]! += dy * 0.0002;
    }
    attr.needsUpdate = true;
  });

  const posBufferAttr = useMemo(() => new THREE.BufferAttribute(positions, 3), [positions]);
  const colBufferAttr = useMemo(() => new THREE.BufferAttribute(colors, 3), [colors]);
  const sizBufferAttr = useMemo(() => new THREE.BufferAttribute(sizes, 1), [sizes]);

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function ParticleBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          alpha: true,
        }}
        style={{ background: "transparent" }}
      >
        <Particles count={1500} />
      </Canvas>
    </div>
  );
}

// ---- Main Hero Component ----
export function Hero() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Gradient overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background" />
      <div className="pointer-events-none absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span>全新一代智能收纳平台</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          让文件管理
          <br />
          <span className="rainbow-text">像彩虹一样有序</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl"
        >
          现代化个人文件管理与分类收纳平台。
          以七彩分类重新定义文件管理方式，
          让每一份文件都有它的归属。
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button size="xl" className="group gap-2 shadow-xl shadow-primary/20" asChild>
            <a href="/register">
              立即开始
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
          <Button variant="outline" size="xl" asChild>
            <a href="#features">了解更多</a>
          </Button>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8"
        >
          {[
            { icon: Zap, label: "极速上传", desc: "断点续传" },
            { icon: Shield, label: "安全可靠", desc: "加密存储" },
            { icon: Palette, label: "七彩分类", desc: "视觉管理" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground/60">向下滚动</span>
          <div className="h-10 w-6 rounded-full border-2 border-muted-foreground/20 p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto h-2 w-1.5 rounded-full bg-primary/50"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
