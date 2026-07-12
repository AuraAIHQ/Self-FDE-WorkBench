# FEED — 知识碎片入库协议

> 把任何碎片知识扔给我，自动分类入库。
> 全局唯一 KB：`~/.mempalace/palace`（MemPalace MCP，所有 Claude Code 对话共享）

---

## 使用方式

直接说：`入库: [内容/URL]`  
或粘贴任何内容，我判断值得留就直接入库。不需要整理，原始扔进来就好。

---

## 支持的输入类型

| 类型 | 处理方式 |
|------|---------|
| URL（论文/GitHub/博客） | agent-reach 抓全文 → 摘要 → 入库 |
| 小红书 / Twitter post | 提炼要点 → 入库 |
| 图片截图 | 内容描述 → 入库 |
| PDF 章节 | 关键内容提取 → 入库 |
| 文字片段 | 直接入库 + 标签 |

---

## Palace 结构（MemPalace Wings/Rooms）

```
~/.mempalace/palace/
  wing: ai-research       ← 学习内容（论文、文章、笔记）
    room: llm-fundamentals
    room: agent-architecture
    room: fine-tuning
    room: multi-agent
    room: self-evolution
  wing: projects          ← 项目相关（Agent24、AirAccount等）
    room: agent24
    room: mempalace
    room: airacount
  wing: ideas             ← 想法碎片
    room: product-ideas
    room: experiments
```

---

## 入库记录结构（Heinu1 kb-record schema）

每条记录写为 markdown，用 `mempalace_add_drawer` 存入：

```
wing: [ai-research / projects / ideas]
room: [具体分类]
content: 原始内容 + 摘要 + 要点
tags: phase-N, 主题
entities: 关键实体
```

---

## KB 基础设施

| 组件 | 路径 |
|------|------|
| Palace 数据 | `~/.mempalace/palace/` |
| Python venv | `~/.mempalace/venv/` |
| MCP 配置 | `~/.claude.json → mcpServers.mempalace` |
| CLI 命令 | `~/.mempalace/venv/bin/python -m mempalace` |

**搜索示例**（任意 Claude Code 会话）：
```
搜索知识库：MemGPT
Phase 3 相关的论文有哪些？
Agent memory 的设计方案
```

---

## Fallback（来自 Heinu1）

入库永不丢失：抓取失败也记 URL + 时间 + 原因。

---

## 与 Heinu1 / MemPalace 的关系

- **基础设施**：MemPalace（你的项目，`~/Dev/jhfnetboy/mempalace`）
- **入库 schema**：借鉴 Heinu1 `kb-record` 字段（title/summary/tags/entities）
- **Palace 结构**：Wing/Room 对应研究方向，与 roadmap.md Phase 对齐
- **你既是用户也是开发者**：使用过程中发现问题直接在 MemPalace 里改
