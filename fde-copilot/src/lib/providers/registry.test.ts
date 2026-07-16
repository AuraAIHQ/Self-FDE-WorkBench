import assert from "node:assert/strict";
import test from "node:test";
import { discoverProviders, resolveProviderSelection, selectToolModels } from "./registry";

test("project model selection overrides server defaults", () => {
  assert.deepEqual(
    resolveProviderSelection(
      { provider: "lmstudio", model: "project-model" },
      { defaultProvider: "claude", lmStudioModel: "server-model" },
    ),
    { provider: "lmstudio", model: "project-model" },
  );
});

test("provider discovery exposes Claude and models reported by LM Studio", async () => {
  const providers = await discoverProviders({
    baseUrl: "http://lm.test/v1",
    requestModels: async () => ["qwen-local", "coder-local"],
  });

  assert.deepEqual(providers, [
    { id: "claude", label: "Claude", available: true, models: [] },
    { id: "lmstudio", label: "LM Studio", available: true, models: ["qwen-local", "coder-local"] },
  ]);
});

test("LM Studio discovery excludes embeddings and models without native tool training", () => {
  assert.deepEqual(selectToolModels([
    { type: "llm", key: "qwen", capabilities: { trained_for_tool_use: true } },
    { type: "embedding", key: "embed" },
    { type: "llm", key: "plain", capabilities: { trained_for_tool_use: false } },
  ]), ["qwen"]);
});
