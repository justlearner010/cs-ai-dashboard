import type { LucideIcon } from 'lucide-react';
import { Dumbbell, Sword, Wind, Brain, HeartPulse, Eye, Sparkles } from 'lucide-react';
import type { AttrKey } from '../utils/attrs';
import { ATTR_KEYS, ATTR_LABELS } from '../utils/attrs';

const ATTR_ICON: Record<AttrKey, LucideIcon> = {
  str: Sword,
  agi: Wind,
  int: Brain,
  sta: HeartPulse,
  per: Eye,
  cha: Sparkles,
};

interface AttributePanelProps {
  allocated: Record<AttrKey, number>;
  unspent: number;
  onInc: (key: AttrKey) => void;
  onDec: (key: AttrKey) => void;
  onReset: () => void;
  className?: string;
}

/** 属性加点：点数由 level 派生，+/− 手动分配，洗点守恒归零（纯展示不回写） */
export function AttributePanel({
  allocated,
  unspent,
  onInc,
  onDec,
  onReset,
  className = '',
}: AttributePanelProps) {
  const spent = ATTR_KEYS.reduce((s, k) => s + allocated[k], 0);

  return (
    <div className={`card p-4 ${className}`} data-testid="rpg-attrs">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 inline-flex items-center gap-1.5">
          <Dumbbell className="w-4 h-4 text-brand-500" />
          属性加点
        </h3>
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-full bg-brand-100/80 dark:bg-brand-900/40 text-xs font-medium text-brand-700 dark:text-brand-300 tabular-nums"
            data-testid="rpg-attr-unspent"
          >
            可用点数 {unspent}
          </span>
          <button
            type="button"
            data-testid="rpg-attr-reset"
            disabled={spent === 0}
            onClick={onReset}
            className="btn btn--quiet px-2.5 py-1 text-xs disabled:opacity-40"
          >
            洗点
          </button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1" data-testid="rpg-attr-rows">
        {ATTR_KEYS.map(key => {
          const Icon = ATTR_ICON[key];
          const label = ATTR_LABELS[key];
          const value = allocated[key];
          return (
            <div
              key={key}
              data-testid={`rpg-attr-row-${key}`}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60"
            >
              <Icon className="w-4 h-4 shrink-0 text-brand-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300 shrink-0 w-9">{label}</span>
              <span
                className="flex-1 text-right text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums"
                data-testid={`rpg-attr-value-${key}`}
              >
                {value}
              </span>
              <button
                type="button"
                aria-label={`减少${label}`}
                disabled={value === 0}
                onClick={() => onDec(key)}
                className="btn btn--quiet px-2.5 py-1 text-xs disabled:opacity-40"
              >
                −
              </button>
              <button
                type="button"
                aria-label={`增加${label}`}
                disabled={unspent === 0}
                onClick={() => onInc(key)}
                className="btn px-2.5 py-1 text-xs btn--accent disabled:opacity-40"
              >
                +
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
