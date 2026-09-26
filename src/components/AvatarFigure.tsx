import { Fragment, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MOTION } from '../motion/tokens';
import type { Rarity, Slot } from '../utils/rpg';

export type AvatarBand = 1 | 2 | 3 | 4 | 5;

/** 称号段位即形象分段：1-3 布衣 / 4-7 围巾木杖 / 8-9 披风腰带 / 10-14 光环星 / 15+ 王冠光晕 */
export function avatarBand(level: number): AvatarBand {
  return level >= 15 ? 5 : level >= 10 ? 4 : level >= 8 ? 3 : level >= 4 ? 2 : 1;
}

/** 成长服装档（与形象分段错峰）：1 粗布 / 5 旅装 / 9 皮甲 / 13 战袍 → data-growth 组 */
export function growthTier(level: number): 1 | 2 | 3 | 4 {
  return level >= 13 ? 4 : level >= 9 ? 3 : level >= 5 ? 2 : 1;
}

/** 已穿戴装备的叠绘描述：variant 是 EQ_TEMPLATES 的槽内变体键 */
export interface AvatarEquip {
  slot: Slot;
  rarity: Rarity;
  variant: string;
}

interface AvatarFigureProps {
  level: number;
  equip?: AvatarEquip[];
  className?: string;
}

/* 像素小人：22×25 网格五档合成图（含自动描边），字符 → 调色板 */
const FILL: Record<string, string> = {
  o: '#2f2a33', h: '#4f4238', H: '#6a5b4e', s: '#f5c9a6', S: '#e8b08c',
  e: '#2b2b33', m: '#b56a5a', t: '#d6cfc2', T: '#b8ae9d', p: '#7a6852',
  k: '#54443a', c: '#d068b8', d: '#8b6b4a', g: '#34d399', a: '#d97706',
  A: '#b45309', u: '#9d3d84', l: '#fbbf24', r: '#d068b8', n: '#fcd34d',
  q: '#9fb0c4', w: '#7e90a6', y: '#b07a45', z: '#8a5c33',
  R: '#3f4959', Q: '#2c3442', M: '#9aa3ad', N: '#77808c', E: '#ece8de',
};
/** 'n'（光环/星芒/光晕）半透明，与设计稿 alpha=110 对齐 */
const ALPHA_N = 110 / 255;
/** 装备模板 '@' 材质位的渲染色：随该槽装备稀有度解析（与 pixelart.py 同步） */
const RARITY_FILL: Record<Rarity, string> = {
  common: '#c9d2df', fine: '#60a5fa', rare: '#a78bfa', legendary: '#fbbf24',
};

const GRIDS: Record<AvatarBand, string[]> = {
  1: [
    '......................',
    '......................',
    '......................',
    '......................',
    '.....oooooooooo.......',
    '....oohhhhhhhhoo......',
    '....ohhHhhhhHhho......',
    '....ohhhhhhhhhho......',
    '....ohssssssssho......',
    '....ohseesseesho......',
    '....ohSesseesSho......',
    '....ohsssmmsssho......',
    '....oossssssssoo......',
    '...oootttsstttooo.....',
    '...otttttttttttto.....',
    '...otttttttttttto.....',
    '...ossttttttttsso.....',
    '...ossttttttttsso.....',
    '...oooTTTTTTTTooo.....',
    '.....opppoopppo.......',
    '.....opppoopppo.......',
    '.....opppoopppo.......',
    '....oopppoopppoo......',
    '....okkkkookkkko......',
    '....oooooooooooo......',
  ],
  2: [
    '......................',
    '......................',
    '......................',
    '......................',
    '.....oooooooooo..oooo.',
    '....oohhhhhhhhoo.oggo.',
    '....ohhHhhhhHhho.ogoo.',
    '....ohhhhhhhhhho.oddo.',
    '....ohssssssssho.oddo.',
    '....ohseesseesho.oddo.',
    '....ohSesseesSho.oddo.',
    '....ohsssmmsssho.oddo.',
    '....oossssssssoo.oddo.',
    '...oooccccccccooooddo.',
    '...ottttttttccttooddo.',
    '...otttttttttcttooddo.',
    '...osstttttttcssooddo.',
    '...osstttttttcssooddo.',
    '...oooTTTTTTTTooooddo.',
    '.....opppoopppo..oddo.',
    '.....opppoopppo..oddo.',
    '.....opppoopppo..oddo.',
    '....oopppoopppoo.oddo.',
    '....okkkkookkkko.oddo.',
    '....oooooooooooo.oooo.',
  ],
  3: [
    '......................',
    '......................',
    '......................',
    '......................',
    '.....oooooooooo..oooo.',
    '....oohhhhhhhhoo.oggo.',
    '....ohhHhhhhHhho.ogoo.',
    '....ohhhhhhhhhho.oddo.',
    '....ohssssssssho.oddo.',
    '....ohseesseesho.oddo.',
    '....ohSesseesSho.oddo.',
    '....ohsssmmsssho.oddo.',
    '....oossssssssoo.oddo.',
    '.oooooccccccccooooddo.',
    '.ouuttttttttccttuuddo.',
    '.ouutttttttttcttuuddo.',
    '.ouusstttttttcssuuddo.',
    '.ouussaaaAAaaassuuddo.',
    '.ouuooaaaAAaaaoouuddo.',
    '.ouuoopppoopppoouuddo.',
    '.ouuoopppoopppoouuddo.',
    '.ouuoopppoopppoouuddo.',
    '.ouuoopppoopppoouuddo.',
    '.ouuukkkkookkkkuuuddo.',
    '.ouuuoooooooooouuuooo.',
  ],
  4: [
    '........nnnnnn........',
    '......nn......nn......',
    '.....n..........n.....',
    '......................',
    '.....oooooooooo..oooo.',
    '....oohhhhhhhhoo.oggo.',
    '....ohhHhhhhHhho.ogoo.',
    '....ohhhhhhhhhho.oddo.',
    '....ohssssssssho.oddo.',
    '....ohseesseesho.oddo.',
    '....ohSesseesSho.oddo.',
    '....ohsssmmsssho.oddo.',
    '....oossssssssoo.oddo.',
    '.oooooccccccccooooddo.',
    '.ouuttttttttccttuuddo.',
    '.ouutttttttttcttuuddo.',
    '.ouusstttttttcssuuddo.',
    '.ouussaaaAAaaassuuddo.',
    '.ouuooaaaAAaaaoouuddo.',
    '.ouuoopppoopppoouuddo.',
    '.ouuoopppoopppoouuddo.',
    '.ouuoopppoopppoouuddo.',
    '.ouuoopppoopppoouuddo.',
    '.ouuukkkkookkkkuuuddo.',
    '.ouuuoooooooooouuuooo.',
  ],
  5: [
    '........nnnnnn........',
    '.....onnoooooonn......',
    '.n...nloolooloo.n...n.',
    'nnn..olllrrlllo....nnn',
    '.n...olllrrlllnn.ooon.',
    '....onhhhhhhhhnnnoggo.',
    'n...nhhHhhhhHhhnnngoon',
    'nn.nnhhhhhhhhhho.nddnn',
    'n.nnnhssssssssho.nddon',
    '..nnohseesseesho.oddo.',
    '..nnohSesseesSho.oddo.',
    '..nnohsssmmsssho.oddo.',
    '..nnoossssssssoo.oddo.',
    '.onnnoccccccccooonddo.',
    '.ouuttttttttccttuuddo.',
    '.ouutttttttttcttuuddo.',
    '.ouusstttttttcssuuddo.',
    '.ouussaaaAAaaassuuddo.',
    '.ouuooaaaAAaaaoouuddo.',
    '.ouuoopppoopppoouuddo.',
    '.ouuoopppoopppoouuddo.',
    '.ouuoopppoopppoouuddo.',
    '.ouuoopppoopppoouuddo.',
    '.ouuukkkkookkkkuuuddo.',
    '.ouuuoooooooooouuuooo.',
  ]
};

/* 成长服装档叠绘网格（仅布衣/下摆字符位置；由 pixelart.py v3 生成，勿手改） */
const TIER_GRIDS: Record<number, string[]> = {
  2: ["......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......qqq..qqq........", "....qqqqqqqqqqqq......", "....qqqqqqqqqqqq......", "......qqqqqqqq........", "......qqqqqqqq........", "......wwwwwwww........", "......................", "......................", "......................", "......................", "......................", "......................"],
  3: ["......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......yyy..yyy........", "....yyyyyyyyyyyy......", "....yyyyyyyyyyyy......", "......yyyyyyyy........", "......yyyyyyyy........", "......zzzzzzzz........", "......................", "......................", "......................", "......................", "......................", "......................"],
  4: ["......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......RRR..RRR........", "....RRRRRRRRRRRR......", "....RRRRRRRRRRRR......", "......RRRRRRRR........", "......RRRRRRRR........", "......QQQQQQQQ........", "......................", "......................", "......................", "......................", "......................", "......................"],
};

/* 装备叠绘模板：'@' = 稀有度材质位（由 pixelart.py v3 生成，勿手改） */
const EQ_TEMPLATES: Record<string, string[]> = {
  'armor:chain': ["......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "....MMNMMMNMMMNM......", "....MNMMMNMMMNMM......", "....NMMMNMMMNMMM......", "....MMMNMMMNMMMN......", "......NMMMNMMM........", "......................", "......................", "......................", "......................", "......................", "......................"],
  'armor:robe': ["......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "....RRlRRRRRRlRR......", "....RRRRlRRRRRRR......", "....RRRRRRRRRRRR......", "....RRRRlRRRRRRR......", "......QQQQQQQQ........", "......................", "......................", "......................", "......................", "......................", "......................"],
  'helm:dome': ["......................", "......................", "......................", "......................", "......................", "......MMMMMMMM........", ".....MMMMMMMMMM.......", ".....MMMMMMMMMM.......", ".....NNNNNNNNNN.......", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................"],
  'helm:circlet': ["......................", "......................", "......................", "......................", "......................", "......................", "......................", ".....l..l..l..l.......", ".....llllrrllll.......", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................"],
  'boots:tall': ["......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......ooo..ooo........", "......@@@..@@@........", ".....@@@@..@@@@.......", "......................"],
  'boots:sleek': ["......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......ooo..ooo........", ".....@@@@..@@@@.......", "......................", "......................"],
  'trinket:brooch': ["......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "........oo............", ".......o@@o...........", ".......o@@o...........", "........oo............", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................"],
  'trinket:amulet': ["......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......llllll..........", ".......o@@o...........", "........oo............", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................"],
  'weapon:blade': ["......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "......................", "....@.................", "...@@@@...............", "....p.................", "....p.................", "....@.................", "...o@.................", "...o@.................", "...o@.................", "...o@.................", "......................", "......................"],
  'weapon:staff': ["......................", "......................", "......................", "......................", ".................oooo.", ".................oggo.", ".................ogoo.", ".................o@@o.", ".................o@@o.", ".................o@@o.", ".................o@@o.", ".................o@@o.", ".................o@@o.", ".................o@@o.", ".................o@@o.", ".................o@@o.", ".................o@@o.", ".................o@@o.", ".................o@@o.", ".................o@@o.", ".................o@@o.", ".................o@@o.", ".................o@@o.", ".................o@@o.", ".................oooo."],
  'weapon:bow': ["......................", "......................", "......................", "......................", "......................", "......................", ".oo...................", "o.@E..................", "o@.E..................", "o@.E..................", "o@.E..................", "o@.E..................", "o@.E..................", "o@.E..................", "o@.E..................", "o@.E..................", "o@.E..................", "o@.E..................", "o@.E..................", "o@.E..................", "o@.E..................", "o.@E..................", ".oo...................", "......................", "......................"],
};

/** 叠绘仅当【基础档字符】∈ 集合时绘制（条纹/腰带等 band 装饰天然保留）；null = 任意（纯叠绘） */
const EQ_ALLOWED: Record<Slot, string | null> = {
  armor: 'tTs', helm: 'hHso', boots: 'kp', trinket: 'tTsc', weapon: null,
};
/** 装备组 DOM/绘制序：武器最前压过甲面（护手/握柄不被链甲盖） */
const EQ_ORDER: Slot[] = ['armor', 'helm', 'boots', 'trinket', 'weapon'];

const GROUP_ORDER = ['5', '3', '1', '2', '3b', '4', '5b'] as const;
const GROUP_MIN_BAND: Record<string, AvatarBand> = {
  '5': 5, '3': 3, '1': 1, '2': 2, '3b': 3, '4': 4, '5b': 5,
};

type Cell = { r: number; c: number; ch: string };
type Rect = Cell & { w: number; h: number };

function diffCells(from: AvatarBand, to: AvatarBand): Cell[] {
  const a = GRIDS[from];
  const b = GRIDS[to];
  const out: Cell[] = [];
  for (let r = 0; r < b.length; r++) {
    for (let c = 0; c < b[r].length; c++) {
      if (a[r][c] !== b[r][c]) out.push({ r, c, ch: b[r][c] });
    }
  }
  return out;
}

function nonEmpty(band: AvatarBand): Cell[] {
  const g = GRIDS[band];
  const out: Cell[] = [];
  for (let r = 0; r < g.length; r++) {
    for (let c = 0; c < g[r].length; c++) {
      if (g[r][c] !== '.') out.push({ r, c, ch: g[r][c] });
    }
  }
  return out;
}

/**
 * 各 data-band 组的归属单元格（按档位递进差分切分图层）。
 * 渲染字符一律取当前档 GRIDS 的最终字符——同一格无论落在几组，
 * 画出的颜色都相同，故组间叠绘顺序（DOM 5,3,1,[growth],2,3b,4,5b,[eq…]）不影响成像。
 * 半透明 'n' 例外：同格多组会叠加加深，故只归 DOM 最右一组绘制。
 * growth/eq 叠绘组与 band 组字节级解耦：单元格按基础档字符过滤，永不覆盖 band 装饰。
 */
const NOMINAL: Record<string, Cell[]> = (() => {
  const d12 = diffCells(1, 2);
  const d23 = diffCells(2, 3);
  const d34 = diffCells(3, 4);
  const d45 = diffCells(4, 5);
  return {
    '5': d45.filter(x => x.ch === 'n'),
    '3': d23.filter(x => x.ch === 'u' || x.ch === 'o'),
    '1': nonEmpty(1),
    '2': d12,
    '3b': d23.filter(x => x.ch === 'a' || x.ch === 'A'),
    '4': d34,
    '5b': d45.filter(x => x.ch !== 'n'),
  };
})();

/** 水平游程合并 + 垂直同列同色拼接 → 最少 rect */
function toRects(cells: Cell[]): Rect[] {
  const rows = new Map<number, Cell[]>();
  for (const cell of cells) {
    const list = rows.get(cell.r);
    if (list) list.push(cell);
    else rows.set(cell.r, [cell]);
  }
  const runs: Rect[] = [];
  for (const [r, list] of rows) {
    list.sort((a, b) => a.c - b.c);
    let start = 0;
    for (let i = 1; i <= list.length; i++) {
      if (i === list.length || list[i].c !== list[i - 1].c + 1 || list[i].ch !== list[start].ch) {
        runs.push({ r, c: list[start].c, w: i - start, h: 1, ch: list[start].ch });
        start = i;
      }
    }
  }
  runs.sort((a, b) => a.r - b.r || a.c - b.c);
  const merged: Rect[] = [];
  const tails = new Map<string, Rect>();
  for (const run of runs) {
    const key = `${run.c}|${run.w}|${run.ch}`;
    const tail = tails.get(key);
    if (tail && tail.r + tail.h === run.r) {
      tail.h += 1;
      continue;
    }
    const rect = { ...run };
    merged.push(rect);
    tails.set(key, rect);
  }
  return merged;
}

function buildBand(band: AvatarBand): Record<string, Rect[]> {
  const grid = GRIDS[band];
  const present = GROUP_ORDER.filter(key => GROUP_MIN_BAND[key] <= band);
  const nOwner = new Map<string, string>();
  for (const key of present) {
    for (const cell of NOMINAL[key]) {
      if (grid[cell.r][cell.c] === 'n') nOwner.set(`${cell.r},${cell.c}`, key);
    }
  }
  const out: Record<string, Rect[]> = {};
  for (const key of present) {
    const cells: Cell[] = [];
    for (const cell of NOMINAL[key]) {
      const ch = grid[cell.r][cell.c];
      if (ch === '.') continue;
      if (ch === 'n' && nOwner.get(`${cell.r},${cell.c}`) !== key) continue;
      cells.push({ r: cell.r, c: cell.c, ch });
    }
    out[key] = toRects(cells);
  }
  return out;
}

const BAND_GROUPS: Record<AvatarBand, Record<string, Rect[]>> = {
  1: buildBand(1),
  2: buildBand(2),
  3: buildBand(3),
  4: buildBand(4),
  5: buildBand(5),
};

function cellsOfGrid(grid: string[]): Cell[] {
  const out: Cell[] = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] !== '.') out.push({ r, c, ch: grid[r][c] });
    }
  }
  return out;
}

/** 成长服装档：仅覆盖基础档仍是布衣/下摆的格（围巾、腰带、披风等装饰保留） */
function buildGrowth(band: AvatarBand, tier: number): Rect[] {
  const tg = TIER_GRIDS[tier];
  if (!tg) return [];
  const base = GRIDS[band];
  const cells: Cell[] = [];
  for (const cell of cellsOfGrid(tg)) {
    const b = base[cell.r][cell.c];
    if (b === 't' || b === 'T') cells.push(cell);
  }
  return toRects(cells);
}

/** 装备叠绘：模板格按 EQ_ALLOWED 过滤基础档字符后绘制（'@' 留给渲染期解析稀有度） */
function buildEq(band: AvatarBand, e: AvatarEquip): Rect[] {
  const tpl = EQ_TEMPLATES[`${e.slot}:${e.variant}`];
  if (!tpl) return [];
  const base = GRIDS[band];
  const allow = EQ_ALLOWED[e.slot];
  const cells: Cell[] = [];
  for (const cell of cellsOfGrid(tpl)) {
    const b = base[cell.r][cell.c];
    if (allow === null || (allow && allow.includes(b))) cells.push(cell);
  }
  return toRects(cells);
}

export function AvatarFigure({ level, equip = [], className = '' }: AvatarFigureProps) {
  const reduce = useReducedMotion();
  const band = avatarBand(level);
  const tier = growthTier(level);
  const dur = MOTION.duration.base / 1000;
  const ease = MOTION.ease.out;
  const layer = band >= 2 && !reduce
    ? { initial: { opacity: 0, y: 0.75 }, animate: { opacity: 1, y: 0 }, transition: { duration: dur, ease } }
    : band >= 2
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : null;
  const groups = BAND_GROUPS[band];
  const growthRects = useMemo(() => (tier >= 2 ? buildGrowth(band, tier) : []), [band, tier]);
  const eqGroups = useMemo(() => {
    const out: { e: AvatarEquip; rects: Rect[] }[] = [];
    for (const slot of EQ_ORDER) {
      const e = equip.find(x => x.slot === slot);
      if (!e) continue;
      const rects = buildEq(band, e);
      if (rects.length) out.push({ e, rects });
    }
    return out;
  }, [band, equip]);

  const pixels = (rects: Rect[], rarity?: Rarity) => rects.map(q => (
    <rect
      key={`${q.r}-${q.c}`}
      x={q.c}
      y={q.r}
      width={q.w}
      height={q.h}
      fill={q.ch === '@' && rarity ? RARITY_FILL[rarity] : FILL[q.ch]}
      fillOpacity={q.ch === 'n' ? ALPHA_N : undefined}
    />
  ));

  return (
    <svg
      viewBox="0 0 22 25"
      className={`w-44 h-auto shrink-0 ${className}`}
      role="img"
      aria-label={`RPG 形象，等级 ${level}`}
      shapeRendering="crispEdges"
    >
      {GROUP_ORDER.map(key => {
        if (key === '1') {
          const rects = groups['1'];
          if (!rects) return null;
          return (
            <Fragment key="1">
              <g data-band="1">{pixels(rects)}</g>
              {growthRects.length > 0 && (layer ? (
                <motion.g data-growth={tier} {...layer}>{pixels(growthRects)}</motion.g>
              ) : (
                <g data-growth={tier}>{pixels(growthRects)}</g>
              ))}
            </Fragment>
          );
        }
        const rects = groups[key];
        if (!rects) return null;
        return <motion.g key={key} data-band={key} {...layer}>{pixels(rects)}</motion.g>;
      })}
      {eqGroups.map(({ e, rects }) => (layer ? (
        <motion.g key={e.slot} data-eq={e.slot} {...layer}>{pixels(rects, e.rarity)}</motion.g>
      ) : (
        <g key={e.slot} data-eq={e.slot}>{pixels(rects, e.rarity)}</g>
      )))}
    </svg>
  );
}
