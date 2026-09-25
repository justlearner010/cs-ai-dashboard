import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { Glass, type GlassProps } from "@samasante/liquid-glass";

/** false = 浅色；App 用 GlassThemeProvider 注入 useDarkMode 的值 */
const GlassThemeContext = createContext(false);

export function GlassThemeProvider({ value, children }: { value: boolean; children: ReactNode }) {
  return <GlassThemeContext.Provider value={value}>{children}</GlassThemeContext.Provider>;
}

/**
 * iOS 26 质感预设（rim 优先：厚唇缘 + 镜面带 + 色散，中心保持平静）。
 * 浅色底近纯白，折射无信号：提折射强度/色散、降磨砂让极光透上来；
 * 暗色沿用 v2 校准的 frost/saturate，其余与浅色同构（specular 略高，暗色镜面更抓眼）。
 * 库 material 模式自带 bend 0.45 / sheen 0.32 / specular 1 底子，这里是往 Apple 观感再推一档。
 */
const IOS26_COMMON = {
  bend: 0.6,
  bendWidth: 0.14,
  sheen: 0.55,
  sheenWidth: 5,
  sheenAngle: 45,
  glow: 0.15,
} satisfies NonNullable<GlassProps["optics"]>;

const OPTICS_BY_THEME = {
  light: {
    ...IOS26_COMMON,
    frost: 10,
    saturate: 1.7,
    strength: 0.085,
    dispersion: 0.55,
    specular: 1.4,
  },
  dark: {
    ...IOS26_COMMON,
    frost: 12,
    saturate: 1.7,
    strength: 0.08,
    dispersion: 0.5,
    specular: 1.45,
    glow: 0.16,
  },
} satisfies Record<string, NonNullable<GlassProps["optics"]>>;

type GlassSurfaceProps = GlassProps & {
  /** 默认块级铺满；flex 卡片显式传 "flex"（inline style 会压过 Tailwind 的 display 类） */
  display?: CSSProperties["display"];
};

export function GlassSurface({ display = "block", optics, style, ...rest }: GlassSurfaceProps) {
  const isDark = useContext(GlassThemeContext);
  return (
    <Glass
      optics={{ ...OPTICS_BY_THEME[isDark ? "dark" : "light"], ...optics }}
      style={{ display, ...style }}
      {...rest}
    />
  );
}
