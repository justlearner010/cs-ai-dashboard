import type { Course, LogEntry } from '../types';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, TrendingUp, Award, Clock3, Flame } from 'lucide-react';
import { getDimensionsBySkills } from '../data/skillDimensions';
import { computeStreak, totalHours } from '../utils/helpers';
import { format, startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { SectionHeader } from './SectionHeader';
import { EmptyState } from './EmptyState';
import { GlassSurface } from './glass/GlassSurface';

interface TrendStatsProps {
  courses: Course[];
  logs: LogEntry[];
}

function courseDimension(course: Course | undefined): string | null {
  if (!course) return null;
  const dims = getDimensionsBySkills(course.skills);
  return dims.length > 0 ? dims[0].label : null;
}

export default function TrendStats({ courses, logs }: TrendStatsProps) {
  const today = new Date();

  // 单图双序列：近 12 周每周学时（柱） + 截至该周末的累计学时（线）
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const start = startOfWeek(addWeeks(today, -11 + i), { weekStartsOn: 1 });
    const end = endOfWeek(addWeeks(today, -11 + i), { weekStartsOn: 1 });
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    let weekHours = 0;
    let cumHours = 0;
    logs.forEach(log => {
      const hours = Number(log.hours) || 0;
      if (log.date > endStr) return;
      cumHours += hours;
      if (log.date >= startStr && log.date <= endStr) weekHours += hours;
    });

    return {
      label: format(start, 'M/d'),
      weekHours: Number(weekHours.toFixed(1)),
      cumHours: Number(cumHours.toFixed(1)),
    };
  });

  // 月度小结（当前月份）
  const monthLogs = logs.filter(l => l.date.startsWith(format(today, 'yyyy-MM')));
  const monthHours = monthLogs.reduce((s, l) => s + (Number(l.hours) || 0), 0);
  const monthDays = new Set(monthLogs.map(l => l.date)).size;
  const dimHours: Map<string, number> = new Map();
  monthLogs.forEach(log => {
    const course = courses.find(c => log.course.includes(c.name));
    const dim = courseDimension(course);
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

  const hasData = logs.length > 0;

  return (
    <GlassSurface className="card p-4 sm:p-5" data-testid="trend-section">
      <SectionHeader
        icon={TrendingUp}
        title="学习趋势"
        extra={
          <div
            className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400"
            data-testid="trend-legend"
          >
            <span className="inline-flex items-center gap-2" data-testid="trend-series-week">
              <span className="w-3 h-3 rounded-sm bg-brand-600/75" aria-hidden />
              每周学时（近 12 周）
            </span>
            <span className="inline-flex items-center gap-2" data-testid="trend-series-cum">
              <span className="w-4 h-0.5 rounded bg-amber-500" aria-hidden />
              累计学时
            </span>
          </div>
        }
      />

      {!hasData ? (
        <div data-testid="trend-empty">
          <EmptyState
            icon={TrendingUp}
            title="还没有学习日志"
            description="记录第一条后，这里会长出你的成长曲线。"
          />
        </div>
      ) : (
        <>
          <div className="w-full h-64" data-testid="trend-chart">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="week" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  yAxisId="cum"
                  orientation="right"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number | string, name: string) => [
                    `${Number(value).toFixed(1)}h`,
                    name === 'weekHours' ? '本周学时' : '累计学时',
                  ]}
                  contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
                />
                <Bar
                  yAxisId="week"
                  dataKey="weekHours"
                  name="每周学时"
                  fill="#c253a4"
                  fillOpacity={0.75}
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
                <Line
                  yAxisId="cum"
                  type="monotone"
                  dataKey="cumHours"
                  name="累计学时"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: '#f59e0b', strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* 月度小结 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-700/80">
            <MiniStat icon={Clock3} label="本月时长" value={`${summary.monthHours}h`} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-950/50" />
            <MiniStat icon={Calendar} label="本月学习天数" value={`${summary.monthDays} 天`} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/50" />
            <MiniStat
              icon={Award}
              label="本月最活跃"
              value={summary.topDim ? `${summary.topDim[0]}` : '—'}
              sub={summary.topDim ? `${summary.topDim[1]}h` : undefined}
              color="text-purple-600 dark:text-purple-400"
              bg="bg-purple-50 dark:bg-purple-950/50"
            />
            <MiniStat icon={Flame} label="连续打卡" value={`${summary.streak} 天`} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-950/50" />
          </div>
        </>
      )}
    </GlassSurface>
  );
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
