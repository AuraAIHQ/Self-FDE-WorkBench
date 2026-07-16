import { NextResponse } from "next/server";
import { authError } from "@/lib/auth";
import { discoverProviders, resolveProviderSelection } from "@/lib/providers/registry";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = authError(req);
  if (denied) return denied;
  return NextResponse.json({
    providers: await discoverProviders(),
    defaultSelection: resolveProviderSelection(),
  });
}
