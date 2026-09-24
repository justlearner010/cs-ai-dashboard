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
import { SectionHeader } from './SectionHeader';
import { GlassSurface } from './glass/GlassSurface';

interface RadarChartProps {
  courses: Course[];
  highlightedDimension?: string | null;
}

export function RadarChart({ courses, highlightedDimension }: RadarChartProps) {
  const data = computeSkillRadarData(courses);

  return (
    <GlassSurface className="card p-4 sm:p-5">
      <SectionHeader
        icon={Radar}
        title="能力雷达图"
        muted={<span className="text-xs text-slate-600 dark:text-slate-400">基于各能力维度完成度实时生成</span>}
      />
      <div className="w-full h-[280px] sm:h-80 lg:h-96">
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
                    fill={isHighlighted ? '#c253a4' : '#334155'}
                    fontSize={isHighlighted ? 13 : 11}
                    fontWeight={isHighlighted ? 700 : 600}
                    className="transition-all"
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
              stroke="#d068b8"
              strokeWidth={2}
              fill="#d068b8"
              fillOpacity={highlightedDimension ? 0.12 : 0.2}
            />
          </ReRadarChart>
        </ResponsiveContainer>
      </div>
    </GlassSurface>
  );
}
