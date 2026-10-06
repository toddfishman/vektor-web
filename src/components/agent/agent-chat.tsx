"use client";

/*
  Vektor AI agent chat. Talks to /api/agent (NDJSON stream). The backend is swappable
  (text today; voice later) without changing this component's contract.
*/
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { markAgentUsed } from "@/components/site/contact-actions";
import { site } from "@/content/site";

type Action = { label: string; href: string };
type Msg = { role: "user" | "assistant"; content: string; actions?: Action[]; error?: boolean };

const GREETING = "Hi, I'm Vektor's AI agent. I can answer questions about shipping or hauling with Vektor, start a quote for you, or get a person to call you back. What are you moving?";
const STARTERS = ["I need a quote", "I'm a carrier looking for loads", "Where's my shipment?", "Talk to a person"];

function Bubble({ m }: { m: Msg }) {
  const paras = m.content.split(/\n{2,}/);
  return (
    <div className={`chat-msg ${m.role}${m.error ? " err" : ""}`}>
      {m.role === "assistant" && <span className="chat-who">Vektor agent · AI</span>}
      <div className="chat-text">
        {paras.map((p, i) => {
          const lines = p.split("\n");
          if (lines.every((l) => /^\s*[-•]\s+/.test(l))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{l.replace(/^\s*[-•]\s+/, "")}</li>)}</ul>;
          return <p key={i}>{lines.map((l, j) => <span key={j}>{l}{j < lines.length - 1 && <br />}</span>)}</p>;
        })}
      </div>
      {m.actions?.length ? (
        <div className="chat-actions">{m.actions.map((a) => <Link key={a.href + a.label} className="btn" href={a.href}>{a.label} <i className="ar" /></Link>)}</div>
      ) : null}
    </div>
  );
}

export function AgentChat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = logRef.current; if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, busy]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    markAgentUsed();
    const history: Msg[] = [...msgs, { role: "user", content: t }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const patch = (fn: (m: Msg) => Msg) => setMsgs((cur) => { const c = [...cur]; c[c.length - 1] = fn(c[c.length - 1]); return c; });
    try {
      const r = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history.filter((m) => !m.error && m.content).map(({ role, content }) => ({ role, content })) }),
      });
      if (!r.ok || !r.body) {
        const j = await r.json().catch(() => ({}));
        if (j.error === "offline") setOffline(true);
        patch((m) => ({ ...m, error: true, content: j.error && j.error !== "offline" ? j.error : `The AI agent isn't connected on this preview yet. A person can help any hour: call or text ${site.agent.phone.display}.` }));
        return;
      }
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (!line.trim()) continue;
          const e = JSON.parse(line);
          if (e.type === "text") patch((m) => ({ ...m, content: m.content + e.text }));
          else if (e.type === "action") patch((m) => ({ ...m, actions: [...(m.actions ?? []), e.action] }));
          else if (e.type === "error") patch((m) => ({ ...m, error: true, content: (m.content ? m.content + "\n\n" : "") + e.message }));
        }
      }
    } catch {
      patch((m) => ({ ...m, error: true, content: `Connection lost. Please try again, or call or text ${site.agent.phone.display}.` }));
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function onSubmit(e: FormEvent) { e.preventDefault(); void send(input); }
  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); }
  }

  const last = msgs[msgs.length - 1];
  const thinking = busy && last?.role === "assistant" && !last.content;

  return (
    <div className="chat" id="agent">
      <div className="chat-top">
        <span className="chat-id"><span className="chat-title">Vektor agent</span><span className="chat-ai">AI</span></span>
        <span className="live">Online 24/7/365</span>
      </div>
      <div className="chat-log" ref={logRef} role="log" aria-live="polite" aria-label="Conversation with Vektor's AI agent">
        <Bubble m={{ role: "assistant", content: GREETING }} />
        {msgs.map((m, i) => (m.role === "assistant" && !m.content && !m.actions ? null : <Bubble key={i} m={m} />))}
        {thinking && <div className="chat-msg assistant typing" aria-label="Agent is typing"><span /><span /><span /></div>}
        {!msgs.length && (
          <div className="chat-starters">
            {STARTERS.map((s) => <button key={s} type="button" onClick={() => void send(s)}>{s}</button>)}
          </div>
        )}
      </div>
      <form className="chat-form" onSubmit={onSubmit}>
        <label className="vh" htmlFor="chat-input">Message Vektor&rsquo;s AI agent</label>
        <textarea id="chat-input" ref={inputRef} rows={1} value={input} maxLength={2000} placeholder={offline ? "Agent offline on this preview" : "Ask about a load, a lane or hauling for Vektor…"}
          onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} disabled={busy} />
        <button className="btn" type="submit" disabled={busy || !input.trim()} aria-label="Send"><span className="chat-send-t">Send</span> <i className="ar" /></button>
      </form>
      <p className="chat-note">AI agent: it can make mistakes and can&rsquo;t quote rates or track loads. Don&rsquo;t share card or bank numbers. Chats may be reviewed to improve service. <Link href="/privacy">Privacy</Link></p>
    </div>
  );
}
