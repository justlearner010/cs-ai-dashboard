import { Download, Upload, Cloud, Sun, Moon } from 'lucide-react';
import type { AppData, ImportResult } from '../types';

interface HeaderProps {
  onExport: () => void;
  onImport: (data: AppData) => ImportResult;
  onBackup: () => void;
  lastBackupAt: string | null;
  isDark: boolean;
  onToggleDark: () => void;
}

const BACKUP_INTERVAL_MS = 14 * 24 * 60 * 60 * 1000;

export function Header({ onExport, onImport, onBackup, lastBackupAt, isDark, onToggleDark }: HeaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target?.result as string) as AppData;
        const result = onImport(data);
        if (result.ok) {
          const parts: string[] = [];
          if (result.courseCount !== null) parts.push(`${result.courseCount} 门课`);
          if (result.logCount !== null) parts.push(`${result.logCount} 条日志`);
          alert(parts.length > 0 ? `导入成功：${parts.join('、')}` : '导入成功');
        } else {
          alert(`导入失败：${result.error}`);
        }
      } catch {
        alert('导入失败：文件格式错误');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const backupTs = Date.parse(lastBackupAt ?? '');
  const needsBackup = Number.isNaN(backupTs) || Date.now() - backupTs > BACKUP_INTERVAL_MS;

  return (
    <header className="bg-white/80 backdrop-blur border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src={`${import.meta.env.BASE_URL}MyGO!!!!!_logo.png`}
            alt="MyGO!!!!!"
            width={980}
            height={480}
            className="h-10 sm:h-12 w-auto object-contain shrink-0"
            loading="eager"
            draggable={false}
            onError={e => {
              // 图片加载失败时退回占位图标
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
              从零开始的Coding生活
              <span className="text-xs font-medium text-brand-600 dark:text-brand-300 whitespace-nowrap hidden md:inline">
                ♪ MyGO Theme
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">多源优质课程 · 知识点 + Lab + 问题反馈 · 实时进度</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {needsBackup && (
            <span
              title="超过 14 天未导出备份，重要进度可能有丢失风险"
              className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 whitespace-nowrap"
            >
              久未备份
            </span>
          )}
          <button
            onClick={onToggleDark}
            title={isDark ? '切换到亮色模式' : '切换到暗色模式'}
            aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
            className="inline-flex items-center justify-center p-2 rounded-lg text-sm font-medium bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={onBackup}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 hover:scale-105 active:scale-95 transition-all dark:bg-brand-900/40 dark:text-brand-300 dark:border-brand-800 dark:hover:bg-brand-900/60"
          >
            <Cloud className="w-4 h-4" />
            <span className="hidden sm:inline">飞书备份</span>
          </button>
          <button
            onClick={onExport}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">导出</span>
          </button>
          <label className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">导入</span>
            <input type="file" className="hidden" accept=".json" onChange={handleFileChange} />
          </label>
        </div>
      </div>
    </header>
  );
}