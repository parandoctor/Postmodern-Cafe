"use client";

import * as React from "react";
import { motion, useAnimation, useInView, type Transition } from "framer-motion";

/* ============================================================
   Entrance — SSR 安全的入场动画容器
   解决「首次访问只显示背景、刷新后才显示 UI」：
   framer-motion 的 initial 隐藏态会被 SSR 输出为内联 opacity:0，
   在 JS 水合完成前首屏内容不可见。
   本组件 SSR / 首帧直接渲染可见内容，挂载后再执行入场动画。
   ============================================================ */

interface EntranceProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** 渲染标签，默认 div（如 "h1" / "header" / "p"） */
  as?: React.ElementType;
  /** 入场隐藏状态，默认 { opacity: 0, y: 24 } */
  from?: Record<string, number>;
  /** 入场可见状态，默认 { opacity: 1, y: 0 } */
  to?: Record<string, number>;
  transition?: Transition;
  /** true = 滚动进入视口时触发（首屏以下区块）；false = 挂载后触发 */
  inView?: boolean;
  viewportMargin?: string;
  once?: boolean;
}

export function Entrance({
  children,
  className,
  style,
  as = "div",
  from = { opacity: 0, y: 24 },
  to = { opacity: 1, y: 0 },
  transition,
  inView = false,
  viewportMargin = "-80px",
  once = true,
}: EntranceProps) {
  const controls = useAnimation();
  const ref = React.useRef<HTMLElement>(null);
  const inViewState = useInView(ref as React.RefObject<Element>, {
    once,
    margin: viewportMargin as never,
  });
  const show = inView ? inViewState : true;

  // 保持最新值而避免重复触发 effect
  const fromRef = React.useRef(from);
  fromRef.current = from;
  const toRef = React.useRef(to);
  toRef.current = to;
  const transitionRef = React.useRef(transition);
  transitionRef.current = transition;

  React.useEffect(() => {
    if (!show) return;
    controls.set({ ...fromRef.current });
    controls.start({ ...toRef.current, transition: transitionRef.current });
  }, [show, controls]);

  // 缓存组件类型：motion.create 每次调用返回新组件，导致父级重渲染时
  // React 判定元素类型变化而卸载重建整棵子树（登录/注册输入框因此每敲一字就失焦）
  const MotionComp = React.useMemo(
    () => motion.create(as as never) as React.ElementType,
    [as],
  );

  return (
    <MotionComp
      ref={ref}
      className={className}
      style={style}
      initial={false}
      animate={controls}
    >
      {children}
    </MotionComp>
  );
}




