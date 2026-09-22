import { useState, useEffect, useRef } from 'react';

export function useAnimatedNumber(
  target: number,
  options: { duration?: number; decimals?: number } = {}
): number {
  const { duration = 600, decimals = 0 } = options;
  const [value, setValue] = useState(target);
  const startRef = useRef({ from: target, to: target, startAt: 0 });

  useEffect(() => {
    const from = value;
    const to = target;
    startRef.current = { from, to, startAt: performance.now() };

    let rafId: number;

    const step = (now: number) => {
      const elapsed = now - startRef.current.startAt;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = from + (to - from) * eased;
      setValue(Number(current.toFixed(decimals)));

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration, decimals]);

  return value;
}
