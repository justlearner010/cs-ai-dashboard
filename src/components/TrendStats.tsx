import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, TrendingUp, Award, Clock3, Flame } from 'lucide-react';
import type { Course, LogEntry } from '../types';
import { getDimensionsBySkills } from '../data/skillDimensions';
import { computeStreak, totalHours } from '../utils/helpers';
import { format, startOfWeek, endOfWeek, addWeeks, isSameWeek } from 'date-fns';

interface TrendStatsProps {
  courses: Course[];
  logs: LogEntry[];
}

const DIMENSION_COLORS: Record<string, string> = {
  编程基础: '#3b82f6',
  数据结构与算法: '#8b5cf6',
  '数学基础': '#f97316',
  '软件工程': '#06b6d4',
  '计算机系统': '#f59e0b',
  '分布式系统': '#ec4899',
  '机器学习 / AI': '#10b981',
  '智能体工程': '#6366f1',
};

const dimensionOrder = Object.keys(DIMENSION_COLORS);

function courseDimension(course: Course | undefined): string | null {
  if (!course) return null;
  const dims = getDimensionsBySkills(course.skills);
  return dims.length > 0 ? dims[0].label : null;
}

export default function TrendStats({ courses, logs }: TrendStatsProps) {
  const [range, setRange] = useState<'week' | 'month'>('week');

  const courseById = useMemo(() => {
    const m = new Map<string, Course>();
    courses.forEach(c => m.set(c.id, c));
    return m;
  }, [courses]);

  const { chartData, summary } = useMemo(() => {
    const today = new Date();
    let buckets: { label: string; start: Date; end: Date }[] = [];

    if (range === 'week') {
      for (let i = 11; i >= 0; i--) {
        const weekStart = startOfWeek(addWeeks(today, -i), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(addWeeks(today, -i), { weekStartsOn: 1 });
        buckets.push({ label: format(weekStart, 'M/d'), start: weekStart, end: weekEnd });
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        buckets.push({ label: format(d, 'yyyy/M'), start: d, end });
      }
    }

    const rows = buckets.map(bucket => {
      const row: Record<string, number | string> = { label: bucket.label };
      dimensionOrder.forEach(d => (row[d] = 0));
      let total = 0;
      logs.forEach(log => {
        const logDate = new Date(log.date);
        if (range === 'week') {
          if (!isSameWeek(logDate, bucket.start, { weekStartsOn: 1 })) return;
        } else {
          if (logDate < bucket.start || logDate > bucket.end) return;
        }
        const hours = Number(log.hours) || 0;
        total += hours;
        const course = courseById.get(courseIdFromLog(log, courses));
        const dim = courseDimension(course);
        if (dim && row[dim] !== undefined) row[dim] = (row[dim] as number) + hours;
      });
      row['total'] = total;
      return row;
    });

    // 月度小结（当前月份）
    const todayStr = format(today, 'yyyy-MM');
    const monthLogs = logs.filter(l => l.date.startsWith(todayStr));
    const monthHours = monthLogs.reduce((s, l) => s + (Number(l.hours) || 0), 0);
    const monthDays = new Set(monthLogs.map(l => l.date)).size;
    const dimHours: Map<string, number> = new Map();
    monthLogs.forEach(log => {
      const c = courseById.get(courseIdFromLog(log, courses));
      const dim = courseDimension(c);
      if (dim) dimHours.set(dim, (dimHours.get(dim) || 0) + (Number(log.hours) || 0));
    });
    const topDim = Array.from(dimHours.entries()).sort((a, b) => b[1] - a[1])[0];

    const summary = {
      monthHours: Number(monthHours.toFixed(1)),
      monthDays,
      topDim: topDim ? [topDim[0], topDim[1].toFixed(1)] : null,
      streak: computeStreak(logs),
      totalHours: totalHours(logs),
    };

    return { chartData: rows, summary };
  }, [logs, courses, courseById, range]);

  const hasData = logs.length > 0;

  return (
    <section className="card p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-semibold">学习趋势</h2>
        </div>
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            onClick={() => setRange('week')}
            className={`px-3 py-1.5 text-xs font-medium ${range === 'week' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            按周
          </button>
          <button
            onClick={() => setRange('month')}
            className={`px-3 py-1.5 text-xs font-medium ${range === 'month' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            按月
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="text-center text-slate-400 dark:text-slate-500 py-10 text-sm">记录学习日志后，这里会展示你的学习趋势。</div>
      ) : (
        <>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: number | string, name: string) => [`${Number(value).toFixed(1)}h`, name === 'total' ? '总时长' : name]}
                  contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
                />
                {dimensionOrder.map(dim => (
                  <Area
                    key={dim}
                    type="monotone"
                    dataKey={dim}
                    stackId="1"
                    stroke={DIMENSION_COLORS[dim]}
                    fill={DIMENSION_COLORS[dim]}
                    fillOpacity={0.5}
                    strokeWidth={1.5}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {dimensionOrder.map(dim => (
              <span key={dim} className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: DIMENSION_COLORS[dim] }} />
                {dim}
              </span>
            ))}
          </div>

          {/* 月度小结 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-700/80">
            <MiniStat icon={Clock3} label="本月时长" value={`${summary.monthHours}h`} color="text-blue-600" bg="bg-blue-50" />
            <MiniStat icon={Calendar} label="本月学习天数" value={`${summary.monthDays} 天`} color="text-emerald-600" bg="bg-emerald-50" />
            <MiniStat
              icon={Award}
              label="本月最活跃"
              value={summary.topDim ? `${summary.topDim[0]}` : '—'}
              sub={summary.topDim ? `${summary.topDim[1]}h` : undefined}
              color="text-purple-600"
              bg="bg-purple-50"
            />
            <MiniStat icon={Flame} label="连续打卡" value={`${summary.streak} 天`} color="text-amber-600" bg="bg-amber-50" />
          </div>
        </>
      )}
    </section>
  );
}

function courseIdFromLog(log: LogEntry, courses: Course[]): string {
  // 日志的 course 字段形如 "① 编程基础 — Harvard CS50x"，尝试匹配课程 name
  const course = courses.find(c => log.course.includes(c.name));
  return course ? course.id : '';
}

interface MiniStatProps {
  icon: typeof Calendar;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bg: string;
}

function MiniStat({ icon: Icon, label, value, sub, color, bg }: MiniStatProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{value}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}
