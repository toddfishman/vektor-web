import "server-only";
/*
  Agent runtime. One function, provider behind it, so the front end never changes when the
  backend does. Today: Claude via the Anthropic API (AGENT_PROVIDER=anthropic). A voice layer
  (e.g. Deepgram or another voice-agent platform) would sit in front of this — speech-to-text in,
  the same runAgent() in the middle, text-to-speech out — reusing the prompt, knowledge and tools.
*/
import Anthropic from "@anthropic-ai/sdk";
import { AGENT_SYSTEM } from "./prompt";
import { TOOL_DEFS, runTool, type AgentAction } from "./tools";

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type AgentEvent =
  | { type: "text"; text: string }
  | { type: "action"; action: AgentAction }
  | { type: "done" }
  | { type: "error"; message: string };

export const agentConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY) && process.env.AGENT_ENABLED !== "0";

const MODEL = process.env.AGENT_MODEL || "claude-sonnet-5-5";
const MAX_TOOL_ROUNDS = 4;

export async function runAgent(history: ChatMessage[], emit: (e: AgentEvent) => void, meta: { ip?: string }) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const transcript = history.map((m) => `${m.role === "user" ? "Visitor" : "Agent"}: ${m.content}`).join("\n");
  const messages: Anthropic.MessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 800,
      // the system prompt is long and identical every turn: cache it
      system: [{ type: "text", text: AGENT_SYSTEM, cache_control: { type: "ephemeral" } }],
      tools: TOOL_DEFS,
      messages,
    });
    stream.on("text", (t) => emit({ type: "text", text: t }));
    const msg = await stream.finalMessage();

    const uses = msg.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    if (msg.stop_reason !== "tool_use" || !uses.length) break;

    messages.push({ role: "assistant", content: msg.content });
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const u of uses) {
      const r = await runTool(u.name, (u.input ?? {}) as Record<string, unknown>, { ip: meta.ip, transcript });
      if (r.action) emit({ type: "action", action: r.action });
      results.push({ type: "tool_result", tool_use_id: u.id, content: r.content, is_error: r.isError });
    }
    messages.push({ role: "user", content: results });
    if (round === MAX_TOOL_ROUNDS) emit({ type: "text", text: "\n\nI can't finish that here. Please call or text (831) 220-8093 and a person will help." });
  }
  emit({ type: "done" });
}
