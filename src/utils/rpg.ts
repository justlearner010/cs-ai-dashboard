import type { Course } from '../types';
import { LEGENDARY_ITEMS, BOSS_DUNGEONS } from '../data/rpgLegend';

/**
 * RPG 装备/副本纯函数层：全部输入 courses 即可确定性重建，解锁集合派生自 done，
 * 落盘的只有 loadout（csAiAgentRpgLoadout，独立 key 不进备份）。三期加点只消费 growth。
 */

export type Slot = 'weapon' | 'armor' | 'helm' | 'boots' | 'trinket';
export type Rarity = 'common' | 'fine' | 'rare' | 'legendary';

export interface RpgItem {
  id: string;
  name: string;
  desc?: string;
  slot?: Slot;
  rarity: Rarity;
  kind: 'equipment' | 'scroll';
  from: 'knowledge' | 'question';
  courseId: string;
}

export interface DungeonStage {
  id: string;
  name: string;
  boss: boolean;
  cleared: boolean;
}

export interface Dungeon {
  id: string;
  region: string;
  name: string;
  stages: DungeonStage[];
  cleared: number;
  total: number;
}

export const RPG_LOADOUT_KEY = 'csAiAgentRpgLoadout';

export const SLOTS: Slot[] = ['weapon', 'armor', 'helm', 'boots', 'trinket'];

export const SLOT_LABELS: Record<Slot, string> = {
  weapon: '武器',
  armor: '护甲',
  helm: '头盔',
  boots: '鞋履',
  trinket: '饰品',
};

export const RARITY_LABELS: Record<Rarity, string> = {
  common: '普通',
  fine: '精良',
  rare: '稀有',
  legendary: '传说',
};

/** 排序权重：越大越稀有 */
export const RARITY_RANK: Record<Rarity, number> = {
  common: 0,
  fine: 1,
  rare: 2,
  legendary: 3,
};

const VARIANTS: Record<Slot, string[]> = {
  weapon: ['之刃', '之杖', '之弓'],
  armor: ['链甲', '战袍'],
  helm: ['之冠', '头盔'],
  boots: ['行靴', '疾履'],
  trinket: ['徽记', '护符'],
};

/** 与 VARIANTS 同序的模板变体键（AvatarFigure EQ_TEMPLATES 索引） */
const VARIANT_KEYS: Record<Slot, string[]> = {
  weapon: ['blade', 'staff', 'bow'],
  armor: ['chain', 'robe'],
  helm: ['dome', 'circlet'],
  boots: ['tall', 'sleek'],
  trinket: ['brooch', 'amulet'],
};

/** 形象叠绘变体：与 equipmentName 同一 hash 序，保证名字后缀与画出的模板一致 */
export function itemVariant(item: RpgItem): string {
  const slot = item.slot ?? 'weapon';
  const keys = VARIANT_KEYS[slot];
  return keys[fnv1a(`${item.id}:v`) % keys.length];
}

const SCROLL_SUFFIX = ['卷轴', '秘典', '箴言', '星图'];

const RARE_KEYWORDS = [
  '算法', '架构', '数据库', '并发', '内核', '机器学习', '深度学习',
  '神经网络', '分布式', '安全', '加密', '协议',
  '调度', '优化', '性能',
];

const FINE_KEYWORDS = ['实现', '实战', '项目', '实践'];

export function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** 「前缀: 主题（细节）」→ 主题；剥括号注释，>8 字在 与/和// 或词边界截断 */
export function parseTopic(text: string): string {
  const colon = text.search(/[：:]/);
  let topic = (colon >= 0 ? text.slice(colon + 1) : text).trim();
  topic = topic.replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').trim();
  if (!topic) topic = text.replace(/（[^）]*）/g, '').trim();
  // 主题内嵌第二段冒号（如「生成学习算法:GDA」）→ 只留前段
  const inner = topic.search(/[：:]/);
  if (inner > 0 && inner <= 12) topic = topic.slice(0, inner);
  return shorten(topic).replace(/ {2,}/g, ' ').replace(/[\s—–、，。·]+$/, '');
}

function shorten(s: string): string {
  const t = s.replace(/[\s—–]+$/, '');
  if (t.length <= 8) return t;
  const sep = t.search(/[—–与和/]/);
  if (sep >= 2 && sep <= 12) return snapTail(t.slice(0, sep), t);
  const spaces: number[] = [];
  for (let i = 0; i < t.length; i++) {
    if (t[i] === ' ' && i >= 2 && i <= 12) spaces.push(i);
  }
  const cut = spaces.length > 0 ? t.slice(0, spaces[spaces.length - 1]) : t.slice(0, 8);
  return snapTail(cut, t);
}

/** 切点落在拉丁词中间：前缀够长则回剪，否则向后补全整个词 */
function snapTail(base: string, full: string): string {
  const m = /[A-Za-z0-9]+$/.exec(base);
  if (!m || base.length >= full.length || !/[A-Za-z0-9.+-]/.test(full[base.length])) return base;
  const tokenStart = base.length - m[0].length;
  if (tokenStart >= 4) return base.slice(0, tokenStart).replace(/[\s—–、，。·]+$/, '');
  let i = base.length;
  while (i < full.length && /[A-Za-z0-9.+-]/.test(full[i])) i++;
  return full.slice(0, i);
}

function equipmentName(topic: string, slot: Slot, id: string): string {
  const variants = VARIANTS[slot];
  return `${topic}${variants[fnv1a(`${id}:v`) % variants.length]}`;
}

function scrollName(text: string, id: string): string {
  const core = text.replace(/^(为什么|为何|如何|怎样|什么|哪些|能否|请)/, '');
  const seg = (core.split(/[？?。；;，,：:、！!（(—–"'“”‘’]/)[0] || core).trim();
  return `${scrollBase(seg)}·${SCROLL_SUFFIX[fnv1a(id) % SCROLL_SUFFIX.length]}`;
}

function scrollBase(raw: string): string {
  // 前导虚词（与编码…/从 hello…）剥离后更像词牌
  const seg = (raw.replace(/^[与和的了在是把被从就而为]+/, '') || raw).trim() || raw;
  const latin = /^[A-Za-z0-9][A-Za-z0-9.+=-]*/.exec(seg);
  // 短拉丁词头（RSA/CLT/MCP…）单独成词，不硬补汉字
  if (latin && latin[0].length >= 2 && latin[0].length <= 16) return latin[0];
  if (seg.length <= 8) return seg.replace(/[\s—–、，。·"'.,]+$/, '');
  // 虚词边界（[4..8] 首个）优先于固定 8 字切，避免「哈希表查找平」式断词
  let cut = 8;
  for (let i = 4; i <= Math.min(8, seg.length - 1); i++) {
    if ('的是在与和把被到从为就而'.includes(seg[i])) { cut = i; break; }
  }
  return snapTail(seg.slice(0, cut), seg).replace(/[\s—–、，。·"'.,]+$/, '');
}

/**
 * 359 件（knowledge→装备 276 + question→卷轴 83，lab 不进背包）。
 * 稀有度：手写传说 > 课末 knowledge / 毕业答辩 > 关键词 > 后 1/3 knowledge / 实战词 > 普通。
 */
export function buildRpgCatalog(courses: Course[]): RpgItem[] {
  const legendMap = new Map(LEGENDARY_ITEMS.map(l => [l.todoId, l]));
  const items: RpgItem[] = [];
  for (const course of courses) {
    const knowledge = course.todos.filter(t => t.type === 'knowledge');
    const lastKnowledgeId = knowledge[knowledge.length - 1]?.id;
    const finalTodoId = course.todos[course.todos.length - 1]?.id;
    for (const t of course.todos) {
      if (t.type === 'lab') continue;
      const legend = legendMap.get(t.id);
      const knowledgeIdx = t.type === 'knowledge' ? knowledge.findIndex(k => k.id === t.id) : -1;
      const inLastThird =
        knowledgeIdx >= 0 && knowledgeIdx >= knowledge.length - Math.ceil(knowledge.length / 3);
      let rarity: Rarity;
      if (legend) rarity = 'legendary';
      else if (t.id === lastKnowledgeId || t.id === finalTodoId) rarity = 'rare';
      else if (RARE_KEYWORDS.some(k => t.text.includes(k))) rarity = 'rare';
      else if (inLastThird || FINE_KEYWORDS.some(k => t.text.includes(k))) rarity = 'fine';
      else rarity = 'common';

      if (t.type === 'question') {
        items.push({
          id: t.id,
          name: scrollName(t.text, t.id),
          rarity,
          kind: 'scroll',
          from: 'question',
          courseId: course.id,
        });
      } else {
        const slot = SLOTS[fnv1a(t.id) % SLOTS.length];
        items.push({
          id: t.id,
          name: legend?.name ?? equipmentName(parseTopic(t.text), slot, t.id),
          desc: legend?.desc,
          slot,
          rarity,
          kind: 'equipment',
          from: 'knowledge',
          courseId: course.id,
        });
      }
    }
  }
  return items;
}

/** 每课一张副本卡；手写 Boss 命中标 Boss，否则末条 lab 程序化「终阶·主题」 */
export function buildDungeons(courses: Course[]): Dungeon[] {
  const bossMap = new Map(BOSS_DUNGEONS.map(b => [b.todoId, b]));
  return courses.map(course => {
    const labs = course.todos.filter(t => t.type === 'lab');
    const hasBoss = labs.some(l => bossMap.has(l.id));
    const lastLabId = labs[labs.length - 1]?.id;
    const stages: DungeonStage[] = labs.map(l => {
      const boss = bossMap.get(l.id);
      const autoBoss = !boss && !hasBoss && l.id === lastLabId;
      const topic = parseTopic(l.text);
      return {
        id: l.id,
        name: boss?.name ?? (autoBoss ? `终阶·${topic}` : topic),
        boss: !!boss || autoBoss,
        cleared: l.done,
      };
    });
    return {
      id: course.id,
      region: course.phase,
      name: course.name,
      stages,
      cleared: stages.filter(s => s.cleared).length,
      total: stages.length,
    };
  });
}

/** 渲染时过滤失效 loadout 条目（todo 被删 / 未知槽位 / 非字符串），不回写存储 */
export function resolveLoadout(
  loadout: Partial<Record<Slot, string>>,
  validIds: ReadonlySet<string>,
): Partial<Record<Slot, string>> {
  const out: Partial<Record<Slot, string>> = {};
  for (const key of Object.keys(loadout)) {
    if (!(SLOTS as string[]).includes(key)) continue;
    const slot = key as Slot;
    const id = loadout[slot];
    if (typeof id === 'string' && validIds.has(id)) out[slot] = id;
  }
  return out;
}

/** useLocalStorage 的 parse：非对象/数组/损坏 JSON → {} */
export function parseLoadout(raw: string): Partial<Record<Slot, string>> {
  try {
    const v: unknown = JSON.parse(raw);
    return v && typeof v === 'object' && !Array.isArray(v)
      ? (v as Partial<Record<Slot, string>>)
      : {};
  } catch {
    return {};
  }
}
