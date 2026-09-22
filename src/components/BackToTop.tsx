import { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      title="回到顶部"
      aria-label="回到顶部"
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 p-3 rounded-full
                 bg-brand-600 text-white shadow-lg shadow-brand-200/50
                 hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all
                 duration-300 ease-out dark:shadow-black/40
                 ${visible ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-3'}`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
