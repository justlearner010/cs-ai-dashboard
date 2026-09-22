# CS→AI→Agent 仪表盘 V3 优化 Spec

## 一、项目背景

当前 V2 已完成：
- React + Vite + TypeScript + Tailwind CSS 重构
- 能力雷达图 7 维度规范化
- 每日学习日志收集
- 学习热力图
- 飞书文档云备份

本 Spec 聚焦 V3 的两大优化方向：
- **5. UI/UX 细节打磨**
- **6. 内容/课程结构优化**

---

## 二、总体目标

在不改变现有数据模型和核心功能的前提下：
1. 让交互更细腻、视觉更精致、移动端更可用
2. 让课程内容信息更丰富、学习路径更清晰、能力标签更直观

---

## 三、任务清单

| 编号 | 任务 | 优先级 | 预估工时 | 依赖 |
|---|---|---|---|---|
| 5.1 | 动画与过渡效果 | P1 | 2h | 无 |
| 5.2 | 空状态优化 | P2 | 1.5h | 无 |
| 5.3 | 任务拖拽排序 | P2 | 3h | 无 |
| 5.4 | 批量操作 | P2 | 2.5h | 无 |
| 5.5 | 响应式细节优化 | P1 | 2h | 无 |
| 6.1 | 前置依赖与学习路径图 | P1 | 4h | 6.3 |
| 6.2 | 资源链接 richer | P2 | 2h | 无 |
| 6.3 | 技能标签可视化 | P1 | 1.5h | 无 |

---

## 四、任务详细 Spec

### 5.1 动画与过渡效果

#### 范围
- 任务勾选/取消勾选时的平滑过渡
- 课程卡片 Tab 切换时的内容淡入淡出
- 新任务添加时的滑入动画
- 任务删除时的滑出动画
- 统计数字变化时的数字滚动/淡变效果
- Modal 弹窗的打开/关闭动画
- 热力图格子 hover 时的放大效果

#### 验收标准
- [ ] 勾选任务时，文字划线动画从左侧扩展到右侧
- [ ] Tab 切换内容时，无闪烁，300ms 内完成淡入淡出
- [ ] 添加新任务时，任务项从上方滑入 200ms
- [ ] 删除任务时，任务项向左滑出并收缩高度 250ms
- [ ] 统计卡片数字变化时，有 300ms 的过渡效果
- [ ] 备份 Modal 打开时从顶部淡入缩放，关闭时反向
- [ ] 所有动画尊重 `prefers-reduced-motion` 设置

#### 技术方案
- 使用 Tailwind 的 `transition-*` + `duration-*` + `ease-*`
- 复杂动画使用 `framer-motion` 库（体积小、API 友好）
- 勾选划线动画使用 CSS `background-size` 或 `clip-path`
- 数字过渡使用自定义 hook `useAnimatedNumber`

#### 文件变更
- `src/components/CourseCard.tsx`
- `src/components/StatsCards.tsx`
- `src/components/BackupModal.tsx`
- `src/components/Heatmap.tsx`
- 新增 `src/hooks/useAnimatedNumber.ts`
- `package.json` 新增 `framer-motion`

---

### 5.2 空状态优化

#### 范围
替换当前所有朴素的空状态文案，包括：
- 暂无日志
- 暂无此类任务
- 热力图无数据
- 空筛选结果

#### 验收标准
- [ ] 每个空状态都有对应图标/插画
- [ ] 文案带有行动引导（如"完成一项任务后，点击右上角写日志"）
- [ ] 空状态在 loading 时不显示，避免闪屏
- [ ] 插画使用 SVG，不引入外部图片资源

#### 技术方案
- 新增 `src/components/EmptyState.tsx` 通用组件
- 支持 `icon`、`title`、`description`、`action` 四个 props
- 使用 Lucide 图标 + 简单 SVG 几何图形组合成轻插画

#### 示例文案
```
📝 还没有学习日志
完成一项任务后，来这里记录今天的知识点、Lab 和反思。
[去写日志]
```

---

### 5.3 任务拖拽排序

#### 范围
- 课程卡片内，同类型任务支持拖拽排序
- 不跨课程拖拽
- 不跨类型拖拽（knowledge/lab/question 各自独立排序）

#### 验收标准
- [ ] 长按/按住任务项可拖动
- [ ] 拖动时有视觉反馈（阴影、半透明、占位提示）
- [ ] 释放后任务顺序持久化到 localStorage
- [ ] 移动端支持触摸拖拽
- [ ] 拖拽后 todo 的 `id` 保持不变，仅调整数组顺序

#### 技术方案
- 使用 `@dnd-kit/core` + `@dnd-kit/sortable`
- 每个任务项包装成 `SortableItem`
- 在 `CourseCard` 内部维护当前类型任务的排序状态
- 拖拽结束后通过 `onReorderTodos` 回调更新父组件 `courses` 状态

#### 文件变更
- `src/components/CourseCard.tsx`
- 新增 `src/components/SortableTodoItem.tsx`
- `src/App.tsx` 新增 `onReorderTodos` 处理函数
- `package.json` 新增 `@dnd-kit/core`、`@dnd-kit/sortable`

---

### 5.4 批量操作

#### 范围
#### 5.4.1 批量完成任务
- 在课程卡片顶部添加"全选/取消全选"当前类型任务
- 支持批量标记当前筛选类型的所有未完成任务为完成

#### 5.4.2 批量删除日志
- 在日志列表顶部添加"批量选择"模式
- 支持选择多条日志后一键删除
- 删除前二次确认

#### 验收标准
- [ ] 课程卡片每个 Tab 右上角出现"全选"按钮
- [ ] 点击"全选"后，当前类型所有未完成任务变为已完成
- [ ] 日志列表有"批量管理"入口
- [ ] 进入批量模式后，每条日志前出现复选框
- [ ] 选中后底部出现"删除选中"按钮
- [ ] 删除前弹出确认框，显示"确定删除 X 条日志？"

#### 技术方案
- 批量完成：在 `CourseCard` 内计算当前类型未完成任务，调用多次 `onToggleTodo`
- 批量删除：在 `LogList` 内维护 `selectedIds` 状态，调用 `onBatchDeleteLogs`

#### 文件变更
- `src/components/CourseCard.tsx`
- `src/components/LogList.tsx`
- `src/App.tsx` 新增 `onBatchDeleteLogs`

---

### 5.5 响应式细节优化

#### 范围
- 雷达图在窄屏下自适应缩小
- 日志表单的 3 列在手机上堆叠成单列
- 统计卡片在超窄屏下 2×2 布局
- 课程卡片的进度条和百分比不挤在一起
- Header 按钮在手机上只显示图标
- 热力图容器支持横向滚动

#### 验收标准
- [ ] 屏幕宽度 < 640px 时，雷达图高度从 384px 降至 280px
- [ ] 日志表单的"知识点/Lab/问题"三列在 < 1024px 时堆叠
- [ ] 统计卡片在 < 480px 时 2 列显示
- [ ] 课程卡片的百分比数字不会折行
- [ ] Header 的导出/导入/飞书备份按钮只显示图标
- [ ] 热力图在小屏幕上可横向滚动，不出现横向溢出

#### 技术方案
- Tailwind 响应式前缀：`sm:`、`md:`、`lg:`、`xl:`
- 雷达图使用 Recharts 的 `ResponsiveContainer`，根据容器高度变化
- 日志表单的 grid 从 `grid-cols-1 lg:grid-cols-3` 调整

#### 文件变更
- `src/components/RadarChart.tsx`
- `src/components/DailyLogForm.tsx`
- `src/components/StatsCards.tsx`
- `src/components/CourseCard.tsx`
- `src/components/Header.tsx`
- `src/components/Heatmap.tsx`

---

### 6.1 前置依赖与学习路径图

#### 范围
- 为每个课程添加 `prerequisites: string[]` 字段
- 在页面中展示学习路径图（Mermaid 或自定义 SVG）
- 路径图按 Phase 分组，显示课程之间的依赖关系

#### 课程依赖关系（初稿）

```
CS50 / Missing Semester
    ↓
CS61A
    ↓
CS61B
    ↓
MIT 6.006 (Algorithms)
MIT 6.042 (Math)
    ↓
MIT 6.031 (Software Construction)
    ↓
CMU 15-213 (Computer Systems)
MIT 6.1810 (OS)
Stanford CS144 (Networking)
Berkeley CS186 (Database)
    ↓
MIT 6.5840 (Distributed Systems)
    ↓
Stanford CS229 (ML)
3Blue1Brown (Math)
    ↓
Stanford CS224N (NLP / LLM)
    ↓
Agent Runtime 项目
```

#### 验收标准
- [ ] `Course` 类型新增 `prerequisites: string[]`
- [ ] 每个课程数据都配置了合理的前置依赖
- [ ] 页面新增"学习路径图"区块
- [ ] 路径图能清晰展示 7 个 Phase 的递进关系
- [ ] 点击课程节点可跳转到对应课程卡片
- [ ] 路径图支持横向滚动，适配移动端

#### 技术方案
- 数据层：在 `src/data/courses.ts` 增加 `prerequisites` 字段
- 可视化：
  - 方案 A：使用 `@dagrejs/graphlib` + 自定义 SVG 渲染（更灵活）
  - 方案 B：使用 `mermaid` 库（更快，但样式受限）
  - **推荐方案 B**，因为实现快、维护简单
- 将课程数据构建成有向无环图（DAG），自动分层布局
- 使用 Mermaid 的 `graph TD` 语法生成流程图

#### 文件变更
- `src/types.ts` 新增 `prerequisites`
- `src/data/courses.ts` 补充依赖数据
- 新增 `src/components/LearningPath.tsx`
- `src/App.tsx` 集成学习路径图
- `package.json` 新增 `mermaid`

---

### 6.2 资源链接 richer

#### 范围
为每个课程添加更多相关资源链接：
- 中文笔记/博客
- B 站搬运视频
- GitHub 仓库
- 官方课程论坛/Discord
- 参考书籍

#### 验收标准
- [ ] `Course` 类型新增 `resources: Resource[]`
- [ ] 每个课程至少补充 2-3 个资源链接
- [ ] 课程卡片上展示资源入口
- [ ] 资源按类型分组显示（视频、笔记、代码、社区）

#### Resource 类型设计
```ts
interface Resource {
  type: 'video' | 'notes' | 'code' | 'community' | 'book';
  title: string;
  url: string;
}
```

#### 技术方案
- 数据层：`src/data/courses.ts` 新增 `resources` 字段
- UI：在 `CourseCard` 头部或底部添加"相关资源"折叠面板
- 图标：用 Lucide 的 `Youtube`、`BookOpen`、`Github`、`MessageCircle`

#### 文件变更
- `src/types.ts`
- `src/data/courses.ts`
- `src/components/CourseCard.tsx`

---

### 6.3 技能标签可视化

#### 范围
- 在课程卡片上展示该课程覆盖的能力维度小标签
- 标签颜色与雷达图维度对应
- 点击标签可高亮雷达图对应维度

#### 验收标准
- [ ] 每个课程卡片展示覆盖的能力维度标签
- [ ] 标签颜色与 7 大维度一一对应
- [ ] 标签尺寸小巧，不影响卡片整体布局
- [ ] （可选）hover 标签时，雷达图对应维度高亮

#### 技术方案
- 在 `src/data/skillDimensions.ts` 中为每个维度定义颜色
- 在 `CourseCard` 中根据 `course.skills` 反查对应维度
- 使用小 pill 样式展示标签

#### 文件变更
- `src/data/skillDimensions.ts` 增加颜色定义
- `src/components/CourseCard.tsx` 添加标签展示
- `src/components/RadarChart.tsx` 支持外部高亮某个维度（可选）

---

## 五、执行顺序建议

### Phase 1：基础体验优化（1 天）
1. 5.5 响应式细节优化
2. 5.1 动画与过渡效果
3. 5.2 空状态优化

### Phase 2：交互增强（1 天）
4. 5.3 任务拖拽排序
5. 5.4 批量操作

### Phase 3：内容结构化（1 天）
6. 6.3 技能标签可视化
7. 6.2 资源链接 richer
8. 6.1 前置依赖与学习路径图

### Phase 4：回归验证（0.5 天）
9. 全量构建 + 移动端测试 + localStorage 兼容性测试

---

## 六、技术依赖

预计新增依赖：

```json
{
  "dependencies": {
    "framer-motion": "^11.x",
    "@dnd-kit/core": "^6.x",
    "@dnd-kit/sortable": "^8.x",
    "mermaid": "^10.x"
  }
}
```

可选依赖（如果用方案 A 画路径图）：
- `@dagrejs/graphlib`

---

## 七、数据兼容性

所有新增字段（`prerequisites`、`resources`）都必须有默认值，确保：
- 旧版 localStorage 数据迁移不报错
- 导入旧版 JSON 时不会丢失进度
- 新增字段缺失时组件正常降级显示

---

## 八、验收方式

1. 每个任务完成后在对应验收标准上打勾
2. 最终执行 `npm run build` 无 TS 错误
3. 在桌面端和移动端（浏览器 DevTools 模拟）各走一遍主流程
4. 检查 localStorage 旧数据迁移是否正常
