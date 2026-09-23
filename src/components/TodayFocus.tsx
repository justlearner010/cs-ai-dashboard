import { forwardRef, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Flame,
  AlertTriangle,
  CalendarClock,
  ArrowUpRight,
  Sparkles,
  Bell,
  BellRing,
  BellOff,
  Download,
} from 'lucide-react';
import type { Course, LogEntry, Todo } from '../types';
import { computeStreak, dueBadge, dueStatus, today } from '../utils/helpers';
import { reminderSupported } from '../hooks/useTaskReminders';
import { downloadFeishuSync } from '../utils/feishuSync';
import { MOTION } from '../motion/tokens';

interface FocusItem {
  todo: Todo;
  course: Course;
}

interface TodayFocusProps {
  courses: Course[];
  logs: LogEntry[];
  onToggleTodo: (courseId: string, todoId: string) => void;
  onJumpToCourse: (courseId: string) => void;
}

const typeLabels: Record<Todo['type'], string> = {
  knowledge: '知识点',
  lab: 'Lab',
  question: '问题',
};

function collectDueItems(courses: Course[]): FocusItem[] {
  const items: FocusItem[] = [];
  for (const course of courses) {
    for (const todo of course.todos) {
      const status = dueStatus(todo);
      if (status === 'overdue' || status === 'today' || status === 'soon') {
        items.push({ todo, course });
      }
    }
  }
  return items.sort((a, b) =>
    (a.todo.dueDate || '').localeCompare(b.todo.dueDate || ''),
  );
}

function findNextStep(courses: Course[]): FocusItem | null {
  for (const course of courses) {
    const todo = course.todos.find(t => !t.done);
    if (todo) return { todo, course };
  }
  return null;
}

// forwardRef：AnimatePresence(popLayout) 会注入 ref，需转发到 motion 根节点
const FocusRow = forwardRef<
  HTMLLIElement,
  {
    item: FocusItem;
    onToggleTodo: (courseId: string, todoId: string) => void;
    onJumpToCourse: (courseId: string) => void;
  }
>(function FocusRow(
  { item, onToggleTodo, onJumpToCourse },
  ref,
) {
  const badge = dueBadge(item.todo);
  const status = dueStatus(item.todo);
  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, height: 0, marginTop: 0 }}
      transition={{ duration: MOTION.duration.base / 1000, ease: MOTION.ease.out }}
      onClick={() => onJumpToCourse(item.course.id)}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border-l-2 cursor-pointer transition-colors ${
        status === 'overdue'
          ? 'border-red-400 bg-red-50/50 hover:bg-red-50 dark:bg-red-950/20 dark:hover:bg-red-950/30'
          : status === 'today'
            ? 'border-amber-400 bg-amber-50/40 hover:bg-amber-50/80 dark:bg-amber-950/20 dark:hover:bg-amber-950/30'
            : 'border-brand-300 bg-white/60 hover:bg-white dark:bg-slate-800/40 dark:hover:bg-slate-800/70'
      }`}
    >
      <input
        type="checkbox"
        checked={item.todo.done}
        onChange={() => onToggleTodo(item.course.id, item.todo.id)}
        onClick={e => e.stopPropagation()}
        aria-label={item.todo.text}
        className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500 cursor-pointer shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-800 dark:text-slate-200 truncate">
          {item.todo.text}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {item.course.name} · {typeLabels[item.todo.type]}
        </p>
      </div>
      {badge && (
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${badge.className}`}
        >
          {badge.label}
        </span>
      )}
      <button
        type="button"
        aria-label={`跳转到 ${item.course.name}`}
        onClick={e => {
          e.stopPropagation();
          onJumpToCourse(item.course.id);
        }}
        className="p-0.5 rounded shrink-0 text-slate-400 dark:text-slate-500 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <ArrowUpRight className="w-3.5 h-3.5" />
      </button>
    </motion.li>
  );
});

function ReminderButton() {
  const [perm, setPerm] = useState<NotificationPermission | 'unsupported'>(
    reminderSupported() ? Notification.permission : 'unsupported',
  );

  if (perm === 'unsupported') return null;

  if (perm === 'granted') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg dark:bg-emerald-900/30 dark:text-emerald-300">
        <BellRing className="w-3.5 h-3.5" /> 浏览器提醒已开启
      </span>
    );
  }

  if (perm === 'denied') {
    return (
      <span
        title="浏览器已拒绝通知权限，可在地址栏站点设置中重新开启"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg dark:bg-slate-800 dark:text-slate-400"
      >
        <BellOff className="w-3.5 h-3.5" /> 提醒被拒绝
      </span>
    );
  }

  return (
    <button
      onClick={async () => {
        const res = await Notification.requestPermission();
        setPerm(res);
      }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors dark:bg-brand-900/40 dark:text-brand-300 dark:hover:bg-brand-900/60"
    >
      <Bell className="w-3.5 h-3.5" /> 开启浏览器提醒
    </button>
  );
}

export function TodayFocus({
  courses,
  logs,
  onToggleTodo,
  onJumpToCourse,
}: TodayFocusProps) {
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const streak = computeStreak(logs);
  const loggedToday = logs.some(l => l.date === today());
  const showStreakWarning = streak >= 1 && !loggedToday;

  const groups = useMemo(() => {
    const items = collectDueItems(courses);
    const overdue = items.filter(i => dueStatus(i.todo) === 'overdue');
    const dueToday = items.filter(i => dueStatus(i.todo) === 'today');
    const soonAll = items.filter(i => dueStatus(i.todo) === 'soon');
    const soon = soonAll.slice(0, 4);
    return {
      list: [
        {
          key: 'overdue',
          label: '已逾期',
          icon: AlertTriangle,
          tone: 'text-red-600 dark:text-red-400',
          items: overdue,
        },
        {
          key: 'today',
          label: '今天到期',
          icon: Flame,
          tone: 'text-amber-600 dark:text-amber-400',
          items: dueToday,
        },
        {
          key: 'soon',
          label: '近 3 天',
          icon: CalendarClock,
          tone: 'text-brand-600 dark:text-brand-400',
          items: soon,
        },
      ].filter(g => g.items.length > 0),
      soonHidden: soonAll.length - soon.length,
    };
  }, [courses]);

  const nextStep = useMemo(() => findNextStep(courses), [courses]);
  const dateLabel = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Target className="w-5 h-5 text-brand-600 shrink-0" />
          <h2 className="text-lg font-semibold">今日焦点</h2>
          <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
            {dateLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ReminderButton />
          <button
            onClick={() => {
              const n = downloadFeishuSync(courses);
              setSyncMsg(`已导出 ${n} 项未完成任务`);
              window.setTimeout(() => setSyncMsg(null), 6000);
            }}
            title="导出未完成任务，用脚本批量创建为飞书待办（关掉网页手机也会提醒）"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
          >
            <Download className="w-3.5 h-3.5" /> 同步到飞书
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showStreakWarning && (
          <motion.button
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: MOTION.duration.base / 1000, ease: MOTION.ease.out }}
            onClick={() => {
              document
                .getElementById('daily-log-form')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="streak-at-risk w-full flex items-center gap-2 px-3 py-2.5 mb-3 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-300 text-left hover:from-amber-100 hover:to-amber-200/70 transition-colors dark:from-amber-950/40 dark:to-amber-900/30 dark:border-amber-700/60 dark:hover:from-amber-950/50 dark:hover:to-amber-900/40"
          >
            <Flame className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-300 flex-1 min-w-0">
              已连续学习 {streak} 天 — 今天还没记录，别断了！
            </span>
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400 whitespace-nowrap">
              去记录 →
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {groups.list.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-500" />
            今天没有到期任务，节奏刚刚好
          </p>
          {nextStep && (
            <button
              onClick={() => onJumpToCourse(nextStep.course.id)}
              className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-50 hover:bg-brand-100 text-sm text-brand-700 transition-colors dark:bg-brand-900/30 dark:text-brand-300 dark:hover:bg-brand-900/50 max-w-full"
            >
              <span className="truncate">
                下一步建议：{nextStep.course.name} → {nextStep.todo.text}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            点任务行右侧日历图标设置截止日期，这里会自动聚合到期提醒
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.list.map(group => {
            const Icon = group.icon;
            return (
              <div key={group.key}>
                <p
                  className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 ${group.tone}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {group.label}（{group.items.length}）
                </p>
                <ul className="space-y-1.5">
                  <AnimatePresence initial={false} mode="popLayout">
                    {group.items.map(item => (
                      <FocusRow
                        key={item.todo.id}
                        item={item}
                        onToggleTodo={onToggleTodo}
                        onJumpToCourse={onJumpToCourse}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            );
          })}
          {groups.soonHidden > 0 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              近 3 天还有 {groups.soonHidden} 项未展示
            </p>
          )}
          {nextStep && (
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              <span className="truncate">
                没到期的也别闲着：{nextStep.course.name} → {nextStep.todo.text}
              </span>
            </p>
          )}
        </div>
      )}
      {syncMsg && (
        <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
          {syncMsg} — 运行{' '}
          <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
            node scripts/sync-todos-to-feishu.mjs --file feishu-todos-{today()}.json
          </code>{' '}
          创建飞书待办
        </p>
      )}
    </div>
  );
}
