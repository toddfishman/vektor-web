"use client";

/*
  Agent + email actions used across the site.
  - Using the agent (call, text, callback) is remembered in this browser so the
    "Was the agent not helpful?" escalation line can appear afterwards
    (site.agent.escalation.reveal = "after-agent"), or always ("always").
  - Email is offered as buttons (open mail app / copy address) instead of a printed address.
*/
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { site } from "@/content/site";

const KEY = "vk-agent-used";
const EVT = "vk:agent-used";

function subscribe(cb: () => void) {
  addEventListener(EVT, cb);
  addEventListener("storage", cb);
  return () => { removeEventListener(EVT, cb); removeEventListener("storage", cb); };
}
const read = () => { try { return localStorage.getItem(KEY) === "1"; } catch { return false; } };

export function markAgentUsed() {
  try { localStorage.setItem(KEY, "1"); } catch { /* private mode */ }
  dispatchEvent(new Event(EVT));
}

export function useAgentUsed() {
  return useSyncExternalStore(subscribe, read, () => false);
}

/** Chat (AI agent, first route) / Call / Text / Callback buttons. */
export function AgentActions({ compact = false, chat = true }: { compact?: boolean; chat?: boolean }) {
  const a = site.agent;
  return (
    <>
      {chat && <Link className="btn" href="/contact#agent">{compact ? "Chat" : "Chat with an agent"}{!compact && <> <i className="ar" /></>}</Link>}
      <a className={chat ? "btn ghost" : "btn"} href={`tel:${a.phone.tel}`} onClick={markAgentUsed}>{compact ? "Call" : "Call an agent"}</a>
      {a.sms && <a className="btn ghost" href={`sms:${a.sms}`} onClick={markAgentUsed}>Text</a>}
      {a.mode === "callback" && !compact && <Link className="btn ghost" href="/contact?topic=callback#message" onClick={markAgentUsed}>Callback</Link>}
    </>
  );
}

/** "Was the agent not helpful? Call ___" — shown per site.agent.escalation.reveal. */
export function Escalation({ className = "escalate" }: { className?: string }) {
  const used = useAgentUsed();
  const e = site.agent.escalation;
  if (e.reveal !== "always" && !used) return null;
  return (
    <p className={className} role="status">
      Was the agent not helpful? Call <a href={`tel:${e.phone.tel}`}>{e.phone.display}</a> and a Vektor team member will pick up.
    </p>
  );
}

/** Email without printing the address: open the visitor's mail app, or copy to clipboard. */
export function EmailActions({ address = site.email.sales, subject, compact = false }: { address?: string; subject?: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(address); }
    catch {
      const t = document.createElement("textarea"); t.value = address; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } finally { t.remove(); }
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }
  const href = `mailto:${address}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  return (
    <span className={`email-actions${compact ? " compact" : ""}`}>
      <a className={compact ? "link-btn" : "btn ghost"} href={href}>Email us</a>
      <button type="button" className={compact ? "link-btn" : "btn ghost"} onClick={copy} aria-live="polite">
        {copied ? "Copied ✓" : "Copy email"}
      </button>
    </span>
  );
}
