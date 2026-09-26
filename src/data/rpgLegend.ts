import type { TodoType } from '../types';

/** knowledge 里程碑手写「传说」：按 todoId 精确匹配，未命中静默走程序化规则 */
export interface LegendaryItem {
  todoId: string;
  name: string;
  desc: string;
  from?: TodoType;
}

/** 重工程 lab 手写 Boss：命中的 lab 关卡在副本卡上以 Boss 身份展示 */
export interface BossDungeon {
  todoId: string;
  name: string;
  desc: string;
}

export const LEGENDARY_ITEMS: LegendaryItem[] = [
  { todoId: 'missing-t9', name: '真理叩问', desc: 'Missing Semester 终讲：提问的艺术与社区' },
  { todoId: 'mit-algo-t14', name: '近似先知', desc: 'MIT 算法终章：近似算法与随机算法' },
  { todoId: 'mit-linear-t11', name: '基底权杖', desc: '18.06 终章：线性变换与基变换' },
  { todoId: 'cs50-t10', name: '心智引擎', desc: 'CS50 终章：神经网络与 GPT 原理' },
  { todoId: 'cmu-ics-t15', name: '并发圆桌', desc: '15-213 终讲：同步、并发 bug 模式与性能优化' },
  { todoId: 'mit-os-t13', name: '网络窥镜', desc: '6.1810 终讲：网络栈、ring buffer 与 Ethern' },
  { todoId: 'berkeley-db-t14', name: '万库之枢', desc: 'CS186 终讲：并行与分布式数据库' },
  { todoId: 'mit-dist-t13', name: '分布式星图', desc: '6.5840 终讲：Cassandra / TiKV 案例研究' },
  { todoId: 'karpathy-ztp-t6', name: '深层秘钥', desc: 'Lesson 7：LayerNorm、残差连接与位置编码' },
  { todoId: 'stanford-ml-t13', name: '隐态罗盘', desc: 'CS229 终讲：HMM 与维特比算法' },
  { todoId: 'stanford-nlp-t13', name: '言灵法典', desc: 'CS224N 终讲：LLM、Prompt 工程与 RLHF' },
  { todoId: 'llm-inference-t6', name: '缓存神谕', desc: '主题 7：上下文截断、前缀缓存与结构记忆' },
  { todoId: 'agent-runtime-t15', name: '裁决天平', desc: '子模块 4：Eval Harness 自动化评测' },
  { todoId: 'stanford-moderndev-t8', name: '工坊主印', desc: 'CS146S Week 9：Software Factory 规模化演进' },
  { todoId: 'fullstack-open-t10', name: '部署号角', desc: 'Full Stack Open Part 10：CI/CD 与部署' },
];

export const BOSS_DUNGEONS: BossDungeon[] = [
  { todoId: 'missing-t14', name: '远程结界师', desc: 'Lab 5：tmux + SSH 持久远程开发环境' },
  { todoId: 'missing-t17', name: '自动化流水魔像', desc: 'Lab 8：Makefile 构建 + GitHub Actions' },
  { todoId: 'cs50-t21', name: '毕业巨像', desc: 'Final Project：作品集级完整应用' },
  { todoId: 'cmu-ics-t18', name: '逆向炸弹拆除者', desc: 'Bomb Lab：反汇编 x86-64 拆弹' },
  { todoId: 'cmu-ics-t22', name: '内存九头蛇', desc: 'Malloc Lab：动态内存分配器实现' },
  { todoId: 'mit-os-t15', name: '系统调用监工', desc: 'Lab 1：实现 trace/fork/wait 并过 usertests' },
  { todoId: 'mit-os-t17', name: '深渊陷阱领主', desc: 'Lab 3：backtrace、alarm 与 U-mode trap' },
  { todoId: 'berkeley-db-t15', name: '关系代数守门人', desc: 'Project 1：SELECT/JOIN/聚合执行器' },
  { todoId: 'berkeley-db-t16', name: '索引独眼巨人', desc: 'Project 2：B+ 树索引插入删除与范围扫描' },
  { todoId: 'berkeley-db-t17', name: '代价迷雾巫师', desc: 'Project 3：选择性估计与 Join 顺序搜索' },
  { todoId: 'berkeley-db-t18', name: '锁链双头犬', desc: 'Project 4：锁管理器 / MVCC 可串行化' },
  { todoId: 'berkeley-db-t19', name: 'ARIES 冥河摆渡人', desc: 'Project 5：WAL 与 ARIES 崩溃恢复' },
  { todoId: 'berkeley-db-t20', name: '迷你 DBMS 之王', desc: 'Project 6：索引+优化器+事务+恢复集成' },
  { todoId: 'mit-dist-t17', name: '容错复制巨龙', desc: 'Lab 4：在 Raft 之上构建复制状态机' },
  { todoId: 'stanford-net-t20', name: '拥塞控制海蛇', desc: 'Lab 6：cwnd、ACK 时钟与重传定时器' },
  { todoId: 'karpathy-ztp-t11', name: '莎士比亚炼金龙', desc: 'Lab 5：训练 mini-GPT 生成长文本' },
  { todoId: 'stanford-ml-t23', name: '端到端炼金术士', desc: 'Project：Kaggle 全流程 ML Pipeline' },
  { todoId: 'stanford-nlp-t20', name: '终焉数据集试炼', desc: 'Final Project：SQuAD/SST/CoNLL 自选攻坚' },
  { todoId: 'agent-runtime-t25', name: '运行时化身', desc: 'Lab 10：Docker 部署可运行 Agent Runtime' },
  { todoId: 'hf-agents-t9', name: '文档问答贤者', desc: 'Lab 3：向量检索 RAG Agent 并附引用来源' },
  { todoId: 'stanford-moderndev-t14', name: '造流宗师', desc: 'Final Project：落地 Agent-driven 开发工作流' },
];
