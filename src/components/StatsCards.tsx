import { Percent, CheckCircle2, Flame, Clock } from 'lucide-react';
import type { Course, LogEntry } from '../types';
import { overallProgress, computeStreak, totalHours } from '../utils/helpers';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

interface StatsCardsProps {
  courses: Course[];
  logs: LogEntry[];
}

export function StatsCards({ courses, logs }: StatsCardsProps) {
  const { pct, done, total } = overallProgress(courses);
  const streak = computeStreak(logs);
  const hours = totalHours(logs);

  const animatedPct = useAnimatedNumber(pct, { decimals: 0 });
  const animatedDone = useAnimatedNumber(done, { decimals: 0 });
  const animatedStreak = useAnimatedNumber(streak, { decimals: 0 });
  const animatedHours = useAnimatedNumber(hours, { decimals: 1 });

  const items = [
    {
      icon: Percent,
      label: '总完成度',
      value: `${animatedPct}%`,
      raw: `${pct}%`,
      color: 'text-brand-700 dark:text-brand-300',
      bg: 'bg-brand-100 dark:bg-brand-900/40',
    },
    {
      icon: CheckCircle2,
      label: '已完成项',
      value: `${animatedDone}/${total}`,
      raw: `${done}/${total}`,
      color: 'text-brand-600 dark:text-brand-300',
      bg: 'bg-brand-50 dark:bg-brand-900/30',
    },
    {
      icon: Flame,
      label: '连续打卡',
      value: `${animatedStreak} 天`,
      raw: `${streak} 天`,
      color: 'text-brand-800 dark:text-brand-300',
      bg: 'bg-brand-200/70 dark:bg-brand-900/50',
    },
    {
      icon: Clock,
      label: '总学习时长',
      value: `${animatedHours.toFixed(1)}h`,
      raw: `${hours.toFixed(1)}h`,
      color: 'text-brand-700 dark:text-brand-300',
      bg: 'bg-brand-100/80 dark:bg-brand-900/40',
    },
  ];

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="card p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
            style={{
              animation: 'stats-enter 0.4s ease-out both',
              animationDelay: `${index * 80}ms`,
            }}
          >
            <div className={`p-2.5 sm:p-3 rounded-xl ${item.bg} shrink-0`}>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {item.value}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
