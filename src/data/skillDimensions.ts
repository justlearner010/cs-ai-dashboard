import type { SkillDimension } from '../types';

/**
 * 能力雷达图维度定义
 *
 * 设计原则：
 * 1. 覆盖 CS → AI → Agent 完整技术栈
 * 2. 每个维度对应一组可识别的课程技能标签
 * 3. 维度之间尽量正交，避免重复计算
 * 4. 名称简洁，适合在雷达图上展示
 */
export const skillDimensions: SkillDimension[] = [
  {
    key: 'programming',
    label: '编程基础',
    description: '编程语言、Linux/Unix 环境、Shell 脚本、Git 版本控制',
    skills: ['C / Linux / Git'],
    color: '#3b82f6',
    bgColor: '#eff6ff',
  },
  {
    key: 'algorithms',
    label: '数据结构与算法',
    description: '数据结构、算法设计、复杂度分析',
    skills: ['Data Structures', 'Algorithms'],
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
  },
  {
    key: 'math',
    label: '数学基础',
    description: '离散数学、线性代数、概率论与统计',
    skills: ['Discrete Math', 'Linear Algebra', 'Probability'],
    color: '#f97316',
    bgColor: '#fff7ed',
  },
  {
    key: 'software',
    label: '软件工程',
    description: '软件构造、规格说明、测试调试、设计模式、并发编程',
    skills: ['Software Construction', 'Testing / Debugging', 'Concurrency'],
    color: '#06b6d4',
    bgColor: '#ecfeff',
  },
  {
    key: 'systems',
    label: '计算机系统',
    description: '计算机组成、操作系统、计算机网络、数据库系统',
    skills: ['Computer Organization', 'Operating Systems', 'Networking', 'Database'],
    color: '#f59e0b',
    bgColor: '#fffbeb',
  },
  {
    key: 'distributed',
    label: '分布式系统',
    description: 'RPC、复制、一致性模型、共识算法、容错',
    skills: ['RPC', 'Consistency', 'Consensus', 'Fault Tolerance'],
    color: '#ec4899',
    bgColor: '#fdf2f8',
  },
  {
    key: 'ai',
    label: '机器学习 / AI',
    description: '机器学习、深度学习、大语言模型',
    skills: ['ML', 'Deep Learning', 'LLM'],
    color: '#10b981',
    bgColor: '#ecfdf5',
  },
  {
    key: 'agent',
    label: '智能体工程',
    description: '工具编排、状态机、调度、记忆、上下文、故障恢复、可观测性',
    skills: ['Tool Orchestration', 'State', 'Scheduling', 'Memory', 'Context', 'Failure Recovery', 'Observability'],
    color: '#6366f1',
    bgColor: '#eef2ff',
  },
];

export const skillDimensionMap = new Map(skillDimensions.map(d => [d.key, d]));

const skillToDimensionMap = new Map<string, SkillDimension>();
skillDimensions.forEach(d => {
  d.skills.forEach(skill => {
    skillToDimensionMap.set(skill, d);
  });
});

export function getDimensionBySkill(skill: string): SkillDimension | undefined {
  return skillToDimensionMap.get(skill);
}

export function getDimensionsBySkills(skills: string[]): SkillDimension[] {
  const seen = new Set<string>();
  const result: SkillDimension[] = [];
  skills.forEach(skill => {
    const d = getDimensionBySkill(skill);
    if (d && !seen.has(d.key)) {
      seen.add(d.key);
      result.push(d);
    }
  });
  return result;
}
