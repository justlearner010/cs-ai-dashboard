export type TodoType = 'knowledge' | 'lab' | 'question';

export interface Todo {
  id: string;
  text: string;
  type: TodoType;
  done: boolean;
  /** 截止日期 YYYY-MM-DD，可选 */
  dueDate?: string;
}

export type ResourceType = 'video' | 'notes' | 'code' | 'community' | 'book';

export interface Resource {
  type: ResourceType;
  title: string;
  url: string;
}

export interface Course {
  id: string;
  phase: string;
  name: string;
  fullName: string;
  url: string;
  skills: string[];
  prerequisites: string[];
  resources: Resource[];
  todos: Todo[];
  optional?: boolean;
}

export type Mood = 'focused' | 'tired' | 'excited' | 'confused' | 'productive';

export interface LogEntry {
  id: string;
  date: string;
  course: string;
  hours: number;
  mood: Mood;
  knowledge: string;
  lab: string;
  questions: string;
  reflection: string;
  createdAt: string;
}

export interface AppData {
  courses: Course[];
  logs: LogEntry[];
  exportedAt?: string;
}

/** 导入结果：失败时带具体原因，成功时带回实际导入条数 */
export type ImportResult =
  | { ok: true; courseCount: number | null; logCount: number | null }
  | { ok: false; error: string };

export interface SkillDimension {
  key: string;
  label: string;
  description: string;
  skills: string[];
  color: string;
  bgColor: string;
}
