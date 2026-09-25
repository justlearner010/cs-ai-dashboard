/**
 * 极光纹理模块 —— 给 WebGL 玻璃面板供给 backdrop。
 *
 * 浏览器无法读取合成后的页面像素，@taha_kadhim/liquid-glass 的 WebGL tier
 * 只能消费我们显式提供的纹理；shader 的 uv 是面板局部的（纹理拉伸贴合面板），
 * 所以每个面板要拿到「自己那块视口区域」的极光像素。
 *
 * 做法：复刻 ThemeBackground 的极光（同一套渐变值 + blur-3xl ≈ ctx.filter blur(64px)）
 * 画进一张视口共享画布（仅主题/视口尺寸变化时重画）；面板更新时按自己的
 * getBoundingClientRect 视口矩形裁剪 drawImage。极光是 fixed 层不随滚动移动，
 * 但面板相对视口的位置会变，所以滚动时给可见面板重裁。
 */

export type AuroraTheme = "light" | "dark";

type Blob = {
  /** 圆心 X（视口 CSS px，随视口宽变化） */
  cx: (vw: number) => number;
  /** 圆心 Y（视口 CSS px，随视口高变化） */
  cy: (vh: number) => number;
  /** 直径 px */
  d: number;
  color: string;
  /** radial-gradient 透明终点（CSS 的 transparent 65% 等） */
  stop: number;
};

/** 与 ThemeBackground.tsx 亮色极光逐斑对应（-top-32 等 Tailwind 值换算后的几何） */
const LIGHT_BLOBS: Blob[] = [
  { cx: () => 158, cy: () => 158, d: 572, color: "rgba(232,139,204,0.36)", stop: 0.65 },
  { cx: vw => vw - 104, cy: vh => vh / 4 + 264, d: 528, color: "rgba(244,182,228,0.38)", stop: 0.65 },
  { cx: vw => vw / 3 + 330, cy: vh => vh - 330, d: 660, color: "rgba(216,180,234,0.34)", stop: 0.7 },
  { cx: vw => vw * 0.75 - 231, cy: vh => (vh * 2) / 3 + 231, d: 462, color: "rgba(247,211,238,0.44)", stop: 0.7 },
  { cx: () => 144, cy: vh => vh * 0.38 + 240, d: 480, color: "rgba(147,197,253,0.3)", stop: 0.65 },
];

/** 暗色三斑 */
const DARK_BLOBS: Blob[] = [
  { cx: () => 152, cy: () => 120, d: 560, color: "rgba(168,71,141,0.2)", stop: 0.6 },
  { cx: vw => vw - 90, cy: vh => vh / 4 + 250, d: 500, color: "rgba(192,83,164,0.18)", stop: 0.6 },
  { cx: vw => vw / 3 + 310, cy: vh => vh - 310, d: 620, color: "rgba(139,108,176,0.16)", stop: 0.65 },
];

/** 玻璃折射的基底：亮色 to-br 白→#f5f6f8 渐变；暗色纯 #0e1016（与 ThemeBackground/body 一致） */
const BODY: Record<AuroraTheme, string> = { light: "#f5f6f8", dark: "#0e1016" };

/** 与库 WebGLTarget 一致的 DPR 上限 */
export function textureDpr(): number {
  return Math.min(window.devicePixelRatio || 1, 2);
}

/* ——— 视口共享画布 ——— */
let shared: HTMLCanvasElement | null = null;
let sharedKey = "";

function paintViewport(target: HTMLCanvasElement, theme: AuroraTheme, vw: number, vh: number, dpr: number) {
  target.width = Math.max(1, Math.round(vw * dpr));
  target.height = Math.max(1, Math.round(vh * dpr));
  const ctx = target.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (theme === "light") {
    const g = ctx.createLinearGradient(0, 0, vw, vh);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.5, "#f5f6f8");
    g.addColorStop(1, "#f5f6f8");
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = BODY.dark;
  }
  ctx.fillRect(0, 0, vw, vh);

  const blobs = theme === "light" ? LIGHT_BLOBS : DARK_BLOBS;
  ctx.save();
  // blur-3xl = blur(64px)
  ctx.filter = "blur(64px)";
  for (const b of blobs) {
    const r = b.d / 2;
    const x = b.cx(vw);
    const y = b.cy(vh);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, b.color);
    g.addColorStop(b.stop, b.color.replace(/[\d.]+\)$/, "0)"));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, b.d, b.d);
  }
  ctx.restore();
}

function sharedViewport(theme: AuroraTheme, vw: number, vh: number, dpr: number): HTMLCanvasElement {
  const key = `${theme}|${vw}x${vh}@${dpr}`;
  if (!shared || sharedKey !== key) {
    if (!shared) shared = document.createElement("canvas");
    paintViewport(shared, theme, vw, vh, dpr);
    sharedKey = key;
  }
  return shared;
}

/* ——— 面板注册与滚动编排 ——— */
type Panel = { host: HTMLElement; update: () => void };
const panels = new Set<Panel>();
let rafId = 0;
let theme: AuroraTheme = "light";
let listening = false;

function viewportVisible(host: HTMLElement): boolean {
  const r = host.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
}

function pump() {
  rafId = 0;
  for (const p of panels) {
    if (viewportVisible(p.host)) p.update();
  }
}

/** 合帧调度一轮可见面板重绘（滚动/resize/主题变化均走这里） */
export function scheduleRepaint() {
  if (rafId || typeof requestAnimationFrame === "undefined") return;
  rafId = requestAnimationFrame(pump);
}

function ensureListeners() {
  if (listening) return;
  listening = true;
  addEventListener("scroll", scheduleRepaint, { passive: true, capture: true });
  addEventListener("resize", scheduleRepaint, { passive: true });
}

/** 注册一个纹理面板；返回注销函数 */
export function registerPanel(host: HTMLElement, update: () => void): () => void {
  const panel: Panel = { host, update };
  panels.add(panel);
  ensureListeners();
  return () => {
    panels.delete(panel);
    if (!panels.size) {
      removeEventListener("scroll", scheduleRepaint, true);
      removeEventListener("resize", scheduleRepaint);
      listening = false;
    }
  };
}

/** 切换极光主题；变化时合帧重绘全部可见面板 */
export function setAuroraTheme(next: AuroraTheme) {
  if (next === theme) return;
  theme = next;
  scheduleRepaint();
}

export function getAuroraTheme(): AuroraTheme {
  return theme;
}

/**
 * 把当前主题的极光按「视口锚定」画进面板画布：
 * origin = 面板矩形左上角（视口 CSS px），面板超出视口的部分用页面基底色填充
 * （那部分本就不可见，滚动进入视口时会由编排器重裁）。
 * 调用前画布尺寸应已按 textureDpr() 设为面板尺寸。
 */
export function paintPanel(canvas: HTMLCanvasElement, originX: number, originY: number): void {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const dpr = textureDpr();
  const src = sharedViewport(theme, vw, vh, dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.filter = "none";
  ctx.fillStyle = BODY[theme];
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 面板与视口的交集（视口坐标）
  const ix0 = Math.max(0, originX);
  const iy0 = Math.max(0, originY);
  const ix1 = Math.min(vw, originX + canvas.width / dpr);
  const iy1 = Math.min(vh, originY + canvas.height / dpr);
  if (ix1 <= ix0 || iy1 <= iy0) return;

  ctx.drawImage(
    src,
    ix0 * dpr, iy0 * dpr, (ix1 - ix0) * dpr, (iy1 - iy0) * dpr,
    (ix0 - originX) * dpr, (iy0 - originY) * dpr, (ix1 - ix0) * dpr, (iy1 - iy0) * dpr,
  );
}
