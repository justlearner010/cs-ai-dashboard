import { useEffect, useRef } from 'react';
import { SIDEBAR_ITEMS } from '../data/navItems';
import { useActiveSection } from '../hooks/useActiveSection';

/**
 * 移动端底部芯片导航（< lg 显示）。
 * 横向滑动查看全部 section，当前项自动滚入视野。
 */
export function MobileNav() {
  const { activeId, jumpTo } = useActiveSection();
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeId]);

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30
                 bg-white/90 dark:bg-slate-900/90 backdrop-blur
                 border-t border-slate-200 dark:border-slate-800
                 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex gap-1.5 overflow-x-auto px-3 py-2 no-scrollbar">
        {SIDEBAR_ITEMS.map(item => {
          const Icon = item.icon;
          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              ref={active ? activeRef : undefined}
              onClick={() => jumpTo(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                active
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
