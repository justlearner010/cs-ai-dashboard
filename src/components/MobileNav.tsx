import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SIDEBAR_ITEMS } from '../data/navItems';
import { useActiveSection } from '../hooks/useActiveSection';
import { MOTION } from '../motion/tokens';
import { smoothScrollTo } from '../utils/helpers';

/**
 * 移动端底部芯片导航（< lg 显示）。
 * 横向滑动查看全部 section，当前项自动滚入视野。
 */
export function MobileNav() {
  const { activeId, jumpTo } = useActiveSection();
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const el = activeRef.current;
    if (el) smoothScrollTo(el, { inline: 'center', block: 'nearest' });
  }, [activeId]);

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30
                 glass-strong border-x-0 border-b-0
                 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex gap-2 overflow-x-auto px-3 py-2 no-scrollbar">
        {SIDEBAR_ITEMS.map(item => {
          const Icon = item.icon;
          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              ref={active ? activeRef : undefined}
              onClick={() => jumpTo(item.id)}
              aria-current={active ? 'true' : undefined}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                active
                  ? 'text-white'
                  : 'text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800/60'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active-mobile"
                  transition={MOTION.spring.nav}
                  className="absolute inset-0 rounded-full bg-brand-600 shadow-sm -z-10"
                />
              )}
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
