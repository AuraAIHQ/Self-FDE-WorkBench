# 技术方案 · Tech Spec

> 客户：CMU Summer Mini Hackathon ｜ 项目：帮我做个团购小工具 ｜ 交付物：app（web）
> 架构 / 数据模型 / 接口 / 依赖 / 部署 / 风险
> 本文件由 FDE Copilot 随每轮对话自动维护。

> ⚠️ 技术选型由 FDE 依 hackathon 场景拍板（可落地、部署简单）；仅"是否需要真实支付/是否要账号"这类会改变架构的点需客户确认。

## 1. 架构总览
- **单一全栈 Web 应用**，前后端一体，优先部署简单、可一键上线。
- 推荐：**Next.js (App Router) + TypeScript**，API 用 Route Handlers；托管在 **Vercel**。数据用 **托管 Postgres（Neon/Supabase）** 经 Prisma 访问。
  - 备选（更快起）：Vite + React 前端 + 轻后端 + SQLite/Supabase。团队更熟哪套就用哪套，不阻塞。
- 无登录，靠两类不可猜测 token 做访问控制：
  - `groupId`（公开团购页）——可分享。
  - `manageToken`（发起人管理页）——仅发起人持有，控制汇总/导出/关团。
- 参与者身份：无账号，用浏览器 `localStorage` 存 `participantToken`，用于回来修改/撤销自己的报名。非安全边界，仅便利。

## 2. 数据模型（初稿）
```
GroupBuy
  id            string (uuid, 公开)
  manageToken   string (随机, 仅发起人)
  title         string          // 商品名
  unitPrice     number          // 单价（分/最小货币单位，避免浮点误差）
  currency      string          // 默认 CNY/USD（待确认）
  goalType      enum(HEADCOUNT | QUANTITY | AMOUNT)  // 成团口径
  goalTarget    number          // 目标值（人数/总份数/总金额）
  deadline      datetime | null
  pickupNote    string | null   // 取货点/说明
  payInfo       string | null   // 收款说明（M2）
  payImageUrl   string | null   // 收款码（M2）
  status        enum(OPEN | FULFILLED | CLOSED)
  fulfilledAt   datetime | null
  createdAt     datetime

Participation
  id                string (uuid)
  groupBuyId        string (fk)
  participantToken  string   // 对应浏览器，凭此改/删自己
  nickname          string
  quantity          integer  // 份数 ≥1
  variant           string | null  // 规格
  note              string | null
  createdAt         datetime
  updatedAt         datetime
```
派生量（不落库，服务端计算）：`totalHeadcount = 去重 or 报名条数`、`totalQuantity = Σquantity`、`totalAmount = Σ(quantity*unitPrice)`。成团判定按 `goalType` 比对 `goalTarget`。
> 注：goalType=HEADCOUNT 时"人数"定义（按报名条数 vs 按去重）需确认，见 GAPS。

## 3. 接口契约（REST 初稿）
- `POST /api/groups` → 创建团购。body: {title, unitPrice, currency, goalType, goalTarget, deadline?, pickupNote?}。resp: {id, manageToken}。
- `GET /api/groups/:id` → 公开视图（含商品、目标、进度、名单[脱敏可选]、status）。
- `POST /api/groups/:id/participants` → 加入。body:{nickname, quantity, variant?, note?, participantToken}。**服务端在事务内校验 status=OPEN 并重算进度/成团**（防并发超卖）。
- `PATCH /api/groups/:id/participants/:pid` → 改自己的报名（需匹配 participantToken）。
- `DELETE /api/groups/:id/participants/:pid` → 撤销（需匹配 participantToken）。
- `GET /api/groups/:id/summary?manageToken=...` → 发起人汇总 + CSV 导出。
- `POST /api/groups/:id/close?manageToken=...` → 手动关团/重开（M1）。
- 校验：所有写接口做输入校验（zod），金额用整数分，拒绝越权 token。

## 4. 实时更新
- v0 用**客户端轮询**（每 3–5s `GET /api/groups/:id`）即可满足"数秒内更新"，实现简单、演示稳。
- 加分项（M2）：SSE / WebSocket / Supabase Realtime 做推送。非必须。

## 5. 并发与一致性
- 成团判定与状态翻转在**数据库事务**中完成，读取当前累计→插入报名→若达标置 FULFILLED，避免两人同时提交导致状态/合计错乱。
- 金额一律整数（最小货币单位）计算，展示时再除。

## 6. 部署与依赖
- 依赖：Next.js/React、Prisma、托管 Postgres、zod；可选 QR 生成库、CSV 生成。
- 部署：Vercel + Neon/Supabase 免费档，`git push` 即上线，契合 hackathon。
- 环境变量：`DATABASE_URL`；无三方支付密钥（v0 不接支付）。

## 7. 技术风险 / 待决策
- **是否真实支付** → 若客户要在线收款，架构需加三方支付（Stripe/微信支付）+ 合规，工作量与风险大幅上升。默认不做，见 GAPS（阻塞级）。
- **货币与地域**（CNY vs USD、微信生态 vs 通用 web）影响收款方式与文案，见 GAPS。
- **实时性要求**：若必须"实时推送"而非轮询，改用 SSE/Realtime。
- **隐私**：公开团购页是否展示他人昵称/份数，涉及隐私粒度，见 GAPS。
