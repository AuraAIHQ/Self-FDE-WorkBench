import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

/** 常量时间比较，避免 token 校验的时序侧信道 */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * 最小鉴权：若设了 WORKBENCH_TOKEN，则所有 API 需带 `x-workbench-token` 匹配头，否则 401。
 * 未设 token 时视为「仅本机使用」——配合默认 bind 127.0.0.1（见 package.json / README）。
 * 面向公网/无人值守部署务必设置 WORKBENCH_TOKEN。
 */
export function authError(req: Request): NextResponse | null {
  const token = process.env.WORKBENCH_TOKEN?.trim();
  if (!token) return null;
  const got = req.headers.get("x-workbench-token");
  if (!got || !safeEqual(got, token)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
