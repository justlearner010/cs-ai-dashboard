import { motion, useScroll, useSpring } from 'framer-motion';

/** 顶部阅读进度条（1px 渐变，随页面滚动伸展） */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-1 z-40 origin-left
                 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600"
    />
  );
}
