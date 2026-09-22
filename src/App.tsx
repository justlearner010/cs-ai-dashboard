import { useState, useEffect, useCallback, Suspense, lazy } from "react";
import type { AppData, Course, LogEntry, Todo, TodoType } from "./types";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useDarkMode } from "./hooks/useDarkMode";
import { initDefaultCourses } from "./data/courses";
import { Header } from "./components/Header";
import { StatsCards } from "./components/StatsCards";
import { CourseList } from "./components/CourseList";
import { DailyLogForm } from "./components/DailyLogForm";
import { LogList } from "./components/LogList";
import { Sidebar } from "./components/Sidebar";
import { BackToTop } from "./components/BackToTop";
import { MobileNav } from "./components/MobileNav";
import { ScrollProgress } from "./components/ScrollProgress";
import { TodayFocus } from "./components/TodayFocus";
import { useTaskReminders } from "./hooks/useTaskReminders";
import { ThemeBackground, MyGoHero } from "./components/ThemeBackground";
import { Reveal } from "./components/Reveal";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LazySectionFallback } from "./components/LazyLoad";
import { today, overallProgress } from "./utils/helpers";
import { generateBackupContent, type BackupPayload } from "./utils/backup";

// 重型组件按需加载，减小首屏 bundle
const RadarChart = lazy(() =>
  import("./components/RadarChart").then((m) => ({ default: m.RadarChart })),
);
const Heatmap = lazy(() =>
  import("./components/Heatmap").then((m) => ({ default: m.Heatmap })),
);
const LearningPath = lazy(() =>
  import("./components/LearningPath").then((m) => ({
    default: m.LearningPath,
  })),
);
const BackupModal = lazy(() =>
  import("./components/BackupModal").then((m) => ({ default: m.BackupModal })),
);
const TrendStats = lazy(() =>
  import("./components/TrendStats").then((m) => ({ default: m.default })),
);

const COURSES_KEY = "csAiAgentCoursesV3";
const LOGS_KEY = "csAiAgentLogsV3";
const LEGACY_COURSES_KEY = "csAiAgentCoursesV2";
const LEGACY_LOGS_KEY = "csAiAgentLogs";

function normalizeCourses(saved: Course[]): Course[] {
  const defaults = initDefaultCourses();
  const defaultMap = new Map(defaults.map((d) => [d.id, d]));

  const result: Course[] = defaults.map((def) => {
    const found = saved.find((s) => s.id === def.id);
    if (!found) return def;
    const todos = def.todos.map((dt) => {
      const ft = found.todos.find((t) => t.id === dt.id);
      return ft ? { ...dt, done: ft.done, dueDate: ft.dueDate } : dt;
    });
    const customTodos = found.todos.filter(
      (t) => !def.todos.some((dt) => dt.id === t.id),
    );
    return { ...def, todos: [...todos, ...customTodos] };
  });

  // Preserve custom courses added by user
  for (const s of saved) {
    if (!defaultMap.has(s.id)) {
      result.push({
        ...s,
        prerequisites: s.prerequisites || [],
        resources: s.resources || [],
      });
    }
  }

  return result;
}

function safeParseCourses(raw: string): Course[] {
  try {
    return normalizeCourses(JSON.parse(raw) as Course[]);
  } catch (error) {
    console.warn("Failed to parse saved courses:", error);
    return initDefaultCourses();
  }
}

function safeParseLogs(raw: string): LogEntry[] {
  try {
    return JSON.parse(raw) as LogEntry[];
  } catch (error) {
    console.warn("Failed to parse saved logs:", error);
    return [];
  }
}

export default function App() {
  const [savedCourses, setSavedCourses] = useLocalStorage<Course[]>(
    COURSES_KEY,
    initDefaultCourses,
    {
      parse: (raw) => safeParseCourses(raw),
    },
  );
  const [savedLogs, setSavedLogs] = useLocalStorage<LogEntry[]>(
    LOGS_KEY,
    () => [],
    {
      parse: (raw) => safeParseLogs(raw),
    },
  );
  const [courses, setCourses] = useState<Course[]>(savedCourses);
  const [logs, setLogs] = useState<LogEntry[]>(savedLogs);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [backupPayload, setBackupPayload] = useState<BackupPayload | null>(
    null,
  );
  const [highlightedDimension, setHighlightedDimension] = useState<
    string | null
  >(null);
  const [isDark, toggleDark] = useDarkMode();

  // 页面打开期间，每天最多一次「逾期/今天到期」浏览器通知
  useTaskReminders(courses);

  // Migrate from legacy V2 keys if V3 is empty
  useEffect(() => {
    const v3Courses = localStorage.getItem(COURSES_KEY);
    const v3Logs = localStorage.getItem(LOGS_KEY);
    if (v3Courses || v3Logs) return;

    try {
      const v2Courses = localStorage.getItem(LEGACY_COURSES_KEY);
      const v2Logs = localStorage.getItem(LEGACY_LOGS_KEY);
      if (!v2Courses && !v2Logs) return;

      const nextCourses = v2Courses
        ? normalizeCourses(JSON.parse(v2Courses) as Course[])
        : initDefaultCourses();
      const nextLogs = v2Logs ? (JSON.parse(v2Logs) as LogEntry[]) : [];
      setCourses(nextCourses);
      setLogs(nextLogs);
      setSavedCourses(nextCourses);
      setSavedLogs(nextLogs);
    } catch (error) {
      console.warn("Failed to migrate legacy data:", error);
    }
  }, [setSavedCourses, setSavedLogs]);

  useEffect(() => {
    setSavedCourses(courses);
  }, [courses, setSavedCourses]);

  useEffect(() => {
    setSavedLogs(logs);
  }, [logs, setSavedLogs]);

  // 兜底：合并“新增的默认课程”
  // localStorage 里已存有旧课程列表时，新增的默认课程只在解析（页面加载）时合并一次。
  // HMR/Fast Refresh 会保留 React state，导致新课程看不到——挂载时再合并一次即可自愈。
  useEffect(() => {
    setCourses((prev) => {
      const merged = normalizeCourses(prev);
      const same =
        merged.length === prev.length &&
        merged.every((c, i) => c.id === prev[i].id && c === prev[i]);
      return same ? prev : merged;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleTodo = useCallback((courseId: string, todoId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          todos: c.todos.map((t) =>
            t.id === todoId ? { ...t, done: !t.done } : t,
          ),
        };
      }),
    );
  }, []);

  const handleAddTodo = useCallback(
    (courseId: string, text: string, type: TodoType, dueDate?: string) => {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id !== courseId) return c;
          return {
            ...c,
            todos: [
              ...c.todos,
              {
                id: `${courseId}-t${Date.now()}`,
                text,
                type,
                done: false,
                dueDate: dueDate || undefined,
              },
            ],
          };
        }),
      );
    },
    [],
  );

  const handleSetDueDate = useCallback(
    (courseId: string, todoId: string, dueDate?: string) => {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id !== courseId) return c;
          return {
            ...c,
            todos: c.todos.map((t) =>
              t.id === todoId ? { ...t, dueDate: dueDate || undefined } : t,
            ),
          };
        }),
      );
    },
    [],
  );

  const handleDeleteTodo = useCallback((courseId: string, todoId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return { ...c, todos: c.todos.filter((t) => t.id !== todoId) };
      }),
    );
  }, []);

  const handleSaveLog = useCallback((entry: LogEntry) => {
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.id === entry.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = entry;
        return next;
      }
      return [...prev, entry];
    });
    setEditingLog(null);
  }, []);

  const handleEditLog = useCallback((log: LogEntry) => {
    setEditingLog(log);
    const form = document.getElementById("daily-log-form");
    form?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleDeleteLog = useCallback((id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const handleBatchDeleteLogs = useCallback((ids: string[]) => {
    setLogs((prev) => prev.filter((l) => !ids.includes(l.id)));
  }, []);

  const handleReorderTodos = useCallback(
    (courseId: string, newTodos: Todo[]) => {
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, todos: newTodos } : c)),
      );
    },
    [],
  );

  const handleExport = useCallback(() => {
    const data: AppData = {
      courses,
      logs,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cs-ai-agent-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [courses, logs]);

  const handleImport = useCallback((data: AppData) => {
    if (data.courses) {
      // Merge imported progress with current default structure to avoid missing new todos
      const defaultCourses = initDefaultCourses();
      const merged = defaultCourses.map((def) => {
        const imported = data.courses.find((c) => c.id === def.id);
        if (!imported) return def;
        const todos = def.todos.map((dt) => {
          const it = imported.todos.find((t) => t.id === dt.id);
          return it ? { ...dt, done: it.done, dueDate: it.dueDate } : dt;
        });
        // Preserve any custom todos from import that are not in default
        const customTodos = imported.todos.filter(
          (t) => !def.todos.some((dt) => dt.id === t.id),
        );
        return { ...def, todos: [...todos, ...customTodos] };
      });
      setCourses(merged);
    }
    if (data.logs) {
      setLogs(data.logs);
    }
  }, []);

  const handleBackup = useCallback(() => {
    const payload = generateBackupContent(courses, logs);
    setBackupPayload(payload);
  }, [courses, logs]);

  const handleSelectCourseFromPath = useCallback((courseId: string) => {
    const element = document.getElementById(`course-${courseId}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    element?.classList.add("ring-2", "ring-brand-400");
    setTimeout(
      () => element?.classList.remove("ring-2", "ring-brand-400"),
      1500,
    );
  }, []);

  const { pct: progressPct } = overallProgress(courses);

  return (
    <div className="min-h-screen pb-20 relative">
      <ThemeBackground />
      <ScrollProgress />
      <Header
        onExport={handleExport}
        onImport={handleImport}
        onBackup={handleBackup}
        isDark={isDark}
        onToggleDark={toggleDark}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:flex lg:items-start lg:gap-6">
        <Sidebar progressPct={progressPct} />

        <main className="flex-1 min-w-0 space-y-6">
          <MyGoHero />
          <section id="section-today" className="scroll-mt-24">
            <Reveal>
              <TodayFocus
                courses={courses}
                logs={logs}
                onToggleTodo={handleToggleTodo}
                onJumpToCourse={handleSelectCourseFromPath}
              />
            </Reveal>
          </section>
          <section id="section-overview" className="scroll-mt-24">
            <Reveal>
              <StatsCards courses={courses} logs={logs} />
            </Reveal>
          </section>

          <Suspense fallback={<LazySectionFallback />}>
            <ErrorBoundary>
              <section id="section-radar" className="scroll-mt-24">
                <Reveal>
                  <RadarChart
                    courses={courses}
                    highlightedDimension={highlightedDimension}
                  />
                </Reveal>
              </section>
            </ErrorBoundary>
            <ErrorBoundary>
              <section id="section-trend" className="scroll-mt-24">
                <Reveal>
                  <TrendStats courses={courses} logs={logs} />
                </Reveal>
              </section>
            </ErrorBoundary>
            <ErrorBoundary>
              <section id="section-heatmap" className="scroll-mt-24">
                <Reveal>
                  <Heatmap logs={logs} days={365} />
                </Reveal>
              </section>
            </ErrorBoundary>
            <ErrorBoundary>
              <section id="section-path" className="scroll-mt-24">
                <Reveal>
                  <LearningPath
                    courses={courses}
                    onSelectCourse={handleSelectCourseFromPath}
                  />
                </Reveal>
              </section>
            </ErrorBoundary>
          </Suspense>

          <ErrorBoundary>
            <section id="section-courses" className="scroll-mt-24">
              <Reveal>
                <CourseList
                  courses={courses}
                  onToggleTodo={handleToggleTodo}
                  onAddTodo={handleAddTodo}
                  onDeleteTodo={handleDeleteTodo}
                  onSetDueDate={handleSetDueDate}
                  onReorderTodos={handleReorderTodos}
                  onHighlightDimension={setHighlightedDimension}
                />
              </Reveal>
            </section>
          </ErrorBoundary>

          <div id="daily-log-form">
            <section id="section-daily" className="scroll-mt-24">
              <Reveal>
                <DailyLogForm
                  courses={courses}
                  editingLog={editingLog}
                  onSave={handleSaveLog}
                  onCancelEdit={() => setEditingLog(null)}
                />
              </Reveal>
            </section>
          </div>

          <ErrorBoundary>
            <section id="section-logs" className="scroll-mt-24">
              <Reveal>
                <LogList
                  courses={courses}
                  logs={logs}
                  onEdit={handleEditLog}
                  onDelete={handleDeleteLog}
                  onBatchDelete={handleBatchDeleteLogs}
                />
              </Reveal>
            </section>
          </ErrorBoundary>
        </main>
      </div>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-slate-400">
        数据保存在浏览器本地（localStorage）。重要进度请定期导出备份。
      </footer>

      <MobileNav />
      <BackToTop />

      <Suspense fallback={null}>
        <BackupModal
          payload={backupPayload}
          onClose={() => setBackupPayload(null)}
        />
      </Suspense>
    </div>
  );
}
