import type { CSSProperties } from "react";
import { Glass, type GlassProps } from "@samasante/liquid-glass";

/** 磨砂/饱和沿用 v2 校准值；折射参数（色散、边缘弯曲、厚度光）全走库默认 */
const SURFACE_OPTICS = {
  frost: 12,
  saturate: 1.7,
} satisfies NonNullable<GlassProps["optics"]>;

type GlassSurfaceProps = GlassProps & {
  /** 默认块级铺满；flex 卡片显式传 "flex"（inline style 会压过 Tailwind 的 display 类） */
  display?: CSSProperties["display"];
};

export function GlassSurface({ display = "block", optics, style, ...rest }: GlassSurfaceProps) {
  return (
    <Glass
      optics={{ ...SURFACE_OPTICS, ...optics }}
      style={{ display, ...style }}
      {...rest}
    />
  );
}
