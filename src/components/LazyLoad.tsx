import { Loader2 } from 'lucide-react';

export function LazySectionFallback() {
  return (
    <div className="card p-10 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">加载中…</span>
    </div>
  );
}
