import type { Course, LogEntry, Todo } from '../types';
import { skillDimensions } from '../data/skillDimensions';

export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function phaseProgress(courses: Course[], phase: string): number {
  const list = courses.filter(c => c.phase === phase);
  if (!list.length) return 0;
  const total = list.reduce((s, c) => s + c.todos.length, 0);
  const done = list.reduce((s, c) => s + c.todos.filter(t => t.done).length, 0);
  return total ? Math.round((done / total) * 100) : 0;
}

export function overallProgress(courses: Course[]): { pct: number; done: number; total: number } {
  const all = courses.flatMap(c => c.todos);
  const done = all.filter(t => t.done).length;
  const total = all.length;
  return { pct: total ? Math.round((done / total) * 100) : 0, done, total };
}

export interface SkillRadarPoint {
  dimension: string;
  value: number;
  fullMark: number;
}

export function computeSkillRadarData(courses: Course[]): SkillRadarPoint[] {
  return skillDimensions.map(dimension => {
    // 找到所有包含该维度技能的课程
    const relatedCourses = courses.filter(c =>
      c.skills.some(skill => dimension.skills.includes(skill))
    );

    if (relatedCourses.length === 0) {
      return { dimension: dimension.label, value: 0, fullMark: 100 };
    }

    const total = relatedCourses.reduce((s, c) => s + c.todos.length, 0);
    const done = relatedCourses.reduce((s, c) => s + c.todos.filter(t => t.done).length, 0);
    const value = total ? Math.round((done / total) * 100) : 0;

    return { dimension: dimension.label, value, fullMark: 100 };
  });
}

export function computeStreak(logs: LogEntry[]): number {
  if (logs.length === 0) return 0;
  const dates = [...new Set(logs.map(l => l.date))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  const check = new Date();
  check.setHours(0, 0, 0, 0);
  for (const d of dates) {
    const cur = new Date(d);
    cur.setHours(0, 0, 0, 0);
    const diff = (check.getTime() - cur.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 1) {
      streak++;
      check.setTime(cur.getTime());
    } else {
      break;
    }
  }
  return streak;
}

export function totalHours(logs: LogEntry[]): number {
  return logs.reduce((s, l) => s + (Number(l.hours) || 0), 0);
}

export function progressColor(pct: number): string {
  if (pct < 30) return 'bg-slate-400';
  if (pct < 70) return 'bg-blue-500';
  return 'bg-emerald-500';
}

export function moodLabel(m: string): string {
  const map: Record<string, string> = {
    focused: '专注',
    tired: '疲惫',
    excited: '兴奋',
    confused: '困惑',
    productive: '高效',
  };
  return map[m] || m;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export type DueStatus = 'overdue' | 'today' | 'soon' | 'later' | 'none' | 'done';

/** 任务截止状态：逾期 / 今天到期 / 3天内 / 更晚 / 未设置 / 已完成 */
export function dueStatus(todo: Todo): DueStatus {
  if (todo.done) return 'done';
  if (!todo.dueDate) return 'none';
  const t = today();
  if (todo.dueDate < t) return 'overdue';
  if (todo.dueDate === t) return 'today';
  const diff =
    (new Date(todo.dueDate).getTime() - new Date(t).getTime()) / (1000 * 60 * 60 * 24);
  return diff <= 3 ? 'soon' : 'later';
}

export function isOverdue(todo: Todo): boolean {
  return dueStatus(todo) === 'overdue';
}

export function isDueToday(todo: Todo): boolean {
  return dueStatus(todo) === 'today';
}

/** 距离截止日期的天数（负数=已逾期） */
export function daysUntilDue(dueDate: string): number {
  const t = today();
  return Math.round(
    (new Date(dueDate).getTime() - new Date(t).getTime()) / (1000 * 60 * 60 * 24),
  );
}

/** 截止日期徽章文案与样式；无需展示时返回 null */
export function dueBadge(
  todo: Todo,
): { label: string; className: string } | null {
  const status = dueStatus(todo);
  if (status === 'none' || status === 'done' || !todo.dueDate) return null;
  const days = daysUntilDue(todo.dueDate);
  const label =
    status === 'overdue'
      ? `逾期 ${-days} 天`
      : status === 'today'
        ? '今天到期'
        : days === 1
          ? '明天到期'
          : `${days} 天后`;
  const className =
    status === 'overdue'
      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
      : status === 'today'
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
        : status === 'soon'
          ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
  return { label, className };
}
