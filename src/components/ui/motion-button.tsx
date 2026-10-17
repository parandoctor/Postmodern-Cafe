"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

type Variant = "primary" | "secondary" | "ghost" | "icon" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

export interface MotionButtonProps {
  children?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  arrow?: boolean;
  floating?: boolean;
  title?: string;
  ariaLabel?: string;
}

const VARIANTS: Record<Variant, string> = {
  primary: "border-black bg-black text-white shadow-[0_7px_20px_rgba(0,0,0,0.16)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)]",
  secondary: "border-[#d5d5d5] bg-white text-[#222] hover:border-black hover:bg-black hover:text-white hover:shadow-[0_10px_24px_rgba(0,0,0,0.16)]",
  ghost: "border-transparent bg-transparent text-[#666] hover:bg-[#f5f5f5] hover:text-black",
  icon: "h-9 w-9 border-[#dedede] bg-white text-[#666] hover:border-black hover:bg-black hover:text-white",
  danger: "border-[#d5d5d5] bg-white text-[#555] hover:border-[#111] hover:bg-[#111] hover:text-white",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[11px]",
  md: "h-10 px-5 text-[12px]",
  lg: "h-12 px-7 text-[13px]",
  icon: "h-9 w-9 p-0",
};

export function MotionButton({
  children,
  variant = "primary",
  size = "md",
  href,
  type = "button",
  onClick,
  disabled,
  className,
  icon,
  arrow,
  floating,
  title,
  ariaLabel,
}: MotionButtonProps) {
  const reduced = useReducedMotion();
  const shouldFloat = Boolean(floating) && !reduced && !disabled;
  const classes = cn(
    "group relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full border font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
  const content = (
    <>
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-[45%] w-[35%] skew-x-[-22deg] bg-white/30 opacity-0 blur-sm transition-all duration-500 group-hover:left-[120%] group-hover:opacity-100" />
      {icon && <span className="relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5">{icon}</span>}
      {children && <span className="relative z-10">{children}</span>}
      {arrow && <ArrowUpRight className="relative z-10 h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
    </>
  );

  const motionProps = {
    whileHover: reduced ? undefined : { y: -3.5 },
    whileTap: reduced ? undefined : { scale: 0.965, y: -1 },
    animate: shouldFloat ? { y: [0, -2, 0] } : { y: 0 },
    transition: shouldFloat
      ? { y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" as const } }
      : { type: "spring" as const, stiffness: 380, damping: 24 },
  };

  if (href) {
    return (
      <MotionLink href={href} className={classes} title={title} aria-label={ariaLabel} {...motionProps}>
        {content}
      </MotionLink>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      title={title}
      aria-label={ariaLabel}
      {...motionProps}
    >
      {content}
    </motion.button>
  );
}
