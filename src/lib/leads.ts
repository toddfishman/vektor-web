import "server-only";
/*
  Where form submissions go. Two channels, either or both:
   1. Email via Resend  (RESEND_API_KEY + LEADS_FROM + per-form LEADS_TO_*)
   2. Webhook POST      (LEADS_WEBHOOK_URL, signed with LEADS_WEBHOOK_SECRET) — point this at
      the CRM, Power Automate, Zapier, or a SharePoint list flow once Vektor picks one.
  In production, if neither channel is configured the API returns 503 instead of
  silently dropping a lead.

  The employee dashboard's "today's quote requests" needs a readable store; see
  docs/decisions.md (lead store). Until then, the webhook target is the system of record.
*/
import { createHmac } from "node:crypto";
import { Resend } from "resend";
import type { FormKind } from "./forms/schemas";

const ROUTE_ENV: Record<FormKind, string> = {
  quote: "LEADS_TO_QUOTE",
  contact: "LEADS_TO_CONTACT",
  carrier: "LEADS_TO_CARRIER",
  careers: "LEADS_TO_CAREERS",
  partnership: "LEADS_TO_PARTNERSHIP",
  referral: "LEADS_TO_REFERRAL",
};

const SUBJECT: Record<FormKind, string> = {
  quote: "Quote request", contact: "Website message", carrier: "Carrier setup request",
  careers: "Careers inquiry", partnership: "Partnership inquiry", referral: "Referral",
};

export type Lead = {
  id: string;
  kind: FormKind;
  receivedAt: string;
  data: Record<string, unknown>;
  turvo?: unknown;
  meta: { ip?: string; userAgent?: string; referer?: string };
};

export function newLeadId(kind: FormKind) {
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${kind === "quote" ? "VKQ" : "VKW"}-${ymd}-${rnd}`;
}

export function channelsConfigured() {
  return {
    email: Boolean(process.env.RESEND_API_KEY && process.env.LEADS_FROM),
    webhook: Boolean(process.env.LEADS_WEBHOOK_URL),
  };
}

function recipients(kind: FormKind) {
  const v = process.env[ROUTE_ENV[kind]] || process.env.LEADS_TO_DEFAULT || "";
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

function textBody(lead: Lead) {
  const lines = Object.entries(lead.data)
    .filter(([k, v]) => k !== "consent" && v !== "" && v !== undefined && v !== null && !(Array.isArray(v) && !v.length))
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`);
  return [`${SUBJECT[lead.kind]} ${lead.id}`, `Received ${lead.receivedAt}`, "", ...lines, "", lead.meta.referer ? `Page: ${lead.meta.referer}` : ""].join("\n");
}

export async function deliverLead(lead: Lead): Promise<{ ok: boolean; channels: string[] }> {
  const done: string[] = [];
  const cfg = channelsConfigured();
  const errors: unknown[] = [];

  if (cfg.email) {
    const to = recipients(lead.kind);
    if (to.length) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const replyTo = typeof lead.data.email === "string" ? lead.data.email : undefined;
        const label = [lead.data.company, lead.data.name].filter(Boolean).join(" · ");
        const { error } = await resend.emails.send({
          from: process.env.LEADS_FROM!,
          to,
          replyTo,
          subject: `${SUBJECT[lead.kind]} ${lead.id}${label ? ` — ${label}` : ""}`,
          text: textBody(lead),
        });
        if (error) throw error;
        done.push("email");
      } catch (e) { errors.push(e); }
    }
  }

  if (cfg.webhook) {
    try {
      const body = JSON.stringify(lead);
      const headers: Record<string, string> = { "content-type": "application/json" };
      if (process.env.LEADS_WEBHOOK_SECRET) {
        headers["x-vektor-signature"] = createHmac("sha256", process.env.LEADS_WEBHOOK_SECRET).update(body).digest("hex");
      }
      const r = await fetch(process.env.LEADS_WEBHOOK_URL!, { method: "POST", headers, body, signal: AbortSignal.timeout(8000) });
      if (!r.ok) throw new Error(`webhook ${r.status}`);
      done.push("webhook");
    } catch (e) { errors.push(e); }
  }

  if (!cfg.email && !cfg.webhook && process.env.NODE_ENV !== "production") {
    console.info("[leads] no channel configured; dev log only\n" + textBody(lead));
    done.push("dev-log");
  }

  if (errors.length) console.error(`[leads] ${lead.id} delivery errors`, errors);
  return { ok: done.length > 0, channels: done };
}
