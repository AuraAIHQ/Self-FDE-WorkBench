# 技术方案 · Tech Spec

> 客户：chattest ｜ 项目：待办清单app ｜ 交付物：待办清单（other）
> 架构 / 数据模型 / 接口 / 依赖 / 部署 / 风险

## 1. 架构总览（【调研假设·待确认】）
纯前端单页应用，无后端、无数据库。所有状态存于浏览器 localStorage。

- 形态：静态站点（HTML/CSS/JS），可直接双击打开或托管于任意静态服务器。
- 【调研假设·待确认】技术栈选型：**原生 HTML + CSS + 原生 JavaScript（无框架）**。理由：需求极简、三个动作，零依赖最符合「简单」目标，构建/部署成本最低。若客户团队已有 React/Vue 技术栈偏好，可切换（进 GAPS）。
- 无需登录、无网络请求。

## 2. 数据模型
单一集合 `tasks`，存于 localStorage，键名 `todo.tasks.v1`，值为 JSON 数组：

```json
[
  {
    "id": "字符串，唯一标识（如时间戳+随机，或 crypto.randomUUID()）",
    "text": "任务文本（纯文本，已 trim）",
    "completed": false,
    "createdAt": "ISO 8601 时间戳，用于排序"
  }
]
```
- 排序：默认按 createdAt 倒序（最新在上）——【假设·待确认】。
- 版本化键名（v1）便于未来结构迁移。

## 3. 「接口」契约（前端内部模块，无 HTTP API）
以一个 store 模块封装持久化与操作，便于测试：
- `loadTasks(): Task[]` —— 读取并解析 localStorage，异常时返回 `[]`。
- `addTask(text: string): Task | null` —— trim 后为空返回 null；否则创建并保存，返回新任务。
- `toggleTask(id): void` —— 翻转 completed 并保存。
- `deleteTask(id): void` —— 移除并保存。
- 每次变更后重渲染列表。

## 4. UI 结构
- 顶部：标题 + 输入框 + 「添加」按钮。
- 中部：任务列表，每行 = 勾选框 + 任务文本 + 删除按钮。
- 空状态：列表为空时显示提示文案。
- 响应式：移动端单列自适应，触控目标 ≥ 44px。
- 无障碍：勾选框与删除按钮带 aria-label，可键盘操作。

## 5. 依赖与部署
- 依赖：无第三方运行时依赖（可选：一个轻量 CSS reset）。
- 【调研假设·待确认】部署：作为静态文件托管（如 GitHub Pages / Netlify / Vercel / 任意静态服务器）。具体托管平台待客户确认。
- 浏览器支持：现代浏览器（Chrome/Safari/Firefox/Edge 近两年版本）。

## 6. 技术风险
- localStorage 有容量上限（~5MB）且不跨设备——对纯本地待办足够，但若客户需要多设备/多人则需引入后端+账号，是重大方向变更（见 GAPS，优先确认）。
- 浏览器隐私模式或清缓存会清空数据——属本地存储固有限制，需在成功指标中体现预期。

## 7. 测试策略
- store 模块 4 个方法做单元测试（含空输入、异常存储回退）。
- 交互层按 INTERACTIONS.md 的步骤做端到端验收（可用 Playwright）。
