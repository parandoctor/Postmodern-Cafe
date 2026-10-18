"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StippleWave } from "@/components/dashboard/stipple-wave";

const MODULES = [
  {
    index: "01",
    title: "笔记管理",
    subtitle: "MARKDOWN / NOTES / FILES",
    href: "/dashboard/notes",
    lineX: 30,
    node: { left: "30%", top: "42%" },
    label: { left: "1%", top: "11%", align: "left" as const },
  },
  {
    index: "02",
    title: "美学空间",
    subtitle: "MUSIC / IMAGE / EDIT",
    href: "/dashboard/aesthetic",
    lineX: 50,
    node: { left: "50%", top: "68%" },
    label: { left: "55%", top: "81%", align: "left" as const },
  },
  {
    index: "03",
    title: "实用工具",
    subtitle: "COUNTDOWN / CALENDAR",
    href: "/dashboard/tools",
    lineX: 70,
    node: { left: "70%", top: "46%" },
    label: { left: "0%", top: "10%", align: "right" as const },
  },
];

function Node({
  module,
  active,
  onEnter,
  onLeave,
}: {
  module: (typeof MODULES)[number];
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <Link
      href={module.href}
      aria-label={`进入${module.title}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group absolute z-30 flex h-7 w-7 items-center justify-center rounded-full border border-[#111] bg-white transition-[transform,box-shadow] duration-300 hover:shadow-[0_8px_22px_rgba(0,0,0,0.14)]"
      style={{
        left: module.node.left,
        top: module.node.top,
        transform: active ? "translate(-50%, calc(-50% - 4px)) scale(1.1)" : "translate(-50%, -50%) scale(1)",
      }}
    >
      <span className={cn("absolute -left-3 h-8 w-2 border-y border-l border-[#111] transition-all duration-300", active ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0")} />
      <span className={cn("absolute -right-3 h-8 w-2 border-y border-r border-[#111] transition-all duration-300", active ? "translate-x-0 opacity-100" : "translate-x-1 opacity-0")} />
      <span className="h-[5px] w-[5px] rounded-full bg-[#111] transition-transform duration-300 group-hover:scale-150" />
    </Link>
  );
}

function Label({
  module,
  active,
  onEnter,
  onLeave,
}: {
  module: (typeof MODULES)[number];
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <Link
      href={module.href}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={cn(
        "group absolute z-30 block w-[126px] transition-[transform,opacity] duration-300",
        active ? "-translate-y-1" : "translate-y-0",
      )}
      style={{
        left: module.label.align === "right" ? undefined : module.label.left,
        right: module.label.align === "right" ? "1%" : undefined,
        top: module.label.top,
        textAlign: module.label.align,
      }}
    >
      <p className="text-[10px] font-semibold tabular-nums text-[#111]">{module.index}</p>
      <p className="mt-1 font-editorial text-[20px] leading-tight tracking-[-0.025em] text-[#111]">{module.title}</p>
      <p className="mt-2 whitespace-nowrap text-[7px] tracking-[0.1em] text-[#8d8d8d]">{module.subtitle}</p>
      <span className={cn("mt-2 inline-flex items-center gap-1 text-[9px] text-[#8d8d8d] transition-all duration-300", active ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0")}>
        进入 <ArrowUpRight className="h-2.5 w-2.5" />
      </span>
    </Link>
  );
}

export function ModuleConstellation() {
  const [active, setActive] = React.useState<number | null>(null);
  const [pointerX, setPointerX] = React.useState<number | null>(null);
  const focusX = active !== null ? MODULES[active]!.lineX / 100 : pointerX;

  return (
    <section
      className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-white px-6 py-14"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPointerX((event.clientX - rect.left) / rect.width);
      }}
      onPointerLeave={() => setPointerX(null)}
    >
      <div className="relative hidden h-[min(58vh,520px)] w-full max-w-[780px] md:block">
        <StippleWave focusX={focusX} active={active !== null} className="absolute inset-x-[15%] top-[24%] h-[52%] opacity-95" />

        <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" viewBox="0 0 1200 760" preserveAspectRatio="none" aria-hidden="true">
          <g fill="none" stroke="#111111" strokeWidth="1" vectorEffect="non-scaling-stroke">
            <path d="M180 200L360 319" className={active === 0 ? "opacity-100" : "opacity-70"} />
            <path d="M640 616L600 517" strokeDasharray="3 5" className={active === 1 ? "opacity-100" : "opacity-70"} />
            <path d="M1030 190L840 350" className={active === 2 ? "opacity-100" : "opacity-70"} />
            <path d="M300 380H220" strokeDasharray="3 5" markerEnd="url(#arrow-left)" />
            <path d="M900 380H980" strokeDasharray="3 5" markerEnd="url(#arrow-right)" />
          </g>
          <defs>
            <marker id="arrow-left" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M10 0L0 5L10 10Z" fill="#111111" />
            </marker>
            <marker id="arrow-right" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0L10 5L0 10Z" fill="#111111" />
            </marker>
          </defs>
        </svg>

        {MODULES.map((module, index) => (
          <React.Fragment key={module.href}>
            <Link
              href={module.href}
              aria-label={`进入${module.title}`}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              className="absolute z-20 w-8 -translate-x-1/2"
              style={{ left: `${module.lineX}%`, top: "9%", bottom: "9%" }}
            >
              <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#111]" />
              <span className={cn("module-line-flow absolute left-1/2 top-0 h-20 w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-black/35 to-transparent transition-opacity", active === index ? "opacity-100" : "opacity-0")} />
            </Link>
            <Label module={module} active={active === index} onEnter={() => setActive(index)} onLeave={() => setActive(null)} />
            <Node module={module} active={active === index} onEnter={() => setActive(index)} onLeave={() => setActive(null)} />
          </React.Fragment>
        ))}
      </div>

      <div className="relative z-20 flex min-h-[calc(100vh-8rem)] w-full max-w-[320px] flex-col justify-center md:hidden">
        <StippleWave focusX={pointerX} active={active !== null} className="pointer-events-none absolute inset-x-[-8%] top-[30%] h-[42%] opacity-55" />
        <p className="mb-8 text-[9px] tracking-[0.2em] text-[#9a9a9a]">THREE SPACES</p>
        <div className="relative ml-3 border-l border-[#d6d6d6] pl-7">
          {MODULES.map((module, index) => (
            <Link
              key={module.href}
              href={module.href}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              className={cn("group relative block border-b border-[#ededed] py-7 last:border-b-0 transition-transform duration-300", active === index && "-translate-y-1")}
            >
              <span className="absolute -left-[31px] top-9 flex h-3 w-3 items-center justify-center rounded-full border border-[#111] bg-white">
                <span className="h-[4px] w-[4px] rounded-full bg-[#111]" />
              </span>
              <p className="text-[10px] font-semibold tabular-nums text-[#777]">{module.index}</p>
              <div className="mt-1 flex items-center justify-between gap-4">
                <h2 className="font-editorial text-[26px] tracking-[-0.03em]">{module.title}</h2>
                <ArrowUpRight className="h-4 w-4 text-[#999] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <p className="mt-2 text-[8px] tracking-[0.13em] text-[#999]">{module.subtitle}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
