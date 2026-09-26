import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Sword, Shield, HardHat, Footprints, Gem, ScrollText, Backpack } from 'lucide-react';
import type { RpgItem, Rarity, Slot } from '../utils/rpg';
import { SLOTS, SLOT_LABELS, RARITY_LABELS } from '../utils/rpg';

const SLOT_ICON: Record<Slot, LucideIcon> = {
  weapon: Sword,
  armor: Shield,
  helm: HardHat,
  boots: Footprints,
  trinket: Gem,
};

const RARITY_TEXT: Record<Rarity, string> = {
  common: 'text-slate-500 dark:text-slate-400',
  fine: 'text-sky-600 dark:text-sky-400',
  rare: 'text-violet-600 dark:text-violet-400',
  legendary: 'text-amber-600 dark:text-amber-400',
};

const RARITY_BG: Record<Rarity, string> = {
  common: 'bg-slate-100 dark:bg-slate-800',
  fine: 'bg-sky-50 dark:bg-sky-950/50',
  rare: 'bg-violet-50 dark:bg-violet-950/50',
  legendary: 'bg-amber-50 dark:bg-amber-950/50',
};

const RARITY_RANK_ORDER: Record<Rarity, number> = { legendary: 3, rare: 2, fine: 1, common: 0 };

type InventoryFilter = 'all' | Slot | 'scroll';

const FILTERS: { key: InventoryFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  ...SLOTS.map(s => ({ key: s as InventoryFilter, label: SLOT_LABELS[s] })),
  { key: 'scroll', label: '卷轴' },
];

interface SlotsProps {
  catalog: RpgItem[];
  loadout: Partial<Record<Slot, string>>;
  onUnequip: (slot: Slot) => void;
}

/** 顶栏装备栏 5 格：已穿戴可点击卸下，空格只展示占位 */
export function EquipmentSlots({ catalog, loadout, onUnequip }: SlotsProps) {
  const byId = new Map(catalog.map(i => [i.id, i]));
  return (
    <div className="flex flex-wrap gap-2" data-testid="rpg-slots">
      {SLOTS.map(slot => {
        const item = loadout[slot] ? byId.get(loadout[slot]!) : undefined;
        const Icon = SLOT_ICON[slot];
        return (
          <button
            key={slot}
            type="button"
            data-testid={`rpg-slot-${slot}`}
            disabled={!item}
            onClick={() => item && onUnequip(slot)}
            title={item ? `点击卸下「${item.name}」` : SLOT_LABELS[slot]}
            aria-label={item ? `卸下${item.name}` : SLOT_LABELS[slot]}
            className={
              item
                ? 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 hover:border-brand-300 dark:hover:border-brand-700 transition-colors text-left min-w-0'
                : 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 cursor-default'
            }
          >
            <Icon className={`w-4 h-4 shrink-0 ${item ? RARITY_TEXT[item.rarity] : ''}`} />
            <span className="min-w-0">
              <span className="block text-[10px] leading-tight text-slate-500 dark:text-slate-400">
                {SLOT_LABELS[slot]}
              </span>
              {item ? (
                <span className={`block text-xs font-medium truncate ${RARITY_TEXT[item.rarity]}`}>
                  {item.name}
                </span>
              ) : (
                <span className="block text-xs">空</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface PanelProps {
  catalog: RpgItem[];
  doneIds: ReadonlySet<string>;
  loadout: Partial<Record<Slot, string>>;
  onEquip: (item: RpgItem) => void;
}

/** 背包图鉴：已解锁未穿戴，槽位筛选 + 稀有度降序，滚动容器 */
export function EquipmentPanel({ catalog, doneIds, loadout, onEquip }: PanelProps) {
  const [filter, setFilter] = useState<InventoryFilter>('all');
  const equippedIds = new Set(Object.values(loadout));
  const unlocked = catalog.filter(i => doneIds.has(i.id) && !equippedIds.has(i.id));
  const visible = unlocked
    .filter(i => {
      if (filter === 'all') return true;
      if (filter === 'scroll') return i.kind === 'scroll';
      return i.slot === filter;
    })
    .sort((a, b) => RARITY_RANK_ORDER[b.rarity] - RARITY_RANK_ORDER[a.rarity]);

  return (
    <div className="card p-4" data-testid="rpg-inventory">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 inline-flex items-center gap-1.5">
          <Backpack className="w-4 h-4 text-brand-500" />
          背包图鉴
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums" data-testid="rpg-inventory-count">
          {unlocked.length}/{catalog.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {FILTERS.map(f => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`btn px-2.5 py-1 text-xs ${filter === f.key ? 'btn--accent' : 'btn--quiet'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {unlocked.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
          完成 knowledge 任务获得第一件装备——图鉴会随进度点亮。
        </p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
          该槽位还没有已解锁的物品。
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
          {visible.map(item => {
            const Icon = item.kind === 'scroll' ? ScrollText : SLOT_ICON[item.slot!];
            const body = (
              <>
                <span className={`p-1.5 rounded-md shrink-0 ${RARITY_BG[item.rarity]}`}>
                  <Icon className={`w-4 h-4 ${RARITY_TEXT[item.rarity]}`} />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                    {item.name}
                  </span>
                  <span className={`block text-[10px] ${RARITY_TEXT[item.rarity]}`}>
                    {RARITY_LABELS[item.rarity]} · {item.kind === 'scroll' ? '卷轴' : SLOT_LABELS[item.slot!]}
                  </span>
                </span>
              </>
            );
            if (item.kind === 'scroll') {
              return (
                <div
                  key={item.id}
                  title={item.desc ?? item.name}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60"
                >
                  {body}
                </div>
              );
            }
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onEquip(item)}
                title={`装备「${item.name}」到${SLOT_LABELS[item.slot!]}`}
                aria-label={`装备${item.name}`}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                {body}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
