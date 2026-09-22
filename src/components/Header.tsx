import { Download, Upload, Cloud, Sun, Moon } from 'lucide-react';
import type { AppData } from '../types';

interface HeaderProps {
  onExport: () => void;
  onImport: (data: AppData) => void;
  onBackup: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export function Header({ onExport, onImport, onBackup, isDark, onToggleDark }: HeaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target?.result as string) as AppData;
        onImport(data);
        alert('导入成功');
      } catch {
        alert('导入失败：文件格式错误');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="bg-white/80 backdrop-blur border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src={`${import.meta.env.BASE_URL}MyGO!!!!!_logo.png`}
            alt="MyGO!!!!!"
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
          <button
            onClick={onToggleDark}
            title={isDark ? '切换到亮色模式' : '切换到暗色模式'}
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