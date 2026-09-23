import { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Course } from '../types';
import { MapPin } from 'lucide-react';
import { MOTION } from '../motion/tokens';
import { SectionHeader } from './SectionHeader';

interface LearningPathProps {
  courses: Course[];
  onSelectCourse?: (courseId: string) => void;
}

const phaseOrder = [
  '① 编程与算法基础',
  '② 系统与分布式',
  '③ 深度学习与 LLM',
  '④ Agent Runtime',
];

const phaseShort: Record<string, string> = {
  '① 编程与算法基础': '基础',
  '② 系统与分布式': '系统',
  '③ 深度学习与 LLM': 'LLM',
  '④ Agent Runtime': 'Agent',
};

const NODE_WIDTH = 112;
const NODE_HEIGHT = 46;
const PADDING_X = 56;
const PADDING_TOP = 44;
const PADDING_BOTTOM = 48;
const ROW_GAP = 24;
const COL_GAP_MIN = 24;
const MIN_COL_WIDTH = NODE_WIDTH + COL_GAP_MIN;

export function LearningPath({ courses, onSelectCourse }: LearningPathProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(760);

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
    const colCount = phaseOrder.length;

    // Column width: enough so the whole path fits the container, but never below min
    const colWidth = Math.max(
      MIN_COL_WIDTH,
      (containerWidth - PADDING_X * 2 - NODE_WIDTH) / (colCount - 1)
    );
    // Total width: left padding + node + (colCount-1) gaps + node + right padding
    const svgWidth = PADDING_X * 2 + colWidth * (colCount - 1) + NODE_WIDTH;

    const coursesByPhase = new Map<string, Course[]>();
    phaseOrder.forEach(phase => coursesByPhase.set(phase, []));
    courses.forEach(c => {
      const list = coursesByPhase.get(c.phase) || [];
      list.push(c);
      coursesByPhase.set(c.phase, list);
    });

    const maxCount = Math.max(...Array.from(coursesByPhase.values()).map(l => l.length));
    const maxColHeight = maxCount * NODE_HEIGHT + (maxCount - 1) * ROW_GAP;

    const nodeMap = new Map<string, { id: string; name: string; x: number; y: number; phase: string; course: Course }>();
    const centers: number[] = [];

    phaseOrder.forEach((phase, col) => {
      const list = coursesByPhase.get(phase) || [];
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
          phase,
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
          {phaseOrder.map((phase, i) => (
            <text
              key={phase}
              x={colCenters[i]}
              y={18}
              textAnchor="middle"
              className="text-[11px] fill-slate-400 dark:fill-slate-500 font-medium"
            >
              {phaseShort[phase]}
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
                stroke={optional ? '#d6a2a2' : '#e2e8f0'}
                strokeWidth={1.5}
                strokeDasharray={optional ? '4 3' : undefined}
                className="hover:stroke-brand-400 transition-all"
              />
              <text
                x={node.x + NODE_WIDTH / 2}
                y={node.y + 20}
                textAnchor="middle"
                className="text-[11px] fill-slate-900 dark:fill-slate-100 font-semibold"
              >
                {node.name.length > 12 ? node.name.slice(0, 11) + '…' : node.name}
              </text>
              <text
                x={node.x + NODE_WIDTH / 2}
                y={node.y + 35}
                textAnchor="middle"
                className="text-[9px] fill-slate-400 dark:fill-slate-500"
              >
                {optional ? '选修' : (node.course.fullName.length > 20 ? node.course.fullName.slice(0, 19) + '…' : node.course.fullName)}
              </text>
            </motion.g>
            );
          })}
        </svg>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        点击节点可跳转到对应课程卡片。箭头表示建议的前置依赖关系。
      </p>
    </section>
  );
}
