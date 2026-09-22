import type { Course } from '../types';
import { today } from './helpers';

export interface FeishuSyncTodo {
  text: string;
  type: string;
  dueDate?: string;
  courseName: string;
  courseId: string;
}

export interface FeishuSyncPayload {
  exportedAt: string;
  source: string;
  todos: FeishuSyncTodo[];
}

/** 收集全部未完成任务，按截止日期升序（未设置日期的排最后） */
export function buildFeishuSyncPayload(courses: Course[]): FeishuSyncPayload {
  const todos: FeishuSyncTodo[] = [];
  for (const course of courses) {
    for (const todo of course.todos) {
      if (!todo.done) {
        todos.push({
          text: todo.text,
          type: todo.type,
          dueDate: todo.dueDate,
          courseName: course.name,
          courseId: course.id,
        });
      }
    }
  }
  todos.sort((a, b) =>
    (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99'),
  );
  return {
    exportedAt: new Date().toISOString(),
    source: 'cs-ai-agent-dashboard',
    todos,
  };
}

/** 导出「待办同步包」JSON 并触发下载，返回导出的任务数 */
export function downloadFeishuSync(courses: Course[]): number {
  const payload = buildFeishuSyncPayload(courses);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `feishu-todos-${today()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  return payload.todos.length;
}
