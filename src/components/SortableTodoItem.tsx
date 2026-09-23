import { forwardRef, useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Trash2, GripVertical, CalendarDays } from 'lucide-react';
import type { Todo } from '../types';
import { dueBadge, dueStatus } from '../utils/helpers';

/** 完成庆祝粒子的散开方向与颜色 */
const BURST = [
  { x: 26, y: -16, cls: 'bg-brand-400' },
  { x: 18, y: -24, cls: 'bg-pink-400' },
  { x: -18, y: -22, cls: 'bg-amber-400' },
  { x: -26, y: -10, cls: 'bg-emerald-400' },
  { x: 24, y: 10, cls: 'bg-sky-400' },
  { x: -22, y: 14, cls: 'bg-violet-400' },
  { x: 8, y: -28, cls: 'bg-rose-400' },
  { x: -10, y: 22, cls: 'bg-cyan-400' },
];

interface SortableTodoItemProps {
  todo: Todo;
  courseId: string;
  onToggle: (courseId: string, todoId: string) => void;
  onDelete: (courseId: string, todoId: string) => void;
  onSetDueDate?: (courseId: string, todoId: string, dueDate?: string) => void;
}

// forwardRef：AnimatePresence(popLayout) 会注入 ref，需转发到 motion 根节点
export const SortableTodoItem = forwardRef<HTMLDivElement, SortableTodoItemProps>(
function SortableTodoItem({ todo, courseId, onToggle, onDelete, onSetDueDate }, ref) {
  const [showDate, setShowDate] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const reduceMotion = useReducedMotion();
  const prevDone = useRef(todo.done);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  // 同时挂上 dnd-kit 的 setNodeRef 与 AnimatePresence 注入的 ref
  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
  };

  // 未完成 → 完成的瞬间放一轮庆祝粒子
  useEffect(() => {
    const was = prevDone.current;
    prevDone.current = todo.done;
    if (todo.done && !was && !reduceMotion) {
      setCelebrate(true);
      const t = window.setTimeout(() => setCelebrate(false), 750);
      return () => window.clearTimeout(t);
    }
  }, [todo.done, reduceMotion]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  const badge = dueBadge(todo);
  const overdue = dueStatus(todo) === 'overdue';

  return (
    <motion.div
      ref={setRefs}
      style={style}
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        x: -24,
        height: 0,
        marginBottom: 0,
        transition: { duration: 0.25, ease: 'easeOut' },
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`group relative p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 dark:bg-slate-800 hover:shadow-sm transition-all ${
        isDragging ? 'bg-white dark:bg-slate-800 shadow-lg ring-2 ring-brand-200' : ''
      } ${overdue ? 'border-l-2 border-red-400 pl-1.5 shadow-sm shadow-red-100 dark:shadow-red-900/30' : ''}`}
    >
      <AnimatePresence>
        {celebrate && (
          <span aria-hidden className="pointer-events-none absolute left-5 top-2.5 z-10">
            {BURST.map((p, i) => (
              <motion.span
                key={i}
                className={`absolute w-1.5 h-1.5 rounded-full ${p.cls}`}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
              />
            ))}
          </span>
        )}
      </AnimatePresence>
      <div className="flex items-start gap-1.5">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-0.5 text-slate-300 hover:text-slate-500 dark:text-slate-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          title="拖动排序"
          aria-label="拖动排序"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle(courseId, todo.id)}
          aria-label={todo.text}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500 cursor-pointer shrink-0"
        />
        <span
          className={`text-sm flex-1 break-all relative ${
            todo.done ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          {todo.text}
          {todo.done && (
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute left-0 top-[55%] h-[1px] bg-slate-400"
            />
          )}
        </span>
        {badge && (
          <span
            className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${badge.className}`}
          >
            {badge.label}
          </span>
        )}
        {onSetDueDate && (
          <button
            onClick={() => setShowDate(v => !v)}
            className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-slate-500 hover:text-brand-600 p-1 rounded transition-all shrink-0"
            title="设置截止日期"
            aria-label="设置截止日期"
          >
            <CalendarDays className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => onDelete(courseId, todo.id)}
          className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-slate-500 hover:text-red-600 p-1 rounded transition-all shrink-0"
          title="删除"
          aria-label="删除任务"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {showDate && onSetDueDate && (
        <div className="flex items-center gap-2 mt-1.5 pl-7">
          <input
            type="date"
            value={todo.dueDate ?? ''}
            onChange={e => onSetDueDate(courseId, todo.id, e.target.value || undefined)}
            aria-label={`设置「${todo.text}」的截止日期`}
            className="rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {todo.dueDate && (
            <button
              onClick={() => onSetDueDate(courseId, todo.id, undefined)}
              aria-label="清除截止日期"
              className="text-xs text-slate-400 hover:text-red-600 transition-colors"
            >
              清除
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
});
