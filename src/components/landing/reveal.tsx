"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  trigger?: "mount" | "view";
}

export function Reveal({ children, className, delay = 0, trigger = "view" }: RevealProps) {
  const reduced = useReducedMotion();
  const hidden = reduced ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 24, filter: "blur(6px)" };
  const visible = { opacity: 1, y: 0, filter: "blur(0px)" };
  const transition = reduced ? { duration: 0 } : { duration: 0.72, delay, ease: [0.16, 1, 0.3, 1] as const };
  return (
    <motion.div
      className={className}
      initial={hidden}
      animate={trigger === "mount" ? visible : undefined}
      whileInView={trigger === "view" ? visible : undefined}
      viewport={trigger === "view" ? { once: true, margin: "-12% 0px" } : undefined}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

interface RevealLinesProps {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  trigger?: "mount" | "view";
}

export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.12,
  trigger = "view",
}: RevealLinesProps) {
  const reduced = useReducedMotion();
  return (
    <span className={cn("block", className)}>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={cn("block", lineClassName)}
            initial={reduced ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: "105%", filter: "blur(5px)" }}
            animate={trigger === "mount" && !reduced ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
            whileInView={trigger === "view" && !reduced ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
            viewport={trigger === "view" ? { once: true, margin: "-10% 0px" } : undefined}
            transition={reduced ? { duration: 0 } : { duration: 0.78, delay: delay + index * stagger, ease: [0.16, 1, 0.3, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
