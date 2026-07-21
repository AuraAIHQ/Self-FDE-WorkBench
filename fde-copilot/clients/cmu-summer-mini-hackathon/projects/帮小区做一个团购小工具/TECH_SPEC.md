# 技术方案 · Tech Spec

> 客户：CMU Summer Mini Hackathon ｜ 项目：帮小区做一个团购小工具 ｜ 交付物：app（web）
> 架构 / 数据模型 / 接口 / 依赖 / 部署 / 风险
> 本文件由 FDE Copilot 随每轮对话自动维护。

> 说明：以下为面向黑客松 demo 的技术拍板（可由下游 loop 直接实施）。涉及**商业决策**（如是否在线支付）的部分留在 GAPS 待客户确认，不在此定死。

## 1. 架构
- **全栈单体**：Next.js（App Router）+ TypeScript，前后端同仓，API 用 Route Handlers。
  - 理由：黑客松追求快速出可访问链接；Next.js 一套搞定前端页面 + 后端 API + 部署，移动端优先渲染方便。
- **数据库**：SQLite（本地/demo）经 Prisma ORM 访问；如需线上持久化可切 Postgres（Prisma 无痛切换）。
- **部署**：Vercel（一键公网链接）。SQLite 在 Vercel 无持久化，若线上部署则用托管 Postgres（如 Neon/Supabase）。demo 本地跑用 SQLite。
- **样式**：Tailwind CSS，移动端优先响应式。

## 2. 数据模型（Prisma schema 概念）
```
Activity        团购活动
  id            string (cuid)  PK
  title         string
  status        enum(OPEN, CLOSED)   默认 OPEN
  deadline      datetime
  minShares     int?            成团/起送份数（可空）
  pickupPlace   string?
  pickupTime    string?
  note          string?
  adminToken    string          团长管理口令（随机串，用于授权管理页）
  createdAt     datetime

Product         团购商品项
  id            string PK
  activityId    string  FK -> Activity
  name          string
  unitPrice     decimal   分为单位存储（int cents）避免浮点
  unit          string?   如 "箱/份"

Order           居民订单
  id            string PK
  activityId    string  FK -> Activity
  buyerName     string
  buyerPhone    string
  buildingUnit  string    楼栋门牌
  totalAmount   int       cents，= Σ item
  createdAt     datetime

OrderItem       订单明细行
  id            string PK
  orderId       string FK -> Order
  productId     string FK -> Product
  quantity      int
  lineAmount    int   cents = quantity * unitPrice
```
- 金额一律以「分(int cents)」存储与计算，展示时格式化，避免浮点误差。

## 3. 接口契约（REST，JSON）
- `POST /api/activities` — 创建团购。body: {title, deadline, minShares?, pickup*, note?, products:[{name,unitPrice,unit?}]}。resp: {id, adminToken, shareUrl}。
- `GET /api/activities/:id` — 获取团购详情（公开）。resp: 活动 + 商品 + 进度聚合(totalShares, orderCount)。不含订单个人明细。
- `POST /api/activities/:id/orders` — 居民下单。body: {buyerName, buyerPhone, buildingUnit, items:[{productId, quantity}]}。服务端重算金额，忽略前端传入金额。校验活动状态=OPEN 且未过 deadline。
- `GET /api/activities/:id/admin?token=...` — 团长管理数据（校验 adminToken）。resp: 汇总 + 全部订单明细。
- `POST /api/activities/:id/close?token=...` — 截单（校验 adminToken）。
- `GET /api/activities/:id/export.csv?token=...` — 导出 CSV（UTF-8 BOM）。

## 4. 授权模型（轻量）
- 无账号体系。团长管理靠创建时返回的 `adminToken`（拼进管理链接，如 `/g/{id}/manage?token=xxx`）。
- 居民端完全公开，凭活动链接访问、下单。
- 风险：adminToken 泄露=管理权泄露；demo 可接受，生产需升级（见风险）。

## 5. 依赖
- Next.js, React, TypeScript, Tailwind CSS, Prisma, SQLite（或 Postgres）, zod（入参校验）, 剪贴板 API。

## 6. 技术风险
- **R1 并发下单一致性**：截止瞬间并发下单，需在服务端事务内校验 status/deadline。demo 量级风险低。
- **R2 无支付即无强约束**：下单≠付款，可能有空单/爽约。属产品选择（见 GAPS Q2）。
- **R3 adminToken 简易授权**：泄露即失控；生产需真正登录。
- **R4 Vercel + SQLite 无持久化**：线上部署须换 Postgres；本地 demo 无此问题。

## 7. 待客户确认后可能影响技术方案的点
- 在线支付（GAPS Q2）→ 引入支付网关（Stripe / 微信支付）、支付回调、订单支付状态机。
- 是否要求登录（GAPS Q5）→ 引入账号体系或短信验证码。
