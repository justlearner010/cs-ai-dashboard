import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { Glass, type GlassProps } from "@samasante/liquid-glass";

/** false = 浅色；App 用 GlassThemeProvider 注入 useDarkMode 的值 */
const GlassThemeContext = createContext(false);

export function GlassThemeProvider({ value, children }: { value: boolean; children: ReactNode }) {
  return <GlassThemeContext.Provider value={value}>{children}</GlassThemeContext.Provider>;
}

/**
 * 浅色底近乎纯白，折射无信号：提折射强度/色散、降磨砂让极光透上来；
 * 暗色沿用 v2 校准（frost 12 / saturate 1.7），折射参数走库默认。
 */
const OPTICS_BY_THEME = {
  light: { frost: 10, saturate: 1.7, strength: 0.075, dispersion: 0.45 },
  dark: { frost: 12, saturate: 1.7 },
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
