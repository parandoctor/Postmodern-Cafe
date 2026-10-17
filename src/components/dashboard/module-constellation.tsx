import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StippleWave } from "@/components/dashboard/stipple-wave";

const MODULES = [
  {
    index: "01",
    title: "笔记管理",
    subtitle: "MARKDOWN / NOTES / FILES",
    href: "/dashboard/notes",
    node: { left: "16.667%", top: "46.05%" },
    label: { left: "0%", top: "13%", align: "left" as const },
  },
  {
    index: "02",
    title: "美学空间",
    subtitle: "MUSIC / IMAGE / EDIT",
    href: "/dashboard/aesthetic",
    node: { left: "50%", top: "65.79%" },
    label: { left: "54%", top: "77%", align: "left" as const },
  },
  {
    index: "03",
    title: "实用工具",
    subtitle: "COUNTDOWN / CALENDAR",
    href: "/dashboard/tools",
    node: { left: "83.333%", top: "50%" },
    label: { left: "0%", top: "14%", align: "right" as const },
  },
];

function Node({ left, top, href, title }: { left: string; top: string; href: string; title: string }) {
  return (
    <Link
      href={href}
      aria-label={`进入${title}`}
      className="group absolute z-20 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#111] bg-white transition-transform duration-200 hover:scale-110"
      style={{ left, top }}
    >
      <span className="h-[4px] w-[4px] rounded-full bg-[#111] transition-transform duration-200 group-hover:scale-150" />
    </Link>
  );
}

function Label({ module }: { module: (typeof MODULES)[number] }) {
  return (
    <Link
      href={module.href}
      className="group absolute z-20 block w-[132px] transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        left: module.label.align === "right" ? undefined : module.label.left,
        right: module.label.align === "right" ? "0%" : undefined,
        top: module.label.top,
        textAlign: module.label.align,
      }}
    >
      <p className="text-[10px] font-semibold tabular-nums text-[#111]">{module.index}</p>
      <p className="mt-1 font-editorial text-[21px] leading-tight tracking-[-0.025em] text-[#111]">{module.title}</p>
      <p className="mt-2 whitespace-nowrap text-[7px] tracking-[0.1em] text-[#8d8d8d]">{module.subtitle}</p>
      <span className="mt-2 inline-flex items-center gap-1 text-[9px] text-[#8d8d8d] opacity-0 transition-opacity group-hover:opacity-100">
        进入 <ArrowUpRight className="h-2.5 w-2.5" />
      </span>
    </Link>
  );
}

export function ModuleConstellation() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-white px-6 py-16">
      <div className="relative hidden h-[min(58vh,545px)] w-full max-w-[860px] md:block">
        <StippleWave className="absolute inset-x-[8%] top-[27%] h-[43%] opacity-90" />
        <svg className="absolute inset-0 z-10 h-full w-full" viewBox="0 0 1200 760" preserveAspectRatio="none" aria-hidden="true">
          <g fill="none" stroke="#111111" strokeWidth="1" vectorEffect="non-scaling-stroke">
            <path d="M200 70V690" />
            <path d="M600 60V700" />
            <path d="M1000 80V680" />
            <path d="M160 188L200 350" />
            <path d="M650 600L600 500" strokeDasharray="3 5" />
            <path d="M1040 205L1000 380" />
            <path d="M130 390H50" strokeDasharray="3 5" markerEnd="url(#arrow-left)" />
            <path d="M1070 390H1150" strokeDasharray="3 5" markerEnd="url(#arrow-right)" />
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

        {MODULES.map((module) => (
          <div key={module.href}>
            <Label module={module} />
            <Node left={module.node.left} top={module.node.top} href={module.href} title={module.title} />
          </div>
        ))}
      </div>

      <div className="relative z-20 flex min-h-[calc(100vh-8rem)] w-full max-w-[330px] flex-col justify-center md:hidden">
        <StippleWave className="pointer-events-none absolute inset-x-[-10%] top-[32%] h-[38%] opacity-40" />
        <p className="mb-9 text-[9px] tracking-[0.2em] text-[#9a9a9a]">THREE SPACES</p>
        <div className="relative ml-3 border-l border-[#d6d6d6] pl-7">
          {MODULES.map((module) => (
            <Link key={module.href} href={module.href} className="group relative block border-b border-[#ededed] py-7 last:border-b-0">
              <span className="absolute -left-[31px] top-9 flex h-3 w-3 items-center justify-center rounded-full border border-[#111] bg-white">
                <span className="h-[4px] w-[4px] rounded-full bg-[#111]" />
              </span>
              <p className="text-[10px] font-semibold tabular-nums text-[#777]">{module.index}</p>
              <div className="mt-1 flex items-center justify-between gap-4">
                <h2 className="font-editorial text-[27px] tracking-[-0.03em]">{module.title}</h2>
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
