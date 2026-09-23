import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  eachDayOfInterval,
  subDays,
  startOfWeek,
  endOfWeek,
  format,
  getMonth,
  getDay,
} from 'date-fns';
import type { LogEntry } from '../types';
import { Calendar, Flame, X, Clock3, CheckCircle2, PenLine, CircleHelp } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { moodLabel } from '../utils/helpers';
import { MOTION } from '../motion/tokens';

interface HeatmapProps {
  logs: LogEntry[];
  days?: number;
}

const LEVELS = [
  { min: 0, max: 0, className: 'bg-slate-100 dark:bg-slate-700' },
  { min: 0.5, max: 2, className: 'bg-emerald-200' },
  { min: 2.5, max: 4, className: 'bg-emerald-300' },
  { min: 4.5, max: 6, className: 'bg-emerald-400' },
  { min: 6.5, max: Infinity, className: 'bg-emerald-500' },
];

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function Heatmap({ logs, days = 365 }: HeatmapProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { weeks, columns, monthLabels, dayLogs } = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, days - 1);
    const rangeStart = startOfWeek(startDate, { weekStartsOn: 0 });
    const rangeEnd = endOfWeek(today, { weekStartsOn: 0 });

    const allDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
    const dailyHours = new Map<string, number>();
    const byDate = new Map<string, LogEntry[]>();

    logs.forEach(log => {
      const key = log.date;
      dailyHours.set(key, (dailyHours.get(key) || 0) + log.hours);
      const list = byDate.get(key) || [];
      list.push(log);
      byDate.set(key, list);
    });

    const cells = allDays.map(date => {
      const key = format(date, 'yyyy-MM-dd');
      const hours = dailyHours.get(key) || 0;
      const level = LEVELS.find(l => hours >= l.min && hours <= l.max) || LEVELS[0];
      return {
        date,
        key,
        hours,
        weekday: getDay(date),
        levelClass: level.className,
      };
    });

    const weeks: (typeof cells[number] | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }

    const columns = weeks.length;

    const monthLabels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, colIndex) => {
      const firstDay = week[0];
      if (!firstDay) return;
      const month = getMonth(firstDay.date);
      if (month !== lastMonth) {
        lastMonth = month;
        monthLabels.push({ col: colIndex, label: format(firstDay.date, 'M月') });
      }
    });

    return { weeks, columns, monthLabels, dayLogs: byDate };
  }, [logs, days]);

  const hasData = logs.length > 0;

  const selectedLogs = selectedDate ? (dayLogs.get(selectedDate) || []) : [];
  const selectedHours = selectedLogs.reduce((s, l) => s + (Number(l.hours) || 0), 0);

  const toggleSelect = (key: string) => {
    setSelectedDate(prev => (prev === key ? null : key));
  };

  return (
    <section className="card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-semibold">学习热力图</h2>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">最近 {days} 天学习时长分布 · 点击格子查看当日详情</span>
      </div>

      {!hasData ? (
        <EmptyState
          icon={Flame}
          title="还没有学习记录"
          description="每天坚持记录学习日志，这里会逐渐填满绿色方块。"
          action={{
            label: '去写日志',
            onClick: () => {
              document.getElementById('daily-log-form')?.scrollIntoView({ behavior: 'smooth' });
            },
          }}
        />
      ) : (
        <>
          <div className="overflow-x-auto pb-2">
            <div
              className="inline-grid gap-1"
              style={{
                gridTemplateColumns: `auto repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {/* Empty top-left corner */}
              <div />

              {/* Month labels row */}
              {monthLabels.map((m, i) => {
                const next = monthLabels[i + 1];
                const span = next ? next.col - m.col : columns - m.col;
                return (
                  <div
                    key={i}
                    className="text-xs text-slate-400 dark:text-slate-500"
                    style={{ gridColumn: `${m.col + 2} / span ${span}` }}
                  >
                    {m.label}
                  </div>
                );
              })}

              {/* Weekday labels + grid cells */}
              {WEEKDAYS.map((dayName, row) => (
                <div key={row} className="contents">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-3 self-center h-3">
                    {row % 2 === 1 ? dayName : ''}
                  </div>
                  {weeks.map((week, col) => {
                    const cell = week[row];
                    if (!cell) return <div key={col} className="w-3 h-3" />;
                    const isSelected = selectedDate === cell.key;
                    return (
                      <div
                        key={col}
                        title={`${cell.key} · ${cell.hours.toFixed(1)} 小时`}
                        aria-label={`${cell.key} · ${cell.hours.toFixed(1)} 小时`}
                        onClick={() => toggleSelect(cell.key)}
                        className={`w-3 h-3 rounded-sm ${cell.levelClass} cursor-pointer transition-all hover:ring-2 hover:ring-slate-400 hover:scale-125 ${
                          isSelected ? 'ring-2 ring-brand-500 scale-125' : ''
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400 pl-5">
              <span>少</span>
              {LEVELS.slice(1).map((level, i) => (
                <div key={i} className={`w-3 h-3 rounded-sm ${level.className}`} />
              ))}
              <span>多</span>
            </div>
          </div>

          {/* Day detail panel */}
          <AnimatePresence>
            {selectedDate && (
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: MOTION.duration.base / 1000, ease: MOTION.ease.out }}
                className="mt-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/70 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300 text-xs font-semibold rounded-lg">
                      {selectedDate}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      <Clock3 className="w-4 h-4 text-brand-600 dark:text-brand-300" />
                      {selectedHours.toFixed(1)}h
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="关闭"
                    aria-label="关闭当日详情"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {selectedLogs.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">这一天没有学习日志记录。</p>
                ) : (
                  <div className="space-y-3">
                    {selectedLogs.map((log, i) => (
                      <DayLogItem key={log.id || i} log={log} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </section>
  );
}

function DayLogItem({ log }: { log: LogEntry }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/80 p-3">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{log.course}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{log.hours}h · {moodLabel(log.mood)}</span>
      </div>
      <div className="space-y-2 text-sm">
        {log.knowledge && (
          <DetailRow icon={CheckCircle2} content={log.knowledge} color="text-blue-600 dark:text-blue-400" />
        )}
        {log.lab && (
          <DetailRow icon={PenLine} content={log.lab} color="text-emerald-600 dark:text-emerald-400" />
        )}
        {log.questions && (
          <DetailRow icon={CircleHelp} content={log.questions} color="text-amber-600 dark:text-amber-400" />
        )}
        {log.reflection && (
          <p className="text-slate-600 dark:text-slate-400"><span className="font-medium">💡 反思：</span>{log.reflection}</p>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  content,
  color,
}: {
  icon: typeof CheckCircle2;
  content: string;
  color: string;
}) {
  return (
    <p className="flex gap-2 text-slate-700 dark:text-slate-300 items-start">
      <Icon className={`w-3.5 h-3.5 mt-1 shrink-0 ${color}`} />
      <span className="whitespace-pre-line break-all">{content}</span>
    </p>
  );
}