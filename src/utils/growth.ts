import type { Course, LogEntry } from '../types';
import { overallProgress, computeStreak, totalHours, parseLocalDate, today } from './helpers';
import { ACHIEVEMENTS, TIER_XP } from '../data/achievements';

/**
 * 成长系统派生层：XP / 等级 / 称号全部由 courses+logs 确定性重算，不落盘。
 * 落盘的只有成就首次解锁时刻（csAiAgentAchievements 快照，设备本地，不进备份）。
 *
 * 扩展点（后续分期只消费本文件，不改数据模型）：
 * - 二期：computeGrowth().level 驱动 SVG 虚拟形象分段变身
 * - 三期：level 派生加点点数，分配结果存独立 localStorage key，纯展示不回写图表
 *
 * 不变量：成就 condition 永不读 xp/level（成就 XP 计入总 XP 也不成环，
 * growth 反向依赖 ACHIEVEMENTS 仅在 ctx 构建完成之后做求和）。
 */

/** 成就贡献的派生上下文——成就 condition 的唯一数据源 */
export interface GrowthCtx {
  courses: Course[];
  logs: LogEntry[];
  done: number;
  total: number;
  pct: number;
  streak: number;
  hours: number;
  logCount: number;
  distinctLogDates: number;
  clearCourseCount: number;
  /** 最近 7 个自然日（含今天）每天都有日志 */
  weekStreak: number;
}

export interface Growth {
  xp: number;
  level: number;
  title: string;
  /** 当前等级内已获得 XP */
  intoNext: number;
  /** 升到下一级所需的累计 XP */
  nextAt: number;
  ctx: GrowthCtx;
}

/** 升到 L+1 级需要 30×(L+1) XP；累计到第 n 级 = 15(n-1)(n+2) */
function levelBaseXp(level: number): number {
  return 15 * (level - 1) * (level + 2);
}

export function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor((-1 + Math.sqrt((4 * xp) / 15 + 9)) / 2));
}

const TITLES: { min: number; title: string }[] = [
  { min: 15, title: '大师' },
  { min: 10, title: '达人' },
  { min: 8, title: '修行者' },
  { min: 6, title: '行者' },
  { min: 4, title: '探路者' },
  { min: 2, title: '学徒' },
  { min: 1, title: '见习' },
];

export function levelTitle(level: number): string {
  return TITLES.find(t => level >= t.min)?.title ?? '见习';
}

const pad = (n: number) => String(n).padStart(2, '0');

function buildCtx(courses: Course[], logs: LogEntry[]): GrowthCtx {
  const progress = overallProgress(courses);
  const dates = new Set(logs.map(l => l.date));
  const clearCourseCount = courses.filter(
    c => c.todos.length > 0 && c.todos.every(t => t.done),
  ).length;

  const end = parseLocalDate(today());
  let weekStreak = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    if (dates.has(key)) weekStreak++;
    else break;
  }

  return {
    courses,
    logs,
    done: progress.done,
    total: progress.total,
    pct: progress.pct,
    streak: computeStreak(logs),
    hours: totalHours(logs),
    logCount: logs.length,
    distinctLogDates: dates.size,
    clearCourseCount,
    weekStreak,
  };
}

export function computeGrowth(courses: Course[], logs: LogEntry[]): Growth {
  const ctx = buildCtx(courses, logs);
  const achievementBonus = ACHIEVEMENTS.reduce(
    (s, a) => (a.condition(ctx) ? s + TIER_XP[a.tier] : s),
    0,
  );
  const xp = Math.round(ctx.done * 10 + ctx.hours * 5 + ctx.streak * 15 + achievementBonus);
  const level = levelFromXp(xp);
  return {
    xp,
    level,
    title: levelTitle(level),
    intoNext: xp - levelBaseXp(level),
    nextAt: levelBaseXp(level + 1),
    ctx,
  };
}
