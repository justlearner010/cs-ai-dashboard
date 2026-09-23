import { useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { Course, Todo, TodoType } from '../types';
import { CourseCard } from './CourseCard';
import { EmptyState } from './EmptyState';
import { staggerStyle } from '../motion/tokens';

interface CourseListProps {
  courses: Course[];
  onToggleTodo: (courseId: string, todoId: string) => void;
  onAddTodo: (courseId: string, text: string, type: TodoType, dueDate?: string) => void;
  onDeleteTodo: (courseId: string, todoId: string) => void;
  onSetDueDate?: (courseId: string, todoId: string, dueDate?: string) => void;
  onReorderTodos: (courseId: string, newTodos: Todo[]) => void;
  onHighlightDimension?: (dimension: string | null) => void;
}

export function CourseList({
  courses,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onSetDueDate,
  onReorderTodos,
  onHighlightDimension,
}: CourseListProps) {
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState('');
  const phases = useMemo(() => [...new Set(courses.map(c => c.phase))], [courses]);
  const q = query.trim().toLowerCase();
  const visible = courses.filter(c => {
    if (phase && c.phase !== phase) return false;
    if (!q) return true;
    return `${c.name} ${c.fullName} ${c.id} ${c.skills.join(' ')}`.toLowerCase().includes(q);
  });

  return (
    <section className="card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-semibold">课程与任务清单</h2>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" />知识点</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" />Lab</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" />问题反馈</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜索课程 / 技能…"
          aria-label="搜索课程"
          className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-full sm:w-auto sm:min-w-[12rem]"
        />
        <select
          value={phase}
          onChange={e => setPhase(e.target.value)}
          aria-label="按阶段筛选课程"
          className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-full sm:w-auto"
        >
          <option value="">全部阶段</option>
          {phases.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      {visible.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="无匹配课程"
          description="换个关键词，或清除阶段筛选试试。"
          action={{
            label: '清除筛选',
            onClick: () => {
              setQuery('');
              setPhase('');
            },
          }}
        />
      ) : (
        <div className="space-y-4">
          {visible.map((course, index) => (
            <div key={course.id} style={staggerStyle(index)}>
              <CourseCard
                course={course}
                onToggleTodo={onToggleTodo}
                onAddTodo={onAddTodo}
                onDeleteTodo={onDeleteTodo}
                onSetDueDate={onSetDueDate}
                onReorderTodos={onReorderTodos}
                onHighlightDimension={onHighlightDimension}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
