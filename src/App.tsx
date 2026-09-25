import { useState, useEffect, useCallback, Suspense, lazy } from "react";
import type { AppData, Course, ImportResult, LogEntry, Todo, TodoType } from "./types";
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
import { SignatureMoment } from "./components/SignatureMoment";
import { MobileNav } from "./components/MobileNav";
import { ScrollProgress } from "./components/ScrollProgress";
import { TodayFocus } from "./components/TodayFocus";
import { useTaskReminders } from "./hooks/useTaskReminders";
import { useToast } from "./hooks/useToast";
import { ThemeBackground, MyGoHero } from "./components/ThemeBackground";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LazySectionFallback } from "./components/LazyLoad";
import { GlassThemeProvider } from "./components/glass/GlassSurface";
import { today, uuid, overallProgress, smoothScrollTo } from "./utils/helpers";
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
const LAST_BACKUP_KEY = "csAiAgentLastBackupAt";
/** 任务完成自动记时的固定学时（spec：固定 2 小时，不做配置项） */
const AUTO_LOG_HOURS = 2;

// 解析失败过的 key：挂载合并时跳过写回，避免用 fallback 覆盖损坏原文
const corruptKeys = new Set<string>();
let corruptToastShown = false;
// 配额/写入失败提示：每个 key 每个会话只提醒一次
const writeErrorNotified = new Set<string>();

function backupCorrupt(key: string, raw: string): void {
  try {
    let target = `${key}.corrupt`;
    if (window.localStorage.getItem(target) !== null) {
      target = `${key}.corrupt.${Date.now()}`;
    }
    window.localStorage.setItem(target, raw);
  } catch {
    // 备份失败不阻断：主流程已回退到安全值
  }
}

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
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("courses is not an array");
    return normalizeCourses(parsed as Course[]);
  } catch (error) {
    console.warn("Failed to parse saved courses:", error);
    corruptKeys.add(COURSES_KEY);
    backupCorrupt(COURSES_KEY, raw);
    return initDefaultCourses();
  }
}

function safeParseLogs(raw: string): LogEntry[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("logs is not an array");
    return parsed as LogEntry[];
  } catch (error) {
    console.warn("Failed to parse saved logs:", error);
    corruptKeys.add(LOGS_KEY);
    backupCorrupt(LOGS_KEY, raw);
    return [];
  }
}

/** 结构校验导入数据；合法返回 null，否则返回具体的中文错误说明 */
function validateAppData(data: unknown): string | null {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return "根节点必须是 JSON 对象";
  }
  const d = data as { courses?: unknown; logs?: unknown };
  if (d.courses === undefined && d.logs === undefined) {
    return "缺少 courses / logs 字段";
  }
  if (d.courses !== undefined) {
    if (!Array.isArray(d.courses)) return "courses 必须是数组";
    for (const c of d.courses) {
      if (
        typeof c !== "object" ||
        c === null ||
        typeof (c as { id?: unknown }).id !== "string" ||
        !Array.isArray((c as { todos?: unknown }).todos)
      ) {
        return "课程项缺少 id 或 todos 字段";
      }
    }
  }
  if (d.logs !== undefined) {
    if (!Array.isArray(d.logs)) return "logs 必须是数组";
    for (const l of d.logs) {
      if (
        typeof l !== "object" ||
        l === null ||
        typeof (l as { id?: unknown }).id !== "string" ||
        typeof (l as { date?: unknown }).date !== "string"
      ) {
        return "日志项缺少 id 或 date 字段";
      }
    }
  }
  return null;
}

export default function App() {
  const { toast } = useToast();
  const notifyWriteError = useCallback(() => {
    // courses/logs 共用一条提示，每会话只提醒一次
    if (writeErrorNotified.has("any")) return;
    writeErrorNotified.add("any");
    toast("保存失败，浏览器存储可能已满，请立即导出备份", { duration: 8000 });
  }, [toast]);
  const [courses, setCourses] = useLocalStorage<Course[]>(
    COURSES_KEY,
    initDefaultCourses,
    {
      parse: (raw) => safeParseCourses(raw),
      onWriteError: notifyWriteError,
    },
  );
  const [logs, setLogs] = useLocalStorage<LogEntry[]>(
    LOGS_KEY,
    () => [],
    {
      parse: (raw) => safeParseLogs(raw),
      onWriteError: notifyWriteError,
    },
  );
  const [lastBackupAt, setLastBackupAt] = useLocalStorage<string | null>(
    LAST_BACKUP_KEY,
    () => null,
  );
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

  // 有 key 解析失败过：一次性告知用户（原始值已备份到 *.corrupt）
  useEffect(() => {
    if (corruptKeys.size === 0 || corruptToastShown) return;
    corruptToastShown = true;
    toast("本地数据解析失败，原始值已备份到 *.corrupt 键，本次先展示默认内容", {
      duration: 8000,
    });
  }, [toast]);

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
    } catch (error) {
      console.warn("Failed to migrate legacy data:", error);
    }
  }, [setCourses, setLogs]);

  // 兜底：合并“新增的默认课程”
  // localStorage 里已存有旧课程列表时，新增的默认课程只在解析（页面加载）时合并一次。
  // HMR/Fast Refresh 会保留 React state，导致新课程看不到——挂载时再合并一次即可自愈。
  // 解析失败过的 key 必须跳过，否则会把 fallback 写回、覆盖损坏原文。
  useEffect(() => {
    if (corruptKeys.has(COURSES_KEY)) return;
    setCourses((prev) => {
      const merged = normalizeCourses(prev);
      const same =
        merged.length === prev.length &&
        merged.every((c, i) => c.id === prev[i].id && c === prev[i]);
      return same ? prev : merged;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 玻璃指针追光：光源坐标写入 CSS 变量（约 25fps 节流，避免玻璃层逐帧重绘）
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    let raf = 0;
    let last = 0;
    const onPointerMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const now = performance.now();
        if (now - last < 40) return;
        last = now;
        const root = document.documentElement;
        root.style.setProperty("--glass-light-x", `${e.clientX}px`);
        root.style.setProperty("--glass-light-y", `${e.clientY}px`);
      });
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const handleToggleTodo = useCallback(
    (courseId: string, todoId: string) => {
      const course = courses.find((c) => c.id === courseId);
      const todo = course?.todos.find((t) => t.id === todoId);
      if (!course || !todo) return;
      const nowDone = !todo.done;

      setCourses((prev) =>
        prev.map((c) => {
          if (c.id !== courseId) return c;
          return {
            ...c,
            todos: c.todos.map((t) =>
              t.id === todoId ? { ...t, done: nowDone } : t,
            ),
          };
        }),
      );

      // 今日日志联动：完成 +2h（无日志自动创建），取消 −2h（下限 0）
      const date = today();
      const hasTodayLog = logs.some((l) => l.date === date);
      setLogs((prev) => {
        const idx = prev.findIndex((l) => l.date === date);
        if (nowDone) {
          if (idx === -1) {
            const created: LogEntry = {
              id: uuid(),
              date,
              course: `${course.phase} — ${course.name}`,
              hours: AUTO_LOG_HOURS,
              mood: "productive",
              knowledge: `任务完成自动记时：${todo.text}`,
              lab: "",
              questions: "",
              reflection: "",
              createdAt: new Date().toISOString(),
            };
            return [...prev, created];
          }
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            hours: (Number(next[idx].hours) || 0) + AUTO_LOG_HOURS,
          };
          return next;
        }
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          hours: Math.max(
            0,
            (Number(next[idx].hours) || 0) - AUTO_LOG_HOURS,
          ),
        };
        return next;
      });

      const label =
        todo.text.length > 16 ? `${todo.text.slice(0, 16)}…` : todo.text;
      if (nowDone) {
        toast(`已完成「${label}」，今日 +${AUTO_LOG_HOURS} 学时`);
      } else if (hasTodayLog) {
        // 下限 0：实际扣减可能不足 2，提示必须与落地学时一致
        const current =
          Number(logs.find((l) => l.date === date)?.hours) || 0;
        const cut = Math.min(AUTO_LOG_HOURS, current);
        toast(
          cut > 0
            ? `已取消完成「${label}」，今日 −${cut} 学时`
            : `已取消完成「${label}」，今日学时已是 0`,
        );
      } else {
        toast(`已取消完成「${label}」，今日暂无可扣回的学时`);
      }
    },
    [courses, logs, setCourses, setLogs, toast],
  );

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

  const handleDeleteTodo = useCallback(
    (courseId: string, todoId: string) => {
      const course = courses.find((c) => c.id === courseId);
      const index = course?.todos.findIndex((t) => t.id === todoId) ?? -1;
      if (!course || index < 0) return;
      const removed = course.todos[index];
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? { ...c, todos: c.todos.filter((t) => t.id !== todoId) }
            : c,
        ),
      );
      const label =
        removed.text.length > 16 ? `${removed.text.slice(0, 16)}…` : removed.text;
      toast(`已删除任务「${label}」`, {
        action: {
          label: "撤销",
          onAction: () =>
            setCourses((prev) =>
              prev.map((c) => {
                if (c.id !== courseId || c.todos.some((t) => t.id === removed.id))
                  return c;
                const next = [...c.todos];
                next.splice(Math.min(index, next.length), 0, removed);
                return { ...c, todos: next };
              }),
            ),
        },
      });
    },
    [courses, setCourses, toast],
  );

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
    smoothScrollTo("daily-log-form", { block: "start" });
  }, []);

  const handleDeleteLog = useCallback(
    (id: string) => {
      const index = logs.findIndex((l) => l.id === id);
      if (index < 0) return;
      const removed = logs[index];
      setLogs((prev) => prev.filter((l) => l.id !== id));
      toast("已删除 1 条日志", {
        action: {
          label: "撤销",
          onAction: () =>
            setLogs((prev) => {
              if (prev.some((l) => l.id === removed.id)) return prev;
              const next = [...prev];
              next.splice(Math.min(index, next.length), 0, removed);
              return next;
            }),
        },
      });
    },
    [logs, setLogs, toast],
  );

  const handleBatchDeleteLogs = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      const removed = logs.filter((l) => idSet.has(l.id));
      if (removed.length === 0) return;
      setLogs((prev) => prev.filter((l) => !idSet.has(l.id)));
      toast(`已删除 ${removed.length} 条日志`, {
        action: {
          label: "撤销",
          onAction: () =>
            setLogs((prev) => {
              const existing = new Set(prev.map((l) => l.id));
              const restored = removed.filter((r) => !existing.has(r.id));
              return restored.length > 0 ? [...prev, ...restored] : prev;
            }),
        },
      });
    },
    [logs, setLogs, toast],
  );

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
    setLastBackupAt(new Date().toISOString());
  }, [courses, logs, setLastBackupAt]);

  const handleImport = useCallback(
    (data: AppData): ImportResult => {
      const error = validateAppData(data);
      if (error) return { ok: false, error };
      if (data.courses) setCourses(normalizeCourses(data.courses));
      if (data.logs) setLogs(data.logs);
      return {
        ok: true,
        courseCount: data.courses ? data.courses.length : null,
        logCount: data.logs ? data.logs.length : null,
      };
    },
    [setCourses, setLogs],
  );

  const handleBackup = useCallback(() => {
    const payload = generateBackupContent(courses, logs);
    setBackupPayload(payload);
    setLastBackupAt(new Date().toISOString());
  }, [courses, logs, setLastBackupAt]);

  const handleSelectCourseFromPath = useCallback((courseId: string) => {
    const element = document.getElementById(`course-${courseId}`);
    if (element) smoothScrollTo(element, { block: "center" });
    element?.classList.add("ring-2", "ring-brand-400");
    setTimeout(
      () => element?.classList.remove("ring-2", "ring-brand-400"),
      1500,
    );
  }, []);

  const { pct: progressPct } = overallProgress(courses);

  return (
    // load-in 挂在 Header 与布局容器上（不含 ScrollProgress/MobileNav/BackToTop 等
    // fixed 元素）：根节点带 transform 期间会成为 fixed 的包含块，首屏把底栏拉出视口
    <GlassThemeProvider value={isDark}>
    <div className="min-h-screen pb-20 relative">
      <ThemeBackground />
      <ScrollProgress />
      <Header
        onExport={handleExport}
        onImport={handleImport}
        onBackup={handleBackup}
        lastBackupAt={lastBackupAt}
        isDark={isDark}
        onToggleDark={toggleDark}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:flex lg:items-start lg:gap-6 animate-load-in">
        <Sidebar progressPct={progressPct} />

        <main className="flex-1 min-w-0 space-y-6">
          <MyGoHero />
          <section id="section-today" className="scroll-mt-24">
            <TodayFocus
              courses={courses}
              logs={logs}
              onToggleTodo={handleToggleTodo}
              onJumpToCourse={handleSelectCourseFromPath}
            />
          </section>
          <section id="section-overview" className="scroll-mt-24">
            <StatsCards courses={courses} logs={logs} />
          </section>

          <Suspense fallback={<LazySectionFallback />}>
            <ErrorBoundary>
              <section id="section-radar" className="scroll-mt-24">
                <RadarChart
                  courses={courses}
                  highlightedDimension={highlightedDimension}
                />
              </section>
            </ErrorBoundary>
            <ErrorBoundary>
              <section id="section-trend" className="scroll-mt-24">
                <TrendStats courses={courses} logs={logs} />
              </section>
            </ErrorBoundary>
            <ErrorBoundary>
              <section id="section-heatmap" className="scroll-mt-24">
                <Heatmap logs={logs} days={365} />
              </section>
            </ErrorBoundary>
            <ErrorBoundary>
              <section id="section-path" className="scroll-mt-24">
                <LearningPath
                  courses={courses}
                  onSelectCourse={handleSelectCourseFromPath}
                />
              </section>
            </ErrorBoundary>
          </Suspense>

          <ErrorBoundary>
            <section id="section-courses" className="scroll-mt-24">
              <CourseList
                courses={courses}
                onToggleTodo={handleToggleTodo}
                onAddTodo={handleAddTodo}
                onDeleteTodo={handleDeleteTodo}
                onSetDueDate={handleSetDueDate}
                onReorderTodos={handleReorderTodos}
                onHighlightDimension={setHighlightedDimension}
              />
            </section>
          </ErrorBoundary>

          <div id="daily-log-form">
            <section id="section-daily" className="scroll-mt-24">
              <DailyLogForm
                courses={courses}
                editingLog={editingLog}
                onSave={handleSaveLog}
                onCancelEdit={() => setEditingLog(null)}
              />
            </section>
          </div>

          <ErrorBoundary>
            <section id="section-logs" className="scroll-mt-24">
              <LogList
                courses={courses}
                logs={logs}
                onEdit={handleEditLog}
                onDelete={handleDeleteLog}
                onBatchDelete={handleBatchDeleteLogs}
              />
            </section>
          </ErrorBoundary>
        </main>
      </div>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-slate-400">
        数据保存在浏览器本地（localStorage）。重要进度请定期导出备份。
      </footer>

      <MobileNav />
      <BackToTop />
      <SignatureMoment courses={courses} logs={logs} />

      <Suspense fallback={null}>
        <BackupModal
          payload={backupPayload}
          onClose={() => setBackupPayload(null)}
        />
      </Suspense>
    </div>
    </GlassThemeProvider>
  );
}
