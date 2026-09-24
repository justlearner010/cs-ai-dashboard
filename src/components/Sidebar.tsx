import { motion } from 'framer-motion';
import { SIDEBAR_ITEMS } from '../data/navItems';
import { useActiveSection } from '../hooks/useActiveSection';
import { MOTION } from '../motion/tokens';
import { GlassSurface } from './glass/GlassSurface';

function ProgressRing({ pct }: { pct: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <div className="px-3 pb-2 flex items-center gap-3">
      <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0 -rotate-90" aria-hidden>
        <circle
          cx="20" cy="20" r={r} fill="none" strokeWidth="4"
          className="stroke-slate-200 dark:stroke-slate-700"
        />
        <motion.circle
          cx="20" cy="20" r={r} fill="none" strokeWidth="4" strokeLinecap="round"
          className="stroke-brand-500"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct / 100) }}
          transition={{ duration: MOTION.duration.draw / 1000, ease: MOTION.ease.out }}
        />
      </svg>
      <div className="min-w-0">
        <p className="label-muted">总进度</p>
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">{pct}%</p>
      </div>
    </div>
  );
}

export function Sidebar({ progressPct }: { progressPct: number }) {
  const { activeId, jumpTo } = useActiveSection();

  return (
    <aside className="hidden lg:block w-52 shrink-0">
      <GlassSurface
        role="navigation"
        className="card sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1 py-2"
      >
        <ProgressRing pct={progressPct} />
        <p className="px-3 pb-2 label-muted">页面导航</p>
        <ul className="space-y-1">
          {SIDEBAR_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activeId === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => jumpTo(item.id)}
                  aria-current={active ? 'true' : undefined}
                  className={`relative w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left
                    ${active
                      ? 'text-brand-700 font-medium dark:text-brand-300'
                      : 'text-slate-600 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-slate-800/60'
                    }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active-sidebar"
                      transition={MOTION.spring.nav}
                      className="absolute inset-0 rounded-lg bg-brand-50 dark:bg-brand-900/40 -z-10"
                    />
                  )}
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-brand-600 dark:text-brand-300' : 'text-slate-400 dark:text-slate-500'}`} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </GlassSurface>
    </aside>
  );
}
