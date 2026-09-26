import type { LucideIcon } from 'lucide-react';
import {
  Footprints,
  Flame,
  CalendarCheck,
  Award,
  Crown,
  CheckCircle2,
  ListChecks,
  Target,
  Flag,
  Percent,
  TrendingUp,
  PartyPopper,
  NotebookPen,
  FileText,
  Timer,
  Hourglass,
  Gem,
  GraduationCap,
  Medal,
  CalendarRange,
} from 'lucide-react';
import type { GrowthCtx } from '../utils/growth';

export type AchievementCategory = 'checkin' | 'task' | 'log' | 'mastery';
export type AchievementTier = 'bronze' | 'silver' | 'gold';

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  category: AchievementCategory;
  tier: AchievementTier;
  xp: number;
  /** 只读 GrowthCtx，永不读 xp/level（防止与 growth 求和成环） */
  condition: (ctx: GrowthCtx) => boolean;
}

export const TIER_XP: Record<AchievementTier, number> = {
  bronze: 20,
  silver: 50,
  gold: 100,
};

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  checkin: '打卡',
  task: '任务',
  log: '日志',
  mastery: '进阶',
};

export const TIER_LABELS: Record<AchievementTier, string> = {
  bronze: '铜',
  silver: '银',
  gold: '金',
};

function ach(base: Omit<Achievement, 'xp'>): Achievement {
  return { ...base, xp: TIER_XP[base.tier] };
}

export const ACHIEVEMENTS: Achievement[] = [
  // 打卡
  ach({ id: 'first-step', name: '初次打卡', desc: '写下第 1 篇日志', icon: Footprints, category: 'checkin', tier: 'silver', condition: c => c.streak >= 1 }),
  ach({ id: 'streak-3', name: '三日之火', desc: '连续打卡 3 天', icon: Flame, category: 'checkin', tier: 'bronze', condition: c => c.streak >= 3 }),
  ach({ id: 'streak-7', name: '七日不辍', desc: '连续打卡 7 天', icon: CalendarCheck, category: 'checkin', tier: 'silver', condition: c => c.streak >= 7 }),
  ach({ id: 'streak-30', name: '月度坚持', desc: '连续打卡 30 天', icon: Award, category: 'checkin', tier: 'gold', condition: c => c.streak >= 30 }),
  ach({ id: 'streak-100', name: '百日筑基', desc: '连续打卡 100 天', icon: Crown, category: 'checkin', tier: 'gold', condition: c => c.streak >= 100 }),
  // 任务
  ach({ id: 'first-task', name: '第一个脚印', desc: '完成第 1 个学习任务', icon: CheckCircle2, category: 'task', tier: 'bronze', condition: c => c.done >= 1 }),
  ach({ id: 'task-10', name: '十全十美', desc: '累计完成 10 个任务', icon: ListChecks, category: 'task', tier: 'bronze', condition: c => c.done >= 10 }),
  ach({ id: 'task-50', name: '半百里程', desc: '累计完成 50 个任务', icon: Target, category: 'task', tier: 'silver', condition: c => c.done >= 50 }),
  ach({ id: 'task-100', name: '百项通关', desc: '累计完成 100 个任务', icon: Flag, category: 'task', tier: 'gold', condition: c => c.done >= 100 }),
  ach({ id: 'progress-25', name: '四分之一', desc: '总完成度达到 25%', icon: Percent, category: 'task', tier: 'silver', condition: c => c.total > 0 && c.pct >= 25 }),
  ach({ id: 'progress-50', name: '半程里程', desc: '总完成度达到 50%', icon: TrendingUp, category: 'task', tier: 'silver', condition: c => c.total > 0 && c.pct >= 50 }),
  ach({ id: 'progress-100', name: '全量满贯', desc: '总完成度达到 100%', icon: PartyPopper, category: 'task', tier: 'gold', condition: c => c.total > 0 && c.pct >= 100 }),
  // 日志
  ach({ id: 'first-log', name: '首篇日志', desc: '写第 1 篇学习日志', icon: NotebookPen, category: 'log', tier: 'bronze', condition: c => c.logCount >= 1 }),
  ach({ id: 'log-10', name: '十篇沉淀', desc: '累计写 10 篇日志', icon: FileText, category: 'log', tier: 'silver', condition: c => c.logCount >= 10 }),
  ach({ id: 'hours-10', name: '十小时入门', desc: '累计学习 10 小时', icon: Timer, category: 'log', tier: 'bronze', condition: c => c.hours >= 10 }),
  ach({ id: 'hours-100', name: '百小时精进', desc: '累计学习 100 小时', icon: Hourglass, category: 'log', tier: 'silver', condition: c => c.hours >= 100 }),
  ach({ id: 'hours-500', name: '五百小时深潜', desc: '累计学习 500 小时', icon: Gem, category: 'log', tier: 'gold', condition: c => c.hours >= 500 }),
  // 进阶
  ach({ id: 'course-clear', name: '初阵告捷', desc: '完整学完 1 门课程', icon: GraduationCap, category: 'mastery', tier: 'silver', condition: c => c.clearCourseCount >= 1 }),
  ach({ id: 'course-clear-3', name: '三科扫荡', desc: '完整学完 3 门课程', icon: Medal, category: 'mastery', tier: 'gold', condition: c => c.clearCourseCount >= 3 }),
  ach({ id: 'week-ring', name: '七日圆环', desc: '最近 7 天每天都有日志', icon: CalendarRange, category: 'mastery', tier: 'silver', condition: c => c.weekStreak >= 7 }),
];

export const ACHIEVEMENT_MAP: Map<string, Achievement> = new Map(
  ACHIEVEMENTS.map(a => [a.id, a]),
);
