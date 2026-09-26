/**
 * 环境背景层（玻璃的折射基底）
 * - 淡彩基底渐变 + 多层柔和径向极光光斑（静态，只栅格化一次）——玻璃折射的色彩依据
 * - 乐队 Logo 主图居中铺底：背景主视觉，加载失败自动隐藏（色场独立成立）
 * - 无漂移/浮动装饰：背景是舞台，不是演员
 *
 * 注：Logo 与角色图为官方素材，请确保仅限个人学习使用，
 *     并尊重原作者（动画 It's MyGO!!!!! / 芳文社 / Bushiroad）版权。
 */
export function ThemeBackground() {
  return (
    /* 基底淡彩渐变：粉→紫→蓝的全视口保底色（光斑之间的死区也透得出颜色），
       光斑在其上做振幅峰——玻璃透出的颜色 = 保底 + 峰值 */
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden
                 bg-gradient-to-br from-[#fdeef6] via-[#f3f0fc] to-[#e7f2fd]
                 dark:bg-none dark:bg-[#0e1016]"
    >
      {/* 亮色极光光斑（玻璃折射的色彩依据）——色场要够振幅，磨砂才透得出颜色 */}
      <div className="absolute inset-0 dark:hidden">
        <div
          className="absolute -top-32 -left-32 w-[572px] h-[572px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(232,139,204,0.5), transparent 65%)' }}
        />
        <div
          className="absolute top-1/4 -right-40 w-[528px] h-[528px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(244,182,228,0.52), transparent 65%)' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[660px] h-[660px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(216,180,234,0.48), transparent 70%)' }}
        />
        <div
          className="absolute top-2/3 right-1/4 w-[462px] h-[462px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(247,211,238,0.58), transparent 70%)' }}
        />
        {/* 冷蓝斑：给左上象限一个冷暖对比，磨砂里能看出色相变化 */}
        <div
          className="absolute top-1/3 left-1/4 w-[560px] h-[560px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(147,197,253,0.46), transparent 65%)' }}
        />
      </div>

      {/* 暗色光斑 */}
      <div className="absolute inset-0 hidden dark:block">
        <div
          className="absolute -top-40 -left-32 w-[560px] h-[560px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(168,71,141,0.3), transparent 60%)' }}
        />
        <div
          className="absolute top-1/4 -right-40 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(192,83,164,0.28), transparent 60%)' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[620px] h-[620px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139,108,176,0.26), transparent 65%)' }}
        />
        {/* 靛蓝斑：右下冷色平衡品红 */}
        <div
          className="absolute top-2/3 right-1/3 w-[540px] h-[540px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.2), transparent 65%)' }}
        />
      </div>

      {/* Logo 主图背景：色场之上居中铺开——玻璃卡透出的不只是淡彩，还有这块主视觉。
          静态无动画（舞台不做表演）；加载失败即隐藏，色场独立成立 */}
      <img
        src={`${import.meta.env.BASE_URL}MyGO!!!!!_logo.png`}
        alt=""
        aria-hidden
        width={980}
        height={480}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   w-[min(92vw,980px)] h-auto select-none
                   opacity-90 dark:opacity-75"
        draggable={false}
        onError={e => { e.currentTarget.style.display = 'none' }}
      />
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
    <div className="card relative overflow-hidden p-2">
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
    </div>
  );
}
