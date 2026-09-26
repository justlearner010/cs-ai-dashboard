# CS → AI → Agent 学习仪表盘

一个基于 React + Vite + TypeScript + Tailwind CSS 的学习进度追踪应用，覆盖从计算机科学基础到 AI 再到 Agent Runtime 的完整学习路径。

## 特性

- 📊 **能力雷达图**：基于规范化的 9 大能力维度实时展示掌握度
- 📅 **学习热力图**：GitHub 风格，直观展示最近一年学习时长分布
- 📚 **课程与任务清单**：按知识点 / Lab / 问题反馈分类管理任务
- 📝 **每日学习日志**：结构化记录知识点、Lab、问题与反思
- 📈 **统计卡片**：总完成度、已完成项、连续打卡、总学习时长
- 💾 **数据持久化**：自动保存到浏览器 localStorage
- 🔄 **导入/导出**：JSON 格式备份与恢复，支持从 V2 版本数据迁移
- ☁️ **飞书文档备份**：一键生成 Markdown/XML 备份内容，或运行脚本自动创建飞书文档

## 能力雷达图维度

| 维度 | 说明 | 关联技能标签 |
|------|------|-------------|
| 编程基础 | 编程语言、Linux/Unix、Shell、Git | C / Linux / Git |
| 数据结构与算法 | 数据结构、算法、复杂度 | Data Structures, Algorithms |
| 数学基础 | 离散数学、线性代数、概率论与统计 | Discrete Math, Linear Algebra, Probability |
| 软件工程 | 软件构造、测试调试、设计模式、并发 | Software Construction, Testing / Debugging, Concurrency |
| 计算机系统 | 计组、操作系统、网络、数据库 | Computer Organization, Operating Systems, Networking, Database |
| 分布式系统 | RPC、复制、一致性、共识、容错 | RPC, Consistency, Consensus, Fault Tolerance |
| 机器学习 / AI | ML、深度学习、LLM | ML, Deep Learning, LLM |
| 智能体工程 | 工具编排、状态、调度、记忆、上下文、故障恢复、可观测性 | Tool Orchestration, State, Scheduling, Memory, Context, Failure Recovery, Observability |
| 产品设计 | 界面设计、用户研究、产品需求分析 | UI Design, UX Research, Product Requirements |

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 部署（GitHub Pages）

线上地址：**https://justlearner010.github.io/cs-ai-dashboard/**

由 GitHub Actions 在每次推送到 `main` 时自动构建发布（见 `.github/workflows/deploy.yml`）。

### 只有我能改

- GitHub 仓库写权限仅属你一人（`justlearner010`）——**只有你能改代码、能触发新部署**，别人只能看页面
- 站点数据保存在**各自浏览器的 localStorage**，互不可见；备份靠「导出 / 飞书备份」，不经过服务器
- 页面带 `noindex`，请搜索引擎勿收录

### 更新站点

```bash
npm run deploy
```

一键提交改动并推送，Actions 约 1 分钟后自动上线；进度看仓库 Actions 页或 `gh run watch`。

> 注意：GitHub 免费版 Pages 需要仓库公开（源码可见但只有你能改）。
> 若希望源码也私密，升级 GitHub Pro 后把仓库设为 private 即可，Actions 配置无需改动。
> MyGO!!!!! 主题素材仅限个人学习使用（见 `public/MYGO-ASSETS.md`），请勿挪作商业用途。

## 飞书文档云备份

### 方式一：浏览器内复制（最快）

1. 点击顶部「飞书备份」按钮
2. 在弹窗中选择 `Markdown` 或 `飞书 XML`
3. 点击「复制」或「下载」
4. 在飞书文档中使用「导入 Markdown」或配合脚本自动创建

### 方式二：命令行自动创建飞书文档

```bash
# 先在前端导出 JSON 备份，然后运行：
node scripts/backup-to-feishu.mjs --file cs-ai-agent-2025-08-24.json

# 或从 stdin 传入：
cat cs-ai-agent-2025-08-24.json | node scripts/backup-to-feishu.mjs
```

前置条件：已安装 `lark-cli` 并执行 `lark-cli auth login --domain docs`。

## 飞书待办同步（防忘记）

把仪表盘里所有未完成任务一键变成飞书待办，由飞书（含手机推送）负责到点提醒：

1. 在「今日焦点」卡片点「同步到飞书」，下载 `feishu-todos-YYYY-MM-DD.json`
2. 运行脚本批量创建：

```bash
node scripts/sync-todos-to-feishu.mjs --file feishu-todos-2026-09-22.json

# 先预览不实际创建：
node scripts/sync-todos-to-feishu.mjs --file feishu-todos-2026-09-22.json --dry-run

# 加入指定任务清单：
node scripts/sync-todos-to-feishu.mjs --file feishu-todos-2026-09-22.json --tasklist-id <任务清单id>
```

前置条件：已安装 `lark-cli` 并执行 `lark-cli auth login --domain task`。

有截止日期的任务会带上飞书截止时间（逾期的排最前创建）；完整备份 JSON 也可直接作为入参。

## 项目结构

```
src/
  components/     # React 组件
  data/           # 课程数据与能力维度定义
  hooks/          # 自定义 Hooks
  utils/          # 工具函数
  App.tsx         # 应用主组件
  main.tsx        # 入口文件
  index.css       # Tailwind 样式
```

## 数据来源

课程清单共 25 门、按 6 个阶段组织，全部为公开优质课程：

- **① 编程、算法与数学基础**：Harvard CS50x、MIT Missing Semester、MIT 6.006（算法）、MIT 6.1200（离散数学）、MIT 18.06（线性代数）、MIT 18.600（概率论）
- **② 系统与分布式**：CMU 15-213、MIT 6.1810（操作系统）、Stanford CS144（网络）、Berkeley CS186（数据库）、MIT 6.5840（分布式）
- **③ 机器学习与 LLM**：Karpathy Neural Networks: Zero to Hero、Stanford CS229、Stanford CS224N、LLM Inference & Serving
- **④ Agent Runtime**：Build Your Own Agent Runtime、Agent Engine & Sandbox、HuggingFace Agents Course、DeepLearning.AI Evaluating AI Agents
- **⑤ 全栈工程**：Full Stack Open、Harvard CS50W；Stanford CS146S（The Modern Software Developer）
- **⑥ 产品与设计**：Figma Learn Design、Google UX Design、Introduction to Product Management
