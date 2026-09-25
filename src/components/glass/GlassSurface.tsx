import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  LiquidGlass,
  detectCapabilities,
  registerProfile,
  type GlassParams,
} from "@taha_kadhim/liquid-glass";
import {
  paintPanel,
  registerPanel,
  scheduleRepaint,
  setAuroraTheme,
  textureDpr,
} from "./auroraTexture";

/** false = 浅色；App 用 GlassThemeProvider 注入 useDarkMode 的值 */
const GlassThemeContext = createContext(false);

export function GlassThemeProvider({ value, children }: { value: boolean; children: ReactNode }) {
  return <GlassThemeContext.Provider value={value}>{children}</GlassThemeContext.Provider>;
}

/**
 * iOS 26 质感预设（W2 shader：唇缘 lip + 超椭圆角 + 薄镜面线，中心平）。
 * - surface 0.5 = kube.io 的 lip 剖面（隆起边缘 + 浅碟中心）；bevelPower 4 = squircle；
 *   splay 压低让面中保持平静，弯折集中在 bevel 环带。
 * - 浅色底近纯白：靠 saturation + 极光纹理（auroraTexture 供色）+ 微白 tint 出信号；
 *   暗色更磨砂、镜面更抓眼（v2/v3 一贯的校准方向）。
 * - motion 0：13 张卡不做 idle 微摆（必须写进 profile——setProfile 整包覆盖实例级 override）。
 */
const IOS26_COMMON = {
  bevel: 20,
  bevelPower: 4,
  surface: 0.5,
  splay: 0.1,
  ior: 1.45,
  dispersion: 0.016,
  thickness: 30,
  tint: 0.04,
  specular: 1.4,
  light: [-0.4, -0.9],
  lightIntensity: 1.1,
  lightRadius: 0.35,
  lightAmbient: 0.14,
  lightWrap: 0.35,
  cornerLight: 1.3,
  rimWidth: 0.6,
  edgeLine: 0.5,
  edgeWidth: 1.5,
  /** 13 张卡不做 idle 微摆；setProfile 会整包覆盖实例级 override，必须写进 profile */
  motion: 0,
} satisfies Partial<GlassParams>;

const OPTICS_BY_THEME = {
  light: { ...IOS26_COMMON, frost: 0.24, saturation: 1.6, tint: 0.05 },
  dark: {
    ...IOS26_COMMON,
    frost: 0.28,
    saturation: 1.5,
    tint: 0.03,
    specular: 1.55,
    lightAmbient: 0.1,
    edgeLine: 0.6,
  },
} satisfies Record<string, Partial<GlassParams>>;

registerProfile("ios26-light", OPTICS_BY_THEME.light);
registerProfile("ios26-dark", OPTICS_BY_THEME.dark);

/**
 * 纹理走 WebGL 的门槛：Chromium 家族 + WebGL2。
 * 每面板一个 GL context（实测 Chrome 上限 16），13 个卡面已贴上限；
 * Safari/Firefox context 预算更紧或不吃这套，退回库自带的 live svg/blur tier
 * （与 chrome 面同路，采样真实页面，永远正确）。
 */
const CAPS = detectCapabilities();
const TEXTURE_WEBGL =
  CAPS.webgl2 && /Chrome|Chromium|Edg|OPR/i.test(typeof navigator !== "undefined" ? navigator.userAgent : "");

/**
 * 库的 measure() 只把 CSS 圆角写进 params，不回写渲染目标（renderer 起手用
 * BASE radius 110）；setProfile 也会把 radius 重置回基线。两个时机都要主动 set 一次。
 * set() 同时让 svg/blur tier 重建滤镜，WebGL 下一帧生效。
 */
function syncRadius(lg: LiquidGlass, host: HTMLElement) {
  const r = parseFloat(getComputedStyle(host).borderTopLeftRadius);
  if (Number.isFinite(r) && r > 0) lg.set("radius", r);
}

type GlassSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  /** 显式行内 display（Tailwind 类冲突时的逃生口，仅在传入时写行内样式） */
  display?: CSSProperties["display"];
};

export function GlassSurface({ display, className = "", style, ...rest }: GlassSurfaceProps) {
  const isDark = useContext(GlassThemeContext);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const lgRef = useRef<LiquidGlass | null>(null);
  /** .card 面 → 供极光纹理走 WebGL；.glass-strong chrome → 不供纹理，落 live tier */
  const textured = /\bcard\b/.test(className);
  const profileName = isDark ? "ios26-dark" : "ios26-light";
  const appliedProfile = useRef<string | null>(null);
  // WebGL 卡面交给 shader 的 interactive 光追踪指针；CSS ::after 追光要让位（见 index.css）
  const shaderLit = textured && TEXTURE_WEBGL;
  const cls = shaderLit ? `${className} glass-shader-light`.trim() : className;

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const withTexture = shaderLit;

    let canvas: HTMLCanvasElement | null = null;
    let update: (() => void) | null = null;
    if (withTexture) {
      canvas = document.createElement("canvas");
      // 探针/调试钩子：纹理画布不在 DOM 里（库的 GL 画布才是），验收要能摸到它
      (host as HTMLElement & { __auroraCanvas?: HTMLCanvasElement }).__auroraCanvas = canvas;
      update = () => {
        const r = host.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) return;
        const dpr = textureDpr();
        const w = Math.round(r.width * dpr);
        const h = Math.round(r.height * dpr);
        if (canvas!.width !== w) canvas!.width = w;
        if (canvas!.height !== h) canvas!.height = h;
        paintPanel(canvas!, r.left, r.top);
        // 探针钩子：记录重裁次数，验收断言滚动编排真的跑了
        (canvas as HTMLCanvasElement & { __repaint?: number }).__repaint =
          ((canvas as HTMLCanvasElement & { __repaint?: number }).__repaint ?? 0) + 1;
        lgRef.current?.setBackdrop(canvas!);
      };
      update();
    }

    const lg = new LiquidGlass(host, {
      profile: profileName,
      backdrop: canvas,
      interactive: withTexture,
    });
    lgRef.current = lg;
    appliedProfile.current = profileName;
    syncRadius(lg, host);
    // GL 画布（.lg-layer，absolute）默认绘制序盖过普通流内容——内容必须在玻璃之上：
    // 宿主自建层叠上下文，把 layer 压到 z-index:-1（背景之上、内容之下）
    host.style.isolation = "isolate";
    const layer = host.querySelector(".lg-layer");
    if (layer instanceof HTMLElement) layer.style.zIndex = "-1";

    const unregister = update ? registerPanel(host, update) : null;
    return () => {
      unregister?.();
      lg.destroy();
      lgRef.current = null;
      appliedProfile.current = null;
      host.style.isolation = "";
      delete (host as HTMLElement & { __auroraCanvas?: HTMLCanvasElement }).__auroraCanvas;
    };
    // 挂载一次；主题切换走下面的 effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    setAuroraTheme(isDark ? "dark" : "light");
    const lg = lgRef.current;
    if (lg && appliedProfile.current !== profileName) {
      appliedProfile.current = profileName;
      lg.setProfile(profileName);
      syncRadius(lg, hostRef.current!);
    }
    scheduleRepaint();
  }, [isDark, profileName]);

  const styleProp: CSSProperties | undefined = display !== undefined ? { display, ...style } : style;
  return <div ref={hostRef} className={cls} style={styleProp} {...rest} />;
}
