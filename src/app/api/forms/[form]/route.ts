/*
  POST /api/forms/:form  (quote | contact | carrier | careers | partnership | referral)
  Body: JSON matching the form's schema plus { website: "", t: msSinceRender }.
  Returns { ok: true, id } or { ok: false, errors }.
*/
import { NextResponse, type NextRequest } from "next/server";
import { FORMS, antiSpam, isFormKind, type Quote } from "@/lib/forms/schemas";
import { toTurvo } from "@/lib/forms/turvo";
import { channelsConfigured, deliverLead, newLeadId } from "@/lib/leads";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/forms/[form]">) {
  const { form } = await ctx.params;
  if (!isFormKind(form)) return NextResponse.json({ ok: false, error: "Unknown form" }, { status: 404 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!rateLimit(`${form}:${ip}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please call us instead." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 }); }

  // Bots: filled honeypot, or submitted faster than a person could. Pretend success.
  const spam = antiSpam.safeParse({ website: body.website, t: body.t });
  if (!spam.success || (typeof spam.data.t === "number" && spam.data.t < 2500)) {
    return NextResponse.json({ ok: true, id: newLeadId(form) });
  }

  const parsed = FORMS[form].safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[i.path.join(".") || "_"] ??= i.message;
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const ch = channelsConfigured();
  if (process.env.NODE_ENV === "production" && !ch.email && !ch.webhook) {
    console.error("[forms] no lead channel configured; refusing to drop a lead");
    return NextResponse.json({ ok: false, error: "We couldn't send this right now. Please call us." }, { status: 503 });
  }

  const id = newLeadId(form);
  const result = await deliverLead({
    id,
    kind: form,
    receivedAt: new Date().toISOString(),
    data: parsed.data as Record<string, unknown>,
    turvo: form === "quote" ? toTurvo(parsed.data as Quote, id) : undefined,
    meta: { ip, userAgent: req.headers.get("user-agent") ?? undefined, referer: req.headers.get("referer") ?? undefined },
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "We couldn't send this right now. Please call us." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, id });
}
