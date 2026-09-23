import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Pencil, Trash2, BookOpen, X, CheckSquare, Square } from 'lucide-react';
import type { Course, LogEntry } from '../types';
import { moodLabel } from '../utils/helpers';
import { EmptyState } from './EmptyState';
import { MOTION } from '../motion/tokens';

interface LogListProps {
  courses: Course[];
  logs: LogEntry[];
  onEdit: (log: LogEntry) => void;
  onDelete: (id: string) => void;
  onBatchDelete: (ids: string[]) => void;
}

export function LogList({ courses, logs, onEdit, onDelete, onBatchDelete }: LogListProps) {
  const [filter, setFilter] = useState('');
  const [query, setQuery] = useState('');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = logs.filter(l => {
      // 与 DailyLogForm 存储格式一致的全串精确匹配（phase — name）
      if (filter && l.course !== filter) return false;
      if (!q) return true;
      return [l.course, l.date, l.knowledge, l.lab, l.questions, l.reflection].some(
        v => (v ?? '').toLowerCase().includes(q),
      );
    });
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, filter, query]);

  const hasCriteria = Boolean(filter || query.trim());

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(l => l.id)));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`确定删除 ${selectedIds.size} 条日志？`)) return;
    onBatchDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
    setIsBatchMode(false);
  };

  const exitBatchMode = () => {
    setIsBatchMode(false);
    setSelectedIds(new Set());
  };

  return (
    <section className="card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-semibold">学习日志</h2>
          {isBatchMode && (
            <span className="text-xs px-2 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300 font-medium">
              已选 {selectedIds.size}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isBatchMode ? (
            <>
              <button
                onClick={toggleAll}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800 transition-colors"
              >
                {selectedIds.size === filtered.length && filtered.length > 0 ? (
                  <CheckSquare className="w-3.5 h-3.5" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                全选
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={selectedIds.size === 0}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> 删除 ({selectedIds.size})
              </button>
              <button
                onClick={exitBatchMode}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> 取消
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsBatchMode(true)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800 transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5" /> 批量管理
            </button>
          )}
          <input
            type="search"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIds(new Set());
            }}
            placeholder="搜索日志…"
            aria-label="搜索学习日志"
            className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-full sm:w-auto sm:min-w-[9rem]"
          />
          <select
            value={filter}
            onChange={e => {
              setFilter(e.target.value);
              setSelectedIds(new Set());
            }}
            aria-label="按课程筛选日志"
            className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-full sm:w-auto"
          >
            <option value="">全部课程</option>
            {courses.map(c => (
              <option key={c.id} value={`${c.phase} — ${c.name}`}>
                {c.phase} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={hasCriteria ? '没有匹配的日志' : '还没有学习日志'}
            description={
              hasCriteria
                ? '换个关键词或课程筛选试试，或清空条件看全部。'
                : '完成一项任务后，来这里记录今天的知识点、Lab 和反思。'
            }
            action={
              !hasCriteria
                ? {
                    label: '去写日志',
                    onClick: () => {
                      document.getElementById('daily-log-form')?.scrollIntoView({ behavior: 'smooth' });
                    },
                  }
                : undefined
            }
          />
        ) : (
          <AnimatePresence>
            {filtered.map((log, index) => (
              <LogItem
                key={log.id}
                log={log}
                index={index}
                isBatchMode={isBatchMode}
                isSelected={selectedIds.has(log.id)}
                onToggleSelect={() => toggleSelection(log.id)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}

interface LogItemProps {
  log: LogEntry;
  index: number;
  isBatchMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: (log: LogEntry) => void;
  onDelete: (id: string) => void;
}

function LogItem({ log, index, isBatchMode, isSelected, onToggleSelect, onEdit, onDelete }: LogItemProps) {
  const enterDelay = Math.min(index, 6) * (MOTION.stagger.step / 1000);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: MOTION.duration.base / 1000, ease: MOTION.ease.out, delay: enterDelay },
      }}
      exit={{
        opacity: 0,
        x: -24,
        height: 0,
        marginBottom: 0,
        transition: { duration: MOTION.duration.base / 1000, ease: MOTION.ease.out },
      }}
      transition={{ duration: MOTION.duration.base / 1000, ease: MOTION.ease.out }}
      className={`bg-slate-50/70 dark:bg-slate-800/70 rounded-xl border p-4 sm:p-5 transition-colors ${
        isSelected ? 'border-brand-300 bg-brand-50/50' : 'border-slate-200/80 dark:border-slate-700/80'
      }`}
      onClick={isBatchMode ? onToggleSelect : undefined}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {isBatchMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={e => {
                e.stopPropagation();
                onToggleSelect();
              }}
              aria-label={`选择 ${log.date} 的日志`}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
          )}
          <span className="px-3 py-1 bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300 text-xs font-semibold rounded-lg">{log.date}</span>
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{log.course}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{log.hours}h · {moodLabel(log.mood)}</span>
        </div>
        {!isBatchMode && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit(log)}
              className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              <Pencil className="w-3.5 h-3.5" /> 编辑
            </button>
            <button
              onClick={() => onDelete(log.id)}
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" /> 删除
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
        <FieldBox label="📚 知识点" content={log.knowledge} />
        <FieldBox label="🛠️ Lab" content={log.lab} />
        <FieldBox label="❓ 问题反馈" content={log.questions} />
      </div>

      {log.reflection && (
        <div className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200/80 dark:border-slate-700/80">
          <span className="font-semibold">💡 反思：</span>
          <span className="whitespace-pre-line">{log.reflection}</span>
        </div>
      )}
    </motion.div>
  );
}

function FieldBox({ label, content }: { label: string; content: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200/80 dark:border-slate-700/80">
      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</div>
      <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{content}</div>
    </div>
  );
}
