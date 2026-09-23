import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MOTION } from '../motion/tokens';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/** 滚动进场容器：进入视口时淡入上移，只播放一次。尊重 prefers-reduced-motion。 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '-60px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(24px)',
        transition: `opacity ${MOTION.duration.reveal}ms ${MOTION.ease.cssOut} ${delay}s, transform ${MOTION.duration.reveal}ms ${MOTION.ease.cssOut} ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
