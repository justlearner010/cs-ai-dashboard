#!/usr/bin/env node
/**
 * 零依赖端到端验收 harness（V3 localStorage → DOM 单接缝）。
 *
 * 启动静态 dist 服务 + headless Chrome（CDP / 原生 WebSocket），
 * 每个用例：清空并注入 fixture → reload → DOM/localStorage 断言。
 *
 * 用法：npm run build && npm run e2e
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const HTTP_PORT = 4187;
const CDP_PORT = 9333;
const BASE = `http://127.0.0.1:${HTTP_PORT}/`;

const COURSES_KEY = 'csAiAgentCoursesV3';
const LOGS_KEY = 'csAiAgentLogsV3';
const CLEAR_KEY = 'csAiAgentCelebrationClear';
const STREAK_KEY = 'csAiAgentCelebrationStreak';
const ACH_KEY = 'csAiAgentAchievements';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.map': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  for (const c of candidates) if (existsSync(c)) return c;
  throw new Error('未找到 Chrome/Chromium，可设置 CHROME_PATH 环境变量');
}

function startStaticServer() {
  // GitHub Pages 子路径部署（vite base，如 /cs-ai-dashboard/）：请求路径需剥前缀
  const html = readFileSync(join(DIST, 'index.html'), 'utf8');
  const prefixMatch = html.match(/(?:src|href)="\/([^/]+)\/(?:assets|vite)\//);
  const prefix = prefixMatch ? `/${prefixMatch[1]}` : '';
  const server = createServer((req, res) => {
    let urlPath = decodeURIComponent(new URL(req.url, BASE).pathname);
    if (prefix && (urlPath === prefix || urlPath.startsWith(`${prefix}/`))) {
      urlPath = urlPath.slice(prefix.length) || '/';
    }
    let filePath = normalize(join(DIST, urlPath));
    if (!filePath.startsWith(DIST)) {
      res.writeHead(403).end();
      return;
    }
    if (!existsSync(filePath) || urlPath === '/') filePath = join(DIST, 'index.html');
    try {
      const body = readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise(resolve => server.listen(HTTP_PORT, '127.0.0.1', () => resolve(server)));
}

async function waitForJson(url, timeout = 10000) {
  const end = Date.now() + timeout;
  let lastErr;
  while (Date.now() < end) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
    } catch (e) {
      lastErr = e;
    }
    await sleep(150);
  }
  throw new Error(`等待 ${url} 超时: ${lastErr?.message}`);
}

function connectCdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  const pending = new Map();
  let nextId = 0;
  ws.addEventListener('message', ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id != null && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`${msg.error.message}`));
      else resolve(msg.result);
    }
  });
  const opened = new Promise((resolve, reject) => {
    ws.addEventListener('open', () => resolve());
    ws.addEventListener('error', () => reject(new Error('CDP WebSocket 连接失败')));
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  return { ws, send, opened };
}

// ——— 页面操作原语 ———
let send, pageSession;

async function evalExpr(expression) {
  const r = await send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    pageSession,
  );
  if (r.exceptionDetails) {
    throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  }
  return r.result.value;
}

async function waitForExpr(expression, { timeout = 6000, interval = 100 } = {}) {
  const end = Date.now() + timeout;
  let lastErr;
  while (Date.now() < end) {
    try {
      const v = await evalExpr(expression);
      if (v) return v;
    } catch (e) {
      lastErr = e; // 导航中的 context destroyed 等可重试
    }
    await sleep(interval);
  }
  throw new Error(`等待超时: ${expression}${lastErr ? `（末次错误: ${lastErr.message}）` : ''}`);
}

async function goto() {
  await send('Page.navigate', { url: BASE }, pageSession);
  await waitForExpr('document.readyState === "complete"', { timeout: 8000 }).catch(() => {});
  await waitForExpr(
    `!![...document.querySelectorAll('p')].find(p => p.textContent === '连续打卡')`,
    { timeout: 10000 },
  );
}

/** 注入 fixture（默认清空全部 localStorage，隔离用例）并 reload 等待挂载 */
async function loadFixture({ courses = null, logs = null, extra = {} } = {}) {
  // about:blank 等不透明源没有 localStorage 权限：先落到业务源再写入
  const origin = await evalExpr('location.origin').catch(() => '');
  if (origin !== new URL(BASE).origin) {
    await send('Page.navigate', { url: BASE }, pageSession);
    await waitForExpr('document.readyState === "complete"', { timeout: 8000 }).catch(() => {});
  }
  const payload = { clear: true, set: {} };
  if (courses) payload.set[COURSES_KEY] = JSON.stringify(courses);
  if (logs) payload.set[LOGS_KEY] = JSON.stringify(logs);
  for (const [k, v] of Object.entries(extra)) payload.set[k] = v;
  await evalExpr(`(() => {
    const payload = ${JSON.stringify(payload)};
    if (payload.clear) localStorage.clear();
    for (const [k, v] of Object.entries(payload.set)) localStorage.setItem(k, v);
    return true;
  })()`);
  await send('Page.reload', {}, pageSession);
  await waitForExpr('document.readyState === "complete"', { timeout: 8000 }).catch(() => {});
  await waitForExpr(
    `!![...document.querySelectorAll('p')].find(p => p.textContent === '连续打卡')`,
    { timeout: 10000 },
  );
}

async function readLocalStorage(key) {
  return evalExpr(`localStorage.getItem(${JSON.stringify(key)})`);
}

const readLogs = async () => JSON.parse((await readLocalStorage(LOGS_KEY)) ?? '[]');

function clickCheckboxByLabel(text) {
  return evalExpr(`(() => {
    const el = [...document.querySelectorAll('input[type="checkbox"]')]
      .find(i => i.getAttribute('aria-label') === ${JSON.stringify(text)});
    if (!el) throw new Error('未找到复选框: ${text.replace(/"/g, '')}');
    el.click();
    return true;
  })()`);
}

// ——— fixture 构造 ———
const pad = n => String(n).padStart(2, '0');
function dayOffset(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
const today = () => dayOffset(0);

let uid = 0;
const nextId = p => `${p}-e2e-${++uid}-${Date.now().toString(36)}`;

function makeCourse(todos) {
  return [
    {
      id: 'course-e2e',
      phase: '① 编程与算法基础',
      name: 'E2E课',
      fullName: 'E2E Course',
      url: 'https://example.com',
      skills: [],
      prerequisites: [],
      resources: [],
      todos,
    },
  ];
}

function makeTodo({ text = 'E2E 任务', done = false, dueDate } = {}) {
  return { id: nextId('t'), text, type: 'knowledge', done, ...(dueDate ? { dueDate } : {}) };
}

function makeLog({ date = today(), hours = 1 } = {}) {
  return {
    id: nextId('l'),
    date,
    course: '① 编程与算法基础 — E2E课',
    hours,
    mood: 'productive',
    knowledge: '知识点',
    lab: '',
    questions: '',
    reflection: '',
    createdAt: new Date().toISOString(),
  };
}

// ——— 测试运行器 ———
const results = [];
async function test(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✓ ${name}`);
  } catch (e) {
    results.push({ name, ok: false, err: e.message });
    console.log(`  ✗ ${name}\n      ${e.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const hasTest = id => `!!document.querySelector('[data-testid="${id}"]')`;

// ——— 主流程 ———
async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error('dist/ 不存在，请先运行 npm run build');
  }
  const chromePath = findChrome();
  const profileDir = mkdtempSync(join(tmpdir(), 'e2e-cdp-'));
  const server = await startStaticServer();
  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      '--remote-allow-origins=*',
      `--user-data-dir=${profileDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-gpu',
      '--hide-scrollbars',
      '--window-size=1440,900',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  let failures = 0;
  try {
    const version = await waitForJson(`http://127.0.0.1:${CDP_PORT}/json/version`);
    const cdp = connectCdp(version.webSocketDebuggerUrl);
    await cdp.opened;
    send = cdp.send;
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    pageSession = sessionId;
    await send('Page.enable', {}, pageSession);
    await send('Runtime.enable', {}, pageSession);

    console.log('chrome + CDP 就绪，开始用例…\n');

    // ——— T1 动效 token ———
    await test('motion-tokens：CSS 变量已注入', async () => {
      await loadFixture({ courses: makeCourse([makeTodo()]), logs: [] });
      const v = await evalExpr(
        `getComputedStyle(document.documentElement).getPropertyValue('--motion-base').trim()`,
      );
      assert(v === '200ms', `--motion-base = "${v}"，期望 200ms`);
    });

    // ——— T2 streak 矩阵 ———
    await test('streak：无日志 → 0', async () => {
      await loadFixture({ courses: makeCourse([makeTodo()]), logs: [] });
      await waitForExpr(`(() => {
        const l = [...document.querySelectorAll('p')].find(p => p.textContent === '连续打卡');
        return l && l.nextElementSibling.textContent.trim() === '0 天';
      })()`);
    });

    await test('streak：仅今天 → 1', async () => {
      await loadFixture({ courses: makeCourse([makeTodo()]), logs: [makeLog()] });
      await waitForExpr(`(() => {
        const l = [...document.querySelectorAll('p')].find(p => p.textContent === '连续打卡');
        return l && l.nextElementSibling.textContent.trim() === '1 天';
      })()`);
    });

    await test('streak：仅昨天 → 1', async () => {
      await loadFixture({
        courses: makeCourse([makeTodo()]),
        logs: [makeLog({ date: dayOffset(1) })],
      });
      await waitForExpr(`(() => {
        const l = [...document.querySelectorAll('p')].find(p => p.textContent === '连续打卡');
        return l && l.nextElementSibling.textContent.trim() === '1 天';
      })()`);
    });

    await test('streak：断档（仅 5 天前）→ 0', async () => {
      await loadFixture({
        courses: makeCourse([makeTodo()]),
        logs: [makeLog({ date: dayOffset(5) })],
      });
      await waitForExpr(`(() => {
        const l = [...document.querySelectorAll('p')].find(p => p.textContent === '连续打卡');
        return l && l.nextElementSibling.textContent.trim() === '0 天';
      })()`);
    });

    await test('streak：按 date 连续补写 4 天 → 4', async () => {
      const logs = [0, 1, 2, 3].map(n => makeLog({ date: dayOffset(n) }));
      await loadFixture({ courses: makeCourse([makeTodo()]), logs });
      await waitForExpr(`(() => {
        const l = [...document.querySelectorAll('p')].find(p => p.textContent === '连续打卡');
        return l && l.nextElementSibling.textContent.trim() === '4 天';
      })()`);
    });

    await test('streak：删除最新日志后重算 3 → 2', async () => {
      const logs = [0, 1, 2].map(n => makeLog({ date: dayOffset(n) }));
      await loadFixture({ courses: makeCourse([makeTodo()]), logs });
      await waitForExpr(`(() => {
        const l = [...document.querySelectorAll('p')].find(p => p.textContent === '连续打卡');
        return l && l.nextElementSibling.textContent.trim() === '3 天';
      })()`);
      // 日志卡片的单条删除按钮（textContent 恰为「删除」，排除 todo 的图标按钮）
      await evalExpr(`(() => {
        const btn = [...document.querySelectorAll('button')]
          .find(b => b.textContent.trim() === '删除');
        if (!btn) throw new Error('未找到日志删除按钮');
        btn.click();
        return true;
      })()`);
      await waitForExpr(`(JSON.parse(localStorage.getItem(${JSON.stringify(LOGS_KEY)}) || '[]')).length === 2`);
      await waitForExpr(`(() => {
        const l = [...document.querySelectorAll('p')].find(p => p.textContent === '连续打卡');
        return l && l.nextElementSibling.textContent.trim() === '2 天';
      })()`);
      assert((await readLogs()).length === 2, '日志应剩 2 条');
    });

    // ——— T6 自动记时 ———
    await test('auto-log：完成无日志 → 新建今日 +2h；取消扣回至 0 保留条目', async () => {
      const text = 'auto-log 新建任务';
      await loadFixture({ courses: makeCourse([makeTodo({ text })]), logs: [] });
      await clickCheckboxByLabel(text);
      await waitForExpr(`(JSON.parse(localStorage.getItem(${JSON.stringify(LOGS_KEY)}) || '[]')).length === 1`);
      let logs = await readLogs();
      assert(logs[0].date === today(), `date=${logs[0].date}`);
      assert(logs[0].hours === 2, `hours=${logs[0].hours}`);
      assert(
        String(logs[0].knowledge).includes('任务完成自动记时'),
        `knowledge=${logs[0].knowledge}`,
      );
      await clickCheckboxByLabel(text);
      await waitForExpr(`(JSON.parse(localStorage.getItem(${JSON.stringify(LOGS_KEY)}) || '[]'))[0].hours === 0`);
      logs = await readLogs();
      assert(logs.length === 1, `取消后应保留条目，实际 ${logs.length}`);
      assert(logs[0].hours === 0, `取消后 hours=${logs[0].hours}，期望地板 0`);
    });

    await test('auto-log：已有今日日志 → 累加 +2h', async () => {
      const text = 'auto-log 累加任务';
      await loadFixture({
        courses: makeCourse([makeTodo({ text })]),
        logs: [makeLog({ hours: 3 })],
      });
      await clickCheckboxByLabel(text);
      await waitForExpr(`(JSON.parse(localStorage.getItem(${JSON.stringify(LOGS_KEY)}) || '[]'))[0].hours === 5`);
      const logs = await readLogs();
      assert(logs.length === 1, `应仍为 1 条，实际 ${logs.length}`);
    });

    await test('auto-log：无今日日志时取消 → 不建日志（暂无可扣回）', async () => {
      const text = 'auto-log 已完成任务';
      await loadFixture({ courses: makeCourse([makeTodo({ text, done: true })]), logs: [] });
      await clickCheckboxByLabel(text);
      await sleep(250);
      const logs = await readLogs();
      assert(logs.length === 0, `不应产生日志，实际 ${logs.length}`);
    });

    // ——— T3 趋势 ———
    await test('trend：有日志 → 双序列（柱+线）渲染', async () => {
      const logs = [0, 3, 10].map(n => makeLog({ date: dayOffset(n), hours: 2 }));
      await loadFixture({ courses: makeCourse([makeTodo()]), logs });
      await waitForExpr(hasTest('trend-section'), { timeout: 8000 });
      for (const id of ['trend-legend', 'trend-series-week', 'trend-series-cum', 'trend-chart']) {
        assert(await evalExpr(hasTest(id)), `缺少 [data-testid=${id}]`);
      }
      const series = await evalExpr(
        `document.querySelectorAll('.recharts-bar-rectangle, .recharts-line-curve').length`,
      );
      assert(series >= 2, `图表序列元素仅 ${series} 个`);
    });

    await test('trend：无日志 → 空状态切换', async () => {
      await loadFixture({ courses: makeCourse([makeTodo()]), logs: [] });
      await waitForExpr(hasTest('trend-empty'), { timeout: 8000 });
      assert(!(await evalExpr(hasTest('trend-chart'))), '空态不应出现 trend-chart');
    });

    // ——— T5 签名时刻 ———
    await test('celebration：通关——触发、写键、刷新不重放、二次抑制', async () => {
      const text = '通关任务';
      const clearKey = `${CLEAR_KEY}-${today()}`;
      await loadFixture({ courses: makeCourse([makeTodo({ text, dueDate: today() })]), logs: [] });
      assert(!(await evalExpr(hasTest('celebration-clear'))), '未完成时不应庆祝');

      await clickCheckboxByLabel(text);
      await waitForExpr(hasTest('celebration-clear'), { timeout: 4000 });
      await waitForExpr(`localStorage.getItem(${JSON.stringify(clearKey)}) === '1'`);
      assert((await readLocalStorage(clearKey)) === '1', '去重键未写入');

      // 刷新（页面重载，全完成边沿再次出现）→ 键存在被抑制
      await goto();
      await sleep(500);
      assert(!(await evalExpr(hasTest('celebration-clear'))), '刷新后不应重放');

      // 二次触发：取消再重做 → 边沿重现但键已在
      await clickCheckboxByLabel(text);
      await sleep(250);
      await clickCheckboxByLabel(text);
      await sleep(500);
      assert(!(await evalExpr(hasTest('celebration-clear'))), '同日二次触发应被抑制');
    });

    await test('celebration：焦点为空/未到期不触发', async () => {
      await loadFixture({
        courses: makeCourse([makeTodo({ done: true })]), // 无截止日 → 不在时间窗
        logs: [],
      });
      await sleep(400);
      assert(!(await evalExpr(hasTest('celebration-clear'))), '空焦点不应庆祝');
    });

    await test('celebration：streak 首达 7 → 火焰里程碑 + 键 + 刷新抑制', async () => {
      const logs = [0, 1, 2, 3, 4, 5, 6].map(n => makeLog({ date: dayOffset(n) }));
      const streakKey = `${STREAK_KEY}-7`;
      await loadFixture({ courses: makeCourse([makeTodo()]), logs });
      await waitForExpr(hasTest('celebration-streak-7'), { timeout: 4000 });
      await waitForExpr(`localStorage.getItem(${JSON.stringify(streakKey)}) === '1'`);

      await goto();
      await sleep(500);
      assert(!(await evalExpr(hasTest('celebration-streak-7'))), '刷新后里程碑不应重放');
    });

    // ——— 成就系统 ———
    await test('achievements：空数据 → Lv1 + 0 解锁 + 无解锁提示', async () => {
      await loadFixture({ courses: makeCourse([makeTodo()]), logs: [] });
      await waitForExpr(hasTest('achievement-level'), { timeout: 8000 });
      const info = await evalExpr(`(() => {
        const lv = document.querySelector('[data-testid="achievement-level"]');
        const wall = document.querySelector('[data-testid="achievement-wall"]');
        return {
          text: lv ? lv.textContent : '',
          cards: wall ? wall.querySelectorAll('[data-unlocked]').length : 0,
          unlocked: wall ? wall.querySelectorAll('[data-unlocked="true"]').length : 0,
          toast: !!document.querySelector('[data-testid="achievement-unlock"]'),
        };
      })()`);
      assert(
        info.text.includes('Lv') && info.text.includes('见习') && info.text.includes('XP 0'),
        `Lv1 见习 0 XP（实际 ${JSON.stringify(info.text.slice(0, 80))}）`,
      );
      assert(
        info.cards === 20 && info.unlocked === 0 && !info.toast,
        `20 卡 0 解锁无提示（${JSON.stringify({ cards: info.cards, unlocked: info.unlocked, toast: info.toast })}）`,
      );
      // 快照已静默回填为对象（key 存在 → 后续解锁才走公告通道）
      const snap = JSON.parse((await readLocalStorage(ACH_KEY)) ?? 'null');
      assert(snap !== null && typeof snap === 'object' && Object.keys(snap).length === 0,
        `静默回填空对象（实际 ${await readLocalStorage(ACH_KEY)}）`);
    });

    await test('achievements：完成任务 → 快照写入 + 解锁提示 + 刷新不重放', async () => {
      const text = '成就任务';
      await loadFixture({
        courses: makeCourse([makeTodo({ text })]),
        logs: [],
        extra: { [ACH_KEY]: '{}' },
      });
      await waitForExpr(hasTest('achievement-wall'), { timeout: 8000 });
      assert(!(await evalExpr(hasTest('achievement-unlock'))), '初始不应有解锁提示');

      await clickCheckboxByLabel(text);
      await waitForExpr(hasTest('achievement-unlock'), { timeout: 4000 });
      const snap = JSON.parse((await readLocalStorage(ACH_KEY)) ?? '{}');
      assert(!!snap['first-task'], `快照含 first-task（实际 ${JSON.stringify(snap)}）`);
      const ts = snap['first-task'];

      await goto();
      await sleep(600);
      assert(!(await evalExpr(hasTest('achievement-unlock'))), '刷新后不应重放');
      const snap2 = JSON.parse((await readLocalStorage(ACH_KEY)) ?? '{}');
      assert(snap2['first-task'] === ts, '刷新后解锁时间戳不变');
    });

    // ——— RPG 成长 ———
    await test('rpg：空数据 → 头像 + 5 槽 + 背包空态 + loadout 缺失不报错', async () => {
      await loadFixture({ courses: makeCourse([makeTodo()]), logs: [] });
      await waitForExpr(hasTest('rpg-avatar'), { timeout: 8000 });
      const info = await evalExpr(`(() => {
        const slots = document.querySelector('[data-testid="rpg-slots"]');
        const inv = document.querySelector('[data-testid="rpg-inventory"]');
        return {
          avatarSvg: !!document.querySelector('[data-testid="rpg-avatar"] svg'),
          slotCount: slots ? slots.querySelectorAll('[data-testid^="rpg-slot-"]').length : 0,
          count: document.querySelector('[data-testid="rpg-inventory-count"]')?.textContent ?? '',
          empty: inv ? inv.textContent.includes('完成 knowledge 任务') : false,
          dungeonToggle: !!document.querySelector('[data-testid="rpg-dungeon-toggle"]'),
        };
      })()`);
      assert(
        info.avatarSvg && info.slotCount === 5 && info.dungeonToggle,
        `头像 svg + 5 槽 + 副本切换（${JSON.stringify(info)}）`,
      );
      assert(info.empty && info.count.startsWith('0/'), `背包空态 0/（${JSON.stringify(info)}）`);
      const loadout = await readLocalStorage('csAiAgentRpgLoadout');
      assert(loadout === null, `fixture clear 后 loadout key 缺失不报错（实际 ${loadout}）`);
    });

    await test('rpg：完成 knowledge 任务 → 背包物品计数 +1', async () => {
      const text = 'RPG 掉落任务';
      await loadFixture({ courses: makeCourse([makeTodo({ text })]), logs: [] });
      await waitForExpr(hasTest('rpg-inventory-count'), { timeout: 8000 });
      const before = await evalExpr(
        `Number(document.querySelector('[data-testid="rpg-inventory-count"]').textContent.split('/')[0])`,
      );
      await clickCheckboxByLabel(text);
      await waitForExpr(
        `Number(document.querySelector('[data-testid="rpg-inventory-count"]').textContent.split('/')[0]) === ${before + 1}`,
        { timeout: 4000 },
      );
      assert(true, `计数 ${before} → ${before + 1}`);
    });

    await test('rpg：背包点穿 → loadout 写入 + 槽位显示；点槽卸下 → 清空为 {}', async () => {
      const text = 'RPG 装备任务';
      await loadFixture({ courses: makeCourse([makeTodo({ text })]), logs: [] });
      await waitForExpr(hasTest('rpg-inventory'), { timeout: 8000 });
      await clickCheckboxByLabel(text);
      await waitForExpr(
        `!!document.querySelector('[data-testid="rpg-inventory"] button[aria-label^="装备"]')`,
        { timeout: 4000 },
      );
      const name = await evalExpr(`(() => {
        const btn = document.querySelector('[data-testid="rpg-inventory"] button[aria-label^="装备"]');
        const label = btn.getAttribute('aria-label');
        btn.click();
        return label.slice('装备'.length);
      })()`);
      await waitForExpr(`localStorage.getItem('csAiAgentRpgLoadout') !== null`, { timeout: 4000 });
      const loadout = JSON.parse((await readLocalStorage('csAiAgentRpgLoadout')) ?? '{}');
      const slot = Object.keys(loadout)[0];
      assert(slot && loadout[slot], `loadout 写入（实际 ${JSON.stringify(loadout)}）`);

      const slotSel = `[data-testid="rpg-slot-${slot}"]`;
      await waitForExpr(
        `(() => { const el = document.querySelector(${JSON.stringify(slotSel)}); return !!el && el.textContent.includes(${JSON.stringify(name)}); })()`,
        { timeout: 4000 },
      );
      await evalExpr(`document.querySelector(${JSON.stringify(slotSel)}).click(); true`);
      await waitForExpr(
        `localStorage.getItem('csAiAgentRpgLoadout') === '{}'`,
        { timeout: 4000 },
      );
      const slotText = await evalExpr(
        `document.querySelector(${JSON.stringify(slotSel)}).textContent`,
      );
      assert(!slotText.includes(name), `卸下后槽位不再显示物品（${slotText}）`);
    });

    // ——— RPG 属性加点（三期）———
    await test('rpg-attr：空数据 → 六行 + 可用 0 + 加号/洗点禁用 + key 不落盘', async () => {
      await loadFixture({ courses: makeCourse([makeTodo()]), logs: [] });
      await waitForExpr(hasTest('rpg-attrs'), { timeout: 8000 });
      const info = await evalExpr(`(() => {
        const panel = document.querySelector('[data-testid="rpg-attrs"]');
        return {
          rows: panel.querySelectorAll('[data-testid^="rpg-attr-row-"]').length,
          unspent: document.querySelector('[data-testid="rpg-attr-unspent"]')?.textContent.trim() ?? '',
          plusDisabled: [...panel.querySelectorAll('button[aria-label^="增加"]')].every(b => b.disabled),
          resetDisabled: document.querySelector('[data-testid="rpg-attr-reset"]').disabled,
        };
      })()`);
      assert(info.rows === 6, `六行属性（${JSON.stringify(info)}）`);
      assert(info.unspent === '可用点数 0', `可用点数 0（${info.unspent}）`);
      assert(info.plusDisabled, 'Lv1 时全部 + 禁用');
      assert(info.resetDisabled, '零分配时洗点禁用');
      const raw = await readLocalStorage('csAiAgentRpgAttrs');
      assert(raw === null, `挂载不写 key（实际 ${raw}）`);
    });

    await test('rpg-attr：升级 fixture → 可用点数 2×(L-1)；点 + → key 写入', async () => {
      await loadFixture({ courses: makeCourse([makeTodo()]), logs: [makeLog({ hours: 60 })] });
      await waitForExpr(hasTest('rpg-attrs'), { timeout: 8000 });
      // 等级数字有动画：等 DOM 等级与静态点数公式自洽（同时验证公式）
      const stable = `(() => {
        const m = document.querySelector('[data-testid="achievement-level"]').textContent.match(/Lv(\\d+)/);
        if (!m) return false;
        const u = document.querySelector('[data-testid="rpg-attr-unspent"]').textContent.trim();
        return u === '可用点数 ' + 2 * (Number(m[1]) - 1);
      })()`;
      await waitForExpr(stable, { timeout: 8000 });
      const lv = await evalExpr(
        `Number(document.querySelector('[data-testid="achievement-level"]').textContent.match(/Lv(\\d+)/)[1])`,
      );
      assert(lv >= 2, `fixture 生效 Lv${lv}`);
      const granted = 2 * (lv - 1);
      await evalExpr(
        `document.querySelector('[data-testid="rpg-attrs"] button[aria-label="增加力量"]').click(); true`,
      );
      await waitForExpr(
        `document.querySelector('[data-testid="rpg-attr-value-str"]').textContent.trim() === '1' &&
         document.querySelector('[data-testid="rpg-attr-unspent"]').textContent.trim() === '可用点数 ${granted - 1}'`,
        { timeout: 4000 },
      );
      const raw = JSON.parse((await readLocalStorage('csAiAgentRpgAttrs')) ?? 'null');
      assert(raw && raw.str === 1, `key 写入 {str:1}（${JSON.stringify(raw)}）`);
    });

    await test('rpg-attr：刷新持久 + − 回收 + 洗点守恒', async () => {
      await loadFixture({ courses: makeCourse([makeTodo()]), logs: [makeLog({ hours: 60 })] });
      await waitForExpr(hasTest('rpg-attrs'), { timeout: 8000 });
      const stable = `(() => {
        const m = document.querySelector('[data-testid="achievement-level"]').textContent.match(/Lv(\\d+)/);
        if (!m) return false;
        const u = document.querySelector('[data-testid="rpg-attr-unspent"]').textContent.trim();
        return u === '可用点数 ' + 2 * (Number(m[1]) - 1);
      })()`;
      await waitForExpr(stable, { timeout: 8000 });
      const lv = await evalExpr(
        `Number(document.querySelector('[data-testid="achievement-level"]').textContent.match(/Lv(\\d+)/)[1])`,
      );
      const granted = 2 * (lv - 1);
      const plus = `[data-testid="rpg-attrs"] button[aria-label="增加力量"]`;
      await evalExpr(`document.querySelector(${JSON.stringify(plus)}).click(); true`);
      await evalExpr(`document.querySelector(${JSON.stringify(plus)}).click(); true`);
      await waitForExpr(
        `document.querySelector('[data-testid="rpg-attr-value-str"]').textContent.trim() === '2' &&
         document.querySelector('[data-testid="rpg-attr-unspent"]').textContent.trim() === '可用点数 ${granted - 2}'`,
        { timeout: 4000 },
      );
      await goto();
      await waitForExpr(hasTest('rpg-attrs'), { timeout: 8000 });
      await waitForExpr(
        `document.querySelector('[data-testid="rpg-attr-value-str"]').textContent.trim() === '2' &&
         document.querySelector('[data-testid="rpg-attr-unspent"]').textContent.trim() === '可用点数 ${granted - 2}'`,
        { timeout: 8000 },
      );
      await evalExpr(
        `document.querySelector('[data-testid="rpg-attrs"] button[aria-label="减少力量"]').click(); true`,
      );
      await waitForExpr(
        `document.querySelector('[data-testid="rpg-attr-value-str"]').textContent.trim() === '1'`,
        { timeout: 4000 },
      );
      await evalExpr(`document.querySelector('[data-testid="rpg-attr-reset"]').click(); true`);
      await waitForExpr(
        `localStorage.getItem('csAiAgentRpgAttrs') === '{}' &&
         document.querySelector('[data-testid="rpg-attr-unspent"]').textContent.trim() === '可用点数 ${granted}' &&
         document.querySelector('[data-testid="rpg-attr-value-str"]').textContent.trim() === '0'`,
        { timeout: 4000 },
      );
    });

    // ——— 汇总 ———
    failures = results.filter(r => !r.ok).length;
    console.log(`\n${results.length - failures}/${results.length} 通过`);
    if (failures > 0) {
      console.log('\n失败用例：');
      for (const r of results.filter(r => !r.ok)) console.log(`  - ${r.name}: ${r.err}`);
      process.exitCode = 1;
    }
  } finally {
    try {
      chrome.kill('SIGKILL');
    } catch {}
    try {
      server.close();
    } catch {}
    try {
      rmSync(profileDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch(e => {
  console.error('harness 启动失败:', e);
  process.exitCode = 1;
});
