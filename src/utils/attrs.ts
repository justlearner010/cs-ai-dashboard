/**
 * 属性加点纯函数层（三期）：点数由 level 派生（2/级），分配结果独立落盘
 * （csAiAgentRpgAttrs，不进 AppData 备份）；纯展示不回写 xp/成就/雷达。
 * 等级回落导致的超分配只在渲染时钳位，绝不改写存储；损坏输入一律安全归零。
 */

export type AttrKey = 'str' | 'agi' | 'int' | 'sta' | 'per' | 'cha';

export const ATTR_STORAGE_KEY = 'csAiAgentRpgAttrs';

export const ATTR_KEYS: AttrKey[] = ['str', 'agi', 'int', 'sta', 'per', 'cha'];

export const ATTR_LABELS: Record<AttrKey, string> = {
  str: '力量',
  agi: '敏捷',
  int: '智力',
  sta: '耐力',
  per: '感知',
  cha: '魅力',
};

/** 每升 1 级发放的自由点数 */
export const GRANT_PER_LEVEL = 2;

export function totalGranted(level: number): number {
  return GRANT_PER_LEVEL * Math.max(0, Math.floor(level) - 1);
}

/** 非对象/数组/负数/小数/未知键 → 全部丢弃；解析失败 → {} */
export function parseAttrs(raw: string): Partial<Record<AttrKey, number>> {
  try {
    const v: unknown = JSON.parse(raw);
    if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
    const out: Partial<Record<AttrKey, number>> = {};
    for (const key of ATTR_KEYS) {
      const n = (v as Record<string, unknown>)[key];
      if (typeof n === 'number' && Number.isFinite(n) && n >= 0) {
        out[key] = Math.floor(n);
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** 六键归一为 ≥0 整数；unspent 钳位到 0（超分配不回写，仅视图禁 +） */
export function resolveAttrs(
  raw: Partial<Record<AttrKey, number>>,
  level: number,
): { allocated: Record<AttrKey, number>; unspent: number } {
  const allocated = {} as Record<AttrKey, number>;
  let sum = 0;
  for (const key of ATTR_KEYS) {
    const n = raw[key];
    const v = typeof n === 'number' && Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
    allocated[key] = v;
    sum += v;
  }
  return { allocated, unspent: Math.max(0, totalGranted(level) - sum) };
}
