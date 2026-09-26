import { useState } from 'react';
import { motion } from 'framer-motion';
import { Skull, Map } from 'lucide-react';
import type { Dungeon } from '../utils/rpg';
import { MOTION } from '../motion/tokens';

interface DungeonPanelProps {
  dungeons: Dungeon[];
}

/** 副本讨伐记录：默认只显示有进度的副本，可切换全量 */
export function DungeonPanel({ dungeons }: DungeonPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? dungeons : dungeons.filter(d => d.cleared > 0);
  const fullClear = dungeons.filter(d => d.cleared === d.total && d.total > 0).length;

  return (
    <div className="card p-4" data-testid="rpg-dungeons">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 inline-flex items-center gap-1.5">
          <Map className="w-4 h-4 text-brand-500" />
          副本讨伐
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {fullClear}/{dungeons.length} 全通
          </span>
          <button
            type="button"
            data-testid="rpg-dungeon-toggle"
            aria-pressed={showAll}
            onClick={() => setShowAll(v => !v)}
            className="btn btn--quiet px-2.5 py-1 text-xs"
          >
            {showAll ? '只看有进度' : `显示全部 ${dungeons.length} 个`}
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
          还没有副本通关记录——完成 lab 任务，第一座副本在等你。
        </p>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {visible.map(d => {
            const boss = d.stages.find(s => s.boss);
            const pct = d.total > 0 ? (d.cleared / d.total) * 100 : 0;
            const bossCleared = !!boss?.cleared;
            return (
              <div
                key={d.id}
                data-testid={`rpg-dungeon-${d.id}`}
                className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-100/80 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 truncate">
                    {d.region}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 tabular-nums shrink-0">
                    {d.cleared}/{d.total}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  {d.name}
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-brand-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: MOTION.duration.draw / 1000, ease: MOTION.ease.out }}
                  />
                </div>
                {boss && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs">
                    <Skull
                      className={`w-3.5 h-3.5 shrink-0 ${
                        bossCleared ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <span
                      className={`truncate ${
                        bossCleared
                          ? 'text-slate-700 dark:text-slate-300 font-medium'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {bossCleared ? boss.name : '???'}
                    </span>
                    {bossCleared && (
                      <span className="text-emerald-600 dark:text-emerald-400 shrink-0">已讨伐</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
