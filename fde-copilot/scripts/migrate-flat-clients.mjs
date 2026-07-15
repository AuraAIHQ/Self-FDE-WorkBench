#!/usr/bin/env node
// 把旧版「扁平客户」(clients/<客户>/{docs,state.json}) 迁移成新版
// 「客户→项目」两级 (clients/<客户>/client.json + projects/主项目/{docs,state.json})。
// 幂等：已有 client.json 的客户跳过。用法: node scripts/migrate-flat-clients.mjs [clientsDir]
import { promises as fs } from "node:fs";
import path from "node:path";

const CLIENTS = process.argv[2] || path.join(process.cwd(), "clients");
const DOCS = ["SPEC.md", "PRODUCT.md", "FEATURES.md", "TECH_SPEC.md", "INTERACTIONS.md", "GAPS.md", "INTAKE.md"];

const exists = (p) => fs.access(p).then(() => true).catch(() => false);

async function migrate() {
  let entries;
  try { entries = await fs.readdir(CLIENTS, { withFileTypes: true }); }
  catch { console.log("无 clients 目录，跳过"); return; }

  let n = 0;
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const dir = path.join(CLIENTS, e.name);
    if (await exists(path.join(dir, "client.json"))) continue;        // 已是新版
    if (!(await exists(path.join(dir, "state.json")))) continue;      // 非旧版客户

    const old = JSON.parse(await fs.readFile(path.join(dir, "state.json"), "utf8"));
    const now = old.updatedAt || old.createdAt || new Date().toISOString();

    // client.json（背景留空，用户可在新版补填）
    await fs.writeFile(path.join(dir, "client.json"), JSON.stringify({
      slug: e.name, name: old.name || e.name, background: "",
      createdAt: old.createdAt || now, updatedAt: now,
    }, null, 2));

    // 主项目
    const projName = "主项目";
    const projDir = path.join(dir, "projects", projName);
    await fs.mkdir(projDir, { recursive: true });
    for (const f of [...DOCS, "conversation.jsonl"]) {
      const src = path.join(dir, f);
      if (await exists(src)) await fs.rename(src, path.join(projDir, f));
    }
    await fs.writeFile(path.join(projDir, "state.json"), JSON.stringify({
      slug: projName, clientSlug: e.name, name: projName,
      deliverable: { name: old.name || "交付物", type: "other" },
      createdAt: old.createdAt || now, updatedAt: now,
      rounds: old.rounds ?? 0, status: old.status ?? "building",
      lastReadiness: old.lastReadiness ?? null, usage: old.usage,
    }, null, 2));
    await fs.rm(path.join(dir, "state.json"), { force: true });       // 旧顶层 state 移除
    n++;
    console.log(`✓ 迁移客户「${e.name}」→ 客户/项目两级（主项目）`);
  }
  console.log(n ? `完成，共迁移 ${n} 个客户` : "无需迁移");
}
migrate().catch((e) => { console.error(e); process.exit(1); });
