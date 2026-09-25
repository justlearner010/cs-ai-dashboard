import { useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { Course, Todo, TodoType } from '../types';
import { CourseCard } from './CourseCard';
import { EmptyState } from './EmptyState';
import { SectionHeader } from './SectionHeader';
import { staggerStyle } from '../motion/tokens';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface CourseListProps {
  courses: Course[];
  onToggleTodo: (courseId: string, todoId: string) => void;
  onAddTodo: (courseId: string, text: string, type: TodoType, dueDate?: string) => void;
  onDeleteTodo: (courseId: string, todoId: string) => void;
  onSetDueDate?: (courseId: string, todoId: string, dueDate?: string) => void;
  onReorderTodos: (courseId: string, newTodos: Todo[]) => void;
  onHighlightDimension?: (dimension: string | null) => void;
}

const statusFilters = [
  { key: 'all', label: '全部' },
  { key: 'doing', label: '进行中' },
  { key: 'todo', label: '未开始' },
] as const;

type StatusFilter = (typeof statusFilters)[number]['key'];

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
  const [status, setStatus] = useState<StatusFilter>('all');
  // 折叠态默认 {} = 全展开（e2e 需要勾选框常驻 DOM）；用户手动折叠后跨刷新保留
  const [collapsedMap, setCollapsedMap] = useLocalStorage<Record<string, boolean>>(
    'csAiAgentCourseFold',
    {},
  );
  const phases = useMemo(() => [...new Set(courses.map(c => c.phase))], [courses]);
  const q = query.trim().toLowerCase();
  const visible = courses.filter(c => {
    if (phase && c.phase !== phase) return false;
    if (status !== 'all') {
      const started = c.todos.some(t => t.done);
      if (status === 'doing' && !started) return false;
      if (status === 'todo' && started) return false;
    }
    if (!q) return true;
    return `${c.name} ${c.fullName} ${c.id} ${c.skills.join(' ')}`.toLowerCase().includes(q);
  });

  const toggleCollapse = (courseId: string) =>
    setCollapsedMap(prev => ({ ...prev, [courseId]: !prev[courseId] }));

  return (
    <section className="card p-4 sm:p-5">
      <SectionHeader
        icon={BookOpen}
        title="课程与任务清单"
        extra={
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" />知识点</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" />Lab</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" />问题反馈</span>
          </div>
        }
      />
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜索课程 / 技能…"
          aria-label="搜索课程"
          className="input w-full sm:w-auto sm:min-w-[12rem]"
        />
        <select
          value={phase}
          onChange={e => setPhase(e.target.value)}
          aria-label="按阶段筛选课程"
          className="input w-full sm:w-auto"
        >
          <option value="">全部阶段</option>
          {phases.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="按状态筛选课程">
          {statusFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              aria-pressed={status === f.key}
              className={`pill cursor-pointer border px-3 py-1.5 transition-colors ${
                status === f.key
                  ? 'bg-brand-100 text-brand-700 border-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:border-brand-800'
                  : 'bg-white/60 text-slate-500 border-white/70 hover:bg-white dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
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
              setStatus('all');
            },
          }}
        />
      ) : (
        <div className="space-y-4">
          {visible.map((course, index) => (
            <div key={course.id} style={staggerStyle(index)}>
              <CourseCard
                course={course}
                collapsed={!!collapsedMap[course.id]}
                onToggleCollapse={toggleCollapse}
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
