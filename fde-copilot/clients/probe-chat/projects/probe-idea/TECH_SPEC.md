# 技术方案 · Tech Spec

> 客户：probe-chat ｜ 项目：probe-idea ｜ 交付物：app（web）
> 架构 / 数据模型 / 接口 / 依赖 / 部署 / 风险
> 本文件由 FDE Copilot 随每轮对话自动维护。

> ⚠️ 本轮为技术初稿【假设】。凡涉及支付/登录等商业选型的部分标注待确认；纯实现细节由 FDE 拍板并说明理由。

## 1. 架构（MVP 建议）
- 单体全栈 Web 应用，手机端优先响应式。
- **前端**：React + TypeScript + Vite，移动端优先 UI（可用 Tailwind）。团长端与居民端同一应用不同路由。
- **后端**：Node.js（NestJS 或 Express）提供 REST API；或用 Next.js 全栈一体（前后端同仓，利于快速交付）。**FDE 建议：Next.js（App Router）单仓全栈**，减少部署复杂度，适合小工具增量交付。
- **数据库**：PostgreSQL（关系模型契合订单/商品）。MVP 可先用 SQLite/Postgres 皆可，推荐 Postgres 便于后续托管。
- **文件/图片**：商品图上传至对象存储（如 S3 兼容）或先用图床/base64 占位（MVP 可延后）。
- **身份识别（MVP 免登录方案，待确认）**：居民端用「浏览器本地标识 + 手机号」软识别订单归属；团长端用「发起时生成的管理密钥链接」访问汇总页（免账号）。若客户需要微信登录/正式账号体系，见 GAPS，属 M1。

## 2. 数据模型（初稿）
```
GroupBuy(团购)
  id, title, status(draft|open|closed), pickup_info(自提点/时间文本),
  deadline_at, target_qty(可空), manager_key(团长管理密钥), created_at

Product(商品)  —— 属于某团购
  id, group_buy_id, name, unit_price(分), unit(单位), image_url(可空),
  limit_per_order(可空), stock(可空), sort_order

Order(订单)  —— 某居民的一次下单
  id, group_buy_id, buyer_name, building_room(楼栋门牌), phone,
  client_token(浏览器软识别), total_amount(分), status, created_at

OrderItem(订单行)
  id, order_id, product_id, qty, unit_price_snapshot(分, 下单时快照)
```
说明：金额用「分」整数存储避免浮点误差；`unit_price_snapshot` 保证改价不影响历史订单。

## 3. 接口契约（REST 初稿）
- `POST /api/group-buys` 创建团购（返回 id + share_url + manager_url）
- `PATCH /api/group-buys/:id` 编辑（需 manager_key）
- `POST /api/group-buys/:id/close` 关闭（需 manager_key）
- `GET /api/group-buys/:id` 居民端读取团购+商品+进度（截止后只读）
- `POST /api/group-buys/:id/orders` 提交订单
- `GET /api/group-buys/:id/orders/mine?token=` 查看/修改本人订单
- `GET /api/group-buys/:id/summary?key=` 团长汇总（需 manager_key）
- `GET /api/group-buys/:id/export?key=` 导出 CSV

## 4. 依赖与第三方（待确认项）
- 【待确认】微信支付：需商户号、企业资质、回调域名备案——若做 M1 支付，前置门槛高。
- 【待确认】微信 JS-SDK / 公众号授权：若要微信内授权登录或分享卡片美化。
- 短信验证码（若需手机号验证）——MVP 可先不做强验证。

## 5. 部署（初稿）
- MVP：单实例部署（Vercel / 一台云服务器 + Docker）。域名需 HTTPS（微信内打开要求）。
- 若涉及微信支付/JS-SDK，需备案域名。

## 6. 技术风险
- **R1 支付合规**：线上收款涉及微信支付商户资质与资金合规，是最大不确定性 → 已抛 GAPS。MVP 建议先「记录订单+线下收款」规避。
- **R2 身份识别**：免登录下「本人订单」靠浏览器 token，清缓存/换设备会丢失识别 → 用手机号兜底查询。
- **R3 微信内环境限制**：H5 在微信内的分享、支付、拍照上传受 JS-SDK 与域名备案约束。
- **R4 并发/库存**：若设库存，需处理并发超卖（MVP 量小，先乐观锁/简单校验）。
