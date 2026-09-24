// 折射滤镜：feImage 位移图 + 单层 feDisplacementMap（思路源自 rdev/liquid-glass-react, MIT）。
// 原库的 EDGE_MASK 是死码（feFuncA 作用在恒 1 alpha 上）；修正后曾接入三通道色散与
// 双半径 variable blur，但 Chrome 实测 feBlend screen 拼通道、feComposite arithmetic k1
// 乘积、multiply+sum 混合三条路均系统性压暗亮色 / 放大发白暗色（分段像素探针逐层定位），
// 故只保留单层位移——纯像素搬运，亮暗两态均不改亮度。磨砂由 ::before 的 backdrop-filter 承担。
import { displacementMap } from "./displacementMap";

const DISPLACEMENT_SCALE = 40;

export function GlassDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <filter
          id="glass-warp"
          x="-8%"
          y="-8%"
          width="116%"
          height="116%"
          colorInterpolationFilters="sRGB"
        >
          {/* none 拉伸：位移环贴合任意宽高比（slice 会在长条卡片上裁掉上下边缘带） */}
          <feImage
            href={displacementMap}
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            result="MAP"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="MAP"
            scale={-DISPLACEMENT_SCALE}
            xChannelSelector="R"
            yChannelSelector="B"
          />
        </filter>
      </defs>
    </svg>
  );
}
