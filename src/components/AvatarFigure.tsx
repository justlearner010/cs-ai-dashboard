import { motion, useReducedMotion } from 'framer-motion';
import { MOTION } from '../motion/tokens';

export type AvatarBand = 1 | 2 | 3 | 4 | 5;

/** 称号段位即形象分段：1-3 布衣 / 4-7 围巾木杖 / 8-9 披风腰带 / 10-14 光环星 / 15+ 王冠光晕 */
export function avatarBand(level: number): AvatarBand {
  return level >= 15 ? 5 : level >= 10 ? 4 : level >= 8 ? 3 : level >= 4 ? 2 : 1;
}

interface AvatarFigureProps {
  level: number;
  className?: string;
}

/* 像素小人：22×25 网格五档合成图（含自动描边），字符 → 调色板 */
const FILL: Record<string, string> = {
  o: '#2f2a33', h: '#4f4238', H: '#6a5b4e', s: '#f5c9a6', S: '#e8b08c',
  e: '#2b2b33', m: '#b56a5a', t: '#d6cfc2', T: '#b8ae9d', p: '#7a6852',
  k: '#54443a', c: '#d068b8', d: '#8b6b4a', g: '#34d399', a: '#d97706',
  A: '#b45309', u: '#9d3d84', l: '#fbbf24', r: '#d068b8', n: '#fcd34d',
};
/** 'n'（光环/星芒/光晕）半透明，与设计稿 alpha=110 对齐 */
const ALPHA_N = 110 / 255;

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
 * 画出的颜色都相同，故组间叠绘顺序（DOM 5,3,1,2,3b,4,5b）不影响成像。
 * 半透明 'n' 例外：同格多组会叠加加深，故只归 DOM 最右一组绘制。
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

export function AvatarFigure({ level, className = '' }: AvatarFigureProps) {
  const reduce = useReducedMotion();
  const band = avatarBand(level);
  const dur = MOTION.duration.base / 1000;
  const ease = MOTION.ease.out;
  const layer = band >= 2 && !reduce
    ? { initial: { opacity: 0, y: 0.75 }, animate: { opacity: 1, y: 0 }, transition: { duration: dur, ease } }
    : band >= 2
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : null;
  const groups = BAND_GROUPS[band];

  return (
    <svg
      viewBox="0 0 22 25"
      className={`w-44 h-auto shrink-0 ${className}`}
      role="img"
      aria-label={`RPG 形象，等级 ${level}`}
      shapeRendering="crispEdges"
    >
      {GROUP_ORDER.map(key => {
        const rects = groups[key];
        if (!rects) return null;
        const pixels = rects.map(q => (
          <rect
            key={`${q.r}-${q.c}`}
            x={q.c}
            y={q.r}
            width={q.w}
            height={q.h}
            fill={FILL[q.ch]}
            fillOpacity={q.ch === 'n' ? ALPHA_N : undefined}
          />
        ));
        if (key === '1') return <g key="1" data-band="1">{pixels}</g>;
        return <motion.g key={key} data-band={key} {...layer}>{pixels}</motion.g>;
      })}
    </svg>
  );
}
