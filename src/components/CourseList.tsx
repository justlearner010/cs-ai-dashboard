import { BookOpen } from 'lucide-react';
import type { Course, Todo, TodoType } from '../types';
import { CourseCard } from './CourseCard';

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
  return (
    <section className="card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-semibold">课程与任务清单</h2>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />知识点</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Lab</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />问题反馈</span>
        </div>
      </div>
      <div className="space-y-4">
        {courses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            onToggleTodo={onToggleTodo}
            onAddTodo={onAddTodo}
            onDeleteTodo={onDeleteTodo}
            onSetDueDate={onSetDueDate}
            onReorderTodos={onReorderTodos}
            onHighlightDimension={onHighlightDimension}
          />
        ))}
      </div>
    </section>
  );
}
