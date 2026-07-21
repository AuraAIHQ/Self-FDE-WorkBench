# 技术方案 · Tech Spec

> 客户：格格 ｜ 创建：2026-07-15 ｜ 最近更新：2026-07-15 (R4)
> 架构 / 数据模型 / 接口契约 / 依赖 / 部署 / 技术风险
> ✅ R2 方向锁定 A。✅ R3 双交付。✅ R4 HiLinkup 采用确认(env 抽象)、新增 F8 视频生成模块、Profile 新增 signatureAsset(自研 agent)。
> ✅ R5：key 位置闭合(`~/Dev/.env`·`HiLinkup_API_KEY`)、signatureAsset 定义闭合(=本 Copilot/Loop Engineer 本身)、F8 拆为 F8a(脚本)+F8b(本地短视频插件)、新增本地视频合成管线技术路线。
> ✅ R6：F8b 底座锁定 = **OpenMontage 作为 git submodule**（github.com/calesthio/OpenMontage · AGPL-3.0 · Remotion+Piper+ffmpeg 本地栈）；Q17 兜底收敛（本地不满足再接外部视频模型 API）；blog 悬案(G11)关闭。以下为可由下游 loop 直接落地的技术方案。
> ✅ R7：**自研系统 = 两个真实 git submodule**（FDE Copilot=fd/pilot 本身 + Loop Engineer）→ signatureAsset 有代码实体，F8b 演示镜头取材于其真实运行；**新增 F8b 成片输出契约**（确定落盘路径 + 绝对路径回显），回答客户"MP4 在哪"。
> ✅ R8：**两 submodule 路径钉死**（`fde-copilot/` + `loop-engineer/`，项目根 `ls` 实证）；本 spec 库物理存放在 `fde-copilot/clients/格格/` 内 → "需求→规格"演进证据即最强就地素材；提醒 OpenMontage submodule 尚未加入（F8b 首步 `git submodule add`）。**最后一个可选缺口关闭，规格全绿。**

## 代码落点与技术栈默认（R9 新增·供 loop-engineer M0.0 直接开工）
- **产品代码落点（默认·待确认 Q18）**：`~/Dev/auraai/Self-FDE-WorkBench/clients/格格/app/` —— 与本 spec 库同层，"需求↔代码"物理并置便于溯源。若客户/loop-engineer 另有约定以其为准。
- **技术栈（默认·loop 可自行拍板，非商业决策）**：单用户本地 Web app，建议 **TypeScript + 轻量全栈框架（如 Next.js 或 Vite+Express）+ SQLite**；LLM 走 HiLinkup（OpenAI 兼容 SDK）。选型属实现细节，loop 可按仓库既有工具链/偏好调整，只需满足"单用户本地私有部署 + 生成内核与导出层解耦"两条硬约束。
- **开工顺序**：严格按 FEATURES.md「Loop-Engineer 增量清单」M0.0→M2.2 逐格施工，每格 DoD 全绿再进下一格。

## 交付形态（R3 闭合 · Q10）
**双交付确定**：①**单用户 Web 应用（个人求职作战台）**——格格一人使用，本地/私有部署，无多租户、无复杂权限；②**材料清单包导出**（F7）——软件生成物一键打包为可离线投递的文件夹。二者**共用同一套生成内核**，材料包是软件数据的"落地快照"，不引入软件外新事实。工程含义：生成内核与导出层必须解耦，导出层独立成模块以支撑离线材料交付。

## 架构（分层）
- **前端**：轻量 Web UI（仪表盘：画像/岗位看板/资产库/演练）。单用户，无需登录体系（本地或口令保护即可）。
- **应用层**：
  - 画像与差距引擎（F1）
  - 岗位情报采集与匹配（F2）——定时抓取 + 规则/LLM 匹配
  - 资产生成服务（F3 简历 / F4 教案 / F6 试讲稿 / **F8 说课试讲视频脚本+分镜**）——LLM 驱动的模板化生成；所有生成物默认植入"自研 agent 亮点"与"AI 融入点"占位
  - 投递看板与提醒（F5）
  - 模拟评委对练（F6）——LLM 多轮对话
- **数据层**：本地数据库（SQLite/文件）足够；存格格档案、岗位库、生成资产、投递状态。

## 数据模型（核心实体）
- `Profile`：格格档案（学历/在读状态、研究方向=数字创新与创业、**成果=[1篇论文, ICDI优秀学生奖, 自研"数字创新创业agent"= **本 FDE Copilot+Loop Engineer 系统本身**（signatureAsset 标记, ✅ R5 定义闭合）]**、语言=专八、党员=否、年龄=20出头、目标地域=东北全域不限城市、意向学院=数字经济/电商[已确认]、毕业时间≈2年后）。`signatureAsset` 字段供生成服务优先引用。
- `Job`：岗位（院校、岗名、学历/经验要求、是否接受海外博士、截止日、来源URL、匹配标签+理由）。
- `Asset`：生成资产（类型=简历/教案/课程设计/试讲稿/**视频脚本**，关联Job可选，版本，评审分数）。
- `Application`：投递记录（关联Job，状态机：待投→已投→初筛→试讲→面试→offer/拒，提醒时间）。
- `GapReport`：差距报告（满足项/缺口项/补齐动作/优先级/就绪度分）。

## 接口/依赖
- **LLM 接入**（✅ R4 采用 · ✅ R5 key 闭合）：统一走 **HiLinkup Gateway**（OpenAI 兼容，可调 GLM/Kimi/gpt 等）作为唯一模型接入层。key 从 **`~/Dev/.env`** 读取，**变量名精确为 `HiLinkup_API_KEY`（混合大小写，勿改成全大写）**；另配 `HILINKUP_BASE_URL`。下游按此变量名接入即可真机联调，**运维阻塞已消除**。境内使用倾向国产模型合规。
- **视频生成 F8a（脚本层·教案配套）**：LLM 生成"说课/试讲视频脚本+分镜+讲解要点+配速"，产出可编辑文档，配合 F4 教案用于 10–20 分钟说课/试讲。绝不合成格格本人影像。
- **视频生成 F8b（本地短视频插件 · R5 新增 · 主打 · ✅ R6 技术底座锁定）**：目标=把"自研 agent（即本 FDE Copilot + Loop Engineer）"做成一条**帅/酷的产品展示短视频（真实 MP4 成片）**，作为 **copilot 的插件**，本地快速渲染。
  - **✅ 确定采用 OpenMontage 作为 F8b 底座（R6 客户拍板）**：以 **`github.com/calesthio/OpenMontage`** 直接作为 **git submodule** 引入（如 `vendor/openmontage` 或 `plugins/openmontage`）。OpenMontage = 开源 agentic 视频生产系统（12 pipelines / 52 tools / 500+ agent skills；三层架构：Python 工具可执行文件 + YAML pipeline manifest + Markdown skill 指令）。本地免费栈 = **Remotion + Piper TTS + FFmpeg + 免费素材**——与 R5 默认栈同源，客户拍板即把假设升格为确认方案。
  - **集成方式**：F8b 插件 = 薄封装层，把本 copilot 的生成内核（脚本/分镜/旁白，走 HiLinkup）→ 转成 OpenMontage 的 pipeline 输入（选 explainer / screen demo / trailer 等合适 pipeline）→ 调其 tools 渲染 → 回收 MP4 + 工程文件。**不 fork、不魔改 OpenMontage 内部**，走它的既定接口；升级只需 `git submodule update`。
  - **⚠️ 许可证注意（下游必看）**：OpenMontage 为 **AGPL-3.0**。格格**本地私用（个人求职、不对外分发软件）不触发 AGPL 分发/网络服务开源义务**，可安全使用；**但若未来把本 copilot 作为网络服务对外提供**，AGPL 的 network-use 条款会要求开源——届时需评估（隔离为独立进程/服务调用，或换非 copyleft 渲染栈）。当前单用户本地部署无风险，记录备查。
  - **兜底（可选·Q17→R6 收敛）**：客户已确认"本地不满足再找外部视频模型 API"。故默认全走 OpenMontage 本地纯代码合成栈（无需生成式视频大模型即可出片）；仅当要 AI 实拍级镜头/数字人时，客户另行提供厂商与 key，作为独立可选 adapter，不改主管线。
  - **插件化约束**：F8b 作为独立插件模块挂在生成内核之上，输入=脚本/素材 JSON，输出=MP4 + 工程文件；失败可降级为 F8a 脚本+分镜（不阻塞主交付）。
  - **✅ 自研系统的代码实体（R7 · R8 路径钉死）**：格格自研 agent（signatureAsset）= 本项目下的**两个 git submodule**，路径已由客户确认（`~/Dev/auraai/Self-FDE-WorkBench` 项目根 `ls` 实证）：
    - **`fde-copilot/`** —— **FDE Copilot（即本 copilot 本身，别名 fd/pilot）**，需求→loop-ready 规格的对话侧。绝对路径 `~/Dev/auraai/Self-FDE-WorkBench/fde-copilot`。
    - **`loop-engineer/`** —— **Loop Engineer**，loop-ready 规格→增量自动建系统的执行侧。绝对路径 `~/Dev/auraai/Self-FDE-WorkBench/loop-engineer`。
    - 二者构成"能造系统的 AI"完整闭环。F8b 生成"自研系统演示镜头"时，**素材来源优先取这两个 submodule 的真实运行录屏/流程图/关键代码**。
    - **⭐ 最强就地素材（R8 实证）**：本客户的整套 spec 文档链本身就活在 `fde-copilot/clients/格格/` 目录下 —— 即"需求→规格"的演进证据**物理存放在 FDE Copilot submodule 内部**，F8b 可直接取本目录 INTAKE/SPEC/FEATURES/… 从 R1→R8 逐轮演进的过程作为最直观的"需求变系统"镜头，无需任何外部虚构 demo。
    - 下游无需再猜路径；如需程序化枚举仍可 `git submodule status` 兜底。
  - **⚠️ 待办提醒（非阻塞·R8）**：项目根当前 `ls` 只见 `fde-copilot` / `loop-engineer` 两个 submodule，**OpenMontage 尚未加入**。F8b 开建第一步需 `git submodule add https://github.com/calesthio/OpenMontage <vendor/openmontage>` 并 `git submodule update --init --recursive`。这是已知落地动作，非新缺口。
  - **✅ F8b 成片输出契约（R7 新增·下游必须遵守 · 回答客户"MP4 在哪"）**：F8b 薄封装层负责把 OpenMontage 的原始产物**收拢到项目内统一、可预测的输出目录**，不让成片散落在 submodule 内部。约定如下：
    - **输出根**：`<repo_root>/output/videos/`
    - **每次生成一个带时间戳的运行目录**：`output/videos/<YYYYMMDD-HHmmss>-<slug>/`，内含：
      - `final.mp4` —— **成片**（≥1080p，H.264/MP4）← 客户要看的就是这个
      - `thumbnail.png` —— 首帧/封面缩略图（便于快速预览）
      - `narration.txt` / `script.json` —— 旁白与脚本
      - `storyboard.json` —— 分镜数据
      - `build.log` —— 渲染日志（失败排查）
      - `project/` —— OpenMontage 工程文件（供二次编辑/重渲染）
    - **稳定"最新成片"指针**：每次生成成功后，把成片同步到 `output/videos/latest/final.mp4`（符号链接或副本），供客户/下游"永远看最新一条"，无需记时间戳。
    - **绝对路径回显（硬要求）**：生成流程结束后，**UI 与 CLI 都必须打印成片 `final.mp4` 的绝对路径**（如 `/Users/jason/Dev/<项目根>/output/videos/20260715-.../final.mp4`），让客户可直接 `open` 查看。
    - **注意（须向客户说明）**：以上是**规格约定的产出位置**，系统尚未构建时该路径下**无文件**；须下游 loop 建好 F8b 并真机跑一次后，MP4 才会出现在此。客户亦可自行在 Claude Code 跑通，产物落在同一约定路径。
  - **依赖清单（下游预备）**：OpenMontage submodule + 其依赖（Python 工具链、node + Remotion、Piper TTS、ffmpeg、免费素材源）；均本地可装，macOS 环境。按 OpenMontage README/AGENT_GUIDE.md 装配。
- **岗位数据源**：高校人才网/科学人才网/各校人事处公告等——需确认可合规抓取方式；抓不到的字段（如"是否接受泰博"）标"待确认"，不臆造。
- **文档导出（F7·双交付必需）**：独立导出模块，把简历/教案/岗位表/试讲稿/checklist 打包为可编辑 docx/pdf/xlsx 的结构化文件夹，支持版本化命名、离线交付。与生成内核解耦。
- **岗位源范围**：东北三省（辽/吉/黑）高校人才网/高层次人才网/各校人事处公告等。

## 部署
- 单用户、私有/本地部署优先；无需高可用。数据含格格个人信息，注意本地存储与最小外发。

## 技术风险
- **岗位抓取的合规与稳定性**：站点结构变动/反爬——需容错与人工兜底录入。
- **LLM 生成质量与真实性**：教案/简历须防"看起来像但不能用"；一律"初稿+格格审校"，杜绝虚构经历。
- ✅ **模型接入 key（R5 闭合）**：HiLinkup Gateway 采用已确认，key 在 `~/Dev/.env` 变量 `HiLinkup_API_KEY`，可真机联调，运维阻塞消除。
- **F8b 环境依赖与产片质量（R6：底座已定=OpenMontage）**：OpenMontage 的 Python 工具链 + Remotion/TTS/ffmpeg 需在 macOS 本地正确装配（按其 README/AGENT_GUIDE.md）；"帅/酷"是主观标准，需给出可量化的成片验收（分辨率≥1080p、时长 15–90s、含品牌化 motion/字幕、片中出现"自研 agent=本系统"演示镜头）并留 1–2 版风格模板迭代。OpenMontage 本地栈不依赖生成式视频大模型即可出片，降低外部依赖风险。**AGPL-3.0 许可证**：本地私用无风险，若转网络服务对外则需评估（见接口章）。
- ✅ **F8b 底座与 blog 悬案（R6 闭合）**：客户拍板直接用 **OpenMontage 作 git submodule**，R5 的"blog 既有做法未读取（G11）"已不再阻塞——无需再对齐 blog，采用 OpenMontage 现成方案即可。沙箱仍无法访问 `~/Dev` 下 blog 目录，但该缺口因方案已定而关闭。
- ✅ **交付形态已拍板**（Q10 闭合）：软件+材料双交付，风险消除；唯一新增工程点是导出层需独立解耦（已纳入设计）。
