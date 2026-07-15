import { NextResponse } from "next/server";
import { readProjectState } from "@/lib/clients";
import { commitProject } from "@/lib/git";
import { authError } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = authError(req);
  if (denied) return denied;
  const { clientSlug, projectSlug, push } = (await req.json()) as {
    clientSlug?: string;
    projectSlug?: string;
    push?: boolean;
  };
  if (!clientSlug || !projectSlug) {
    return NextResponse.json({ error: "缺少 clientSlug / projectSlug" }, { status: 400 });
  }
  const state = await readProjectState(clientSlug, projectSlug);
  if (!state) return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  try {
    const r = await commitProject(
      clientSlug,
      projectSlug,
      `docs(${clientSlug}/${projectSlug}): 手动提交 spec（第 ${state.rounds} 轮）`,
      push === true,
    );
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
