import { useState, useEffect, useCallback, useRef } from 'react';
import { SECTION_IDS } from '../data/navItems';
import { smoothScrollTo } from '../utils/helpers';

/**
 * 滚动监听（scroll-spy）+ hash 同步。
 * - 滚动时高亮当前 section，并把 location.hash 用 replaceState 同步（不污染历史）
 * - 首次加载时若 URL 带 #section-xxx 直接定位过去
 * - jumpTo 平滑滚动到目标 section
 */
export function useActiveSection(offset = 120) {
  const [activeId, setActiveId] = useState(SECTION_IDS[0]);
  const activeRef = useRef(activeId);

  // 首次渲染时捕获 URL hash（不能在 effect 里读）：
  // Sidebar 与 MobileNav 各有一个本 hook 实例，同一轮 effects 里前者会先
  // replaceState 写入 #section-xxx，后者再读 location.hash 就会把自家写入的
  // hash 误判为用户直达意图，首屏自动滚过 hero。
  const initialHashRef = useRef<string | null>(null);
  if (initialHashRef.current === null) {
    initialHashRef.current = decodeURIComponent(location.hash.slice(1));
  }

  useEffect(() => {
    let raf = 0;
    const handleScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let current = SECTION_IDS[0];
        for (const id of SECTION_IDS) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= offset) {
            current = id;
          }
        }
        if (current !== activeRef.current) {
          activeRef.current = current;
          setActiveId(current);
        }
      });
    };

    // 首次加载：URL hash 直达（仅初始 hash，排除 effect 阶段写入的）
    const hashId = initialHashRef.current;
    if (hashId && SECTION_IDS.includes(hashId)) {
      document.getElementById(hashId)?.scrollIntoView({ block: 'start' });
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [offset]);

  // hash 同步（replaceState 不产生浏览器历史记录）
  useEffect(() => {
    const hash = `#${activeId}`;
    if (location.hash !== hash && history.replaceState) {
      history.replaceState(null, '', hash);
    }
  }, [activeId]);

  const jumpTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    smoothScrollTo(el, { block: 'start' });
    activeRef.current = id;
    setActiveId(id);
  }, []);

  return { activeId, jumpTo };
}
