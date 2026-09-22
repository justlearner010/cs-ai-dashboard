import { Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * It's MyGO 主题背景层
 * - 多层柔和径向渐变光斑
 * - 浮动星星 / 音符（极低透明度，pointer-events-none）
 * - Logo 与角色图作为可选装饰
 *
 * 注：Logo 与角色图为官方素材，请确保仅限个人学习使用，
 *     并尊重原作者（动画 It's MyGO!!!!! / 芳文社 / Bushiroad）版权。
 *     图片需放入 public/ 目录：mygo-logo.png 与 mygo-characters.png。
 */
export function ThemeBackground() {
  // 装饰符号：星星 / 音符（极低透明度，不抢戏）
  const floaters = [
    { char: '★', style: 'top-[8%] left-[6%] text-3xl', opacity: 0.09 },
    { char: '♪', style: 'top-[14%] right-[8%] text-2xl', opacity: 0.08 },
    { char: '✦', style: 'top-[32%] left-[3%] text-xl', opacity: 0.07 },
    { char: '♫', style: 'top-[48%] right-[4%] text-3xl', opacity: 0.06 },
    { char: '★', style: 'bottom-[12%] left-[8%] text-2xl', opacity: 0.07 },
    { char: '♪', style: 'bottom-[18%] right-[10%] text-xl', opacity: 0.08 },
    { char: '✦', style: 'bottom-[8%] left-[40%] text-2xl', opacity: 0.06 },
  ];

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden
                 bg-gradient-to-br from-white via-[#fdf5fa] to-[#fbeaf6]
                 dark:bg-none dark:bg-[#0e0815]"
    >
      {/* 亮色光斑（alpha 大幅降低） */}
      <div className="absolute inset-0 dark:hidden">
        <div
          className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(232,139,204,0.18), transparent 65%)' }}
        />
        <div
          className="absolute top-1/4 -right-40 w-[480px] h-[480px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(244,182,228,0.2), transparent 65%)' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(216,180,234,0.16), transparent 70%)' }}
        />
        <div
          className="absolute top-2/3 right-1/4 w-[420px] h-[420px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(247,211,238,0.25), transparent 70%)' }}
        />
      </div>

      {/* 暗色光斑 */}
      <div className="absolute inset-0 hidden dark:block">
        <div
          className="absolute -top-40 -left-32 w-[560px] h-[560px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(168,71,141,0.18), transparent 60%)' }}
        />
        <div
          className="absolute top-1/4 -right-40 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(192,83,164,0.16), transparent 60%)' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[620px] h-[620px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139,108,176,0.14), transparent 65%)' }}
        />
      </div>

      {/* 浮动符号 */}
      {floaters.map((f, i) => (
        <span
          key={i}
          aria-hidden
          className={`absolute select-none font-serif animate-float-slow ${f.style}`}
          style={{ opacity: f.opacity, color: '#a8558a', animationDelay: `${i * 0.9}s` }}
        >
          {f.char}
        </span>
      ))}

      {/* 顶部柔光线条（更弱） */}
      <div
        className="absolute top-0 left-0 right-0 h-px
                   bg-gradient-to-r from-transparent via-brand-300/20 to-transparent
                   dark:via-brand-700/20"
      />

      {/* 乐队 Logo 水印 — 右下角，低透明度装饰（更弱） */}
      <img
        src={`${import.meta.env.BASE_URL}MyGO!!!!!_logo.png`}
        alt=""
        className="absolute bottom-6 right-6 w-24 sm:w-32 opacity-[0.12]
                   mix-blend-multiply dark:mix-blend-screen pointer-events-none select-none"
        loading="lazy"
        draggable={false}
        onError={e => (e.currentTarget.style.display = 'none')}
      />
    </div>
  );
}

/**
 * 仪表盘顶部角色横幅（在 StatsCards 之上）。
 * 加载失败时自动隐藏，不破坏布局。
 * 宽度与下方内容对齐（与 max-w-7xl 容器同宽），按原图比例完整显示5 个角色，不拉伸。
 */
export function MyGoHero() {
  const reduce = useReducedMotion();
  return (
    <div className="relative rounded-xl overflow-hidden border border-brand-200/50
                    bg-gradient-to-r from-brand-50/70 via-white/70 to-brand-50/70
                    dark:from-brand-900/20 dark:via-slate-900/50 dark:to-brand-900/20
                    dark:border-brand-800/50">
      <motion.img
        src={`${import.meta.env.BASE_URL}MyGO!!!!!_10th_anniversary_kv_banner_v2.webp`}
        alt="MyGO!!!!! 角色图（官方素材）"
        className="w-full h-auto block object-contain bg-slate-50 dark:bg-slate-900 opacity-95"
        loading="eager"
        draggable={false}
        onError={e => (e.currentTarget.parentElement!.style.display = 'none')}
        animate={reduce ? undefined : { scale: [1, 1.035, 1] }}
        transition={
          reduce
            ? undefined
            : { duration: 16, ease: 'easeInOut', repeat: Infinity }
        }
      />
      {/* 光泽扫过（reduced-motion 时不渲染） */}
      {!reduce && (
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="hero-shimmer absolute inset-y-0 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </div>
      )}
      {/* 底部渐变 fade-out，让横幅与下方内容平滑过渡 */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#fdf5fa] dark:from-[#0e0815] to-transparent pointer-events-none" />
    </div>
  );
}

export function ThemeSparkle({ className = '' }: { className?: string }) {
  return <Sparkles className={`text-brand-500 dark:text-brand-400 ${className}`} aria-hidden />;
}