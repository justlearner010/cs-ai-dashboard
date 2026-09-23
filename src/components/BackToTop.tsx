import { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { smoothScrollTo } from '../utils/helpers';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > 400);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    smoothScrollTo(0);
  };

  return (
    <button
      onClick={scrollToTop}
      title="回到顶部"
      aria-label="回到顶部"
      tabIndex={visible ? 0 : -1}
      className={`btn btn--solid p-3 rounded-full fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40
                 shadow-lg shadow-brand-200/50 dark:shadow-black/40
                 ${visible ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-3'}`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
