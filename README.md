# Self-FDE WorkBench — Learning & Building in Public

> **做自己的 FDE**，以问题 / 用户 / 客户为牵引，落地 AI 能力到自己和中小组织。边学边记，边做实验，每周 meetup。
> Part of [AuraAI](https://github.com/AuraAIHQ) open learning initiative.
> 📍 [CNX Local Weekly Meetup](https://app.sola.day/event/detail/19717)

🌐 **[self-fde-workbench.pages.dev](https://self-fde-workbench.pages.dev)** — 全景图与完整蓝图
📐 [VISION.md](./docs/VISION.md) — 结构化蓝图 · [逐字稿](./docs/TRANSCRIPT-2026-07-12.md) — 原始口述存档

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](./LICENSE)

---

## 这个项目适合谁

**⚙️ 一线开发者** — 不管你原来做什么方向，想把 AI 融入自己的领域。这里有原理解析、动手实验和真实的踩坑经历。

**🔍 管理者 / 企业主** — 不需要知道引擎怎么造，但需要知道这辆车能跑多快、能去哪里。这里有能力边界的梳理和真实应用场景的讨论。

**🌱 普通用户** — AI 正在改变生活和工作，保持一只眼睛关注就够了。每周分享会和 blog 文章是最轻量的入口。

---

## 从 FDE 到 ANE

FDE（Forward Deployed Engineer）是 Palantir 在 2010 年前后发明的词，本质是把苦活脏活累活制度化：**你必须到客户的现场和内部，才能准确识别真实的业务逻辑与流程**，才能提炼、优化，先给出解决方案，再抽象为产品。

AI 已经成熟到必须走出「聊天框」和「开发者圈」，去服务真实的组织——这和当年 ERP 信息化的路程一模一样。我们认为这个角色会长期存在，久到不该再叫 FDE。它是 **ANE — AI Native Engineer**。

| | FDE | ANE |
|---|---|---|
| 驻场 | **必须**驻场 | **不必**驻场，但必须在场 |
| 服务对象 | 大企业（付得起钱的） | 个体 / 中小组织 / 城市 |
| 依托 | 公司内部方法论 | 开源 WorkBench + 数字公共物品 |
| 核心能力 | 业务理解 + 现场交付 | 业务理解 + AI 能力域调度 + 能力创新 |

**ANE 工作循环**：企业场景 → 痛点（反复沟通才找得到真卡点）→ 解决方案（结合组织工作流，持续迭代）→ 抽象为产品 → 反哺能力库。

---

## 三种角色

如果 AI 把生产力成本压到接近电费，每个人都要回答：**当我的岗位被 AI 取代，我还能干什么？**

服务业永远存在——吃面包比打营养针效率低，但大部分人不会去打针。会被重构的是**商业驱动的岗位**。在那里，只有三种角色留下核心价值，而且它们**可以叠加**：

| 角色 | 为什么不可替代 | WorkBench 提供 |
|------|---------------|---------------|
| 🗣 **表达者** Expresser | AI 不会说「这家饭馆味道不错」——因为它不是人 | 一键发布多平台 · 配图 · 去 AI 味 |
| 💡 **创新者** Innovator | 全地图都是黑雾时，有人趟出一条路 | 痛点对接 · 实验对象 · 协作信息 |
| 🔧 **建设者** Builder = ANE | 解决的「小问题」，是别人每天承受的痛苦 | 选型 · LoRA · Memory/Context · Agent |

---

## 三个操作系统（数字公共物品）

不是产品，是**数字公共物品**——开源、免费、无许可，任何人都可以使用、修改和部署。

| 系统 | 面向 | 核心 | 状态 |
|------|------|------|------|
| **Sin90** | 个体 | 围绕成长环：Information → Action → Connection → Communication → ⟲ | 设计中 |
| **Cos72** | 社区 / 中小组织 | 知识库 + 组织工作流 + 组织大脑（大模型 API + 自训练 LoRA）+ Connectors | 进行中 |
| **CityOS** | 城市 | 组织间协作与资源聚合，让城市本身成为智能体 | 远期 |

> 雇不起 FDE 的组织，**能不能自己 FDE？** 把它拆散，通过协作找到创新者和建设者。我觉得是可以的。

---

## 学习方向

核心聚焦两件事：

- **LLM 原理** — Transformer 架构、注意力机制、推理过程、能力边界
- **Agent 构建** — Prompt Engineering 到 Loop Engineering、RAG、Tool Use、Context Memory、Fine-tuning、多 Agent 协作

---

## 仓库结构

WorkBench 不只是文档，也是一套**持续沉淀的机制**——AuraAI 作为聚合 ANE 的组织，靠它积累经验，帮助更多人成为表达者、创新者、建设者。

> **摄入** (`resources/`) → **内化** (`notes/`) → **产出** (`experiments/` + `episodes/`)

| 文件/目录 | 内容 | 主要受众 |
|----------|------|---------|
| [`docs/`](./docs/) | 蓝图（VISION.md）与原始口述逐字稿 | 全部 |
| [`site/`](./site/) | 官网源码（Cloudflare Pages，纯静态，中英双语） | ⚙️ |
| [`roadmap.md`](./roadmap.md) | 学习路线图 + 知识树 + 具体小实验清单 | ⚙️🔍 |
| [`resources/`](./resources/) | 精选文章、论文、书籍，按层级标注 | 全部 |
| [`notes/`](./notes/) | 每周个人研究笔记，含困惑和未解问题 | ⚙️🔍 |
| [`experiments/`](./experiments/) | 动手实验代码，验证理解 | ⚙️ |
| [`episodes/`](./episodes/) | 每周分享会记录——提问、答案、讨论 | 全部 |
| [`ideas/`](./ideas/) | 学习中冒出的想法碎片和可复用能力节点 | ⚙️ |
| [`Proposal.md`](./Proposal.md) | AI 入门课程提案（清迈线下 + 线上黑客松） | 全部 |

---

## 核心模式

> 一起提问 → 各自研究 → 带答案回来讨论

上一期提出的问题，这一期带着各自研究的答案回来。问题在时间里发酵，答案从实践里长出来。

**每周一次在线录制**，讨论进展、问题、AI 最新动向。录制存档在 `episodes/`，精华整理后发 Twitter / 博客 / 公众号。

---

## 本地开发与发布

```bash
pnpm install          # 安装 wrangler
pnpm dev              # 本地预览 http://localhost:8788
./scripts/deploy.sh   # 发布到 Cloudflare Pages
```

发布脚本会先做本地断链自检，再推到 Cloudflare，最后校验线上每个页面返回 200。详见 [`scripts/deploy.sh`](./scripts/deploy.sh)。

---

## Progress

1. 说一下现在的进展。那第一个呢就是核心开发者呃已经有四个了，那我们已经商量确定了呃，主要的路线图，这是核心进展
2. 呃，核心路线图就是以真实用户或者叫真实客户为引领，去帮助两个范例，但后边可能会更多范例的这种社区和公司呃，一步步的迭代，反复打磨，帮助他们建立自己的 AI Native flow
3. 嗯，核心逻辑很简单，就是未来引领当下。那我们希望呃中小组织具备什么样的能力，一定是具备解决他们原来的繁琐重复，痛苦高成本，碎片化的一些工作，然后用 AI 去加速和提效。核心的是这个。
4. 当然可能还有一些原来没有的能力，我们可以通过 AI 来去创新和赋能。那这也是嗯大家一起来探讨的一个方向之一

---

## 参与方式

- AuraAI 团队成员及感兴趣的朋友均可加入
- 提 PR 分享你的笔记、实验，或补全某个 WorkBench 工具
- 在 [Issues](https://github.com/AuraAIHQ/Self-FDE-WorkBench/issues) 里**说出你的痛点**——它可能就是下一个建设者要解决的问题
- 关注每周分享录制

---

Part of [AuraAI](https://github.com/AuraAIHQ) · [Mycelium Protocol](https://github.com/AAStarCommunity/Brood) · [Apache 2.0](./LICENSE)
