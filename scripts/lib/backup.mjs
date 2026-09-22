// 飞书文档备份内容生成器（Node.js 复用版）

const skillDimensions = [
  {
    key: 'programming',
    label: '编程基础',
    skills: ['C / Linux / Git'],
  },
  {
    key: 'algorithms',
    label: '数据结构与算法',
    skills: ['Data Structures', 'Algorithms'],
  },
  {
    key: 'math',
    label: '数学基础',
    skills: ['Discrete Math', 'Linear Algebra', 'Probability'],
  },
  {
    key: 'software',
    label: '软件工程',
    skills: ['Software Construction', 'Testing / Debugging', 'Concurrency'],
  },
  {
    key: 'systems',
    label: '计算机系统',
    skills: ['Computer Organization', 'Operating Systems', 'Networking', 'Database'],
  },
  {
    key: 'distributed',
    label: '分布式系统',
    skills: ['RPC', 'Consistency', 'Consensus', 'Fault Tolerance'],
  },
  {
    key: 'ai',
    label: '机器学习 / AI',
    skills: ['ML', 'Deep Learning', 'LLM'],
  },
  {
    key: 'agent',
    label: '智能体工程',
    skills: ['Tool Orchestration', 'State', 'Scheduling', 'Memory', 'Context', 'Failure Recovery', 'Observability'],
  },
];

function overallProgress(courses) {
  const all = courses.flatMap(c => c.todos);
  const done = all.filter(t => t.done).length;
  const total = all.length;
  return { pct: total ? Math.round((done / total) * 100) : 0, done, total };
}

function computeSkillRadarData(courses) {
  return skillDimensions.map(dimension => {
    const relatedCourses = courses.filter(c =>
      c.skills.some(skill => dimension.skills.includes(skill))
    );

    if (relatedCourses.length === 0) {
      return { dimension: dimension.label, value: 0 };
    }

    const total = relatedCourses.reduce((s, c) => s + c.todos.length, 0);
    const done = relatedCourses.reduce((s, c) => s + c.todos.filter(t => t.done).length, 0);
    const value = total ? Math.round((done / total) * 100) : 0;

    return { dimension: dimension.label, value };
  });
}

function computeStreak(logs) {
  if (logs.length === 0) return 0;
  const dates = [...new Set(logs.map(l => l.date))].sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  const check = new Date();
  check.setHours(0, 0, 0, 0);
  for (const d of dates) {
    const cur = new Date(d);
    cur.setHours(0, 0, 0, 0);
    const diff = (check - cur) / (1000 * 60 * 60 * 24);
    if (diff <= 1) {
      streak++;
      check.setTime(cur.getTime());
    } else {
      break;
    }
  }
  return streak;
}

function totalHours(logs) {
  return logs.reduce((s, l) => s + (Number(l.hours) || 0), 0);
}

function moodLabel(m) {
  const map = {
    focused: '专注',
    tired: '疲惫',
    excited: '兴奋',
    confused: '困惑',
    productive: '高效',
  };
  return map[m] || m;
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateBackupXml(data) {
  const { courses, logs } = data;
  const { pct, done, total } = overallProgress(courses);
  const streak = computeStreak(logs);
  const hours = totalHours(logs);
  const radar = computeSkillRadarData(courses);
  const now = new Date().toLocaleString('zh-CN');

  const title = `CS→AI→Agent 学习仪表盘备份 ${new Date().toISOString().slice(0, 10)}`;

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
    const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
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

  return { title, xml };
}
