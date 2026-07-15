import { NextResponse } from "next/server";
import { listClients, listProjects } from "@/lib/clients";
import { authError } from "@/lib/auth";
import { addUsage, ZERO_USAGE } from "@/lib/types";
import type { Usage } from "@/lib/types";

export const runtime = "nodejs";

/** 全局用量 = 所有客户所有项目累计之和 */
export async function GET(req: Request) {
  const denied = authError(req);
  if (denied) return denied;

  const clients = await listClients();
  let global: Usage = ZERO_USAGE;
  const perProject: Array<{ client: string; project: string; usage: Usage }> = [];
  for (const c of clients) {
    for (const p of await listProjects(c.slug)) {
      const u = p.usage ?? ZERO_USAGE;
      global = addUsage(global, u);
      perProject.push({ client: c.name, project: p.name, usage: u });
    }
  }
  return NextResponse.json({ global, perProject, at: new Date().toISOString() });
}
