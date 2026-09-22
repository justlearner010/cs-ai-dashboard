#!/usr/bin/env node

/**
 * 将仪表盘中未完成的任务批量创建为飞书待办
 *
 * 用法：
 *   # 推荐：在仪表盘「今日焦点」点「同步到飞书」导出后：
 *   node scripts/sync-todos-to-feishu.mjs --file feishu-todos-2026-09-22.json
 *
 *   # 完整备份 JSON 也可以（自动提取未完成任务）：
 *   node scripts/sync-todos-to-feishu.mjs --file cs-ai-agent-2026-09-22.json
 *
 *   # 或从 stdin 传入：
 *   cat feishu-todos.json | node scripts/sync-todos-to-feishu.mjs
 *
 * 可选参数：
 *   --tasklist-id <id或applink>  把创建的待办加入指定任务清单
 *   --dry-run                    只打印将要创建的内容，不实际调用
 *
 * 前置条件：
 *   1. 已安装并配置 lark-cli
 *   2. 已执行 lark-cli auth login --domain task
 */

import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';

const TYPE_LABELS = { knowledge: '知识点', lab: 'Lab', question: '问题' };

function getFlag(name) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : undefined;
}

async function getInput() {
  const file = getFlag('--file');
  if (file) {
    return readFileSync(file, 'utf-8');
  }

  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', chunk => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function runLarkCli(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('lark-cli', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', chunk => (stdout += chunk));
    proc.stderr.on('data', chunk => (stderr += chunk));

    proc.on('close', code => {
      if (code !== 0) {
        reject(new Error(`lark-cli exited with ${code}\n${stderr || stdout}`));
      } else {
        try {
          resolve(JSON.parse(stdout));
        } catch {
          resolve(stdout);
        }
      }
    });
  });
}

/** 兼容两种输入：专用同步包 { todos: [...] } 与完整备份 { courses: [...] } */
function extractTodos(data) {
  if (Array.isArray(data.todos)) {
    return data.todos
      .filter(t => t && t.text)
      .map(t => ({
        text: String(t.text),
        type: t.type,
        dueDate: t.dueDate || undefined,
        courseName: t.courseName || '',
      }));
  }

  if (Array.isArray(data.courses)) {
    const todos = [];
    for (const course of data.courses) {
      for (const t of course.todos || []) {
        if (t && !t.done && t.text) {
          todos.push({
            text: String(t.text),
            type: t.type,
            dueDate: t.dueDate || undefined,
            courseName: course.name || '',
          });
        }
      }
    }
    return todos;
  }

  return null;
}

async function main() {
  try {
    const input = await getInput();
    if (!input.trim()) {
      console.error('错误：未提供数据。请使用 --file 指定 JSON 文件，或从 stdin 传入。');
      process.exit(1);
    }

    const todos = extractTodos(JSON.parse(input));
    if (todos === null) {
      console.error('错误：无法识别的数据格式。需要含 todos 数组（同步包）或 courses 数组（完整备份）。');
      process.exit(1);
    }
    if (todos.length === 0) {
      console.log('没有未完成任务，无需同步。');
      return;
    }

    // 有截止日期的排前面，逾期最狠的最先创建
    todos.sort((a, b) =>
      (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99'),
    );

    const tasklistId = getFlag('--tasklist-id');
    const dryRun = process.argv.includes('--dry-run');
    console.log(`共 ${todos.length} 项未完成任务${dryRun ? '（dry-run）' : ''}：\n`);

    let ok = 0;
    let failed = 0;
    for (const t of todos) {
      const typeLabel = TYPE_LABELS[t.type] || t.type || '任务';
      const summary = (t.courseName ? `[${t.courseName}] ${t.text}` : t.text).slice(0, 100);
      const description = [
        `类型：${typeLabel}`,
        t.dueDate ? `截止日期：${t.dueDate}` : '',
        '来源：CS→AI→Agent 学习仪表盘',
      ]
        .filter(Boolean)
        .join('\n');

      const args = ['task', '+create', '--summary', summary, '--description', description];
      if (t.dueDate) args.push('--due', `date:${t.dueDate}`);
      if (tasklistId) args.push('--tasklist-id', tasklistId);

      if (dryRun) {
        console.log(`  [dry-run] ${summary}${t.dueDate ? `（截止 ${t.dueDate}）` : ''}`);
        ok++;
        continue;
      }

      try {
        await runLarkCli(args);
        console.log(`  ✓ ${summary}${t.dueDate ? `（截止 ${t.dueDate}）` : ''}`);
        ok++;
      } catch (error) {
        console.error(`  ✗ ${summary}：${error.message}`);
        failed++;
      }
    }

    console.log(`\n完成：成功 ${ok} 项${failed ? `，失败 ${failed} 项` : ''}。打开飞书「待办」查看。`);
    if (failed) process.exit(1);
  } catch (error) {
    console.error(`错误：${error.message}`);
    process.exit(1);
  }
}

main();
