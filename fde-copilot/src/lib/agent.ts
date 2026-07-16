import { promises as fs } from "node:fs";
import path from "node:path";
import { projectDir, readConversation, readClient, readProjectState } from "./clients";
import type { ConversationEntry, TurnResult, Usage } from "./types";
import { resolveProviderSelection } from "./providers/registry";
import { specAgentProvider } from "./providers/spec-provider";

async function loadSystemPrompt(): Promise<string> {
  const p = path.join(process.cwd(), "prompts", "system.md");
  return fs.readFile(p, "utf8");
}

function recentContext(history: ConversationEntry[], take = 6): string {
  const slice = history.slice(-take);
  if (slice.length === 0) return "（这是客户第一次输入，尚无历史。）";
  return slice
    .map((e) => `${e.role === "customer" ? "客户" : "你(Copilot)"}：${e.text}`)
    .join("\n");
}

export interface RunTurnInput {
  clientSlug: string;
  projectSlug: string;
  customerInput: string;
  attachments?: string[];
}

export interface RunTurnOutput {
  result: TurnResult;
  /** 若 agent 未调用 submit_turn，用于兜底提示 */
  usedFallback: boolean;
  rawText: string;
  /** 本轮用量（token / 计算量 / 成本） */
  usage: Usage;
}

/**
 * 跑一轮：给定客户新输入，让 agent 读现状→更新文档→调研→抛问题→submit_turn。
 * cwd 锁定为该客户目录，agent 直接就地读写 spec 文档。
 */
export async function runTurn(input: RunTurnInput): Promise<RunTurnOutput> {
  const dir = projectDir(input.clientSlug, input.projectSlug);
  const system = await loadSystemPrompt();
  const history = await readConversation(input.clientSlug, input.projectSlug);
  const client = await readClient(input.clientSlug);
  const project = await readProjectState(input.clientSlug, input.projectSlug);

  // 附件名客户可控：只取 basename，杜绝借文件名做路径穿越/误导 Read 越界
  const safeAttachments = (input.attachments ?? []).map((a) => path.basename(a)).filter(Boolean);
  const attachNote = safeAttachments.length
    ? `\n\n客户本轮附带了文件（已存到当前目录，可用 Read 读取）：${safeAttachments.join(", ")}`
    : "";

  const clientContext = client
    ? `## 客户背景（该客户下所有项目共享，务必据此定制）\n客户：${client.name}\n${client.background || "（客户未填背景）"}`
    : "";
  const deliverableContext = project
    ? `## 本项目的交付物（右栏以此为中心，所有规格都服务于产出它）\n名称：${project.deliverable.name}\n类型：${project.deliverable.type}`
    : "";

  const prompt = `${clientContext}

${deliverableContext}

## 最近对话
${recentContext(history)}

## 客户本轮新输入
${input.customerInput}${attachNote}

## 你的任务
按 system prompt 的流程处理这轮输入：结合上面的**客户背景**与**交付物目标**，读现状 → 融合更新当前目录下的 spec 文档 → 检缺口 → 能查的自己查、只有客户知道的抛问题 → 评估 readiness → 最后调用 mcp__workbench__submit_turn 恰好一次。`;

  const maxTurns = Number(process.env.AGENT_MAX_TURNS ?? 40);
  const selection = resolveProviderSelection(project?.model);
  return specAgentProvider(selection).run({
    root: dir,
    system,
    user: prompt,
    model: selection.model,
    maxTurns,
  });
}
