import { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Course, LogEntry } from '../types';
import { MapPin } from 'lucide-react';
import { MOTION } from '../motion/tokens';
import { findNextStep } from '../utils/helpers';
import { SectionHeader } from './SectionHeader';

interface LearningPathProps {
  courses: Course[];
  logs: LogEntry[];
  onSelectCourse?: (courseId: string) => void;
}

// 路径图按列分组：⑤全栈 与 ⑥产品 在图上合并为「交付」一列（6 列在 1440 宽放不下；
// 课程列表的阶段筛选仍按完整 phase 字符串分开）。
// 按圈号前缀匹配而非完整串：阶段改名后，自定义课程 / e2e fixture 携带的旧阶段名仍能归列
const pathColumns: { nums: string[]; short: string }[] = [
  { nums: ['①'], short: '基础' },
  { nums: ['②'], short: '系统' },
  { nums: ['③'], short: 'AI' },
  { nums: ['④'], short: 'Agent' },
  { nums: ['⑤', '⑥'], short: '交付' },
];

const NODE_WIDTH = 164;
const NODE_HEIGHT = 54;
// fullName 按词换行的每行字符上限（9px 字号下约 130px，留出节点内边距）
const FULL_NAME_MAX_CHARS = 28;

/** 按空格贪心换行，保证全文显示（不做字符级截断） */
function wrapWords(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (!cur) {
      cur = w;
      continue;
    }
    if ((cur + ' ' + w).length <= maxChars) {
      cur += ' ' + w;
    } else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}
const PADDING_X = 48;
const PADDING_TOP = 44;
const PADDING_BOTTOM = 48;
const ROW_GAP = 24;
const COL_GAP_MIN = 20;
const MIN_COL_WIDTH = NODE_WIDTH + COL_GAP_MIN;

export function LearningPath({ courses, logs, onSelectCourse }: LearningPathProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(760);
  const nextCourseId = useMemo(() => findNextStep(courses, logs)?.course.id, [courses, logs]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const { nodes, links, svgWidth, svgHeight, colCenters } = useMemo(() => {
    const colCount = pathColumns.length;

    // Column width: enough so the whole path fits the container, but never below min
    const colWidth = Math.max(
      MIN_COL_WIDTH,
      (containerWidth - PADDING_X * 2 - NODE_WIDTH) / (colCount - 1)
    );
    // Total width: left padding + node + (colCount-1) gaps + node + right padding
    const svgWidth = PADDING_X * 2 + colWidth * (colCount - 1) + NODE_WIDTH;

    const coursesByColumn = pathColumns.map(col =>
      courses.filter(c => col.nums.includes(c.phase.charAt(0)))
    );

    const maxCount = Math.max(...coursesByColumn.map(list => list.length));
    const maxColHeight = maxCount * NODE_HEIGHT + (maxCount - 1) * ROW_GAP;

    const nodeMap = new Map<string, { id: string; name: string; x: number; y: number; phase: string; course: Course }>();
    const centers: number[] = [];

    coursesByColumn.forEach((list, col) => {
      const count = list.length;
      const totalHeight = count * NODE_HEIGHT + (count - 1) * ROW_GAP;
      // Vertically center this column within the tallest column
      const startY = PADDING_TOP + (maxColHeight - totalHeight) / 2;
      const x = PADDING_X + col * colWidth;
      centers.push(x + NODE_WIDTH / 2);
      list.forEach((course, row) => {
        nodeMap.set(course.id, {
          id: course.id,
          name: course.name,
          x,
          y: startY + row * (NODE_HEIGHT + ROW_GAP),
          phase: course.phase,
          course,
        });
      });
    });

    const nodes = Array.from(nodeMap.values());
    const links: { from: string; to: string; path: string }[] = [];

    courses.forEach(course => {
      const toNode = nodeMap.get(course.id);
      if (!toNode) return;
      course.prerequisites.forEach(preId => {
        const fromNode = nodeMap.get(preId);
        if (!fromNode) return;
        const sx = fromNode.x + NODE_WIDTH;
        const sy = fromNode.y + NODE_HEIGHT / 2;
        const tx = toNode.x;
        const ty = toNode.y + NODE_HEIGHT / 2;
        const midX = (sx + tx) / 2;
        const path = `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;
        links.push({ from: preId, to: course.id, path });
      });
    });

    const maxY = Math.max(...nodes.map(n => n.y + NODE_HEIGHT));
    const svgHeight = maxY + PADDING_BOTTOM;

    return { nodes, links, svgWidth, svgHeight, colCenters: centers };
  }, [courses, containerWidth]);

  return (
    <section className="card p-4 sm:p-5">
      <SectionHeader
        icon={MapPin}
        title="学习路径图"
        muted={<span className="text-xs text-slate-600 dark:text-slate-400">共 {courses.length} 门课程</span>}
      />

      <div ref={containerRef} className="overflow-x-auto pb-2">
        <svg width={svgWidth} height={svgHeight} className="min-w-full">
          {/* Phase column labels */}
          {pathColumns.map((col, i) => (
            <text
              key={col.short}
              x={colCenters[i]}
              y={18}
              textAnchor="middle"
              className="text-[11px] fill-slate-400 dark:fill-slate-500 font-medium"
            >
              {col.short}
            </text>
          ))}

          {/* Links */}
          {links.map((link, i) => (
            <motion.path
              key={`${link.from}-${link.to}`}
              d={link.path}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: MOTION.duration.draw / 1000, ease: MOTION.ease.out, delay: (i * MOTION.stagger.step) / 1000 }}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth={1.5}
              markerEnd="url(#arrowhead)"
            />
          ))}

          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#cbd5e1" />
            </marker>
          </defs>

          {/* Nodes */}
          {nodes.map((node, i) => {
            const optional = node.course.optional;
            const total = node.course.todos.length;
            const done = node.course.todos.filter(t => t.done).length;
            const pct = total ? done / total : 0;
            // 色阶镜像 helpers.progressColor（Tailwind 类不能当 SVG fill）
            const barColor = pct < 0.3 ? '#94a3b8' : pct < 0.7 ? '#3b82f6' : '#10b981';
            const isNext = node.id === nextCourseId;
            return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: MOTION.duration.slow / 1000, ease: MOTION.ease.out, delay: (i * MOTION.stagger.step) / 1000 }}
              className="cursor-pointer"
              onClick={() => onSelectCourse?.(node.id)}
              opacity={optional ? 0.75 : 1}
            >
              <rect
                x={node.x}
                y={node.y}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={10}
                fill={optional ? '#fdf6ee' : 'white'}
                stroke={isNext ? '#d068b8' : optional ? '#d6a2a2' : '#e2e8f0'}
                strokeWidth={isNext ? 2.5 : 1.5}
                strokeDasharray={!isNext && optional ? '4 3' : undefined}
                className="hover:stroke-brand-400 transition-all"
              />
              {isNext && (
                <text
                  x={node.x + NODE_WIDTH / 2}
                  y={node.y - 5}
                  textAnchor="middle"
                  fill="#d068b8"
                  className="text-[9px] font-semibold"
                >
                  下一步
                </text>
              )}
              <text
                x={node.x + NODE_WIDTH / 2}
                y={node.y + 18}
                textAnchor="middle"
                className="text-[11px] fill-slate-900 dark:fill-slate-100 font-semibold"
              >
                {node.name}
              </text>
              {optional ? (
                <text
                  x={node.x + NODE_WIDTH / 2}
                  y={node.y + 34}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 dark:fill-slate-500"
                >
                  选修
                </text>
              ) : (
                wrapWords(node.course.fullName, FULL_NAME_MAX_CHARS).map((line, lineIdx) => (
                  <text
                    key={lineIdx}
                    x={node.x + NODE_WIDTH / 2}
                    y={node.y + 34 + lineIdx * 11}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-400 dark:fill-slate-500"
                  >
                    {line}
                  </text>
                ))
              )}
              {/* 课程级完成度进度条（节点底部 4px） */}
              <rect
                x={node.x + 6}
                y={node.y + NODE_HEIGHT - 6}
                width={NODE_WIDTH - 12}
                height={4}
                rx={2}
                fill="#e2e8f0"
              />
              {pct > 0 && (
                <rect
                  x={node.x + 6}
                  y={node.y + NODE_HEIGHT - 6}
                  width={(NODE_WIDTH - 12) * pct}
                  height={4}
                  rx={2}
                  fill={barColor}
                />
              )}
            </motion.g>
            );
          })}
        </svg>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        点击节点可跳转到对应课程卡片。箭头表示建议的前置依赖；节点底部条是完成度，粉色描边是下一步建议。
      </p>
    </section>
  );
}
