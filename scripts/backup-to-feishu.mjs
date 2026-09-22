#!/usr/bin/env node

/**
 * 将学习仪表盘备份 JSON 导入飞书文档
 *
 * 用法：
 *   node scripts/backup-to-feishu.mjs --file cs-ai-agent-2025-08-24.json
 *   cat cs-ai-agent-2025-08-24.json | node scripts/backup-to-feishu.mjs
 *
 * 前置条件：
 *   1. 已安装并配置 lark-cli
 *   2. 已执行 lark-cli auth login --domain docs
 */

import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { generateBackupXml } from './lib/backup.mjs';

function getInput() {
  const fileFlag = process.argv.indexOf('--file');
  if (fileFlag !== -1 && process.argv[fileFlag + 1]) {
    return readFileSync(process.argv[fileFlag + 1], 'utf-8');
  }

  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', chunk => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function runLarkCli(content) {
  return new Promise((resolve, reject) => {
    const proc = spawn('lark-cli', ['docs', '+create', '--content', content], {
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
          const result = JSON.parse(stdout);
          resolve(result);
        } catch {
          resolve(stdout);
        }
      }
    });
  });
}

async function main() {
  try {
    const input = await getInput();
    if (!input.trim()) {
      console.error('错误：未提供备份数据。请使用 --file 指定 JSON 文件，或从 stdin 传入。');
      process.exit(1);
    }

    const data = JSON.parse(input);
    if (!data.courses || !Array.isArray(data.logs)) {
      console.error('错误：备份文件格式不正确，缺少 courses 或 logs 字段。');
      process.exit(1);
    }

    const { title, xml } = generateBackupXml(data);
    console.log(`正在创建飞书文档：${title}`);

    const result = await runLarkCli(xml);

    if (result?.ok && result?.data?.document?.url) {
      console.log('✅ 备份成功');
      console.log(`📄 文档链接：${result.data.document.url}`);
    } else {
      console.log('飞书文档创建结果：');
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('备份失败：', error.message);
    process.exit(1);
  }
}

main();
