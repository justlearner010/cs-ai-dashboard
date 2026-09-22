import {
  Radar as ReRadar,
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Radar } from 'lucide-react';
import type { Course } from '../types';
import { computeSkillRadarData } from '../utils/helpers';

interface RadarChartProps {
  courses: Course[];
  highlightedDimension?: string | null;
}

export function RadarChart({ courses, highlightedDimension }: RadarChartProps) {
  const data = computeSkillRadarData(courses);

  return (
    <section className="card p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Radar className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-semibold">能力雷达图</h2>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">基于各能力维度完成度实时生成</span>
      </div>
      <div className="w-full h-64 sm:h-80 lg:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ReRadarChart data={data} margin={{ top: 16, right: 32, bottom: 16, left: 32 }}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={props => {
                const { x, y, payload } = props as { x: number; y: number; payload: { value: string } };
                const isHighlighted = highlightedDimension && payload.value === highlightedDimension;
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={isHighlighted ? '#4f46e5' : '#334155'}
                    fontSize={isHighlighted ? 13 : 11}
                    fontWeight={isHighlighted ? 700 : 600}
                    className="transition-all duration-200"
                  >
                    {payload.value}
                  </text>
                );
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickCount={6}
              stroke="#cbd5e1"
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, '掌握度']}
              contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
            />
            <ReRadar
              name="能力掌握度"
              dataKey="value"
              stroke="#4f46e5"
              strokeWidth={2}
              fill="#4f46e5"
              fillOpacity={highlightedDimension ? 0.12 : 0.2}
            />
          </ReRadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
