/**
 * 环境背景层（玻璃的折射基底）
 * - 中性冷灰基底 + 多层柔和径向极光光斑（静态，只栅格化一次）
 * - 无漂移/浮动装饰：背景是舞台，不是演员
 *
 * 注：Logo 与角色图为官方素材，请确保仅限个人学习使用，
 *     并尊重原作者（动画 It's MyGO!!!!! / 芳文社 / Bushiroad）版权。
 */
import { GlassSurface } from './glass/GlassSurface';

export function ThemeBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden
                 bg-gradient-to-br from-white via-[#f5f6f8] to-[#f5f6f8]
                 dark:bg-none dark:bg-[#0e1016]"
    >
      {/* 亮色极光光斑（玻璃折射的色彩依据）——浅色折射全靠它出信号，alpha 拉满、补冷色斑供色散 */}
      <div className="absolute inset-0 dark:hidden">
        <div
          className="absolute -top-32 -left-32 w-[572px] h-[572px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(232,139,204,0.36), transparent 65%)' }}
        />
        <div
          className="absolute top-1/4 -right-40 w-[528px] h-[528px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(244,182,228,0.38), transparent 65%)' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[660px] h-[660px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(216,180,234,0.34), transparent 70%)' }}
        />
        <div
          className="absolute top-2/3 right-1/4 w-[462px] h-[462px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(247,211,238,0.44), transparent 70%)' }}
        />
        <div
          className="absolute top-[38%] -left-24 w-[480px] h-[480px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(147,197,253,0.3), transparent 65%)' }}
        />
      </div>

      {/* 暗色光斑 */}
      <div className="absolute inset-0 hidden dark:block">
        <div
          className="absolute -top-40 -left-32 w-[560px] h-[560px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(168,71,141,0.2), transparent 60%)' }}
        />
        <div
          className="absolute top-1/4 -right-40 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(192,83,164,0.18), transparent 60%)' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[620px] h-[620px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139,108,176,0.16), transparent 65%)' }}
        />
      </div>
    </div>
  );
}

/**
 * 仪表盘顶部角色横幅（在 StatsCards 之上）。
 * 玻璃画框静置呈现——全站唯一的表现性图像，图自己不动。
 * 加载失败时自动隐藏，不破坏布局。
 */
export function MyGoHero() {
  return (
    <GlassSurface className="card relative overflow-hidden p-2">
      <img
        src={`${import.meta.env.BASE_URL}MyGO!!!!!_10th_anniversary_kv_banner_v2.webp`}
        alt="MyGO!!!!! 角色图（官方素材）"
        width={1600}
        height={700}
        className="w-full h-auto block object-contain rounded"
        loading="eager"
        draggable={false}
        onError={e => { e.currentTarget.parentElement!.style.display = 'none' }}
      />
      {/* 底部渐变 fade-out，让横幅与下方内容平滑过渡 */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#f5f6f8] dark:from-[#0e1016] to-transparent pointer-events-none" />
    </GlassSurface>
  );
}
