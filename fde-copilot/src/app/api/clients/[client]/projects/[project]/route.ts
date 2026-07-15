import { NextResponse } from "next/server";
import { readClient, readProjectState, readAllDocs, readConversation } from "@/lib/clients";
import { authError } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ client: string; project: string }> },
) {
  const denied = authError(req);
  if (denied) return denied;
  const { client, project } = await params;
  const [c, state] = await Promise.all([readClient(client), readProjectState(client, project)]);
  if (!c || !state) return NextResponse.json({ error: "客户或项目不存在" }, { status: 404 });
  const [docs, conversation] = await Promise.all([
    readAllDocs(client, project),
    readConversation(client, project),
  ]);
  return NextResponse.json({ client: c, state, docs, conversation });
}
