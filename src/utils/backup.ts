import type { Course, LogEntry } from '../types';
import { overallProgress, computeStreak, totalHours, computeSkillRadarData, moodLabel } from './helpers';

export interface BackupPayload {
  markdown: string;
  xml: string;
  title: string;
}

export function generateBackupContent(courses: Course[], logs: LogEntry[]): BackupPayload {
  const { pct, done, total } = overallProgress(courses);
  const streak = computeStreak(logs);
  const hours = totalHours(logs);
  const radar = computeSkillRadarData(courses);
  const now = new Date().toLocaleString('zh-CN');

  const title = `CS→AI→Agent 学习仪表盘备份 ${new Date().toISOString().slice(0, 10)}`;

  const markdown = generateMarkdown(title, now, pct, done, total, streak, hours, radar, courses, logs);
  const xml = generateXml(title, now, pct, done, total, streak, hours, radar, courses, logs);

  return { markdown, xml, title };
}

function generateMarkdown(
  title: string,
  now: string,
  pct: number,
  done: number,
  total: number,
  streak: number,
  hours: number,
  radar: { dimension: string; value: number }[],
  courses: Course[],
  logs: LogEntry[]
): string {
  let md = `# ${title}\n\n`;
  md += `> 备份时间：${now}\n\n`;

  md += `## 📊 概览\n\n`;
  md += `- 总完成度：**${pct}%**\n`;
  md += `- 已完成项：**${done}/${total}**\n`;
  md += `- 连续打卡：**${streak} 天**\n`;
  md += `- 总学习时长：**${hours.toFixed(1)} 小时**\n\n`;

  md += `## 🎯 能力雷达图\n\n`;
  md += '| 能力维度 | 掌握度 |\n|---|---:|\n';
  radar.forEach(r => {
    md += `| ${r.dimension} | ${r.value}% |\n`;
  });
  md += '\n';

  md += `## 📚 课程进度\n\n`;
  courses.forEach(c => {
    const doneCount = c.todos.filter(t => t.done).length;
    const pct = c.todos.length ? Math.round((doneCount / c.todos.length) * 100) : 0;
    md += `### ${c.phase} · ${c.name}\n\n`;
    md += `- 完成度：${doneCount}/${c.todos.length}（${pct}%）\n`;
    md += `- 课程链接：${c.url}\n`;
    md += `- 技能标签：${c.skills.join('、')}\n\n`;
    md += '**未完成任务：**\n\n';
    const undone = c.todos.filter(t => !t.done);
    if (undone.length === 0) {
      md += '- ✅ 全部完成\n\n';
    } else {
      undone.forEach(t => {
        md += `- [ ] [${t.type === 'knowledge' ? '知识点' : t.type === 'lab' ? 'Lab' : '问题'}] ${t.text}\n`;
      });
      md += '\n';
    }
  });

  md += `## 📝 学习日志\n\n`;
  if (logs.length === 0) {
    md += '暂无日志。\n\n';
  } else {
    const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    sorted.forEach(log => {
      md += `### ${log.date} · ${log.course} · ${log.hours}h\n\n`;
      md += `- 状态：${moodLabel(log.mood)}\n`;
      md += `- 📚 知识点：${log.knowledge}\n`;
      md += `- 🛠️ Lab：${log.lab}\n`;
      md += `- ❓ 问题反馈：${log.questions}\n`;
      if (log.reflection) md += `- 💡 反思：${log.reflection}\n`;
      md += '\n';
    });
  }

  return md;
}

function generateXml(
  title: string,
  now: string,
  pct: number,
  done: number,
  total: number,
  streak: number,
  hours: number,
  radar: { dimension: string; value: number }[],
  courses: Course[],
  logs: LogEntry[]
): string {
  let xml = `<title>${escapeXml(title)}</title>\n`;
  xml += `<p>备份时间：${escapeXml(now)}</p>\n`;

  xml += `<h1>📊 概览</h1>\n`;
  xml += `<ul>\n`;
  xml += `<li>总完成度：<b>${pct}%</b></li>\n`;
  xml += `<li>已完成项：<b>${done}/${total}</b></li>\n`;
  xml += `<li>连续打卡：<b>${streak} 天</b></li>\n`;
  xml += `<li>总学习时长：<b>${hours.toFixed(1)} 小时</b></li>\n`;
  xml += `</ul>\n`;

  xml += `<h1>🎯 能力雷达图</h1>\n`;
  xml += `<table>\n`;
  xml += `<thead><tr><th>能力维度</th><th>掌握度</th></tr></thead>\n`;
  xml += `<tbody>\n`;
  radar.forEach(r => {
    xml += `<tr><td>${escapeXml(r.dimension)}</td><td>${r.value}%</td></tr>\n`;
  });
  xml += `</tbody>\n`;
  xml += `</table>\n`;

  xml += `<h1>📚 课程进度</h1>\n`;
  courses.forEach(c => {
    const doneCount = c.todos.filter(t => t.done).length;
    const pct = c.todos.length ? Math.round((doneCount / c.todos.length) * 100) : 0;
    xml += `<h2>${escapeXml(c.phase)} · ${escapeXml(c.name)}</h2>\n`;
    xml += `<ul>\n`;
    xml += `<li>完成度：${doneCount}/${c.todos.length}（${pct}%）</li>\n`;
    xml += `<li>课程链接：<a href="${escapeXml(c.url)}">${escapeXml(c.url)}</a></li>\n`;
    xml += `<li>技能标签：${escapeXml(c.skills.join('、'))}</li>\n`;
    xml += `</ul>\n`;

    const undone = c.todos.filter(t => !t.done);
    if (undone.length === 0) {
      xml += `<p>✅ 全部完成</p>\n`;
    } else {
      xml += `<p><b>未完成任务：</b></p>\n`;
      xml += `<ul>\n`;
      undone.forEach(t => {
        const typeLabel = t.type === 'knowledge' ? '知识点' : t.type === 'lab' ? 'Lab' : '问题';
        xml += `<li>[${typeLabel}] ${escapeXml(t.text)}</li>\n`;
      });
      xml += `</ul>\n`;
    }
  });

  xml += `<h1>📝 学习日志</h1>\n`;
  if (logs.length === 0) {
    xml += `<p>暂无日志。</p>\n`;
  } else {
    const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    sorted.forEach(log => {
      xml += `<h2>${escapeXml(log.date)} · ${escapeXml(log.course)} · ${log.hours}h</h2>\n`;
      xml += `<ul>\n`;
      xml += `<li>状态：${escapeXml(moodLabel(log.mood))}</li>\n`;
      xml += `<li>📚 知识点：${escapeXml(log.knowledge)}</li>\n`;
      xml += `<li>🛠️ Lab：${escapeXml(log.lab)}</li>\n`;
      xml += `<li>❓ 问题反馈：${escapeXml(log.questions)}</li>\n`;
      if (log.reflection) xml += `<li>💡 反思：${escapeXml(log.reflection)}</li>\n`;
      xml += `</ul>\n`;
    });
  }

  return xml;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
