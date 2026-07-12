# 学习路线图 — AI Agent 架构深度研究

> 面向有软件工程基础（10y+）、已有 AI 使用经验的研究组。
> 目标：**构建自进化 AI Agent + Agent 协作网络**（连接 AirAccount + SuperPaymaster）
> 不断迭代。每完成一个 Phase 回来更新。

---

## 背景校准（你已经有的，不需要学）

- LLM API 调用、Prompt Engineering 基本操作
- Transformer 架构大致原理
- 软件工程设计模式、系统架构
- Web3：账户、交易、智能合约基础

**真正的 gap**：模型训练内部机制、Agent 架构设计原则、多 Agent 协调协议、自进化机制。

---

## 知识树（Obsidian 双向链接地图）

```
AI Agent 知识树
│
├── 模型基础（理解"原料"）
│   ├── Transformer 深层机制
│   │   ├── Attention patterns（不同层学到什么）
│   │   ├── Emergent abilities（scale 如何涌现能力）
│   │   └── Context window 本质（为何有 lost-in-middle 问题）
│   ├── Fine-tuning 体系
│   │   ├── SFT（监督微调）— 数据格式、训练目标
│   │   ├── RLHF / DPO — preference learning
│   │   └── PEFT：LoRA / QLoRA / DoRA
│   └── Omni 多模态
│       ├── 视觉-语言对齐（CLIP、LLaVA）
│       ├── 音频集成
│       └── 统一 tokenization 方案
│
├── Agent 核心架构
│   ├── Loop 框架
│   │   ├── ReAct（推理 + 行动）
│   │   ├── Plan-Execute（计划与执行分离）
│   │   ├── Reflexion（自我反思 + 记忆）
│   │   └── Tree of Thoughts（分支搜索）
│   ├── Memory 系统
│   │   ├── 工作记忆（context window）
│   │   ├── 情节记忆（具体经历，episodic）
│   │   ├── 语义记忆（知识，semantic）
│   │   ├── 程序记忆（技能，procedural）
│   │   └── 外部存储（RAG / 向量 DB / KG）
│   └── Tool Use
│       ├── Function Calling 可靠性
│       ├── Tool 自发现
│       └── Tool 组合规划
│
├── Agent 自进化
│   ├── Meta-learning（学会学习）
│   ├── Tool 自获取（agent 主动寻找新工具）
│   ├── Goal refinement（目标自修正）
│   ├── Self-play + MCTS（自我博弈）
│   └── Curriculum learning（难度递进的自我训练）
│
├── 多 Agent 协作
│   ├── 通信协议
│   │   ├── 同步 vs 异步
│   │   ├── Nostr（已有：agent-speaker）
│   │   └── 自定义协议设计
│   ├── 协调模式
│   │   ├── 顺序（流水线）
│   │   ├── 并行（Swarm）
│   │   ├── 层级监督（Orchestrator-Subagent）
│   │   └── 自组织（emergent coordination）
│   └── 信任与激励
│       ├── Agent 声誉系统
│       └── 链上激励（SuperPaymaster 集成）
│
└── Agent 基础设施（你的 Web3 资产）
    ├── Agent 身份 — AirAccount + CometENS
    ├── Agent 交易 — SuperPaymaster gasless
    ├── Agent 通信 — agent-speaker (Nostr)
    └── Agent 存储 — MemPalace（规划中）
```

---

## Phase 1 — Loop 框架深潜（3 周）

**核心问题**：Agent 循环怎么设计才不会死循环或原地打转？不同 Loop 架构适合什么场景？

**论文**（按优先级）：
1. ReAct: Synergizing Reasoning and Acting（2022）
2. Reflexion: Language Agents with Verbal Reinforcement Learning（2023）
3. Tree of Thoughts（2023）
4. AutoGPT / BabyAGI 代码分析（不是论文，看实现）

**实验**：
- `exp-001-react-scratch` — **不用框架**，100 行手写 ReAct 循环，故意触发失败，研究终止条件
- `exp-002-reflexion` — 给 exp-001 加 Reflexion 层：agent 失败后自我批评并重试，对比成功率
- `exp-003-loop-failure-catalog` — 系统整理 Loop 失败模式：死循环 / 幻觉 tool call / 目标漂移

**Episode 话题**：「Agent Loop 的失败地图——我们见过的所有死法」

**与 Agent24 的连接**：Phase 1 的产出直接指导 Agent24 Loop 模块设计

---

## Phase 2 — Memory 系统（3 周）

**核心问题**：Agent 怎么真正"记住"东西？跨会话记忆 vs 实时记忆 vs 知识库，各自的工程边界在哪里？

**论文**：
1. Generative Agents: Interactive Simulacra of Human Behavior（2023）— memory + reflection + planning 完整实现
2. MemGPT: Towards LLMs as Operating Systems（2023）
3. A Survey on the Memory Mechanism of Large Language Model based Agents（2024）

**实验**：
- `exp-004-memory-types` — 实现四种记忆类型，测试每种在什么任务上有优势
- `exp-005-memgpt-minimal` — 实现 MemGPT 的核心思想：分层 context 管理（main ctx + archival）
- `exp-006-memory-eval` — 给记忆系统写评测：记忆准确性 / 检索延迟 / 遗忘策略

**Episode 话题**：「MemGPT 读后感——LLM 作为操作系统，Memory 作为分页存储」

**与 MemPalace 的连接**：Phase 2 产出 = MemPalace 模块的设计基础

---

## Phase 3 — Fine-tuning 实战（3 周）

**核心问题**：LoRA 微调的实际门槛有多低？数据质量 vs 数据量哪个更重要？特定行业 fine-tuning 的陷阱？

**论文**：
1. LoRA: Low-Rank Adaptation of Large Language Models（2021）
2. QLoRA: Efficient Finetuning of Quantized LLMs（2023）
3. LIMA: Less Is More for Alignment（2023）— 1000 条高质量数据的力量

**工具**：
- Unsloth（最快的 LoRA 训练框架，2-5x 加速）
- Axolotl（灵活的训练配置）
- LM Studio（本地推理验证）

**实验**：
- `exp-007-lora-baseline` — 用 Unsloth + Llama 3.1 8B，在 agent 对话数据上做基础 LoRA 微调
- `exp-008-data-quality` — 同模型：1000 条高质量 vs 10000 条低质量数据，对比结果
- `exp-009-domain-finetune` — 在 Web3/Agent 领域数据上微调，测试领域知识注入效果

**Episode 话题**：「1000 条数据能训出什么——LIMA 论文复现实验」

---

## Phase 4 — 多 Agent 协作协议（4 周）

**核心问题**：多个 Agent 怎么分工不重叠？通信协议怎么设计才有扩展性？链上 Agent 账户怎么集成？

**论文**：
1. AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation（2023）
2. Camel: Communicative Agents for "Mind" Exploration of Large Scale Language Model Society（2023）
3. AgentVerse: Facilitating Multi-Agent Collaboration（2023）

**实验**：
- `exp-010-two-agent-protocol` — 设计最小两 Agent 通信协议（基于 Nostr），无框架
- `exp-011-orchestrator-pattern` — 实现 Orchestrator-Subagent 模式，测试任务分发和结果聚合
- `exp-012-agent-account` — Agent 持有 AirAccount，发起一笔链上交易（gasless via SuperPaymaster）

**Episode 话题**：「Agent 账户不是噱头——我让 Agent 真的花了钱」

**与生态的连接**：Phase 4 = Agent24 + AirAccount + SuperPaymaster 的整合实验

---

## Phase 5 — Agent 自进化（持续研究）

**核心问题**：Agent 怎么主动变好？工具获取、目标修正、自我监督——哪个方向最可行？

**论文**：
1. Voyager: An Open-Ended Embodied Agent with Large Language Models（2023）— tool 自获取
2. Self-Refine: Iterative Refinement with Self-Feedback（2023）
3. Constitutional AI（Anthropic）— 自我对齐机制

**实验**：
- `exp-013-self-refine` — Agent 输出后自我批评，迭代改进，测试收敛性
- `exp-014-tool-discovery` — Agent 从文档自动生成新 Tool 定义并执行
- `exp-015-curriculum` — 给 Agent 设计难度递增的任务序列，测试"成长"曲线

**Episode 话题**：「Voyager 复现——让 Agent 在限制环境里自己学会新技能」

---

## 迭代规则

1. **每个 Phase 开始前**：在 Episode 里提出这个 Phase 的核心疑问
2. **实验完成后**：更新 `experiments/` 对应 README，在 `notes/` 写一篇"我理解的 XXX"
3. **每次有新论文/文章**：扔给 Claude，自动入库到 `~/kb`，下一期 Episode 讨论
4. **知识树是活的**：在 Obsidian 里用 `[[节点名]]` 串联，Graph View 自然生长
5. **路线图偏了就修**：实际探索比计划更重要，这里只是地图，不是轨道

---

## 当前位置

- [ ] Phase 1 — Loop 框架 — 开始日期：___
- [ ] Phase 2 — Memory 系统
- [ ] Phase 3 — Fine-tuning 实战
- [ ] Phase 4 — 多 Agent 协作协议
- [ ] Phase 5 — Agent 自进化（持续）

---

## 知识库入口

所有碎片知识入库到 `~/.mempalace/palace`（MemPalace MCP，全局可搜索）。  
详见 [FEED.md](./FEED.md) 的入库协议。
