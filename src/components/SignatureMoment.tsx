import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Course, LogEntry } from '../types';
import { computeStreak, dueWindow, today } from '../utils/helpers';
import { MOTION } from '../motion/tokens';

/**
 * 签名时刻（T5）：今日通关粒子庆祝 + streak 里程碑火焰庆祝。
 * 去重键使用 csAiAgent* 前缀（spec 允许新增的小型庆祝去重键），
 * 同日/同档仅播一次；prefers-reduced-motion 降级为静态提示。
 */
const CLEAR_KEY = 'csAiAgentCelebrationClear';
const STREAK_KEY = 'csAiAgentCelebrationStreak';
const MILESTONES: number[] = [7, 30, 100];

type Moment = { kind: 'clear' } | { kind: 'streak'; days: number };

/** 粒子散开方向与颜色（固定表，避免渲染期随机导致的不可复现） */
const PARTICLES = [
  { x: 120, y: -90, cls: 'bg-brand-400' },
  { x: -130, y: -70, cls: 'bg-pink-400' },
  { x: 90, y: -130, cls: 'bg-amber-400' },
  { x: -100, y: -120, cls: 'bg-emerald-400' },
  { x: 140, y: 20, cls: 'bg-sky-400' },
  { x: -150, y: 30, cls: 'bg-violet-400' },
  { x: 70, y: 110, cls: 'bg-rose-400' },
  { x: -80, y: 120, cls: 'bg-cyan-400' },
  { x: 160, y: -40, cls: 'bg-brand-500' },
  { x: -160, y: -30, cls: 'bg-amber-500' },
  { x: 40, y: 150, cls: 'bg-emerald-500' },
  { x: -50, y: 160, cls: 'bg-pink-500' },
  { x: 110, y: 70, cls: 'bg-violet-400' },
  { x: -120, y: 80, cls: 'bg-sky-500' },
  { x: 0, y: -160, cls: 'bg-rose-500' },
  { x: 20, y: 170, cls: 'bg-brand-300' },
];

/** 时间窗内存在任务且全部完成（空列表不算通关） */
function dueItemsAllDone(courses: Course[]): boolean {
  let count = 0;
  for (const course of courses) {
    for (const todo of course.todos) {
      if (!dueWindow(todo)) continue;
      count++;
      if (!todo.done) return false;
    }
  }
  return count > 0;
}

function MomentOverlay({
  moment,
  reduceMotion,
  onDone,
}: {
  moment: Moment;
  reduceMotion: boolean;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = window.setTimeout(onDone, MOTION.duration.celebrate);
    return () => window.clearTimeout(t);
  }, [onDone]);

  const isClear = moment.kind === 'clear';
  const title = isClear ? '今日通关！' : `连续学习 ${moment.days} 天！`;
  const subtitle = isClear ? '今日焦点任务全部点亮' : `${moment.days} 天火焰里程碑达成`;
  const testId = isClear ? 'celebration-clear' : `celebration-streak-${moment.days}`;

  return (
    <div
      data-testid={testId}
      aria-live="polite"
      className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
    >
      {!reduceMotion && (
        <span aria-hidden className="absolute inset-0 overflow-hidden">
          {PARTICLES.map((p, i) => (
            <motion.span
              key={i}
              className={`absolute left-1/2 top-1/2 w-2.5 h-2.5 rounded-full ${p.cls}`}
              style={{ marginLeft: -5, marginTop: -5 }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.3 }}
              transition={{ ...MOTION.spring.celebrate, delay: (i % 5) * 0.04 }}
            />
          ))}
        </span>
      )}
      <motion.div
        initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.7, y: reduceMotion ? 12 : 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={
          reduceMotion
            ? { duration: MOTION.duration.fast / 1000, ease: MOTION.ease.out }
            : MOTION.spring.celebrate
        }
        data-static={reduceMotion ? '' : undefined}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700 px-8 py-6 text-center"
      >
        <div className="text-4xl mb-2" aria-hidden>
          {isClear ? '🎉' : '🔥'}
        </div>
        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        {reduceMotion && (
          <p className="text-[11px] mt-3 text-slate-400" data-testid="celebration-static">
            已按系统「减少动态效果」设置播放静态提示
          </p>
        )}
      </motion.div>
    </div>
  );
}

export function SignatureMoment({
  courses,
  logs,
}: {
  courses: Course[];
  logs: LogEntry[];
}) {
  const reduceMotion = useReducedMotion();
  const [queue, setQueue] = useState<Moment[]>([]);
  const allDone = useMemo(() => dueItemsAllDone(courses), [courses]);
  const streak = computeStreak(logs);

  // 通关：进入「非空且全完成」边沿时尝试播放（刷新时全完成也会走此边沿，由去重键抑制重放）
  const prevAllDone = useRef(false);
  useEffect(() => {
    if (allDone && !prevAllDone.current) {
      const key = `${CLEAR_KEY}-${today()}`;
      if (!window.localStorage.getItem(key)) {
        window.localStorage.setItem(key, '1');
        setQueue(q => [...q, { kind: 'clear' }]);
      }
    }
    prevAllDone.current = allDone;
  }, [allDone]);

  // 里程碑：streak 已跨过且该档未播过（>= 而非 exact——导入后首见 8 天也要补播 7 天档）
  useEffect(() => {
    for (const m of MILESTONES) {
      if (streak < m) continue;
      const key = `${STREAK_KEY}-${m}`;
      if (window.localStorage.getItem(key)) continue;
      window.localStorage.setItem(key, '1');
      setQueue(q => [...q, { kind: 'streak', days: m }]);
    }
  }, [streak]);

  const active = queue[0];
  const dismiss = () => setQueue(q => q.slice(1));

  return (
    <AnimatePresence>
      {active && (
        <MomentOverlay
          key={active.kind === 'streak' ? `streak-${active.days}` : 'clear'}
          moment={active}
          reduceMotion={Boolean(reduceMotion)}
          onDone={dismiss}
        />
      )}
    </AnimatePresence>
  );
}
