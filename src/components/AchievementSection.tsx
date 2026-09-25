import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import type { Course, LogEntry } from '../types';
import { computeGrowth } from '../utils/growth';
import {
  ACHIEVEMENTS,
  TIER_LABELS,
  type Achievement,
  type AchievementTier,
} from '../data/achievements';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { staggerStyle, MOTION } from '../motion/tokens';
import { SectionHeader } from './SectionHeader';

interface AchievementSectionProps {
  courses: Course[];
  logs: LogEntry[];
}

type Filter = 'all' | 'unlocked' | 'locked';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'unlocked', label: '已解锁' },
  { key: 'locked', label: '未解锁' },
];

const TIER_DOT: Record<AchievementTier, string> = {
  bronze: 'bg-orange-500',
  silver: 'bg-slate-400',
  gold: 'bg-amber-500',
};

/** 解锁快照：Record<id, ISO>，设备本地（与 SignatureMoment 抑制键同范式），不进 AppData 备份 */
const SNAPSHOT_KEY = 'csAiAgentAchievements';

function parseSnapshot(raw: string): Record<string, string> {
  try {
    const v: unknown = JSON.parse(raw);
    return v && typeof v === 'object' && !Array.isArray(v)
      ? (v as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

export function AchievementSection({ courses, logs }: AchievementSectionProps) {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<Filter>('all');
  const [snapshot, setSnapshot] = useLocalStorage<Record<string, string> | null>(
    SNAPSHOT_KEY,
    null,
    { parse: parseSnapshot },
  );
  const [toast, setToast] = useState<Achievement[] | null>(null);
  const [freshIds, setFreshIds] = useState<string[]>([]);

  const growth = useMemo(() => computeGrowth(courses, logs), [courses, logs]);
  const satisfied = useMemo(
    () => ACHIEVEMENTS.filter(a => a.condition(growth.ctx)),
    [growth],
  );

  // 解锁 diff：key 缺失（首访/fixture clear）→ 静默回填只写时刻不公告；
  // key 存在（含 {}）才 diff 公告——快照本身就是永久抑制，不设独立抑制键
  useEffect(() => {
    if (snapshot === null) {
      const backfill: Record<string, string> = {};
      const now = new Date().toISOString();
      for (const a of satisfied) backfill[a.id] = now;
      setSnapshot(backfill);
      return;
    }
    const fresh = satisfied.filter(a => !snapshot[a.id]);
    if (fresh.length === 0) return;
    const now = new Date().toISOString();
    const patch: Record<string, string> = {};
    for (const a of fresh) patch[a.id] = now;
    setSnapshot({ ...snapshot, ...patch });
    setFreshIds(fresh.map(a => a.id));
    setToast(fresh);
  }, [satisfied, snapshot, setSnapshot]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => {
      setToast(null);
      setFreshIds([]);
    }, 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const unlockedCount = satisfied.filter(a => snapshot?.[a.id]).length;
  const visible = ACHIEVEMENTS.filter(a => {
    const unlocked = !!snapshot?.[a.id];
    return filter === 'all' || (filter === 'unlocked' ? unlocked : !unlocked);
  });

  const animatedLevel = useAnimatedNumber(growth.level);
  const levelBase = growth.xp - growth.intoNext;
  const span = growth.nextAt - levelBase;
  const barPct = span > 0 ? Math.min(100, (growth.intoNext / span) * 100) : 0;
  const remain = Math.max(0, growth.nextAt - growth.xp);

  return (
    <section className="card p-4 sm:p-5">
      <SectionHeader
        icon={Trophy}
        title="成长成就"
        muted={
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {unlockedCount}/{ACHIEVEMENTS.length} 已解锁
          </span>
        }
        extra={FILTERS.map(f => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`btn px-3 ${filter === f.key ? 'btn--accent' : 'btn--quiet'}`}
          >
            {f.label}
          </button>
        ))}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            key="achievement-unlock"
            data-testid="achievement-unlock"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: MOTION.duration.base / 1000, ease: MOTION.ease.out }}
            className="mb-4 px-4 py-3 rounded-xl bg-brand-100/90 dark:bg-brand-900/50 border border-brand-200 dark:border-brand-800 text-sm text-brand-800 dark:text-brand-200"
            role="status"
          >
            {toast.length === 1
              ? `解锁成就「${toast[0].name}」`
              : `解锁成就「${toast[0].name}」等 ${toast.length} 项`}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="mb-4 p-4 rounded-xl glass-subtle flex flex-col sm:flex-row sm:items-center gap-4"
        data-testid="achievement-level"
      >
        <div className="flex items-baseline gap-2 shrink-0">
          <span className="text-xs text-slate-600 dark:text-slate-400">Lv</span>
          <span className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {animatedLevel}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-brand-100/80 dark:bg-brand-900/40 text-xs font-medium text-brand-700 dark:text-brand-300">
            {growth.title}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
            <span className="tabular-nums">XP {growth.xp}</span>
            <span className="tabular-nums">
              {remain > 0 ? `距下一级还差 ${remain} XP` : '已到当前满级曲线顶端'}
            </span>
          </div>
          <div
            className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(barPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="等级进度"
          >
            <motion.div
              className="h-full rounded-full bg-brand-500"
              initial={{ width: 0 }}
              animate={{ width: `${barPct}%` }}
              transition={{ duration: MOTION.duration.draw / 1000, ease: MOTION.ease.out }}
            />
          </div>
        </div>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
        data-testid="achievement-wall"
      >
        {visible.map((a, index) => {
          const Icon = a.icon;
          const unlockedAt = snapshot?.[a.id];
          const unlocked = !!unlockedAt;
          const fresh = freshIds.includes(a.id);
          return (
            <div
              key={a.id}
              className="card p-3 flex flex-col gap-2"
              style={staggerStyle(index)}
              data-unlocked={unlocked}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    unlocked
                      ? 'bg-brand-100/80 dark:bg-brand-900/40'
                      : 'glass-subtle'
                  } ${fresh && !reduce ? 'achievement-pulse' : ''}`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      unlocked
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-slate-400 dark:text-slate-600 grayscale opacity-60'
                    }`}
                  />
                </div>
                {!unlocked && <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {a.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.desc}</p>
              </div>
              <div className="mt-auto flex items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${TIER_DOT[a.tier]}`} />
                  {TIER_LABELS[a.tier]} · +{a.xp} XP
                </span>
                {unlocked ? (
                  <span className="text-brand-600 dark:text-brand-400 tabular-nums shrink-0">
                    {unlockedAt.slice(0, 10)}
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-600 shrink-0">未解锁</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
