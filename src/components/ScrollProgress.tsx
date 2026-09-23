import { useEffect, useState } from 'react';

/** 顶部阅读进度条（1px 渐变，随页面滚动伸展） */
export function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setPct(max > 0 ? Math.min(100, (doc.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 h-1 z-40
                 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600
                 transition-[width]"
      style={{ width: `${pct}%` }}
    />
  );
}
