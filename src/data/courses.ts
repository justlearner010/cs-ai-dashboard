import type { Course } from "../types";

export const defaultCourses: Omit<Course, "todos">[] = [
  // ============ Phase 1: 编程与算法基础 ============
  {
    id: "cs50",
    phase: "① 编程与算法基础",
    name: "Harvard CS50x",
    fullName: "Introduction to Computer Science",
    url: "https://cs50.harvard.edu/x/",
    skills: ["C / Linux / Git"],
    prerequisites: [],
    resources: [
      {
        type: "video",
        title: "B站官方频道",
        url: "https://space.bilibili.com/494307248",
      },
      { type: "code", title: "CS50 GitHub", url: "https://github.com/cs50" },
    ],
  },
  {
    id: "missing",
    phase: "① 编程与算法基础",
    name: "MIT Missing Semester",
    fullName: "The Missing Semester of Your CS Education",
    url: "https://missing.csail.mit.edu/",
    skills: ["C / Linux / Git"],
    prerequisites: [],
    resources: [
      {
        type: "notes",
        title: "中文翻译",
        url: "https://missing.csail.mit.edu/",
      },
      {
        type: "code",
        title: "dotfiles 示例",
        url: "https://github.com/anishathalye/dotfiles",
      },
    ],
  },
  {
    id: "mit-algo",
    phase: "① 编程与算法基础",
    name: "MIT 6.1210 / 6.006",
    fullName: "Introduction to Algorithms",
    url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/",
    skills: ["Algorithms"],
    prerequisites: ["mit-math"],
    resources: [
      {
        type: "video",
        title: "MIT OpenCourseWare",
        url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/",
      },
      {
        type: "notes",
        title: "讲义与作业",
        url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/readings/",
      },
    ],
  },
  {
    id: "mit-math",
    phase: "① 编程与算法基础",
    name: "MIT 6.1200",
    fullName: "Mathematics for Computer Science",
    url: "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/",
    skills: ["Discrete Math"],
    prerequisites: [],
    resources: [
      {
        type: "video",
        title: "MIT OpenCourseWare",
        url: "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/",
      },
      {
        type: "notes",
        title: "教材 PDF",
        url: "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/pages/readings/",
      },
    ],
  },
  {
    id: "mit-linear",
    phase: "① 编程与算法基础",
    name: "MIT 18.06",
    fullName: "Linear Algebra (Gilbert Strang)",
    url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
    skills: ["Linear Algebra"],
    prerequisites: [],
    resources: [
      {
        type: "video",
        title: "MIT OpenCourseWare",
        url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
      },
      {
        type: "notes",
        title: "讲义 PDF",
        url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/pages/lecture-notes/",
      },
      {
        type: "book",
        title: "《线性代数及其应用》",
        url: "https://math.mit.edu/~gs/linearalgebra/",
      },
      {
        type: "video",
        title: "3Blue1Brown 线性代数本质（参考视频）",
        url: "https://www.3blue1brown.com/topics/linear-algebra",
      },
    ],
  },
  {
    id: "mit-probability",
    phase: "① 编程与算法基础",
    name: "MIT 18.600",
    fullName: "Probability and Random Variables",
    url: "https://ocw.mit.edu/courses/18-600-probability-and-random-variables-fall-2019/",
    skills: ["Probability"],
    prerequisites: ["mit-math"],
    resources: [
      {
        type: "video",
        title: "MIT OpenCourseWare",
        url: "https://ocw.mit.edu/courses/18-600-probability-and-random-variables-fall-2019/",
      },
      {
        type: "notes",
        title: "讲义 PDF",
        url: "https://ocw.mit.edu/courses/18-600-probability-and-random-variables-fall-2019/pages/lecture-notes/",
      },
      {
        type: "video",
        title: "3Blue1Brown 概率论本质（参考视频）",
        url: "https://www.3blue1brown.com/topics/probability",
      },
    ],
  },
  // ============ Phase 2: 系统与分布式 ============
  {
    id: "cmu-ics",
    phase: "② 系统与分布式",
    name: "CMU 15-213",
    fullName: "Introduction to Computer Systems",
    url: "https://www.cs.cmu.edu/~213/",
    skills: ["Computer Organization"],
    prerequisites: ["cs50"],
    resources: [
      {
        type: "video",
        title: "B站视频",
        url: "https://www.bilibili.com/video/BV1XW411A7xL",
      },
      {
        type: "code",
        title: "CS:APP Labs",
        url: "http://csapp.cs.cmu.edu/3e/labs.html",
      },
    ],
  },
  {
    id: "mit-os",
    phase: "② 系统与分布式",
    name: "MIT 6.1810",
    fullName: "Operating Systems Engineering",
    url: "https://pdos.csail.mit.edu/6.1810/",
    skills: ["Operating Systems"],
    prerequisites: ["cmu-ics"],
    resources: [
      {
        type: "code",
        title: "xv6 源码",
        url: "https://github.com/mit-pdos/xv6-riscv",
      },
      {
        type: "notes",
        title: "xv6 book",
        url: "https://pdos.csail.mit.edu/6.828/2023/xv6/book-riscv-rev3.pdf",
      },
    ],
  },
  {
    id: "stanford-net",
    phase: "② 系统与分布式",
    name: "Stanford CS144",
    fullName: "Computer Networking",
    url: "https://cs144.stanford.edu/",
    skills: ["Networking"],
    prerequisites: ["cmu-ics"],
    optional: true,
    resources: [
      { type: "video", title: "课程视频", url: "https://cs144.stanford.edu/" },
      {
        type: "code",
        title: "Lab 代码",
        url: "https://github.com/CS144/sponge",
      },
    ],
  },
  {
    id: "berkeley-db",
    phase: "② 系统与分布式",
    name: "Berkeley CS186",
    fullName: "Introduction to Database Systems",
    url: "https://cs186berkeley.net/",
    skills: ["Database"],
    prerequisites: ["cmu-ics"],
    resources: [
      {
        type: "notes",
        title: "课程讲义与 Schedule",
        url: "https://cs186berkeley.net/fa24/",
      },
      {
        type: "video",
        title: "CS186 官方视频（YouTube 频道）",
        url: "https://www.youtube.com/user/CS186Berkeley",
      },
      {
        type: "code",
        title: "课程 Project 与讲义公开 Drive",
        url: "https://drive.google.com/drive/folders/1OBW8gmsmBzSu8kj_MngsO6mpliHl_J6q",
      },
      {
        type: "book",
        title: "《Database Management Systems》(Ramakrishnan & Gehrke)",
        url: "http://pages.cs.wisc.edu/~dbbook/",
      },
    ],
  },
  {
    id: "mit-dist",
    phase: "② 系统与分布式",
    name: "MIT 6.5840",
    fullName: "Distributed Systems Engineering",
    url: "https://pdos.csail.mit.edu/6.824/",
    skills: ["RPC", "Consistency", "Consensus", "Fault Tolerance"],
    prerequisites: ["cmu-ics"],
    resources: [
      {
        type: "video",
        title: "课程视频",
        url: "https://pdos.csail.mit.edu/6.824/",
      },
      { type: "code", title: "Lab 代码", url: "https://github.com/6.824" },
    ],
  },
  // ============ Phase 3: 深度学习与 LLM ============
  {
    id: "karpathy-ztp",
    phase: "③ 深度学习与 LLM",
    name: "Zero to Hero (Karpathy)",
    fullName: "Neural Networks: Zero to Hero",
    url: "https://karpathy.ai/zero-to-hero.html",
    skills: ["ML", "Deep Learning"],
    prerequisites: ["mit-linear", "mit-probability"],
    resources: [
      {
        type: "video",
        title: "YouTube 系列",
        url: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ",
      },
      {
        type: "code",
        title: "micrograd 源码",
        url: "https://github.com/karpathy/micrograd",
      },
      {
        type: "code",
        title: "nanoGPT 源码",
        url: "https://github.com/karpathy/nanoGPT",
      },
    ],
  },
  {
    id: "stanford-ml",
    phase: "③ 深度学习与 LLM",
    name: "Stanford CS229",
    fullName: "Machine Learning",
    url: "https://cs229.stanford.edu/",
    skills: ["ML"],
    prerequisites: ["mit-math", "mit-linear", "mit-probability"],
    resources: [
      { type: "video", title: "课程视频", url: "https://cs229.stanford.edu/" },
      {
        type: "notes",
        title: "讲义笔记",
        url: "https://cs229.stanford.edu/summer2020/",
      },
    ],
  },
  {
    id: "stanford-nlp",
    phase: "③ 深度学习与 LLM",
    name: "Stanford CS224N",
    fullName: "NLP with Deep Learning",
    url: "https://web.stanford.edu/class/cs224n/",
    skills: ["Deep Learning", "LLM"],
    prerequisites: ["stanford-ml"],
    resources: [
      {
        type: "video",
        title: "课程视频",
        url: "https://web.stanford.edu/class/cs224n/",
      },
      {
        type: "code",
        title: "Assignment 代码",
        url: "https://web.stanford.edu/class/cs224n/",
      },
    ],
  },
  {
    id: "llm-inference",
    phase: "③ 深度学习与 LLM",
    name: "LLM Systems",
    fullName: "LLM Inference & Serving Runtime",
    url: "https://github.com/vllm-project/vllm",
    skills: ["LLM", "Deep Learning"],
    prerequisites: ["karpathy-ztp", "stanford-nlp"],
    resources: [
      {
        type: "code",
        title: "vLLM 源码",
        url: "https://github.com/vllm-project/vllm",
      },
      {
        type: "code",
        title: "SGLang 源码",
        url: "https://github.com/sgl-project/sglang",
      },
      {
        type: "code",
        title: "llama.cpp",
        url: "https://github.com/ggml-org/llama.cpp",
      },
    ],
  },
  {
    id: "stanford-moderndev",
    phase: "③ 深度学习与 LLM",
    name: "Stanford CS146S",
    fullName: "The Modern Software Developer (Fall 2026)",
    url: "https://themodernsoftware.dev",
    skills: ["LLM", "Tool Orchestration", "Testing / Debugging"],
    prerequisites: ["stanford-ml", "llm-inference"],
    resources: [
      {
        type: "notes",
        title: "课程主页",
        url: "https://themodernsoftware.dev",
      },
      {
        type: "video",
        title: "课程介绍（Mihail Eric）",
        url: "https://themodernsoftware.dev",
      },
    ],
  },
  // ============ Phase 4: Agent Runtime ============
  {
    id: "agent-runtime",
    phase: "④ Agent Runtime",
    name: "Agent Runtime 项目",
    fullName: "Build Your Own Agent Runtime",
    url: "https://langchain-ai.github.io/langgraph/",
    skills: [
      "Tool Orchestration",
      "State",
      "Scheduling",
      "Memory",
      "Context",
      "Failure Recovery",
      "Observability",
    ],
    prerequisites: ["stanford-nlp", "mit-dist"],
    resources: [
      {
        type: "notes",
        title: "LangGraph 文档",
        url: "https://langchain-ai.github.io/langgraph/",
      },
      {
        type: "code",
        title: "LangGraph GitHub",
        url: "https://github.com/langchain-ai/langgraph",
      },
    ],
  },
  {
    id: "agent-engine",
    phase: "④ Agent Runtime",
    name: "Agent Engine & Sandbox",
    fullName: "Agent Execution Engine & Sandboxing",
    url: "https://modelcontextprotocol.io/",
    skills: ["Tool Orchestration", "Failure Recovery", "State"],
    prerequisites: ["agent-runtime"],
    resources: [
      {
        type: "notes",
        title: "MCP 规范",
        url: "https://modelcontextprotocol.io/",
      },
      {
        type: "code",
        title: "MCP SDK",
        url: "https://github.com/modelcontextprotocol",
      },
      {
        type: "notes",
        title: "Durable Execution",
        url: "https://docs.temporal.io/",
      },
    ],
  },
];

const defaultTodos: Record<
  string,
  { type: "knowledge" | "lab" | "question"; text: string }[]
> = {
  cs50: [
    {
      type: "knowledge",
      text: "Week 0: Scratch 编程与计算思维入门（二进制、算法概念、抽象）",
    },
    {
      type: "knowledge",
      text: "Week 1: C 语言基础（变量、数据类型、运算符、格式化输入输出）",
    },
    {
      type: "knowledge",
      text: "Week 2: 数组与字符串（字符串处理、命令行参数）",
    },
    {
      type: "knowledge",
      text: "Week 3: 算法复杂度（大 O 表示法、线性搜索与二分搜索）",
    },
    {
      type: "knowledge",
      text: "Week 4: 内存与指针（地址、malloc/free、指针运算）",
    },
    { type: "knowledge", text: "Week 5: 数据结构入门（链表、哈希表、树）" },
    {
      type: "knowledge",
      text: "Week 6: Python 语法（与 C 的对比、动态类型、面向对象）",
    },
    {
      type: "knowledge",
      text: "Week 7: SQL 与关系型数据库（SELECT、JOIN、索引）",
    },
    {
      type: "knowledge",
      text: "Week 8: Web 开发基础（HTML、CSS、JavaScript、Flask）",
    },
    {
      type: "knowledge",
      text: "Week 9: Flask 与网络（路由、模板、表单、API）",
    },
    {
      type: "knowledge",
      text: "Week 10: 人工智能与机器学习概念（神经网络、GPT 原理）",
    },
    {
      type: "lab",
      text: "Problem Set 0: Scratch 实现简单动画/小游戏（条件、循环、变量、事件）",
    },
    {
      type: "lab",
      text: "Problem Set 1: C 实现 Hello、Hello Again（水印、位数计算、贪心）",
    },
    {
      type: "lab",
      text: "Problem Set 2: C 处理字符串与数组（Readability、Caesar、Bulbs/Substitution）",
    },
    {
      type: "lab",
      text: "Problem Set 3: C 实现排序与递归（Sort、Plurality、Tideman 选举算法）",
    },
    {
      type: "lab",
      text: "Problem Set 4: C 内存与指针（Volume、Filter PNG、Recover JPEG）",
    },
    {
      type: "lab",
      text: "Problem Set 5: C 数据结构（Inheritance 链表、Spooky 哈希、Pokedex 树）",
    },
    {
      type: "lab",
      text: "Problem Set 6: Python 重构 C 程序（DNA、Hello Python、Bank）",
    },
    {
      type: "lab",
      text: "Problem Set 7: SQL 查询（movies.db、multi-table JOIN）",
    },
    {
      type: "lab",
      text: "Problem Set 8: HTML/CSS/JS 静态网页（Homepage、Trivia）",
    },
    {
      type: "lab",
      text: "Problem Set 9: Flask Web 应用（Finance 模拟交易平台）",
    },
    {
      type: "lab",
      text: "Final Project: 自选主题项目（作品集级别的完整应用）",
    },
    {
      type: "question",
      text: "Scratch 中的抽象、函数、事件如何对应到真实编程语言的概念？C 与 Python 的内存模型有何本质差异？",
    },
    {
      type: "question",
      text: "为什么哈希表查找平均是 O(1) 但最坏是 O(n)？Tideman 投票算法为什么能防止选票被“战术性利用”？",
    },
    {
      type: "question",
      text: "SQL 中的外键与索引如何协同工作？Flask 应用中客户端与服务器的数据流是怎样的，如何防范注入攻击？",
    },
    {
      type: "question",
      text: "完成 Final Project 后，你如何向他人讲述从 C 到 Python、再到 Web 与 AI 的能力跃迁？",
    },
  ],

  missing: [
    {
      type: "knowledge",
      text: "Lecture 1: 课程概览与 Shell（Bash 基本命令、文件系统、管道）",
    },
    {
      type: "knowledge",
      text: "Lecture 2: Shell 工具与脚本（find、grep、sed、awk、bash 脚本）",
    },
    {
      type: "knowledge",
      text: "Lecture 3: Vim 编辑器（模式、常用动作、配置 dotfiles）",
    },
    {
      type: "knowledge",
      text: "Lecture 4: 数据整理（正则表达式、数据清洗、jq）",
    },
    {
      type: "knowledge",
      text: "Lecture 5: 命令行环境（任务控制、tmux、SSH、dotfiles 同步）",
    },
    {
      type: "knowledge",
      text: "Lecture 6: 版本控制（Git 基础：commit、branch、merge、rebase）",
    },
    {
      type: "knowledge",
      text: "Lecture 7: 调试与性能分析（gdb、pdb、perf、strace）",
    },
    {
      type: "knowledge",
      text: "Lecture 8: 元编程（Makefile、CI、依赖管理、构建系统）",
    },
    {
      type: "knowledge",
      text: "Lecture 9: 安全与密码学基础（熵、对称/非对称加密、SSH Keys）",
    },
    {
      type: "knowledge",
      text: "Lecture 10: 提问的艺术与社区（Stack Overflow、邮件、Issue）",
    },
    {
      type: "lab",
      text: "Lab 1: 在 Shell 中批量重命名/统计文件（管道、xargs、find 组合）",
    },
    {
      type: "lab",
      text: "Lab 2: 编写 Bash 脚本自动备份并打日志（参数、退出码、trap）",
    },
    {
      type: "lab",
      text: "Lab 3: 配置 Vim 与 dotfiles（.vimrc、插件、Symlink 同步到 GitHub）",
    },
    {
      type: "lab",
      text: "Lab 4: 用正则提取/清洗日志文本（grep/awk/sed 实战）",
    },
    {
      type: "lab",
      text: "Lab 5: tmux + SSH 配置远程开发环境（多窗格、持久会话）",
    },
    {
      type: "lab",
      text: "Lab 6: Git 实战（rebase vs merge、stash、bisect 找 bug）",
    },
    {
      type: "lab",
      text: "Lab 7: 用 gdb/pdb 调试真实程序，并用 perf 找性能瓶颈",
    },
    {
      type: "lab",
      text: "Lab 8: 写一个 Makefile 构建小型 C/Python 项目，并接入 GitHub Actions",
    },
    {
      type: "lab",
      text: "Lab 9: 生成 SSH 密钥、对称加密本地文件（gpg/openssl）",
    },
    {
      type: "lab",
      text: "Lab 10: 在 Issue/Stack Overflow 上提一个高质量技术问题（MCVE 模板）",
    },
    {
      type: "question",
      text: "Shell、编辑器、Git 这些工具如何组合成“高效开发流”？dotfiles 管理的最佳实践是什么？",
    },
    {
      type: "question",
      text: "rebase 与 merge 在团队协作中如何权衡？为什么 bisect 是定位回归 bug 的利器？",
    },
    {
      type: "question",
      text: "加密、哈希、签名各自解决什么问题？为何现代开发几乎离不开 SSH Key？",
    },
  ],

  "mit-algo": [
    {
      type: "knowledge",
      text: "Lecture 1: 算法分析与渐近记号（Asymptotic notation、Big-O/Θ/Ω、插入排序分析）",
    },
    {
      type: "knowledge",
      text: "Lecture 2: 分治法与归并排序（Master theorem、归并排序、递归树）",
    },
    {
      type: "knowledge",
      text: "Lecture 3: 动态规划基础（最优子结构、重叠子问题、rod cutting 与矩阵链乘）",
    },
    {
      type: "knowledge",
      text: "Lecture 4: 高级动态规划（最长公共子序列、最短路径、记忆化搜索）",
    },
    {
      type: "knowledge",
      text: "Lecture 5: 排序与线性时间算法（堆排序、计数排序、基数排序、下界）",
    },
    {
      type: "knowledge",
      text: "Lecture 6: 二叉搜索树与平衡树（AVL、红黑树插入/删除）",
    },
    {
      type: "knowledge",
      text: "Lecture 7: 哈希表（直接寻址、链地址、开放寻址、universal hashing）",
    },
    {
      type: "knowledge",
      text: "Lecture 8: 区间树与优先队列（二项堆、斐波那契堆）",
    },
    {
      type: "knowledge",
      text: "Lecture 9: B 树与外存算法（磁盘模型、cache-oblivious）",
    },
    {
      type: "knowledge",
      text: "Lecture 10: 图的基础与 BFS/DFS（邻接表/矩阵、强连通分量）",
    },
    {
      type: "knowledge",
      text: "Lecture 11: 最短路径（Dijkstra、Bellman-Ford、Johnson）",
    },
    {
      type: "knowledge",
      text: "Lecture 12: 最小生成树与并查集（Kruskal、Prim、Union-Find）",
    },
    {
      type: "knowledge",
      text: "Lecture 13: 贪心算法（活动选择、Huffman 编码、拟阵）",
    },
    {
      type: "knowledge",
      text: "Lecture 14: NP 完全性与归约（SAT、3-SAT、TSP、Clique）",
    },
    {
      type: "knowledge",
      text: "Lecture 15: 近似算法与随机算法（负载均衡、随机舍入）",
    },
    { type: "lab", text: "PSet 1: 渐近分析与插入/归并排序的运行时实验与证明" },
    { type: "lab", text: "PSet 2: 链表中点查找、peak finder（递归与迭代）" },
    { type: "lab", text: "PSet 3: 区间调度与加权区间调度（贪心与 DP）" },
    { type: "lab", text: "PSet 4: AVL / 红黑树插入与删除的纸上模拟" },
    { type: "lab", text: "PSet 5: Universal Hashing 与 Bloom Filter 实现" },
    {
      type: "lab",
      text: "PSet 6: Dijkstra 与 Bellman-Ford 在真实图上的实现与比较",
    },
    {
      type: "lab",
      text: "PSet 7: Kruskal MST 与 Union-Find 性能调优（路径压缩 + 按秩合并）",
    },
    { type: "lab", text: "PSet 8: Huffman 编码与最优前缀码构造" },
    {
      type: "lab",
      text: "Recitation: Python/Recursion Tree 实践（递归树绘制、复杂度推导）",
    },
    {
      type: "question",
      text: "面对一个新问题，如何系统判断该使用分治、动态规划还是贪心？各自的适用判据是什么？",
    },
    {
      type: "question",
      text: "红黑树与 AVL 树在实际系统（如 Java TreeMap、Linux CFS）中如何取舍？为什么？",
    },
    {
      type: "question",
      text: "能否口头证明某个图问题属于 NP 完全：先给出判定版本，再构造从已知 NP 完全问题的多项式归约？",
    },
  ],

  "mit-math": [
    {
      type: "knowledge",
      text: "Lecture 1: 命题逻辑与等价（真值表、CNF/DNF、蕴含/逆否）",
    },
    {
      type: "knowledge",
      text: "Lecture 2: 谓词逻辑与量词（∀、∃、嵌套量词顺序、Nested quantifiers）",
    },
    {
      type: "knowledge",
      text: "Lecture 3: 数学证明方法（直接证明、反证、归纳、构造）",
    },
    {
      type: "knowledge",
      text: "Lecture 4: 强归纳与良序原理（强归纳证明、递归定义、well-ordering）",
    },
    {
      type: "knowledge",
      text: "Lecture 5: 集合、关系与函数（幂集、偏序、等价关系、函数复合）",
    },
    {
      type: "knowledge",
      text: "Lecture 6: 关系与图（自反/对称/传递、连通性、图的矩阵表示）",
    },
    {
      type: "knowledge",
      text: "Lecture 7: 图的基本算法（最短路径、生成树、欧拉/哈密顿回路）",
    },
    {
      type: "knowledge",
      text: "Lecture 8: 树与生成树（最小生成树、Prim/Kruskal、Prim's MST 证明）",
    },
    {
      type: "knowledge",
      text: "Lecture 9: 模运算与丢番图方程（GCD、扩展欧几里得、模逆元）",
    },
    {
      type: "knowledge",
      text: "Lecture 10: 模幂与 RSA（Fermat 小定理、Euler 定理、RSA 加解密）",
    },
    {
      type: "knowledge",
      text: "Lecture 11: 计数与组合（鸽巢原理、二项式系数、组合恒等式）",
    },
    {
      type: "knowledge",
      text: "Lecture 12: 概率基础（样本空间、条件概率、独立性、贝叶斯公式）",
    },
    {
      type: "knowledge",
      text: "Lecture 13: 期望与方差（随机变量、指示变量、Markov/Chebyshev 不等式）",
    },
    {
      type: "knowledge",
      text: "Lecture 14: 状态机与同余关系（DFA/NFA、正则语言、Kleene 定理）",
    },
    {
      type: "knowledge",
      text: "Lecture 15: 递归与分治递推（Master theorem、生成函数入门）",
    },
    { type: "lab", text: "Recitation 1: 真值表与逻辑等价化简练习" },
    { type: "lab", text: "Recitation 2: 数学证明写作（归纳法、反证法模板）" },
    { type: "lab", text: "Recitation 3: 关系性质判定（偏序、等价、商集）" },
    { type: "lab", text: "Recitation 4: 图论证明（握手定理、欧拉回路判定）" },
    { type: "lab", text: "Recitation 5: GCD 与模逆元的程序实现" },
    { type: "lab", text: "Recitation 6: RSA 小整数加解密实验" },
    { type: "lab", text: "Recitation 7: 组合计数与递推求解练习" },
    {
      type: "lab",
      text: "Recitation 8: 期望计算与概率证明（生日悖论、Coupon Collector）",
    },
    { type: "lab", text: "Problem Set 1-4: 公开课后习题集（覆盖前 8 章）" },
    {
      type: "question",
      text: "面对一个命题，先确认是等价/蕴含/逆向，再选择恰当的证明策略——能否口头走通这一流程？",
    },
    {
      type: "question",
      text: "为什么 RSA 中欧拉定理成立？能否从 Fermat 小定理推导出来？公开指数 e 与私钥 d 如何生成？",
    },
    {
      type: "question",
      text: "对同一个计数问题，使用组合恒等式、生成函数、递推三种方法各能得到什么洞察？它们如何互相验证？",
    },
  ],

  "mit-linear": [
    {
      type: "knowledge",
      text: "Lecture 1-2: 线性方程组与高斯消元（行/列视图、初等行变换、秩）",
    },
    {
      type: "knowledge",
      text: "Lecture 3-5: 矩阵乘法与逆矩阵（四种乘法视角、逆、A=LU 分解）",
    },
    {
      type: "knowledge",
      text: "Lecture 6-7: 置换矩阵与转置（对称矩阵、左逆/右逆）",
    },
    {
      type: "knowledge",
      text: "Lecture 8-10: 向量空间与子空间（列空间、零空间、秩-零化度定理）",
    },
    {
      type: "knowledge",
      text: "Lecture 11-13: 正交向量与投影（Gram-Schmidt 正交化、QR 分解、最小二乘）",
    },
    {
      type: "knowledge",
      text: "Lecture 14-16: 行列式（性质、展开式、克拉默法则、体积）",
    },
    {
      type: "knowledge",
      text: "Lecture 17-19: 特征值与特征向量（对角化、相似矩阵、斐波那契应用）",
    },
    {
      type: "knowledge",
      text: "Lecture 20-21: 微分方程与矩阵指数（解耦、马尔可夫矩阵、稳定态）",
    },
    {
      type: "knowledge",
      text: "Lecture 22-23: 对称矩阵与正定矩阵（谱定理、二次型、极小值判定）",
    },
    {
      type: "knowledge",
      text: "Lecture 24-26: 复数矩阵与傅里叶矩阵（复特征值、FFT 思想）",
    },
    {
      type: "knowledge",
      text: "Lecture 27-30: 奇异值分解 SVD（奇异值、极分解、低秩近似）",
    },
    {
      type: "knowledge",
      text: "Lecture 31-34: 线性变换与基变换（坐标变换、相似性、学习总结）",
    },
    { type: "lab", text: "Problem Set 1-3: 消元、逆矩阵与 LU 分解习题" },
    { type: "lab", text: "Problem Set 4-5: 四个子空间与秩练习" },
    { type: "lab", text: "Problem Set 6-7: Gram-Schmidt 与最小二乘拟合" },
    { type: "lab", text: "Problem Set 8-9: 行列式与特征值练习" },
    { type: "lab", text: "Problem Set 10-12: 正定矩阵与复矩阵练习" },
    { type: "lab", text: "Python 实验：用 NumPy 验证消元/特征分解/QR" },
    { type: "lab", text: "Python 实验：SVD 图像压缩（低秩近似误差对比）" },
    { type: "lab", text: "Python 实验：最小二乘拟合房价/线性回归数据" },
    {
      type: "question",
      text: "为什么 AX=b 有解当且仅当 b 在 A 的列空间里？秩与可解性有什么关系？",
    },
    {
      type: "question",
      text: "特征值分解与 SVD 分别适合什么场景？对称矩阵为什么一定可正交对角化？",
    },
    {
      type: "question",
      text: "线性代数的四个基本子空间如何互相正交补？能否从几何上说明秩-零化度定理？",
    },
  ],

  "mit-probability": [
    {
      type: "knowledge",
      text: "Lecture 1-2: 概率空间与计数（样本空间、事件、乘法/加法原理）",
    },
    {
      type: "knowledge",
      text: "Lecture 3-5: 条件概率与独立性（贝叶斯公式、全概率公式、monty hall）",
    },
    {
      type: "knowledge",
      text: "Lecture 6-8: 离散随机变量（伯努利、二项、几何、负二项、超几何、泊松）",
    },
    {
      type: "knowledge",
      text: "Lecture 9-11: 期望与方差（线性期望、指示变量、方差计算、Chebyshev）",
    },
    {
      type: "knowledge",
      text: "Lecture 12-13: 连续随机变量（均匀、指数、正态、伽马分布）",
    },
    {
      type: "knowledge",
      text: "Lecture 14-16: 联合分布与协方差（联合密度、协方差、相关性）",
    },
    {
      type: "knowledge",
      text: "Lecture 17-18: 条件期望与迭代期望（条件分布、全期望公式）",
    },
    {
      type: "knowledge",
      text: "Lecture 19-21: 矩生成函数与变换（MGF、概率生成函数、和分布）",
    },
    {
      type: "knowledge",
      text: "Lecture 22-24: 大数定律与中心极限定理（SLLN、CLT、正态逼近）",
    },
    {
      type: "knowledge",
      text: "Lecture 25-27: 统计推断入门（矩估计、极大似然、置信区间、假设检验）",
    },
    {
      type: "knowledge",
      text: "Lecture 28-30: 随机过程入门（泊松过程、马尔可夫链、平稳分布）",
    },
    { type: "lab", text: "Problem Set 1-2: 计数与条件概率练习" },
    { type: "lab", text: "Problem Set 3-4: 离散分布与期望方差计算" },
    { type: "lab", text: "Problem Set 5-6: 连续分布与联合分布练习" },
    { type: "lab", text: "Problem Set 7-8: 条件期望与 MGF 代数推导" },
    { type: "lab", text: "Problem Set 9-10: CLT 应用与统计检验练习" },
    {
      type: "lab",
      text: "Python 实验：模拟大数定律与中心极限定理（画直方图）",
    },
    { type: "lab", text: "Python 实验：蒙特卡洛估计 π 与积分" },
    { type: "lab", text: "Python 实验：马尔可夫链平稳分布求解" },
    {
      type: "question",
      text: "条件概率如何帮助理解『相关性不等于因果性』？贝叶斯公式在分类/诊断中怎么用？",
    },
    {
      type: "question",
      text: "CLT 与大数定律的区别是什么？什么时候正态逼近会失效？",
    },
    {
      type: "question",
      text: "从样本估计总体（MLE/矩估计）的直觉是什么？置信区间的严格含义是什么？",
    },
  ],

  "cmu-ics": [
    {
      type: "knowledge",
      text: "Lecture 1: 计算机系统漫游（hello.c 生命周期、硬件/操作系统/网络协同）",
    },
    {
      type: "knowledge",
      text: "Lecture 2: 位、字节与整数表示（补码、小端/大端、整数溢出）",
    },
    {
      type: "knowledge",
      text: "Lecture 3: 浮点数（IEEE 754、舍入、舍入误差、数值稳定性）",
    },
    {
      type: "knowledge",
      text: "Lecture 4: 机器级表示 I（x86-64 寄存器、操作数格式、数据传送指令）",
    },
    {
      type: "knowledge",
      text: "Lecture 5: 机器级表示 II（算术/逻辑/控制流、cmp/je/jmp、栈帧布局）",
    },
    {
      type: "knowledge",
      text: "Lecture 6: 过程调用与栈（calling convention、保存寄存器、call/ret）",
    },
    {
      type: "knowledge",
      text: "Lecture 7: 数据结构与内存（数组、结构体、对齐、指针算术）",
    },
    {
      type: "knowledge",
      text: "Lecture 8: 链接（ELF、可重定位目标文件、静态链接、符号解析）",
    },
    {
      type: "knowledge",
      text: "Lecture 9: 异常控制流（中断、故障、信号、进程与上下文切换）",
    },
    {
      type: "knowledge",
      text: "Lecture 10: 进程与虚拟内存（fork/exec、mmap、页面表）",
    },
    {
      type: "knowledge",
      text: "Lecture 11: 虚拟内存系统（TLB、缺页处理、替换算法、Linux VM）",
    },
    {
      type: "knowledge",
      text: "Lecture 12: 存储器层次结构（局部性、cache line、cache 映射、写策略）",
    },
    {
      type: "knowledge",
      text: "Lecture 13: 系统级 I/O（Unix I/O、RIO、文件元数据、共享文件）",
    },
    {
      type: "knowledge",
      text: "Lecture 14: 网络编程（TCP/IP、socket、客户端-服务器模型）",
    },
    {
      type: "knowledge",
      text: "Lecture 15: 并发编程（线程模型、共享变量、同步原语、死锁）",
    },
    {
      type: "knowledge",
      text: "Lecture 16: 高级主题（同步、并发 bug 模式、性能优化）",
    },
    {
      type: "lab",
      text: "Lab 0: C/Unix/GDB 工具链入门（编译、gdb、make、valgrind）",
    },
    { type: "lab", text: "Lab 1: Data Lab（位级操作实现加减乘除与浮点运算）" },
    { type: "lab", text: "Lab 2: Bomb Lab（反汇编 x86-64，逆向输入求解炸弹）" },
    { type: "lab", text: "Lab 3: Attack Lab（代码注入与 ROP 攻击演示）" },
    {
      type: "lab",
      text: "Lab 4: Architecture Lab（Y86-64 流水线模拟器优化 CPI）",
    },
    { type: "lab", text: "Lab 5: Cache Lab（缓存模拟器 + 矩阵转置优化）" },
    {
      type: "lab",
      text: "Lab 6: Malloc Lab（实现动态内存分配器，吞吐量与利用率优化）",
    },
    {
      type: "lab",
      text: "Lab 7: Proxy Lab（多线程 HTTP 代理服务器，支持 GET 与并发）",
    },
    {
      type: "lab",
      text: "Lab 8: Shell Lab（实现自定义 shell：jobs、fg/bg、信号处理）",
    },
    {
      type: "lab",
      text: "Lab 9: Malloc Lab（高级版：分离空闲链表 + 边界标记）",
    },
    {
      type: "lab",
      text: "Lab 10: Performance Lab（卷积/分块优化与 SIMD 探索）",
    },
    {
      type: "question",
      text: "从 hello.c 的源码到屏幕上的输出，CPU、内存、磁盘、操作系统、网络各自做了什么？能否画出完整时间线？",
    },
    {
      type: "question",
      text: "为什么 cache line 大小是 64 字节？空间局部性与时间局部性如何在代码中显式利用？miss 惩罚如何估算？",
    },
    {
      type: "question",
      text: "线程共享内存与多进程地址隔离各自的代价与收益是什么？mutex、信号量、条件变量在 Lab 7 中如何选型？",
    },
  ],

  "mit-os": [
    {
      type: "knowledge",
      text: "Lecture 1: 操作系统概述与 xv6 启动流程（kernel entry、RISC-V SBI、printf 实现）",
    },
    {
      type: "knowledge",
      text: "Lecture 2: 系统调用接口与 trampoline（user/kernel 切换、ecall、sret）",
    },
    {
      type: "knowledge",
      text: "Lecture 3: 页表与虚拟内存（satp、SV39 多级页表、TLB、kernel page table）",
    },
    {
      type: "knowledge",
      text: "Lecture 4: 进程与调度（context switch、scheduler、RAII 风格的锁）",
    },
    {
      type: "knowledge",
      text: "Lecture 5: 协作式锁与 sleep/wakeup（sleep channel、lost wakeup 问题）",
    },
    {
      type: "knowledge",
      text: "Lecture 6: 中断、驱动与 UART（PLIC、console、buffered I/O）",
    },
    {
      type: "knowledge",
      text: "Lecture 7: 文件系统概述（inode/directory/block cache、写回策略）",
    },
    {
      type: "knowledge",
      text: "Lecture 8: 文件系统实现（log-based journaling、crash recovery、FS syscalls）",
    },
    {
      type: "knowledge",
      text: "Lecture 9: mmap 与 demand paging（lazy allocation、page fault、swap）",
    },
    {
      type: "knowledge",
      text: "Lecture 10: 线程与并发原语（uthread、spinlock vs sleep lock）",
    },
    {
      type: "knowledge",
      text: "Lecture 11: 内存分配与写时复制（kalloc、copy-on-write fork）",
    },
    {
      type: "knowledge",
      text: "Lecture 12: 多核与 TLB shootdown（hart、IPI、cache coherency 基础）",
    },
    {
      type: "knowledge",
      text: "Lecture 13: 进程间通信（pipe、socket 入门、文件描述符共享）",
    },
    {
      type: "knowledge",
      text: "Lecture 14: 网络栈概览（NIC、ring buffer、Ethernet/IP/UDP 收包路径）",
    },
    {
      type: "lab",
      text: "Lab 0: 实验环境搭建（GDB+QEMU、gdbinit、编译并启动 xv6）",
    },
    {
      type: "lab",
      text: "Lab 1: System calls（实现 trace/fork/wait 等系统调用并通过 usertests）",
    },
    {
      type: "lab",
      text: "Lab 2: Page tables（实现 fork 时父子页表的 walk 与 copy）",
    },
    {
      type: "lab",
      text: "Lab 3: Traps（backtrace、alarm 系统调用、U-mode trap 处理）",
    },
    {
      type: "lab",
      text: "Lab 4: Copy-on-write fork（实现 COW 与惰性物理页分配）",
    },
    {
      type: "lab",
      text: "Lab 5: File system（large file/ symlink 双层间接块与符号链接）",
    },
    {
      type: "lab",
      text: "Lab 6: mmap（将文件映射到进程地址空间，支持 lazy load 与 write-back）",
    },
    {
      type: "lab",
      text: "Lab 7: Locking（重写 memory allocator 与 inode cache 以减少锁竞争）",
    },
    {
      type: "lab",
      text: "Lab 8: Networking（为 xv6 增加 E1000 网卡驱动与 UDP echo server）",
    },
    {
      type: "lab",
      text: "Lab 9: Kthreads（协程库：yield、schedule、互斥量、条件变量）",
    },
    {
      type: "lab",
      text: "Lab 10: Lottery scheduler（按 ticket 比例分配 CPU 时间的调度器）",
    },
    {
      type: "question",
      text: "用户态进入内核态时，trapframe 究竟由谁保存与恢复？riscv 的 sscratch 与 stvec 各起什么作用？",
    },
    {
      type: "question",
      text: 'xv6 的 sleep/wakeup 配合如何避免"lost wakeup"？为什么 spinlock 在这里必须先释放再睡眠？',
    },
    {
      type: "question",
      text: "写回式文件系统（write-back）和日志式文件系统（journaling）在崩溃一致性上分别如何权衡？",
    },
    {
      type: "question",
      text: "COW fork 的零页（zero page）应该由谁拥有？如果多个进程都 map 同一个零页，写时会发生什么？",
    },
  ],

  "stanford-net": [
    {
      type: "knowledge",
      text: "Lecture 1: 网络分层与 Internet 架构（OSI/TCP/IP 模型、端到端原则）",
    },
    {
      type: "knowledge",
      text: "Lecture 2: HTTP 与应用层协议（请求/响应、REST、缓存与 Cookie）",
    },
    {
      type: "knowledge",
      text: "Lecture 3: 字节序、ASCII 与网络字节序（big-endian 在协议中的统一）",
    },
    {
      type: "knowledge",
      text: "Lecture 4: IP 与子网划分（IPv4 地址、CIDR、NAT、IPv6 概述）",
    },
    {
      type: "knowledge",
      text: "Lecture 5: UDP 与可靠性传输设计选择（不可靠、面向数据报的应用）",
    },
    {
      type: "knowledge",
      text: "Lecture 6: TCP 可靠传输基础（ARQ、超时重传、RTT 估计）",
    },
    {
      type: "knowledge",
      text: "Lecture 7: TCP 流量与拥塞控制（滑动窗口、slow start、cubic、BBR 简介）",
    },
    {
      type: "knowledge",
      text: "Lecture 8: 路由基础（距离向量、链路状态、BGP/OSPF 概述）",
    },
    {
      type: "knowledge",
      text: "Lecture 9: DNS 与名字解析（迭代/递归查询、缓存、DoT/DoH）",
    },
    {
      type: "knowledge",
      text: "Lecture 10: TLS/HTTPS（对称/非对称加密、握手、证书链）",
    },
    {
      type: "knowledge",
      text: "Lecture 11: 局域网与链路层（Ethernet、ARP、交换机、VLAN）",
    },
    {
      type: "knowledge",
      text: "Lecture 12: 数据中心与 SDN（Clos 网络、VXLAN、OpenFlow 思想）",
    },
    {
      type: "knowledge",
      text: "Lecture 13: 性能建模与排队论（M/M/1、Little's Law 在延迟分析中的应用）",
    },
    {
      type: "knowledge",
      text: "Lecture 14: 现代主题（QUIC、HTTP/3、5G 切片、Sock Lab 集成）",
    },
    { type: "lab", text: "Lab 0: 用 Wireshark 抓包分析 HTTP & DNS 协议交互" },
    {
      type: "lab",
      text: "Lab 1: Stitcher——手动拼接 TCP 字节流中分片 HTTP 响应",
    },
    {
      type: "lab",
      text: "Lab 2: TCP in WireShark（分析三次握手、窗口、cwnd 演变）",
    },
    {
      type: "lab",
      text: "Lab 3: IP Router——软件路由器：路由表、ARP、IP 包转发与 TTL",
    },
    {
      type: "lab",
      text: "Lab 4: Reliable Transport over UDP（RDT 3.0 状态机 + seq/ack 仿真）",
    },
    {
      type: "lab",
      text: "Lab 5: TCP 接收端实现（in-order/buffered reassembly、flow control）",
    },
    {
      type: "lab",
      text: "Lab 6: TCP 发送端实现（cwnd、ACK 时钟、重传定时器）",
    },
    {
      type: "lab",
      text: "Lab 7: Network layer simulator（AS-level 路由策略仿真）",
    },
    {
      type: "lab",
      text: "Lab 8: HTTP/HTTPS proxy——用 sockets 实现可观测的代理",
    },
    {
      type: "lab",
      text: "Lab 9: Mininet 拓扑实验（端到端延迟、丢包、吞吐测量）",
    },
    {
      type: "question",
      text: "从浏览器输入 URL 到看到首字节，哪些环节各贡献了多少 RTT？TCP 慢启动对 TTFB 影响多大？",
    },
    {
      type: "question",
      text: "为什么 TCP 需要在快速/慢速网络中区分 RTT 估计？Karn 算法为什么忽略重传段的 RTT 样本？",
    },
    {
      type: "question",
      text: 'BGP 选路中 "local preference > MED > IGP cost" 是如何体现策略与商业关系的？这种设计可能带来什么路由聚合问题？',
    },
    {
      type: "question",
      text: "为什么 QUIC 把传输层放在 UDP 之上而不是直接基于 TCP？连接迁移（connection migration）的具体收益是什么？",
    },
  ],

  "berkeley-db": [
    {
      type: "knowledge",
      text: "Lecture 1: SQL I —— SELECT / WHERE / ORDER BY / LIMIT（关系模型与基础查询）",
    },
    {
      type: "knowledge",
      text: "Lecture 2: SQL II —— 聚合、GROUP BY / HAVING、子查询与 CTE",
    },
    {
      type: "knowledge",
      text: "Lecture 3: SQL III —— JOIN 语义（inner/outer/semi）、集合运算、窗口函数",
    },
    {
      type: "knowledge",
      text: "Lecture 4: 磁盘与文件组织（页、记录格式、Slotted Page）",
    },
    {
      type: "knowledge",
      text: "Lecture 5: 缓冲池管理（Buffer Pool、替换策略、clock、预取）",
    },
    {
      type: "knowledge",
      text: "Lecture 6: 索引基础与 B+ 树（有序索引、聚集/非聚集、搜索路径）",
    },
    {
      type: "knowledge",
      text: "Lecture 7: B+ 树实现细节（插入/删除、分裂合并、并发控制）",
    },
    {
      type: "knowledge",
      text: "Lecture 8: 哈希索引与索引调优（静态/可扩展哈希、覆盖索引、选择度）",
    },
    {
      type: "knowledge",
      text: "Lecture 9: 查询执行 I —— 外部排序、顺序扫描、选择与投影",
    },
    {
      type: "knowledge",
      text: "Lecture 10: 查询执行 II —— 连接算法（block nested loop、hash join、sort-merge）",
    },
    {
      type: "knowledge",
      text: "Lecture 11: 查询优化 —— 代数等价变换、基于代价的 Join 顺序与计划选择",
    },
    {
      type: "knowledge",
      text: "Lecture 12: 事务与 ACID、可串行化（冲突可串行化、2PL、死锁处理）",
    },
    {
      type: "knowledge",
      text: "Lecture 13: 并发控制进阶（时间戳、乐观并发 OCC、多版本 MVCC、隔离级别）",
    },
    {
      type: "knowledge",
      text: "Lecture 14: 崩溃恢复（WAL、ARIES 三阶段、检查点与重做/撤销）",
    },
    {
      type: "knowledge",
      text: "Lecture 15: 并行与分布式数据库、NoSQL/NewSQL 概览（分片、复制、CAP）",
    },
    {
      type: "lab",
      text: "Project 1: SQL 查询引擎（用关系代数实现 SELECT/JOIN/聚合执行器）",
    },
    {
      type: "lab",
      text: "Project 2: B+ 树索引（实现插入、删除、点查与范围扫描）",
    },
    {
      type: "lab",
      text: "Project 3: 查询优化（选择性估计、Join 顺序搜索、代价模型）",
    },
    {
      type: "lab",
      text: "Project 4: 并发控制（实现锁管理器 / MVCC，通过可串行化测试）",
    },
    {
      type: "lab",
      text: "Project 5: 崩溃恢复（WAL 日志、ARIES 重启恢复流程）",
    },
    {
      type: "lab",
      text: "Project 6: 综合集成——把索引、优化器、事务、恢复拼成一个可用的 mini DBMS",
    },
    {
      type: "question",
      text: "为什么 B+ 树把数据全部放在叶子节点而不是内部节点？这与磁盘 I/O 次数和范围查询有什么关系？",
    },
    {
      type: "question",
      text: "hash join 与 sort-merge join 分别在什么数据分布和内存预算下更优？为什么优化器需要统计信息？",
    },
    {
      type: "question",
      text: "2PL 如何保证可串行化却可能死锁？MVCC 又是怎样在读写不互相阻塞的同时维持快照隔离的？",
    },
    {
      type: "question",
      text: 'ARIES 为什么需要 LSN、CLR 和 fuzzy checkpoint 三者配合？WAL 的"先写日志再写数据"若被违反会发生什么？',
    },
  ],

  "mit-dist": [
    {
      type: "knowledge",
      text: "Lecture 1: 分布式系统概论（why distribute? failures & time）",
    },
    {
      type: "knowledge",
      text: "Lecture 2: 远程过程调用（RPC）与网络语义（at-most/least/exactly once）",
    },
    {
      type: "knowledge",
      text: "Lecture 3: GFS 案例——大规模分布式文件系统（chunk server、master）",
    },
    {
      type: "knowledge",
      text: "Lecture 4: 时间与全局时钟（Lamport、Vector clock、causality）",
    },
    { type: "knowledge", text: "Lecture 5: 容错——MapReduce 与批处理模型" },
    {
      type: "knowledge",
      text: "Lecture 6: 容错——Spark RDD 编程模型（lineage、窄/宽依赖）",
    },
    {
      type: "knowledge",
      text: "Lecture 7: 容错——流处理与数据流系统（exactly-once 语义、checkpointing）",
    },
    {
      type: "knowledge",
      text: "Lecture 8: 容错——复制与一致性模型（线性一致性、因果一致性）",
    },
    {
      type: "knowledge",
      text: "Lecture 9: 共识——Paxos 协议详解（prepare/accept/proposer）",
    },
    {
      type: "knowledge",
      text: "Lecture 10: 共识——Raft 协议详解（leader election、log replication、snapshot）",
    },
    {
      type: "knowledge",
      text: "Lecture 11: ZooKeeper 与 Chubby（协调服务、ZAB）",
    },
    {
      type: "knowledge",
      text: "Lecture 12: 分布式事务——2PC、Spanner、TrueTime",
    },
    {
      type: "knowledge",
      text: "Lecture 13: 分片与可扩展性（一致性哈希、数据迁移）",
    },
    {
      type: "knowledge",
      text: "Lecture 14: 案例研究——Cassandra、MongoDB、TiKV（实际 trade-off）",
    },
    {
      type: "lab",
      text: "Lab 1: MapReduce（实现 master/worker、倒排索引排序）",
    },
    {
      type: "lab",
      text: "Lab 2: Raft 基础（leader election + log replication + persistence）",
    },
    {
      type: "lab",
      text: "Lab 3: Raft 扩展（快照、成员变更、linearizable read）",
    },
    {
      type: "lab",
      text: "Lab 4: Fault-tolerant K/V service（在 Raft 之上构建复制状态机）",
    },
    {
      type: "lab",
      text: "Lab 5: Sharded K/V——多 Raft group 分片（配置变更、负载迁移）",
    },
    { type: "lab", text: "Lab 6: PAXOS（基于 Paxos 的 cache 与 replication）" },
    {
      type: "lab",
      text: "Lab 7: Stream processing——Flink-style mini dataflow",
    },
    {
      type: "lab",
      text: "Lab 8: Distributed Transactions（2PC + Percolator-style commit）",
    },
    {
      type: "question",
      text: '为什么在网络分区下"可用性 + 一致性"只能二选一？CAP 是绝对定理还是一种设计权衡？',
    },
    {
      type: "question",
      text: "Raft 中为什么 leader 必须等到上一条日志被多数节点提交后才能响应 client？这一约束如何避免 stale leader 提交被覆盖？",
    },
    {
      type: "question",
      text: '线上通常看到的 "exactly-once delivery" 是真实语义吗？FLINK 与 Kafka Streams 各自如何实现？',
    },
    {
      type: "question",
      text: "为什么 Spanner 需要 TrueTime 而不是 NTP？Spanner 如何利用时间不确定区间提供外部一致性？",
    },
  ],

  "karpathy-ztp": [
    {
      type: "knowledge",
      text: "Lesson 1: micrograd 从零实现——标量自动微分与反向传播",
    },
    {
      type: "knowledge",
      text: "Lesson 2: 手写 MLP、激活函数与损失；训练一个二元分类器",
    },
    {
      type: "knowledge",
      text: "Lesson 3: N-gram 语言模型与 softmax 的数值稳定性",
    },
    {
      type: "knowledge",
      text: "Lesson 4: 反向传播手推——链式法则在矩阵上的落实",
    },
    {
      type: "knowledge",
      text: "Lesson 5: 手写 mini-GPT：token 化、Embedding、自注意力块",
    },
    {
      type: "knowledge",
      text: "Lesson 6: Transformer 训练全流程（数据、优化器、学习率调度）",
    },
    {
      type: "knowledge",
      text: "Lesson 7: 深入理解 LayerNorm、残差连接与位置编码",
    },
    {
      type: "lab",
      text: "Lab 1: 用 numpy 复现 micrograd 的引擎（Node/Value 类）",
    },
    { type: "lab", text: "Lab 2: 训练一个 2D 分类 demo 并可视化决策边界" },
    { type: "lab", text: "Lab 3: 训练字符级 N-gram 模型并采样文本" },
    { type: "lab", text: "Lab 4: 实现 Attention 前向/反向并手推梯度" },
    {
      type: "lab",
      text: "Lab 5: 训练 mini-GPT（Shakespeare 数据集）并生成长文本",
    },
    {
      type: "lab",
      text: "Lab 6: 对比 micrograd/nanoGPT 与 PyTorch 实现的差别",
    },
    {
      type: "question",
      text: "反向传播中的局部梯度如何构成全局梯度？为什么数值梯度校验能抓 bug？",
    },
    {
      type: "question",
      text: "自注意力的时间/空间复杂度是多少？KV Cache 在训练与推理中的差异？",
    },
    {
      type: "question",
      text: "解释为什么 LayerNorm 在 Transformer 中必不可少（训练稳定性视角）",
    },
  ],

  "stanford-ml": [
    {
      type: "knowledge",
      text: "Lecture 1: 监督学习与无监督学习概览、线性回归基本形式",
    },
    {
      type: "knowledge",
      text: "Lecture 2: 梯度下降与正规方程、Batch/随机梯度下降对比",
    },
    {
      type: "knowledge",
      text: "Lecture 3: 局部加权回归、Logistic 回归与感知机",
    },
    {
      type: "knowledge",
      text: "Lecture 4: Newton's Method、广义线性模型 (GLM) 与指数族分布",
    },
    { type: "knowledge", text: "Lecture 5: 生成学习算法:GDA 与朴素贝叶斯" },
    { type: "knowledge", text: "Lecture 6: 支持向量机 (SVM) 与 Kernels" },
    {
      type: "knowledge",
      text: "Lecture 7: 模型选择、偏差/方差正则化 (Bias/Variance)",
    },
    { type: "knowledge", text: "Lecture 8: 降维 PCA 与 ICA 原理与推导" },
    { type: "knowledge", text: "Lecture 9: 异常检测与多变量高斯分布" },
    { type: "knowledge", text: "Lecture 10: 推荐系统、协同过滤与低秩矩阵分解" },
    { type: "knowledge", text: "Lecture 11: 强化学习 MDP、值迭代与策略迭代" },
    {
      type: "knowledge",
      text: "Lecture 12: 集成学习 Boosting、Bagging 与随机森林",
    },
    {
      type: "knowledge",
      text: "Lecture 13: 无监督学习 K-Means、EM 算法与混合高斯",
    },
    {
      type: "knowledge",
      text: "Lecture 14: 隐马尔可夫模型 (HMM) 与维特比算法",
    },
    {
      type: "lab",
      text: "Problem Set 1: 线性回归的闭式解与梯度下降实现 (含 Locally Weighted Regression)",
    },
    { type: "lab", text: "Problem Set 2: Logistic 回归与朴素贝叶斯文本分类" },
    { type: "lab", text: "Problem Set 3: SVM 的对偶问题与核技巧手写推导" },
    {
      type: "lab",
      text: "Problem Set 4: 正则化偏差方差诊断、模型选择交叉验证",
    },
    { type: "lab", text: "Problem Set 5: PCA 降维与人脸数据集可视化" },
    { type: "lab", text: "Problem Set 6: 异常检测 + 推荐系统协同过滤实现" },
    {
      type: "lab",
      text: "Problem Set 7: 强化学习 MDP 值迭代在 GridWorld 上的实现",
    },
    { type: "lab", text: "Problem Set 8: 集成学习 (Boosting) 与手写数字识别" },
    { type: "lab", text: "Problem Set 9: EM 算法拟合混合高斯模型" },
    {
      type: "lab",
      text: "Project: 在 Kaggle 数据集上端到端完成一个完整 ML Pipeline (含特征工程、模型选择、调参)",
    },
    {
      type: "question",
      text: "你能在不查资料的情况下,从最大似然推导出 Logistic 回归的损失函数吗?为什么用交叉熵而不是 MSE?",
    },
    {
      type: "question",
      text: "面对一个新任务时,如何在偏差/方差之间做权衡?你会用哪些诊断手段决定该增加数据、改特征还是调正则?",
    },
    {
      type: "question",
      text: "EM 算法中的 E 步和 M 步分别在做什么?为什么它能保证似然单调不减?",
    },
    {
      type: "question",
      text: "请用自己的话解释 SVM 中对偶问题的几何意义、核函数的合法性条件 (Mercer Theorem) 和支持向量的角色。",
    },
  ],

  "stanford-nlp": [
    {
      type: "knowledge",
      text: "Lecture 1: NLP 概览与词向量动机 (Word2Vec 引入)",
    },
    {
      type: "knowledge",
      text: "Lecture 2: 词向量与 Word2Vec (Skip-gram、负采样)",
    },
    { type: "knowledge", text: "Lecture 3: GloVe、全局矩阵分解与词向量评估" },
    {
      type: "knowledge",
      text: "Lecture 4: 词窗分类与神经网络 (Neural Networks Basics)",
    },
    { type: "knowledge", text: "Lecture 5: 反向传播与计算图" },
    {
      type: "knowledge",
      text: "Lecture 6: 句法结构、依存解析 (Dependency Parsing) 与 RNN 入门",
    },
    { type: "knowledge", text: "Lecture 7: RNN 语言模型与梯度消失/爆炸" },
    { type: "knowledge", text: "Lecture 8: LSTM、GRU 与机器翻译 (Seq2Seq)" },
    {
      type: "knowledge",
      text: "Lecture 9: 注意力机制 (Attention) 与机器翻译细节",
    },
    { type: "knowledge", text: "Lecture 10: 自注意力与 Transformer 架构" },
    { type: "knowledge", text: "Lecture 11: 预训练上下文词向量 (ELMo/BERT)" },
    {
      type: "knowledge",
      text: "Lecture 12: 自然语言推理、问答系统与 Transformer 微调",
    },
    { type: "knowledge", text: "Lecture 13: 文本生成、GPT 家族与解码策略" },
    {
      type: "knowledge",
      text: "Lecture 14: 大模型 (LLM)、Prompt 工程与对齐 (RLHF) 概览",
    },
    {
      type: "lab",
      text: "Assignment 1: 词向量探索 (co-occurrence 矩阵 + SVD) 与语义类比实验",
    },
    {
      type: "lab",
      text: "Assignment 2: Word2Vec (Skip-gram + 负采样) 从零实现",
    },
    {
      type: "lab",
      text: "Assignment 3: 依存解析器 (Transition-based Parser) 实现",
    },
    {
      type: "lab",
      text: "Assignment 4: 神经机器翻译 (NMT) Seq2Seq + Attention",
    },
    {
      type: "lab",
      text: "Assignment 5: 用 PyTorch 训练 Transformer 文本分类模型",
    },
    {
      type: "lab",
      text: "Assignment 6: 预训练模型微调 (Fine-tune BERT 做 QA / NER)",
    },
    {
      type: "lab",
      text: "Final Project: 开放任务,在 SQuAD、SST、CoNLL 等数据集中自选一个完成 baseline + 改进",
    },
    {
      type: "question",
      text: "为什么 self-attention 能比 RNN 更好地捕获长距离依赖?计算复杂度和并行性如何权衡?",
    },
    {
      type: "question",
      text: 'Word2Vec、GloVe 和 BERT 的词向量在"一词多义"上有什么本质区别?为什么?',
    },
    {
      type: "question",
      text: "你能否用一句话区分 encoder-only、decoder-only、encoder-decoder 三类 Transformer 的典型用途?",
    },
    {
      type: "question",
      text: "RLHF 中 reward model 和 PPO 的作用分别是什么?如果跳过对齐直接用 base model 会发生什么?",
    },
  ],

  "llm-inference": [
    {
      type: "knowledge",
      text: "主题 1: LLM 推理两阶段——Prefill 与 Decode 的计算特性",
    },
    {
      type: "knowledge",
      text: "主题 2: KV Cache 机制与显存占用分析（为什么长上下文贵）",
    },
    {
      type: "knowledge",
      text: "主题 3: PagedAttention——按页管理 KV Cache，减少碎片",
    },
    {
      type: "knowledge",
      text: "主题 4: Continuous Batching 与动态请求调度（吞吐 vs 延迟）",
    },
    { type: "knowledge", text: "主题 5: 量化（GPTQ/AWQ/GGUF）与精度-性能权衡" },
    {
      type: "knowledge",
      text: "主题 6: Speculative Decoding 投机采样与并行验证",
    },
    { type: "knowledge", text: "主题 7: 上下文截断、前缀缓存与结构记忆策略" },
    { type: "lab", text: "Lab 1: 用 llama.cpp 本地跑 7B 模型并测量 tokens/s" },
    {
      type: "lab",
      text: "Lab 2: 用 vLLM/SGLang 起服务对比输出吞吐（含 batching 效果）",
    },
    {
      type: "lab",
      text: "Lab 3: 观察 KV Cache 显存变化（加长 prompt 测量显存斜率）",
    },
    {
      type: "lab",
      text: "Lab 4: 实现一个最小 Prefix Cache 提升重复请求首 token 延迟",
    },
    {
      type: "lab",
      text: "Lab 5: 对比量化前后（fp16 vs int8/int4）质量与速度差异",
    },
    {
      type: "question",
      text: "为什么 Decode 阶段是显存/带宽瓶颈而非算力瓶颈？",
    },
    {
      type: "question",
      text: "Continuous Batching 为什么能提升吞吐？对单请求延迟有何影响？",
    },
    {
      type: "question",
      text: "Agent 工具调用高并发时，瓶颈在推理 Runtime 的哪个环节？如何缓解？",
    },
  ],
  "stanford-moderndev": [
    {
      type: "knowledge",
      text: "Week 1: 课程概览——从人工编码到与编码 Agent 协作的范式转变",
    },
    {
      type: "knowledge",
      text: "Week 2: MCP（Model Context Protocol）——给 Agent 提供上下文与能力的标准化方式",
    },
    {
      type: "knowledge",
      text: "Week 3: Agent Skills——可复用 Agent 能力的设计与封装",
    },
    {
      type: "knowledge",
      text: "Week 4: Spec-driven Development——把产品需求翻译为可执行规格",
    },
    {
      type: "knowledge",
      text: "Week 5: Loop Engineering——人与 Agent 的规划-构建-评估-改进迭代",
    },
    {
      type: "knowledge",
      text: "Week 6: Software Factory——把工具与技能组合成可靠开发系统",
    },
    {
      type: "knowledge",
      text: "Week 7: 编码 Agent 的能力边界与局限（评测与安全）",
    },
    {
      type: "knowledge",
      text: "Week 8: 自动化测试与持续部署在 AI 辅助开发中的角色",
    },
    {
      type: "knowledge",
      text: "Week 9: 规模化演进——用 Software Factory 原则加速软件开发",
    },
    {
      type: "lab",
      text: "Lab 1: 配置本地编码 Agent 并用 MCP 接入至少一个工具",
    },
    { type: "lab", text: "Lab 2: 为某工具实现一个 Agent Skill 并接入工作流" },
    {
      type: "lab",
      text: "Lab 3: 用 Spec-driven 方式把一个需求写成可执行规格并让 Agent 实现",
    },
    {
      type: "lab",
      text: "Lab 4: 搭建最小 Agent 迭代 Loop（plan → build → eval → improve）",
    },
    { type: "lab", text: "Lab 5: 为 Agent 生成的代码配置自动化测试与 CI 部署" },
    {
      type: "lab",
      text: "Final Project: 设计并落地一个 Agent-driven 开发工作流",
    },
    {
      type: "question",
      text: "与编码 Agent 协作时，如何通过明确意图与上下文让产出更可靠？",
    },
    {
      type: "question",
      text: "Spec-driven 相比直接 Prompt Agent 写代码，各自的优缺点是什么？",
    },
    {
      type: "question",
      text: "哪些任务适合交给 Agent 自动化，哪些应该保持人工？边界在哪？",
    },
  ],

  "agent-runtime": [
    // ---- 子模块 1: Context & State Management ----
    {
      type: "knowledge",
      text: "子模块1: 状态机设计——Graph-based / DAG 执行流建模",
    },
    {
      type: "knowledge",
      text: "子模块1: 消息与上下文协议（Chat Completions / Messages / MCP 前置）",
    },
    {
      type: "knowledge",
      text: "子模块1: 长期记忆存储——Vector Embedding + BM25 混合检索",
    },
    {
      type: "knowledge",
      text: "子模块1: 轻量持久化（SQLite/RocksDB）与向量索引（HNSW）",
    },
    {
      type: "knowledge",
      text: "子模块1: 上下文压缩、窗口滑动与结构化摘要策略",
    },
    // ---- 子模块 2: Tool Invocation & Sandboxing ----
    {
      type: "knowledge",
      text: "子模块2: 工具调用协议抽象（MCP）与 Schema 设计",
    },
    {
      type: "knowledge",
      text: "子模块2: 执行隔离——Docker/WASM 沙箱、资源配额",
    },
    { type: "knowledge", text: "子模块2: 防提示词注入、工具权限分级与审计" },
    {
      type: "knowledge",
      text: "子模块2: 结构化校验与容错重试（超时/回退/幂等）",
    },
    // ---- 子模块 3: Orchestration & Coordination ----
    {
      type: "knowledge",
      text: "子模块3: 多 Agent 通信拓扑（Supervisor / Peer-to-Peer）",
    },
    {
      type: "knowledge",
      text: "子模块3: 任务规划循环（ReAct / Plan-and-Execute / ReWOO 对比）",
    },
    {
      type: "knowledge",
      text: "子模块3: 确定性回放与断点恢复（Durable State Machine）",
    },
    {
      type: "knowledge",
      text: "子模块3: 并发与竞态控制（工具调用去重、锁、限流）",
    },
    // ---- 子模块 4: Agent Harness & Evaluation ----
    {
      type: "knowledge",
      text: "子模块4: 轨迹追踪（Trace & Step-level Replay）",
    },
    {
      type: "knowledge",
      text: "子模块4: 流式响应与可观测性（SSE、OpenTelemetry、指标）",
    },
    {
      type: "knowledge",
      text: "子模块4: 自动化评测（Eval Harness：成功率、Token 消耗效率）",
    },
    // ---- Labs ----
    { type: "lab", text: "Lab 1: 用 SDK 写一个最小可运行的 Chat Agent Loop" },
    {
      type: "lab",
      text: "Lab 2: 实现 Function Calling 工具调度器（Schema 校验 + 重试）",
    },
    { type: "lab", text: "Lab 3: 接入 RAG：向量库 + BM25 混合检索做长期记忆" },
    {
      type: "lab",
      text: "Lab 4: 实现 Graph-based 状态机调度器（类似 LangGraph）",
    },
    {
      type: "lab",
      text: "Lab 5: 用 WASM/Docker 沙箱执行工具代码（含超时与配额）",
    },
    { type: "lab", text: "Lab 6: 实现断点续跑与失败重试（checkpoint 持久化）" },
    {
      type: "lab",
      text: "Lab 7: Supervisor + Worker 多 Agent 完成一个研究任务",
    },
    {
      type: "lab",
      text: "Lab 8: 接入可观测性（OpenTelemetry tracing + metrics）",
    },
    { type: "lab", text: "Lab 9: 搭建 Eval Harness 评测成功率与 Token 效率" },
    {
      type: "lab",
      text: "Lab 10: 发布一个可运行的 Agent Runtime Demo（Docker 部署）",
    },
    {
      type: "question",
      text: "Agent 状态过大导致 token 爆炸时，如何设计压缩与摘要策略？",
    },
    {
      type: "question",
      text: "多 Agent 并行调用同一工具时有哪些竞态条件？如何保证幂等？",
    },
    {
      type: "question",
      text: "沙箱隔离下，工具可访问的系统资源边界如何设计才算安全？",
    },
    {
      type: "question",
      text: '如何评测一个 Agent 系统"变好"了？成功率之外还应看哪些指标？',
    },
  ],

  "agent-engine": [
    {
      type: "knowledge",
      text: "模块 1: Model Context Protocol (MCP)——工具与上下文的统一协议",
    },
    {
      type: "knowledge",
      text: "模块 2: 工具执行沙箱——Docker/WASM 进程隔离与资源配额",
    },
    {
      type: "knowledge",
      text: "模块 3: 防提示词注入与工具权限分级（allowlist + 审计）",
    },
    {
      type: "knowledge",
      text: "模块 4: Durable Execution——长任务断点、重试与状态机持久化",
    },
    {
      type: "knowledge",
      text: "模块 5: 工具调用的 Schema 校验与容错（重试/回退/超时）",
    },
    {
      type: "knowledge",
      text: "模块 6: 多 Agent 通信拓扑（Supervisor / Peer-to-Peer）",
    },
    {
      type: "lab",
      text: "Lab 1: 接入 MCP：写一个最小 MCP Server 暴露 2 个工具",
    },
    {
      type: "lab",
      text: "Lab 2: 用 WASM/Docker 隔离运行不可信工具代码（含超时）",
    },
    { type: "lab", text: "Lab 3: 实现工具权限分级：白名单 + 危险操作二次确认" },
    {
      type: "lab",
      text: "Lab 4: 用 Temporal 或自研实现断点续跑（kill -9 后恢复）",
    },
    { type: "lab", text: "Lab 5: 结构化工具输出校验 + 失败自动重试策略" },
    {
      type: "lab",
      text: "Lab 6: 构造 Supervisor + Worker 双 Agent 完成一个多步任务",
    },
    {
      type: "question",
      text: "MCP 相比直接用函数调用（Function Calling）解决了什么问题？",
    },
    {
      type: "question",
      text: "沙箱隔离里 工具可访问的系统资源边界 如何设计才算安全？",
    },
    {
      type: "question",
      text: "Durable Execution 的确定性重放对副作用的工具调用有哪些约束？",
    },
  ],
};

export function initDefaultCourses(): Course[] {
  return defaultCourses.map((course) => ({
    ...course,
    todos: (defaultTodos[course.id] || []).map((todo, index) => ({
      id: `${course.id}-t${index}`,
      text: todo.text,
      type: todo.type,
      done: false,
    })),
  }));
}
