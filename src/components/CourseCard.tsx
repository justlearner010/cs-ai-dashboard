import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ExternalLink, Plus, ClipboardList, CheckSquare, PlayCircle, BookOpen, Code, MessageCircle, BookText, ChevronDown } from 'lucide-react';
import type { Course, Todo, TodoType, ResourceType } from '../types';
import { MOTION } from '../motion/tokens';
import { progressColor } from '../utils/helpers';
import { getDimensionsBySkills } from '../data/skillDimensions';
import { EmptyState } from './EmptyState';
import { SortableTodoItem } from './SortableTodoItem';

interface CourseCardProps {
  course: Course;
  collapsed: boolean;
  onToggleCollapse: (courseId: string) => void;
  onToggleTodo: (courseId: string, todoId: string) => void;
  onAddTodo: (courseId: string, text: string, type: TodoType, dueDate?: string) => void;
  onDeleteTodo: (courseId: string, todoId: string) => void;
  onSetDueDate?: (courseId: string, todoId: string, dueDate?: string) => void;
  onReorderTodos: (courseId: string, newTodos: Todo[]) => void;
  onHighlightDimension?: (dimension: string | null) => void;
}

// 单一数据源：类型完整性由 Record<ResourceType, …> 强制，分组顺序 = 声明顺序
const resourceMeta: Record<ResourceType, { label: string; Icon: typeof PlayCircle }> = {
  video: { label: '视频', Icon: PlayCircle },
  notes: { label: '笔记', Icon: BookOpen },
  code: { label: '代码', Icon: Code },
  community: { label: '社区', Icon: MessageCircle },
  book: { label: '书单', Icon: BookText },
};
const resourceTypeOrder = Object.keys(resourceMeta) as ResourceType[];

const typeConfig: Record<TodoType, { label: string; color: string; activeText: string; emptyTitle: string }> = {
  knowledge: {
    label: '知识点',
    color: 'bg-blue-50/70 text-blue-700 border-blue-200/60 hover:bg-blue-100/70 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40 dark:hover:bg-blue-950/60',
    activeText: 'text-blue-700 dark:text-blue-300',
    emptyTitle: '还没有知识点任务',
  },
  lab: {
    label: 'Lab',
    color: 'bg-emerald-50/70 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40 dark:hover:bg-emerald-950/60',
    activeText: 'text-emerald-700 dark:text-emerald-300',
    emptyTitle: '还没有 Lab 任务',
  },
  question: {
    label: '问题',
    color: 'bg-amber-50/70 text-amber-700 border-amber-200/60 hover:bg-amber-100/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40 dark:hover:bg-amber-950/60',
    activeText: 'text-amber-700 dark:text-amber-300',
    emptyTitle: '还没有问题反馈',
  },
};

export function CourseCard({
  course,
  collapsed,
  onToggleCollapse,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onSetDueDate,
  onReorderTodos,
  onHighlightDimension,
}: CourseCardProps) {
  const [activeTab, setActiveTab] = useState<TodoType>('knowledge');
  const [newTodo, setNewTodo] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const total = course.todos.length;
  const done = course.todos.filter(t => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredTodos = course.todos.filter(t => t.type === activeTab);
  const undoneCount = filteredTodos.filter(t => !t.done).length;

  const handleAdd = () => {
    const text = newTodo.trim();
    if (!text) return;
    onAddTodo(course.id, text, activeTab, newDueDate || undefined);
    setNewTodo('');
    setNewDueDate('');
  };

  const handleCompleteAll = () => {
    filteredTodos.filter(t => !t.done).forEach(t => onToggleTodo(course.id, t.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = course.todos.findIndex(t => t.id === active.id);
    const newIndex = course.todos.findIndex(t => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorderTodos(course.id, arrayMove(course.todos, oldIndex, newIndex));
  };

  return (
    <div id={`course-${course.id}`} className="glass-subtle rounded-xl overflow-hidden scroll-mt-24">
      <div className={`p-4 sm:p-5 ${!collapsed ? 'border-b border-white/60 dark:border-slate-700/60' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">{course.phase}</span>
              {course.optional && (
                <span className="pill bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  选修
                </span>
              )}
              <a
                href={course.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-brand-600 inline-flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> 课程资源
              </a>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {course.name} <span className="font-normal text-slate-500 dark:text-slate-400">— {course.fullName}</span>
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {getDimensionsBySkills(course.skills).map(d => (
                <span
                  key={d.key}
                  onMouseEnter={() => onHighlightDimension?.(d.label)}
                  onMouseLeave={() => onHighlightDimension?.(null)}
                  className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium cursor-default transition-transform hover:scale-105"
                  style={{ color: d.color, backgroundColor: d.bgColor }}
                >
                  {d.label}
                </span>
              ))}
            </div>
            {course.resources.length > 0 && (
              <div className="mt-3 space-y-2">
                {resourceTypeOrder
                  .map(type => ({ type, items: course.resources.filter(r => r.type === type) }))
                  .filter(group => group.items.length > 0)
                  .map(({ type, items }) => {
                    const { label, Icon } = resourceMeta[type];
                    return (
                      <div key={type} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                          {label}
                        </span>
                        {items.map((res, i) => (
                          <a
                            key={i}
                            href={res.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 transition-colors"
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {res.title}
                          </a>
                        ))}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-left sm:text-right">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">{pct}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{done}/{total}</div>
            </div>
            <button
              type="button"
              onClick={() => onToggleCollapse(course.id)}
              aria-expanded={!collapsed}
              aria-label={`${collapsed ? '展开' : '收起'}课程 ${course.name}`}
              title={collapsed ? '展开任务列表' : '收起任务列表'}
              className="btn btn--icon text-slate-400 dark:text-slate-500 hover:text-brand-600 shrink-0"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-150 ${collapsed ? '-rotate-90' : ''}`}
              />
            </button>
          </div>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: MOTION.duration.draw / 1000, ease: MOTION.ease.out }}
            className={`h-full rounded-full ${progressColor(pct)}`}
          />
        </div>
      </div>

      {!collapsed && (
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 border-b border-white/60 dark:border-slate-700/60 pb-2">
          <div className="flex gap-2 overflow-x-auto">
            {(Object.keys(typeConfig) as TodoType[]).map(type => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                aria-current={activeTab === type}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap border border-transparent ${
                  activeTab === type ? typeConfig[type].activeText : typeConfig[type].color
                }`}
              >
                {activeTab === type && (
                  <motion.span
                    layoutId={`course-tab-${course.id}`}
                    transition={MOTION.spring.nav}
                    className="absolute inset-0 rounded-lg bg-white dark:bg-slate-700/80 border border-white/70 dark:border-slate-600 shadow-sm"
                    aria-hidden
                  />
                )}
                <span className="relative">
                  {typeConfig[type].label} ({course.todos.filter(t => t.type === type).length})
                </span>
              </button>
            ))}
          </div>
          {undoneCount > 0 && (
            <button
              onClick={handleCompleteAll}
              className="btn btn--quiet ml-2 text-xs px-3 py-2 whitespace-nowrap shrink-0"
              title="完成当前类型所有未完成任务"
            >
              <CheckSquare className="w-3.5 h-3.5" /> 全选
            </button>
          )}
        </div>

        <div className="space-y-2 min-h-[80px]">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTodos.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence mode="popLayout">
                {filteredTodos.length === 0 ? (
                  <motion.div
                    key={`empty-${activeTab}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: MOTION.duration.base / 1000, ease: MOTION.ease.out }}
                  >
                    <EmptyState
                      icon={ClipboardList}
                      title={typeConfig[activeTab].emptyTitle}
                      description="在下方输入框添加第一个任务，开始追踪进度。"
                    />
                  </motion.div>
                ) : (
                  filteredTodos.map(todo => (
                    <SortableTodoItem
                      key={todo.id}
                      todo={todo}
                      courseId={course.id}
                      onToggle={onToggleTodo}
                      onDelete={onDeleteTodo}
                      onSetDueDate={onSetDueDate}
                    />
                  ))
                )}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="添加新任务..."
            className="input flex-1 min-w-[180px]"
          />
          <input
            type="date"
            value={newDueDate}
            onChange={e => setNewDueDate(e.target.value)}
            title="截止日期（可选）"
            className="input w-36"
          />
          <button
            onClick={handleAdd}
            className="btn btn--solid px-3 py-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> 添加
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
