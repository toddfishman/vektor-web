/*
  POST /api/agent  { messages: [{ role: "user" | "assistant", content: string }] }
  Streams newline-delimited JSON events: {type:"text"|"action"|"done"|"error", ...}
*/
import { NextResponse, type NextRequest } from "next/server";
import { agentConfigured, runAgent, type AgentEvent, type ChatMessage } from "@/lib/agent/run";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

const MAX_MESSAGES = 30;
const MAX_CHARS = 2000;

export async function POST(req: NextRequest) {
  if (!agentConfigured()) {
    return NextResponse.json({ ok: false, error: "offline" }, { status: 503 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!rateLimit(`agent:${ip}`, 40, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many messages. Please call or text (831) 220-8093." }, { status: 429 });
  }

  let messages: ChatMessage[];
  try {
    const body = await req.json();
    messages = (Array.isArray(body?.messages) ? body.messages : [])
      .filter((m: ChatMessage) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim())
      .map((m: ChatMessage) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  // conversation must start with the visitor and end with the visitor
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json({ ok: false, error: "This chat is getting long. Please call or text (831) 220-8093 to keep going with a person." }, { status: 413 });
  }

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (e: AgentEvent) => controller.enqueue(enc.encode(JSON.stringify(e) + "\n"));
      try {
        await runAgent(messages, emit, { ip });
      } catch (err) {
        console.error("[agent] error", err);
        emit({ type: "error", message: "I'm having trouble right now. Please call or text (831) 220-8093 and a person will help." });
      } finally {
        audit("agent.turn", { turns: messages.length });
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" } });
}
