/**
 * 全站动效唯一真源（T1 token）。
 *
 * - JS 侧（framer-motion / hooks / 内联 style）直接 import 本模块；
 * - CSS 侧由 applyMotionCssVars() 把同一批值写入 :root 的 --motion-* 变量，
 *   tailwind 的 transition DEFAULT 与 index.css 的兜底值消费这些变量。
 *
 * 修改这里的数值即可观察到全站微交互节奏变化。
 * 零新依赖；prefers-reduced-motion 由 MotionConfig + index.css 全局覆盖处理。
 */
import type { CSSProperties } from 'react';

export const MOTION = {
  duration: {
    /** 微交互：悬停 / 按压 */
    fast: 150,
    /** 默认过渡（spec：约 200ms ease-out） */
    base: 200,
    /** 面板 / 数字滚动 */
    slow: 300,
    /** 区块进场 */
    reveal: 450,
    /** 庆祝演出时长 */
    celebrate: 2600,
    /** count-up 数字补间 */
    countUp: 300,
    /** SVG 路径绘制 / 进度条强调 */
    draw: 600,
    /** 粒子迸发退场 */
    burst: 650,
  },
  ease: {
    /** 标准 ease-out cubic-bezier(0, 0, 0.2, 1)；framer 用四元组 */
    out: [0, 0, 0.2, 1] as [number, number, number, number],
    cssOut: 'cubic-bezier(0, 0, 0.2, 1)',
  },
  spring: {
    /** 庆祝 / 签名时刻的弹簧曲线 */
    celebrate: { type: 'spring' as const, stiffness: 260, damping: 18 },
    /** 导航活动指示器（layoutId）的弹簧曲线 */
    nav: { type: 'spring' as const, stiffness: 380, damping: 32 },
  },
  stagger: {
    /** 错峰进场步长（ms / item） */
    step: 80,
  },
} as const;

/** 把 token 写入 CSS 变量；main.tsx 启动时调用一次 */
export function applyMotionCssVars(root: HTMLElement = document.documentElement): void {
  root.style.setProperty('--motion-fast', `${MOTION.duration.fast}ms`);
  root.style.setProperty('--motion-base', `${MOTION.duration.base}ms`);
  root.style.setProperty('--motion-slow', `${MOTION.duration.slow}ms`);
  root.style.setProperty('--motion-reveal', `${MOTION.duration.reveal}ms`);
  root.style.setProperty('--motion-ease', MOTION.ease.cssOut);
}

/**
 * 错峰进场原语：按 index 生成 animation 内联样式，
 * 配合 index.css 的 stagger-enter keyframes（尊重全局 reduced-motion 覆盖）。
 */
export function staggerStyle(index: number): CSSProperties {
  return {
    animation: `stagger-enter ${MOTION.duration.slow}ms ${MOTION.ease.cssOut} both`,
    animationDelay: `${index * MOTION.stagger.step}ms`,
  };
}
